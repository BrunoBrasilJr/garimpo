import type { Prisma } from '../../persistence/client.ts';
/** Only live reservations reduce physical capacity; a delayed expiry job cannot prolong a hold. */
export async function reservedQuantities(tx: Prisma.TransactionClient, offerIds: string[], now: Date, ignoreCheckoutId?: string) {
  const rows = await tx.reservation.groupBy({ by: ['offerId'], where: { offerId: { in: offerIds }, status: 'ACTIVE', expiresAt: { gt: now }, ...(ignoreCheckoutId ? { checkoutItem: { checkoutId: { not: ignoreCheckoutId } } } : {}) }, _sum: { quantity: true } });
  return new Map(rows.map(row => [row.offerId, row._sum.quantity ?? 0]));
}
export async function lockOffers(tx: Prisma.TransactionClient, offerIds: string[]) {
  offerIds = offerIds.map(id => id.toLowerCase());
  const rows = await tx.offer.findMany({ where: { id: { in: [...new Set(offerIds)] } }, select: { editionId: true } });
  for (const id of [...new Set(rows.map(row => row.editionId))].sort()) await tx.$queryRaw`SELECT id FROM "Edition" WHERE id = ${id}::uuid FOR UPDATE`;
  for (const id of [...new Set(offerIds)].sort()) await tx.$queryRaw`SELECT id FROM "Offer" WHERE id = ${id}::uuid FOR UPDATE`;
}
