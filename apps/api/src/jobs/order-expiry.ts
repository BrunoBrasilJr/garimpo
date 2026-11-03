import type { Database } from '../persistence/client.ts';
import type { Clock } from '../core/clock.ts';
import { systemClock } from '../core/clock.ts';
import { serializable } from '../persistence/transaction.ts';
import { expireOrder } from '../modules/orders/expiry.ts';
export async function expireOrders(db: Database, clock: Clock = systemClock, limit = 100) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('Expiry batch must be between 1 and 1000.');
  const rows = await db.order.findMany({ where: { status: 'PENDING', expiresAt: { lte: clock.now() } }, orderBy: [{ expiresAt: 'asc' }, { id: 'asc' }], take: limit, select: { id: true, userId: true } }); let expired = 0;
  for (const row of rows) expired += await serializable(db, async tx => { await tx.$queryRaw`UPDATE "User" SET "updatedAt"="updatedAt" WHERE id=${row.userId}::uuid RETURNING id`; return await expireOrder(tx, row.id, clock) ? 1 : 0; });
  return expired;
}
