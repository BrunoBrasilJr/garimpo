import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { appendAudit } from '../../core/audit.ts';
import { CartError } from '../cart/errors.ts';
/** Internal integration for TASK-025. Caller owns User/offers/coupon and updates remaining commercial units in this same transaction. */
export async function replaceCharge(tx: Prisma.TransactionClient, orderId: string, previousId: string, productCents: bigint, shippingCents: number, clock: Clock) {
  const order = await tx.order.findUniqueOrThrow({ where: { id: orderId } }), old = await tx.paymentCharge.findFirst({ where: { id: previousId, orderId } });
  if (!old || order.status !== 'PENDING' || !order.expiresAt || order.expiresAt <= clock.now()) throw new CartError(409, 'CHARGE_UNAVAILABLE', 'O pedido não permite substituir esta cobrança.');
  const replay = await tx.paymentCharge.findUnique({ where: { supersedesId: previousId } });
  if (replay) { if (replay.productCents !== productCents || replay.shippingCents !== shippingCents) throw new CartError(409, 'CHARGE_REPLACEMENT_CONFLICT', 'Esta cobrança já foi substituída com outros valores.'); return replay; }
  if (old.status !== 'ACTIVE' || productCents < 0n || !Number.isSafeInteger(shippingCents) || shippingCents < 0 || productCents + BigInt(shippingCents) > old.amountCents) throw new CartError(409, 'CHARGE_REPLACEMENT_CONFLICT', 'Confira o saldo remanescente da cobrança.');
  await tx.paymentCharge.update({ where: { id: old.id }, data: { status: productCents + BigInt(shippingCents) === 0n ? 'CANCELLED' : 'SUPERSEDED' } });
  const row = productCents + BigInt(shippingCents) === 0n ? null : await tx.paymentCharge.create({ data: { orderId, method: old.method, amountCents: productCents + BigInt(shippingCents), productCents, shippingCents, supersedesId: old.id, createdAt: clock.now(), expiresAt: old.expiresAt } });
  await appendAudit(tx, { action: 'CHARGE.REPLACED', targetType: 'ORDER', targetId: orderId, result: 'SUCCESS', reason: 'INTERNAL_REMAINING_AMOUNT', changes: { previousId, replacementId: row?.id ?? null } }, clock); return row;
}
