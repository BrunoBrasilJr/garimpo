import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import type { OrderStatus, Role } from '../../persistence/generated/client.ts';
/** Same transaction as the aggregate transition. Append-only and one event per order revision. */
export async function orderEvent(tx: Prisma.TransactionClient, clock: Clock, entry: { orderId: string; version: number; fromStatus: OrderStatus | null; toStatus: OrderStatus; reason: string; occurredAt: Date; actor?: { id: string; role: Role } }) {
  return tx.orderStatusEvent.create({ data: { orderId: entry.orderId, version: entry.version, fromStatus: entry.fromStatus, toStatus: entry.toStatus, reason: entry.reason, occurredAt: entry.occurredAt, createdAt: clock.now(), actorId: entry.actor?.id ?? null, actorRole: entry.actor?.role ?? null } });
}
