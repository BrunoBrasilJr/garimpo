import type { Clock } from '../../core/clock.ts';
import { enqueue } from '../../core/outbox.ts';
import type { Prisma } from '../../persistence/client.ts';
import { captureAvailability, publishAvailability } from '../engagement/availability.ts';
import { lockOffers } from './reservations.ts';

/** Replenish physical stock only for units explicitly accepted as fit, or never shipped. */
export async function restockReturn(tx: Prisma.TransactionClient, clock: Clock, returnId: string, actorId: string, offerIds: string[]) {
  const quantities = new Map<string, number>();
  for (const id of offerIds) quantities.set(id, (quantities.get(id) ?? 0) + 1);
  const ids = [...quantities.keys()];
  await lockOffers(tx, ids);
  const before = await captureAvailability(tx, ids, clock.now());
  for (const [offerId, quantity] of quantities) {
    const offer = await tx.offer.findUniqueOrThrow({ where: { id: offerId } });
    const after = await tx.offer.update({ where: { id: offerId }, data: { stockOnHand: { increment: quantity }, version: { increment: 1 } } });
    await tx.stockMovement.create({ data: {
      offerId, actorId, offerVersion: after.version, deltaOnHand: quantity,
      balanceBefore: offer.stockOnHand, balanceAfter: after.stockOnHand,
      reason: 'Reposição por devolução apta', originKey: 'RETURN:' + returnId + ':' + offerId, createdAt: clock.now()
    } });
    await enqueue(tx, { type: 'INVENTORY.STOCK_CHANGED', aggregateId: offerId,
      payload: { offerId, editionId: offer.editionId, before: offer.stockOnHand, after: after.stockOnHand } }, clock);
  }
  await publishAvailability(tx, before, clock);
}
