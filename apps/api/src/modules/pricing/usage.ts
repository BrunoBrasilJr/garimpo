import type { Prisma } from '../../persistence/client.ts';
import { CartError } from '../cart/errors.ts';
/** Caller already owns the customer identity, offer locks, then the coupon row lock. */
export async function requireCouponCapacity(tx: Prisma.TransactionClient, couponId: string, userId: string, now: Date) {
  await tx.$queryRaw`SELECT id FROM "Coupon" WHERE id = ${couponId}::uuid FOR UPDATE`;
  const coupon = await tx.coupon.findUniqueOrThrow({ where: { id: couponId } });
  const where = { couponId, OR: [{ status: 'CONSUMED' as const }, { status: 'RESERVED' as const, expiresAt: { gt: now } }] };
  const total = await tx.couponUsage.count({ where }), own = await tx.couponUsage.count({ where: { ...where, userId } });
  if (coupon.totalLimit !== null && total >= coupon.totalLimit || coupon.perUserLimit !== null && own >= coupon.perUserLimit) throw new CartError(409, 'COUPON_LIMIT_REACHED', 'O limite de utilizações deste cupom foi alcançado.');
}
