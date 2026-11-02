import type { Prisma } from '../../persistence/client.ts';
/** User, sorted offers and coupon already locked. No release/reacquire gap or physical stock mutation. */
export async function transferReservation(tx: Prisma.TransactionClient, checkoutItemId: string, orderItemId: string, quantity: number, now: Date, expiresAt: Date) {
  const changed = await tx.reservation.updateMany({ where: { checkoutItemId, orderItemId: null, quantity, status: 'ACTIVE', expiresAt: { gt: now } }, data: { orderItemId, expiresAt } });
  if (changed.count !== 1) throw new Error('Expected a complete live checkout hold before atomic transfer.');
}
