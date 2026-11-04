import type { CheckoutSnapshot, CheckoutView, AcceptedFreight } from '@garimpo/contracts';
import { Accounts } from '../accounts/service.ts';
import { serializable } from '../../persistence/transaction.ts';
import { payloadHash } from '../../core/idempotency.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { Carts } from '../cart/service.ts';
import { captureQuote, json, physicalLines } from '../cart/quote.ts';
import { CartError, missing, staleCart } from '../cart/errors.ts';
import { CHECKOUT_MILLISECONDS } from '../cart/rules.ts';
import { PricingError } from '../pricing/errors.ts';
import { requireCouponCapacity } from '../pricing/usage.ts';
import { lockOffers } from '../inventory/reservations.ts';
import { activeCheckout, checkoutInclude, closeCheckout, expireOwn, lockCoupons, lockCustomer } from './lifecycle.ts';
import type { CheckoutRecord } from './lifecycle.ts';
import { requirePendingCapacity, unavailablePendingOrders } from './pending-orders.ts';
import type { PendingOrders } from './pending-orders.ts';
import { publishAvailability } from '../engagement/availability.ts';
import type { Availability } from '../engagement/availability.ts';

export interface ReserveInput { version: number; pricingRevision: string; couponCode?: string | undefined }
export class Checkouts {
  readonly accounts: Accounts;
  readonly pendingOrders: PendingOrders;
  constructor(accounts: Accounts, pendingOrders: PendingOrders = unavailablePendingOrders) { this.accounts = accounts; this.pendingOrders = pendingOrders; }
  view(row: CheckoutRecord): CheckoutView {
    const snapshot = row.quoteSnapshot as unknown as CheckoutSnapshot;
    return { ...snapshot, id: row.id, status: row.status, version: row.version, cartVersion: row.cartVersion, couponCode: row.couponCode, addressId: row.addressId,
      createdAt: row.createdAt.toISOString(), expiresAt: row.expiresAt.toISOString(), serverTime: this.accounts.clock.now().toISOString(), freight: row.freightRevision ? row.freightSnapshot as unknown as AcceptedFreight : null };
  }
  async current(access: string): Promise<CheckoutView> {
    const row = await serializable(this.accounts.db, async tx => { const user = await lockCustomer(this.accounts, tx, access); return expireOwn(tx, user.id, this.accounts.clock); });
    if (!row) throw missing(); return this.view(row);
  }
  async reserve(access: string, input: ReserveInput, key: string): Promise<CheckoutView> {
    if (!key || key.length > 128) throw new CartError(422, 'IDEMPOTENCY_KEY_REQUIRED', 'Use uma chave válida para esta finalização.');
    const hash = payloadHash({ version: input.version, pricingRevision: input.pricingRevision, couponCode: input.couponCode ?? null });
    const result = await serializable(this.accounts.db, async tx => {
      const user = await lockCustomer(this.accounts, tx, access), cart = await new Carts(this.accounts).cart(tx, user.id), active = await activeCheckout(tx, user.id);
      const requestedCoupon = input.couponCode ? await tx.coupon.findUnique({ where: { code: input.couponCode }, select: { id: true } }) : null;
      await lockOffers(tx, [...cart.items.map(item => item.offerId), ...(active?.items.map(item => item.offerId) ?? [])]);
      await lockCoupons(tx, [active?.couponUsage?.couponId, requestedCoupon?.id]);
      const now = this.accounts.clock.now();
      const availability = new Map<string, Availability>();
      const finish = async <T>(value: T) => {
        await publishAvailability(tx, availability, this.accounts.clock);
        return value;
      };
      if (active && active.expiresAt <= now) await closeCheckout(tx, active, 'EXPIRED', this.accounts.clock, 'CHECKOUT_DEADLINE', user.id, availability);
      const receipt = { actorScope: user.id, operation: 'CHECKOUT.RESERVE', key };
      const replay = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: receipt } });
      if (replay) {
        if (replay.requestHash !== hash) throw new CartError(409, 'IDEMPOTENCY_CONFLICT', 'Esta chave já foi usada com outros dados.');
        const row = await tx.checkout.findFirstOrThrow({ where: { id: replay.resultRef, userId: user.id }, include: checkoutInclude }); return finish({ row });
      }
      if (input.version !== cart.version) return finish({ error: staleCart() });
      if (active && active.expiresAt > now && active.cartVersion === cart.version && active.couponCode === (input.couponCode ?? null)) {
        await tx.idempotencyRecord.create({ data: { ...receipt, requestHash: hash, resultRef: active.id, createdAt: now } }); return { row: active };
      }
      if (active && active.expiresAt > now) await closeCheckout(tx, active, 'CANCELLED', this.accounts.clock, 'CHECKOUT_REPLACED', user.id, availability);
      // Expected commercial failures commit any prior release; storage/audit failures still roll back the whole transaction.
      let captured: Awaited<ReturnType<typeof captureQuote>>;
      try {
        captured = await captureQuote(tx, this.accounts, cart, input.couponCode);
        if (captured.revision !== input.pricingRevision) throw new CartError(409, 'PRICE_CONFIRMATION_REQUIRED', 'Os dados ou valores dos itens mudaram. Atualize o carrinho e confirme os preços atuais.');
        const lines = await physicalLines(tx, cart, now);
        if (lines.some(line => !line.active || line.quantity > line.availableQuantity)) throw new CartError(409, 'INSUFFICIENT_STOCK', 'Um dos itens não possui saldo para esta quantidade. Confira o carrinho.');
        requirePendingCapacity(await this.pendingOrders.inspect(tx, user.id));
        if (captured.snapshot.quote.couponId) await requireCouponCapacity(tx, captured.snapshot.quote.couponId, user.id, now);
      } catch (error) { if (error instanceof CartError || error instanceof PricingError) return finish({ error }); throw error; }
      const expiresAt = new Date(now.getTime() + CHECKOUT_MILLISECONDS), { snapshot, revision } = captured;
      const row = await tx.checkout.create({ data: {
        userId: user.id, cartId: cart.id, cartVersion: cart.version, couponCode: input.couponCode ?? null, requestKey: key, requestHash: hash, pricingRevision: revision, quoteSnapshot: json(snapshot), createdAt: now, expiresAt,
        items: { create: snapshot.products.map(product => ({ offerId: product.offerId, quantity: product.quantity,
          snapshot: json({ product, units: snapshot.quote.units.filter(unit => product.unitIds.includes(unit.id)) }),
          reservation: { create: { offerId: product.offerId, quantity: product.quantity, createdAt: now, expiresAt } }
        })) },
        ...(snapshot.quote.couponId ? { couponUsage: { create: { couponId: snapshot.quote.couponId, userId: user.id, createdAt: now, expiresAt } } } : {})
      }, include: checkoutInclude });
      await appendAudit(tx, { actorId: user.id, action: 'CHECKOUT.CREATED', targetType: 'CHECKOUT', targetId: row.id, result: 'SUCCESS', reason: 'ALL_ITEMS_RESERVED', changes: { totalCents: snapshot.quote.totalCents, expiresAt: expiresAt.toISOString() } }, this.accounts.clock);
      await enqueue(tx, { type: 'CHECKOUT.CREATED', aggregateId: row.id, payload: { checkoutId: row.id, userId: user.id, expiresAt: expiresAt.toISOString() } }, this.accounts.clock);
      await tx.idempotencyRecord.create({ data: { ...receipt, requestHash: hash, resultRef: row.id, createdAt: now } });
      return finish({ row });
    });
    if ('error' in result && result.error) throw result.error;
    return this.view(result.row!);
  }
  async cancel(access: string, id: string): Promise<void> {
    await serializable(this.accounts.db, async tx => {
      const user = await lockCustomer(this.accounts, tx, access), row = await tx.checkout.findFirst({ where: { id, userId: user.id }, include: checkoutInclude }); if (!row) throw missing();
      if (row.status !== 'ACTIVE') return;
      await lockOffers(tx, row.items.map(item => item.offerId)); await lockCoupons(tx, [row.couponUsage?.couponId]);
      await closeCheckout(tx, row, row.expiresAt <= this.accounts.clock.now() ? 'EXPIRED' : 'CANCELLED', this.accounts.clock, 'CUSTOMER_CLOSED');
    });
  }
  /** Internal address metadata seam. Full freight acceptance/API remains TASK-018. */
  async selectAddress(access: string, id: string, version: number, addressId: string): Promise<CheckoutView> {
    const result = await serializable(this.accounts.db, async tx => {
      const user = await lockCustomer(this.accounts, tx, access), row = await expireOwn(tx, user.id, this.accounts.clock);
      if (!row || row.id !== id) return { error: missing() };
      if (row.version !== version) throw new CartError(409, 'CHECKOUT_VERSION_CONFLICT', 'A finalização mudou. Atualize antes de escolher o endereço.');
      const address = await tx.address.findFirst({ where: { id: addressId, userId: user.id, deletedAt: null } }); if (!address) throw missing();
      const updated = await tx.checkout.update({ where: { id, version }, data: { addressId, freightRevision: null, version: { increment: 1 } }, include: checkoutInclude });
      await appendAudit(tx, { actorId: user.id, action: 'CHECKOUT.ADDRESS_SELECTED', targetType: 'CHECKOUT', targetId: id, result: 'SUCCESS', reason: 'OWN_ADDRESS_METADATA', changes: { addressId } }, this.accounts.clock);
      return { row: updated };
    });
    if ('error' in result && result.error) throw result.error;
    return this.view(result.row!);
  }
}
