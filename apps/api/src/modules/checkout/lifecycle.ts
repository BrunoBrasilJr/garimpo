import type { Accounts } from '../accounts/service.ts';
import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { lockOffers } from '../inventory/reservations.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
export const checkoutInclude = { items: { orderBy: { offerId: 'asc' } }, couponUsage: true } satisfies Prisma.CheckoutInclude;
export type CheckoutRecord = Prisma.CheckoutGetPayload<{ include: typeof checkoutInclude }>;
export async function lockCustomer(accounts: Accounts, tx: Prisma.TransactionClient, access: string) {
  const first = await accounts.authorize(tx, access, true);
  // Force a stale SERIALIZABLE waiter to retry before reading the unique checkout aggregate.
  // Values (including the user's timestamp) stay unchanged; the tuple is our coordination point.
  await tx.$queryRaw`UPDATE "User" SET "updatedAt" = "updatedAt" WHERE id = ${first.user.id}::uuid RETURNING id`;
  return (await accounts.authorize(tx, access, true)).user;
}
export async function lockCoupons(tx: Prisma.TransactionClient, ids: (string | undefined | null)[]) {
  for (const id of [...new Set(ids.filter((id): id is string => Boolean(id)))].sort()) await tx.$queryRaw`SELECT id FROM "Coupon" WHERE id = ${id}::uuid FOR UPDATE`;
}
export async function activeCheckout(tx: Prisma.TransactionClient, userId: string) { return tx.checkout.findFirst({ where: { userId, status: 'ACTIVE' }, include: checkoutInclude }); }
/** Caller owns User, then all affected editions/offers and coupons in stable order. */
export async function closeCheckout(tx: Prisma.TransactionClient, row: CheckoutRecord, status: 'CANCELLED' | 'EXPIRED', clock: Clock, reason: string, actorId: string | null = row.userId) {
  if (row.status !== 'ACTIVE') return;
  const now = clock.now();
  await tx.reservation.updateMany({ where: { checkoutItem: { checkoutId: row.id }, status: 'ACTIVE' }, data: { status: status === 'EXPIRED' ? 'EXPIRED' : 'RELEASED', releasedAt: now } });
  await tx.couponUsage.updateMany({ where: { checkoutId: row.id, status: 'RESERVED' }, data: { status: 'RELEASED', releasedAt: now } });
  await tx.checkout.update({ where: { id: row.id, status: 'ACTIVE' }, data: { status, closedAt: now, version: { increment: 1 } } });
  await appendAudit(tx, { ...(actorId ? { actorId } : {}), action: 'CHECKOUT.' + status, targetType: 'CHECKOUT', targetId: row.id, result: 'SUCCESS', reason, changes: {} }, clock);
  await enqueue(tx, { type: 'CHECKOUT.' + status, aggregateId: row.id, payload: { checkoutId: row.id, userId: row.userId } }, clock);
}
export async function expireOwn(tx: Prisma.TransactionClient, userId: string, clock: Clock) {
  const row = await activeCheckout(tx, userId);
  if (row && row.expiresAt <= clock.now()) {
    await lockOffers(tx, row.items.map(item => item.offerId)); await lockCoupons(tx, [row.couponUsage?.couponId]);
    await closeCheckout(tx, row, 'EXPIRED', clock, 'CHECKOUT_DEADLINE'); return null;
  } return row;
}
