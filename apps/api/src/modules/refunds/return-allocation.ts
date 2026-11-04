import type { Clock } from '../../core/clock.ts';
import { enqueue } from '../../core/outbox.ts';
import type { Prisma } from '../../persistence/client.ts';

/** Caller owns the buyer's identity lock and has applied the approved units. */
export async function allocateReturnRefund(tx: Prisma.TransactionClient, clock: Clock, orderId: string, returnId: string, unitAmounts: number[]) {
  const sale = await tx.financialEvent.findUniqueOrThrow({
    where: { eventKey: 'SALE:' + orderId }, include: { paymentAttempt: { select: { userId: true } } }
  });
  const [allocated, remaining] = await Promise.all([
    tx.refund.aggregate({ where: { paymentAttemptId: sale.paymentAttemptId }, _sum: { productCents: true, shippingCents: true } }),
    tx.orderUnit.count({ where: { orderItem: { orderId }, commercialState: 'KEPT' } })
  ]);
  const productCents = unitAmounts.reduce((sum, amount) => sum + BigInt(amount), 0n);
  const shippingBalance = sale.shippingCents - (allocated._sum.shippingCents ?? 0);
  if (shippingBalance < 0 || (allocated._sum.productCents ?? 0n) + productCents > sale.productCents) {
    throw new Error('Return exceeds the captured allocation.');
  }
  const shippingCents = remaining === 0 ? shippingBalance : 0;
  if (productCents === 0n && shippingCents === 0) return null;
  const refund = await tx.refund.create({ data: {
    paymentAttemptId: sale.paymentAttemptId, orderId, origin: 'POST_SALE_RETURN',
    originKey: 'RETURN:' + returnId, productCents, shippingCents, createdAt: clock.now()
  } });
  await enqueue(tx, { type: 'REFUND.PENDING', aggregateId: refund.id, payload: { refundId: refund.id, userId: sale.paymentAttempt.userId, orderId } }, clock);
  return refund;
}
