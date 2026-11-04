import type { Prisma } from '../../persistence/client.ts';
import { ReviewError } from './errors.ts';
export interface ReviewPurchaseKey { userId: string; editionId: string; orderId: string }
export type ReviewPurchase = { status: 'UNAVAILABLE' } | { status: 'KNOWN'; delivered: boolean; retainedUnits: number };
/** Adapter must inspect real delivered/retained purchase state in this same transaction. */
export interface ReviewPurchases { inspect(tx: Prisma.TransactionClient, key: ReviewPurchaseKey): Promise<ReviewPurchase> }
export const unavailableReviewPurchases = Object.freeze<ReviewPurchases>({ async inspect() { return { status: 'UNAVAILABLE' }; } });
export const deliveredPurchases: ReviewPurchases = {
  async inspect(tx, { orderId, userId, editionId }) {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId, status: 'DELIVERED' },
      select: { id: true }
    });
    const retainedUnits = order ? await tx.orderUnit.count({
      where: { commercialState: 'KEPT', deliveredAt: { not: null }, orderItem: { orderId, editionId } }
    }) : 0;
    return { status: 'KNOWN', delivered: Boolean(order), retainedUnits };
  }
};
export function requireEligible(value: ReviewPurchase) {
  if (value.status !== 'KNOWN' || typeof value.delivered !== 'boolean' || !Number.isSafeInteger(value.retainedUnits) || value.retainedUnits < 0) throw new ReviewError(503, 'REVIEW_PURCHASE_UNAVAILABLE', 'Não foi possível conferir esta compra agora. Tente novamente mais tarde.');
  if (!value.delivered || value.retainedUnits === 0) throw new ReviewError(403, 'REVIEW_NOT_ELIGIBLE', 'A avaliação exige uma compra entregue com unidade desta edição mantida.');
}
