import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { include } from './service.ts';
import { lockOffers } from '../inventory/reservations.ts';
import { lockCoupons } from '../checkout/lifecycle.ts';
import { orderEvent } from './events.ts';

/** Caller already owns the customer's MVCC identity. */
export async function expireOrder(tx: Prisma.TransactionClient, id: string, clock: Clock) {
  let row = await tx.order.findUniqueOrThrow({ where: { id }, include });
  const usage = await tx.couponUsage.findUnique({ where: { orderId: id } });
  await lockOffers(tx, row.items.map(item => item.offerId)); await lockCoupons(tx, [usage?.couponId]);
  row = await tx.order.findUniqueOrThrow({ where: { id }, include }); const now = clock.now();
  if (row.status !== 'PENDING' || !row.expiresAt || row.expiresAt > now) return false;
  const updated = await tx.order.update({ where: { id }, data: { status: 'CANCELLED', version: { increment: 1 } } });
  await orderEvent(tx, clock, { orderId: id, version: updated.version, fromStatus: 'PENDING', toStatus: 'CANCELLED', reason: 'PAYMENT_DEADLINE', occurredAt: now });
  await tx.reservation.updateMany({ where: { orderItem: { orderId: id }, status: 'ACTIVE' }, data: { status: 'EXPIRED', releasedAt: now } });
  await tx.couponUsage.updateMany({ where: { orderId: id, status: 'CONSUMED' }, data: { status: 'RELEASED', releasedAt: now } });
  await tx.paymentCharge.updateMany({ where: { orderId: id, status: 'ACTIVE' }, data: { status: 'EXPIRED' } });
  await appendAudit(tx, { action: 'ORDER.EXPIRED', targetType: 'ORDER', targetId: id, result: 'SUCCESS', reason: 'PAYMENT_DEADLINE', changes: {} }, clock);
  await enqueue(tx, { type: 'ORDER.EXPIRED', aggregateId: id, payload: { orderId: id, userId: row.userId } }, clock); return true;
}
