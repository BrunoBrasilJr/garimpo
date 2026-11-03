import type { AcceptedFreight, CheckoutSnapshot, OrderCreationView } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import { Accounts } from '../accounts/service.ts';
import { requireFirstOrderEmail } from '../accounts/checkout.ts';
import { serializable } from '../../persistence/transaction.ts';
import { payloadHash } from '../../core/idempotency.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { json } from '../cart/quote.ts';
import { CartError, missing } from '../cart/errors.ts';
import { checkoutInclude, closeCheckout, lockCustomer, lockCoupons } from '../checkout/lifecycle.ts';
import { requirePendingCapacity } from '../checkout/pending-orders.ts';
import { lockOffers, reservedQuantities } from '../inventory/reservations.ts';
import { transferReservation } from '../inventory/transfer.ts';
import { Freight, freightRevision } from '../freight/service.ts';
import { FreightError } from '../freight/errors.ts';
import { ownAddress } from '../checkout/quotes.ts';
import { orderPendingCount } from './pending-orders.ts';
import type { CreateOrderInput } from './validation.ts';
import * as validate from './validation.ts';
const include = { items: { include: { units: { orderBy: { logicalIndex: 'asc' } } }, orderBy: { offerId: 'asc' } }, charges: { orderBy: { createdAt: 'asc' } } } satisfies Prisma.OrderInclude;
type OrderRecord = Prisma.OrderGetPayload<{ include: typeof include }>;
function cents(value: bigint): number { const number = Number(value); if (!Number.isSafeInteger(number) || number < 0) throw new Error('Stored monetary total is outside the exact JSON range.'); return number; }
export const orderDeadline = (method: 'PIX' | 'BOLETO', now: Date) => new Date(now.getTime() + (method === 'PIX' ? 30 * 60 * 1000 : 48 * 60 * 60 * 1000));
export class Orders {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }
  view(row: OrderRecord): OrderCreationView {
    const snapshot = row.snapshot as unknown as CheckoutSnapshot;
    return { ...snapshot, id: row.id, checkoutId: row.checkoutId, status: row.status, method: row.method, version: row.version,
      address: row.addressSnapshot as unknown as AcceptedFreight['address'], freight: row.freightSnapshot as unknown as AcceptedFreight['freight'], totalCents: cents(row.totalCents), createdAt: row.createdAt.toISOString(), expiresAt: row.expiresAt?.toISOString() ?? null,
      units: row.items.flatMap(item => item.units.map(unit => ({ id: unit.id, offerId: item.offerId, logicalIndex: unit.logicalIndex, netPaidCents: unit.netPaidCents }))),
      charges: row.charges.map(charge => ({ id: charge.id, method: charge.method as 'PIX' | 'BOLETO', amountCents: cents(charge.amountCents), status: charge.status, expiresAt: charge.expiresAt.toISOString() })) };
  }
  async create(access: string, input: CreateOrderInput, key: string): Promise<OrderCreationView> {
    input = validate.parse(validate.create, input); key = validate.parse(validate.key, key);
    const requestHash = payloadHash(input);
    const result = await serializable(this.accounts.db, async tx => {
      const user = await lockCustomer(this.accounts, tx, access), receipt = { actorScope: user.id, operation: 'ORDER.CREATE', key };
      const replay = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: receipt } });
      if (replay) {
        if (replay.requestHash !== requestHash) throw new CartError(409, 'IDEMPOTENCY_CONFLICT', 'Esta tentativa já foi usada com outros dados.');
        const row = await tx.order.findFirst({ where: { id: replay.resultRef, userId: user.id }, include }); if (!row) throw missing(); return { row };
      }
      const checkout = await tx.checkout.findFirst({ where: { id: input.checkoutId, userId: user.id }, include: checkoutInclude }); if (!checkout) throw missing();
      await lockOffers(tx, checkout.items.map(item => item.offerId)); await lockCoupons(tx, [checkout.couponUsage?.couponId]); let now = this.accounts.clock.now();
      if (checkout.status !== 'ACTIVE') throw new CartError(409, 'CHECKOUT_UNAVAILABLE', 'Esta finalização já foi encerrada ou usada em um pedido.');
      if (checkout.expiresAt <= now) { await closeCheckout(tx, checkout, 'EXPIRED', this.accounts.clock, 'ORDER_AFTER_CHECKOUT_DEADLINE'); return { error: new CartError(409, 'CHECKOUT_EXPIRED', 'O prazo da finalização terminou. Confira o carrinho para iniciar outra.') }; }
      if (checkout.version !== input.version) throw new CartError(409, 'CHECKOUT_VERSION_CONFLICT', 'A finalização mudou. Atualize e confirme os dados.');
      await requireFirstOrderEmail(tx, user);
      const cart = await tx.cart.findUniqueOrThrow({ where: { id: checkout.cartId } }); if (cart.userId !== user.id || cart.version !== checkout.cartVersion) throw new CartError(409, 'CART_VERSION_CONFLICT', 'O carrinho mudou. Confira os itens novamente.');
      const accepted = checkout.freightSnapshot as unknown as AcceptedFreight | null;
      if (!accepted || !checkout.freightRevision || checkout.addressId !== input.addressId || accepted.address.id !== input.addressId || checkout.freightRevision !== input.freightRevision) throw new FreightError(409, 'FREIGHT_CONFIRMATION_REQUIRED', 'Escolha um endereço próprio, confira a cotação e aceite o frete.');
      const address = await ownAddress(tx, user.id, input.addressId), freight = await new Freight(this.accounts).quote(tx, address.zip, true);
      // Re-read time after the final potentially blocking configuration lock.
      now = this.accounts.clock.now();
      if (checkout.expiresAt <= now) { await closeCheckout(tx, checkout, 'EXPIRED', this.accounts.clock, 'ORDER_AFTER_FREIGHT_LOCK_DEADLINE'); return { error: new CartError(409, 'CHECKOUT_EXPIRED', 'O prazo da finalização terminou. Confira o carrinho para iniciar outra.') }; }
      if (!freight.served) throw new FreightError(422, 'ZIP_NOT_SERVED', 'Este CEP não é atendido. Corrija o endereço antes de vencer a finalização.');
      if (freightRevision(freight, address) !== input.freightRevision) throw new FreightError(409, 'FREIGHT_CONFIRMATION_REQUIRED', 'O endereço ou o frete mudou. Confira e aceite a nova cotação.');
      requirePendingCapacity(await orderPendingCount(this.accounts.clock).inspect(tx, user.id));
      const snapshot = checkout.quoteSnapshot as unknown as CheckoutSnapshot;
      const otherHolds = await reservedQuantities(tx, checkout.items.map(item => item.offerId), now, checkout.id), offers = await tx.offer.findMany({ where: { id: { in: checkout.items.map(item => item.offerId) } } });
      if (checkout.items.some(item => item.quantity > (offers.find(offer => offer.id === item.offerId)?.stockOnHand ?? 0) - (otherHolds.get(item.offerId) ?? 0))) throw new CartError(409, 'INSUFFICIENT_STOCK', 'Não foi possível confirmar todo o saldo reservado. Tente novamente após conferir os itens.');
      if (snapshot.quote.couponId && (checkout.couponUsage?.status !== 'RESERVED' || checkout.couponUsage.expiresAt <= now || checkout.couponUsage.couponId !== snapshot.quote.couponId)) throw new CartError(409, 'COUPON_RESERVATION_UNAVAILABLE', 'Não foi possível confirmar a utilização reservada do cupom.');
      const expiresAt = orderDeadline(input.method, now), totalCents = snapshot.quote.totalCents + freight.amountCents;
      const row = await tx.order.create({ data: {
        userId: user.id, checkoutId: checkout.id, method: input.method, status: 'PENDING', snapshot: json(snapshot), addressSnapshot: json(address), freightSnapshot: json(freight),
        subtotalCents: BigInt(snapshot.quote.baseSubtotalCents), discountCents: BigInt(snapshot.quote.baseSubtotalCents - snapshot.quote.totalCents), shippingCents: freight.amountCents, totalCents: BigInt(totalCents), createdAt: now, expiresAt,
        items: { create: snapshot.products.map(product => ({ offerId: product.offerId, editionId: product.editionId, quantity: product.quantity, productSnapshot: json(product),
          units: { create: product.unitIds.map((id, logicalIndex) => { const unit = snapshot.quote.units.find(unit => unit.id === id && unit.offerId === product.offerId); if (!unit) throw new Error('Frozen unit allocation is incomplete.'); return { id, logicalIndex, netPaidCents: unit.netPriceCents, priceSnapshot: json(unit), currentOfferId: product.offerId }; }) }
        })) }, charges: { create: { method: input.method, amountCents: BigInt(totalCents), status: 'ACTIVE', createdAt: now, expiresAt } }
      }, include });
      for (const item of row.items) { const source = checkout.items.find(source => source.offerId === item.offerId); if (!source || source.quantity !== item.quantity) throw new Error('Frozen order and checkout quantities disagree.'); await transferReservation(tx, source.id, item.id, item.quantity, now, expiresAt); }
      if (checkout.couponUsage) { const usage = await tx.couponUsage.updateMany({ where: { id: checkout.couponUsage.id, status: 'RESERVED', expiresAt: { gt: now } }, data: { orderId: row.id, status: 'CONSUMED', expiresAt } }); if (usage.count !== 1) throw new Error('Expected reserved coupon usage before order conversion.'); }
      await tx.checkout.update({ where: { id: checkout.id, status: 'ACTIVE' }, data: { status: 'CONVERTED', closedAt: now, version: { increment: 1 } } });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } }); await tx.cart.update({ where: { id: cart.id }, data: { version: { increment: 1 }, updatedAt: now } });
      await appendAudit(tx, { actorId: user.id, action: 'ORDER.CREATED', targetType: 'ORDER', targetId: row.id, result: 'SUCCESS', reason: 'CHECKOUT_HOLD_ATOMICALLY_TRANSFERRED', changes: { checkoutId: checkout.id, method: input.method, totalCents, expiresAt: expiresAt.toISOString() } }, this.accounts.clock);
      await enqueue(tx, { type: 'ORDER.CREATED', aggregateId: row.id, payload: { orderId: row.id, userId: user.id } }, this.accounts.clock);
      await tx.idempotencyRecord.create({ data: { ...receipt, requestHash, resultRef: row.id, createdAt: now } }); return { row };
    });
    if (result.error) throw result.error; return this.view(result.row!);
  }
}
