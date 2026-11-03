import type { Prisma } from '../../persistence/client.ts';
import { CartError } from '../cart/errors.ts';
/** Caller already owns the customer identity, offer locks, then the coupon row lock. */
export async function requireCouponCapacity(tx: Prisma.TransactionClient, couponId: string, userId: string, now: Date) {
  await tx.$queryRaw`UPDATE "Coupon" SET "updatedAt" = "updatedAt" WHERE id = ${couponId}::uuid RETURNING id`;
  const coupon = await tx.coupon.findUniqueOrThrow({ where: { id: couponId } });
  const where: Prisma.CouponUsageWhereInput = { couponId, OR: [{ status: 'CONSUMED', OR: [{ orderId: null }, { order: { status: { not: 'PENDING' } } }, { order: { expiresAt: { gt: now } } }] }, { status: 'RESERVED', expiresAt: { gt: now } }] };
  const total = await tx.couponUsage.count({ where }), own = await tx.couponUsage.count({ where: { ...where, userId } });
  if (coupon.totalLimit !== null && total >= coupon.totalLimit || coupon.perUserLimit !== null && own >= coupon.perUserLimit) throw new CartError(409, 'COUPON_LIMIT_REACHED', 'O limite de utilizações deste cupom foi alcançado.');
}
