import type { Clock } from '../../core/clock.ts';
import { enqueue } from '../../core/outbox.ts';
import type { Prisma } from '../../persistence/client.ts';

/** Called while holding the purchaser's identity lock. Refunds reserve their allocation even if the provider fails. */
export async function cancellationRefund(tx: Prisma.TransactionClient, clock: Clock, orderId: string, cancellationId: string, productCents: bigint, shippingCents: number) {
  if (productCents === 0n && shippingCents === 0) return null;
  const sale = await tx.financialEvent.findUniqueOrThrow({ where: { eventKey: 'SALE:' + orderId }, include: { paymentAttempt: true } });
  const allocated = await tx.refund.aggregate({ where: { paymentAttemptId: sale.paymentAttemptId }, _sum: { productCents: true, shippingCents: true } });
  if ((allocated._sum.productCents ?? 0n) + productCents > sale.productCents || (allocated._sum.shippingCents ?? 0) + shippingCents > sale.shippingCents) {
    throw new Error('Cancellation exceeds the captured allocation.');
  }
  const refund = await tx.refund.create({ data: {
    paymentAttemptId: sale.paymentAttemptId, orderId, origin: 'AUTOMATIC_CANCELLATION',
    originKey: 'CANCELLATION:' + cancellationId, productCents, shippingCents, createdAt: clock.now()
  } });
  await enqueue(tx, { type: 'REFUND.PENDING', aggregateId: refund.id, payload: { refundId: refund.id, userId: sale.paymentAttempt.userId, orderId } }, clock);
  return refund;
}
