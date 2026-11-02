import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { enqueue } from '../../core/outbox.ts';

export async function recordOpening(tx: Prisma.TransactionClient, offer: { id: string; editionId: string; version: number; stockOnHand: number }, actorId: string, clock: Clock) {
  if (offer.stockOnHand === 0) return;
  await tx.stockMovement.create({ data: { offerId: offer.id, offerVersion: offer.version, deltaOnHand: offer.stockOnHand, balanceBefore: 0,
    balanceAfter: offer.stockOnHand, reason: 'Estoque inicial', originKey: 'OPENING:' + offer.id, actorId, createdAt: clock.now() } });
  await enqueue(tx, { type: 'INVENTORY.STOCK_CHANGED', aggregateId: offer.id,
    payload: { offerId: offer.id, editionId: offer.editionId, before: 0, after: offer.stockOnHand } }, clock);
}
