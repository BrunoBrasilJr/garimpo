import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { enqueue } from '../../core/outbox.ts';
import { CartError } from '../cart/errors.ts';
import type { OrderRecord } from '../orders/service.ts';

/** Caller owns User, sorted offers and coupon. Stock, movement and hold consumption commit with payment. */
export async function consumeOrderStock(tx: Prisma.TransactionClient, order: OrderRecord, clock: Clock) {
  const now = clock.now();
  for (const item of order.items) {
    const quantity = item.units.filter(unit => unit.commercialState === 'KEPT').length;
    if (!quantity) continue;
    const hold = await tx.reservation.findUnique({ where: { orderItemId: item.id } });
    const offer = await tx.offer.findUniqueOrThrow({ where: { id: item.offerId } });
    const other = await tx.reservation.aggregate({ where: { offerId: item.offerId, orderItemId: { not: item.id }, status: 'ACTIVE', expiresAt: { gt: now } }, _sum: { quantity: true } });
    // Include checkout-only reservations: SQL NOT on a nullable FK alone would omit them.
    const checkoutOnly = await tx.reservation.aggregate({ where: { offerId: item.offerId, orderItemId: null, status: 'ACTIVE', expiresAt: { gt: now } }, _sum: { quantity: true } });
    if (!hold || hold.status !== 'ACTIVE' || hold.expiresAt <= now || hold.quantity !== quantity || offer.stockOnHand - (other._sum.quantity ?? 0) - (checkoutOnly._sum.quantity ?? 0) < quantity) throw new CartError(409, 'PAYMENT_STOCK_UNAVAILABLE', 'Não foi possível confirmar o saldo reservado. O pagamento será estornado.');
    const updated = await tx.offer.update({ where: { id: offer.id }, data: { stockOnHand: { decrement: quantity }, version: { increment: 1 } } });
    await tx.stockMovement.create({ data: { offerId: offer.id, offerVersion: updated.version, deltaOnHand: -quantity, balanceBefore: offer.stockOnHand, balanceAfter: updated.stockOnHand, reason: 'Pagamento do pedido', originKey: 'PAYMENT:' + item.id, createdAt: now } });
    await tx.reservation.update({ where: { id: hold.id }, data: { status: 'CONSUMED', releasedAt: now } });
    await enqueue(tx, { type: 'INVENTORY.STOCK_CHANGED', aggregateId: offer.id, payload: { offerId: offer.id, editionId: offer.editionId, before: offer.stockOnHand, after: updated.stockOnHand } }, clock);
  }
}
