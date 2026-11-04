import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { lockOffers } from '../inventory/reservations.ts';
import { activeCheckout, closeCheckout, lockCoupons } from '../checkout/lifecycle.ts';
import { include } from './service.ts';
import { orderEvent } from './events.ts';
import { captureAvailability, publishAvailability } from '../engagement/availability.ts';

/** Caller owns/revalidates actor and customer identities. No provider I/O here. */
export async function cancelAccountCommitments(tx: Prisma.TransactionClient, clock: Clock, userId: string, actor: { id: string; role: 'USER' | 'ADMIN' | 'OPERATOR' }, reason: 'ACCOUNT_BLOCKED' | 'ACCOUNT_CLOSED') {
  const checkout = await activeCheckout(tx, userId), pending = await tx.order.findMany({ where: { userId, status: 'PENDING' }, include });
  const usages = await tx.couponUsage.findMany({ where: { OR: [{ orderId: { in: pending.map(row => row.id) } }, ...(checkout ? [{ checkoutId: checkout.id }] : [])] }, select: { couponId: true } });
  const offerIds = [...(checkout?.items.map(item => item.offerId) ?? []), ...pending.flatMap(row => row.items.map(item => item.offerId))];
  await lockOffers(tx, offerIds);
  await lockCoupons(tx, usages.map(usage => usage.couponId));
  const now = clock.now();
  const expired = (checkout && checkout.expiresAt <= now) || pending.some(row => row.expiresAt && row.expiresAt <= now);
  const availability = await captureAvailability(tx, offerIds, expired ? null : now);
  if (checkout) await closeCheckout(tx, checkout, 'CANCELLED', clock, reason, actor.id, availability);
  for (const row of pending) {
    const updated = await tx.order.update({ where: { id: row.id, status: 'PENDING' }, data: { status: 'CANCELLED', version: { increment: 1 } } });
    await tx.orderUnit.updateMany({ where: { orderItem: { orderId: row.id }, commercialState: 'KEPT' }, data: { commercialState: 'CANCELLED' } });
    await tx.reservation.updateMany({ where: { orderItem: { orderId: row.id }, status: 'ACTIVE' }, data: { status: 'RELEASED', releasedAt: now } });
    await tx.couponUsage.updateMany({ where: { orderId: row.id, status: 'CONSUMED' }, data: { status: 'RELEASED', releasedAt: now } });
    await tx.paymentCharge.updateMany({ where: { orderId: row.id, status: 'ACTIVE' }, data: { status: 'CANCELLED' } });
    await orderEvent(tx, clock, { orderId: row.id, version: updated.version, fromStatus: 'PENDING', toStatus: 'CANCELLED', actor, reason, occurredAt: now });
    await appendAudit(tx, { actorId: actor.id, action: 'ORDER.CANCELLED', targetType: 'ORDER', targetId: row.id, result: 'SUCCESS', reason, changes: {} }, clock);
    await enqueue(tx, { type: 'ORDER.CANCELLED', aggregateId: row.id, payload: { orderId: row.id, userId } }, clock);
  }
  await publishAvailability(tx, availability, clock);
}
