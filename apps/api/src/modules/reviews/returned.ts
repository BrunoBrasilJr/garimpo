import type { Clock } from '../../core/clock.ts';
import { appendAudit } from '../../core/audit.ts';
import type { Prisma } from '../../persistence/client.ts';

export async function hideReturnedReviews(tx: Prisma.TransactionClient, clock: Clock, orderId: string, actorId: string, editionIds: string[]) {
  for (const editionId of new Set(editionIds)) {
    const retained = await tx.orderUnit.count({ where: { orderItem: { orderId, editionId }, commercialState: 'KEPT' } });
    if (retained) continue;
    const review = await tx.review.findFirst({ where: { orderId, editionId, visibility: 'PUBLIC' } });
    if (!review) continue;
    const updated = await tx.review.update({ where: { id: review.id }, data: {
      visibility: 'HIDDEN', hiddenReason: 'Todas as unidades da edição foram devolvidas.', awaitingModeration: false,
      version: { increment: 1 }, updatedAt: clock.now()
    } });
    await tx.reviewRevision.create({ data: {
      reviewId: review.id, actorId, version: updated.version, rating: updated.rating, comment: updated.comment,
      visibility: 'HIDDEN', awaitingModeration: false, action: 'HIDDEN', reason: 'ALL_EDITION_UNITS_RETURNED', createdAt: clock.now()
    } });
    await appendAudit(tx, { actorId, action: 'REVIEW.HIDDEN', targetType: 'REVIEW', targetId: review.id, result: 'SUCCESS',
      reason: 'ALL_EDITION_UNITS_RETURNED', changes: { revision: updated.version } }, clock);
  }
}
