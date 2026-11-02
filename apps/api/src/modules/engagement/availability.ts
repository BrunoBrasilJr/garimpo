import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { enqueue } from '../../core/outbox.ts';
export type Availability = { NEW: boolean; USED: boolean };
/** Caller holds the edition lock. Physical public-offer availability until commercial integration TASK-023. */
export async function availability(tx: Prisma.TransactionClient, editionId: string): Promise<Availability> {
  const edition = await tx.edition.findUnique({ where: { id: editionId }, select: { active: true, offers: { where: { active: true, stockOnHand: { gt: 0 } }, select: { kind: true } } } });
  return { NEW: Boolean(edition?.active && edition.offers.some(offer => offer.kind === 'NEW')), USED: Boolean(edition?.active && edition.offers.some(offer => offer.kind === 'USED')) };
}
export async function availabilityReturned(tx: Prisma.TransactionClient, editionId: string, before: Availability, clock: Clock) {
  const after = await availability(tx, editionId);
  for (const kind of ['NEW', 'USED'] as const) if (!before[kind] && after[kind]) {
    const edition = await tx.edition.findUniqueOrThrow({ where: { id: editionId }, select: { title: true } });
    const event = await enqueue(tx, { type: 'AVAILABILITY.RETURNED', aggregateId: editionId, payload: { editionId, kind, title: edition.title } }, clock);
    // Freeze the audience while the same edition lock serializes subscriptions.
    // An activation has one durable trigger even when retries span later restocks.
    await tx.availabilityAlert.updateMany({ where: { editionId, status: 'ACTIVE', triggerEventId: null, kind: { in: [kind, 'ANY'] } }, data: { triggerEventId: event.id } });
  }
}
