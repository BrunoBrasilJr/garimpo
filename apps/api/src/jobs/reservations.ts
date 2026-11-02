import type { Database } from '../persistence/client.ts';
import type { Clock } from '../core/clock.ts';
import { systemClock } from '../core/clock.ts';
import { serializable } from '../persistence/transaction.ts';
import { checkoutInclude, closeCheckout, lockCoupons } from '../modules/checkout/lifecycle.ts';
import { lockOffers } from '../modules/inventory/reservations.ts';

export async function expireReservations(db: Database, clock: Clock = systemClock, limit = 100) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('Expiry batch must be between 1 and 1000.');
  const candidates = await db.checkout.findMany({ where: { status: 'ACTIVE', expiresAt: { lte: clock.now() } }, orderBy: [{ expiresAt: 'asc' }, { id: 'asc' }], take: limit, select: { id: true, userId: true } });
  let closed = 0;
  for (const candidate of candidates) closed += await serializable(db, async tx => {
    await tx.$queryRaw`UPDATE "User" SET "updatedAt" = "updatedAt" WHERE id = ${candidate.userId}::uuid RETURNING id`;
    const row = await tx.checkout.findUniqueOrThrow({ where: { id: candidate.id }, include: checkoutInclude });
    if (row.status !== 'ACTIVE' || row.expiresAt > clock.now()) return 0;
    await lockOffers(tx, row.items.map(item => item.offerId)); await lockCoupons(tx, [row.couponUsage?.couponId]);
    await closeCheckout(tx, row, 'EXPIRED', clock, 'EXPIRY_JOB'); return 1;
  });
  return closed;
}
