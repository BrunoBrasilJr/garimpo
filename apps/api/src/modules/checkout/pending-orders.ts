import type { Prisma } from '../../persistence/client.ts';
import { CartError } from '../cart/errors.ts';
export type PendingCount = { status: 'UNAVAILABLE' } | { status: 'KNOWN'; count: number };
/** Must read real pending orders using this same transaction/identity lock in TASK-018/023. */
export interface PendingOrders { inspect(tx: Prisma.TransactionClient, userId: string): Promise<PendingCount> }
export const unavailablePendingOrders = Object.freeze<PendingOrders>({ async inspect() { return { status: 'UNAVAILABLE' }; } });
export function requirePendingCapacity(value: PendingCount) {
  if (value.status !== 'KNOWN' || !Number.isSafeInteger(value.count) || value.count < 0) throw new CartError(503, 'PENDING_ORDERS_UNAVAILABLE', 'Não foi possível conferir seus pedidos pendentes. Tente novamente mais tarde.');
  if (value.count >= 3) throw new CartError(409, 'PENDING_ORDER_LIMIT', 'Cancele ou pague um pedido pendente antes de iniciar outra finalização.');
}
