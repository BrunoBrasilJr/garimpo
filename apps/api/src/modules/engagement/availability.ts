import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { enqueue } from '../../core/outbox.ts';
import { reservedQuantities } from '../inventory/reservations.ts';
export type Availability = { NEW: boolean; USED: boolean };
/** null captures the last durable reservation state before an expiry is materialized. */
export async function availability(tx: Prisma.TransactionClient, editionId: string, asOf: Date | null): Promise<Availability> {
  const result = { NEW: false, USED: false };
  const edition = await tx.edition.findUnique({
    where: { id: editionId },
    select: { active: true, offers: { where: { active: true, stockOnHand: { gt: 0 } }, select: { id: true, kind: true, stockOnHand: true } } }
  });
  if (!edition?.active || !edition.offers.length) return result;
  const ids = edition.offers.map(offer => offer.id);
  const held = asOf ? await reservedQuantities(tx, ids, asOf) : new Map(
    (await tx.reservation.groupBy({
      by: ['offerId'], where: { offerId: { in: ids }, status: 'ACTIVE' }, _sum: { quantity: true }
    })).map(row => [row.offerId, row._sum.quantity ?? 0])
  );
  for (const offer of edition.offers) {
    if (offer.stockOnHand > (held.get(offer.id) ?? 0)) result[offer.kind] = true;
  }
  return result;
}

export async function captureAvailability(tx: Prisma.TransactionClient, offerIds: string[], asOf: Date | null, snapshots = new Map<string, Availability>()) {
  if (!offerIds.length) return snapshots;
  const offers = await tx.offer.findMany({
    where: { id: { in: offerIds } }, select: { editionId: true }, distinct: ['editionId']
  });
  for (const { editionId } of offers) {
    if (!snapshots.has(editionId)) snapshots.set(editionId, await availability(tx, editionId, asOf));
  }
  return snapshots;
}

export async function publishAvailability(tx: Prisma.TransactionClient, snapshots: ReadonlyMap<string, Availability>, clock: Clock) {
  for (const [editionId, before] of snapshots) await availabilityReturned(tx, editionId, before, clock);
}
export async function availabilityReturned(tx: Prisma.TransactionClient, editionId: string, before: Availability, clock: Clock) {
  const after = await availability(tx, editionId, clock.now());
  for (const kind of ['NEW', 'USED'] as const) if (!before[kind] && after[kind]) {
    const edition = await tx.edition.findUniqueOrThrow({ where: { id: editionId }, select: { title: true } });
    const event = await enqueue(tx, { type: 'AVAILABILITY.RETURNED', aggregateId: editionId, payload: { editionId, kind, title: edition.title } }, clock);
    // Freeze the audience while the same edition lock serializes subscriptions.
    // An activation has one durable trigger even when retries span later restocks.
    await tx.availabilityAlert.updateMany({ where: { editionId, status: 'ACTIVE', triggerEventId: null, kind: { in: [kind, 'ANY'] } }, data: { triggerEventId: event.id } });
  }
}
