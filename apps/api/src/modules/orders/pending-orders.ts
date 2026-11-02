import type { PendingOrders } from '../checkout/pending-orders.ts';
import type { Clock } from '../../core/clock.ts';
/** Real query in the caller's transaction. A delayed job never prolongs a pending slot. */
export function orderPendingCount(clock: Clock): PendingOrders {
  return { async inspect(tx, userId) { return { status: 'KNOWN', count: await tx.order.count({ where: { userId, status: 'PENDING', expiresAt: { gt: clock.now() } } }) }; } };
}
