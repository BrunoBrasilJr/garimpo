import { Prisma } from '../../persistence/generated/client.ts';
import type { Prisma as Types } from '../../persistence/client.ts';
import type { CatalogPage } from '@garimpo/contracts';
import type { CatalogQuery } from './validation.ts';
import { editionInclude, editionView } from './views.ts';
import type { EditionRecord } from './views.ts';
import { activePromotions } from '../pricing/service.ts';
import { promoted } from '../pricing/calculate.ts';
import type { PromotionRule } from '../pricing/calculate.ts';
import { reservedQuantities } from '../inventory/reservations.ts';

/** Alias o is fixed in this module. All values, dates and filters are bound parameters. */
function effectivePrice(now: Date) {
  return Prisma.sql`COALESCE((SELECT MIN(GREATEST(0::bigint, o."priceCents"::bigint -
    CASE WHEN p.type = 'PERCENT' THEN o."priceCents"::bigint * p.amount::bigint / 10000 ELSE p.amount::bigint END))
    FROM "PromotionOffer" po JOIN "Promotion" p ON p.id = po."promotionId"
    WHERE po."offerId" = o.id AND p.active = true AND p."startsAt" <= ${now} AND p."endsAt" > ${now}), o."priceCents"::bigint)`;
}
function offerMatch(query: CatalogQuery, now: Date) {
  const parts = [Prisma.sql`o."editionId" = e.id`, Prisma.sql`o.active = true`];
  if (query.discCondition || query.sleeveCondition) parts.push(Prisma.sql`o.kind = 'USED'`);
  if (query.discCondition) parts.push(Prisma.sql`o."discGrade" = ${query.discCondition}`);
  if (query.sleeveCondition) parts.push(Prisma.sql`o."sleeveGrade" = ${query.sleeveCondition}`);
  if (query.minPrice !== undefined) parts.push(Prisma.sql`${effectivePrice(now)} >= ${query.minPrice}`);
  if (query.maxPrice !== undefined) parts.push(Prisma.sql`${effectivePrice(now)} <= ${query.maxPrice}`);
  return Prisma.join(parts, ' AND ');
}
function pricedOffers(edition: EditionRecord, rules: PromotionRule[], now: Date, holds: ReadonlyMap<string, number>, query?: CatalogQuery) {
  return edition.offers.filter(offer => offer.active).map(offer => ({ ...offer, priceCents: promoted({ offerId: offer.id, basePriceCents: offer.priceCents }, rules, now).priceCents })).filter(offer => !query ||
    (query.minPrice === undefined || offer.priceCents >= query.minPrice) && (query.maxPrice === undefined || offer.priceCents <= query.maxPrice)
    && (!query.discCondition || offer.kind === 'USED' && offer.discGrade === query.discCondition) && (!query.sleeveCondition || offer.kind === 'USED' && offer.sleeveGrade === query.sleeveCondition)
    && (query.available === undefined || (offer.stockOnHand > (holds.get(offer.id) ?? 0)) === query.available));
}
export async function publicPricedEdition(tx: Types.TransactionClient, edition: EditionRecord, now: Date) {
  const ids = edition.offers.map(offer => offer.id);
  const rules = await activePromotions(tx, ids, now);
  const holds = await reservedQuantities(tx, ids, now);
  return editionView(edition, pricedOffers(edition, rules, now, holds), holds);
}
/** Page first in PostgreSQL: never load the entire catalog to apply price filters in JavaScript. */
export async function publicPricedCatalog(tx: Types.TransactionClient, query: CatalogQuery, now: Date): Promise<CatalogPage> {
  const parts = [Prisma.sql`e.active = true`];
  if (query.genre) parts.push(Prisma.sql`EXISTS (SELECT 1 FROM "EditionGenre" eg WHERE eg."editionId" = e.id AND eg."genreId" = ${query.genre}::uuid)`);
  if (query.decade !== undefined) parts.push(Prisma.sql`e."editionYear" BETWEEN ${query.decade} AND ${query.decade + 9}`);
  if (query.artist) parts.push(Prisma.sql`(EXISTS (SELECT 1 FROM "EditionArtist" ea WHERE ea."editionId" = e.id AND ea."artistId" = ${query.artist}::uuid)
    OR EXISTS (SELECT 1 FROM "Track" t JOIN "TrackArtist" ta ON ta."trackId" = t.id WHERE t."editionId" = e.id AND ta."artistId" = ${query.artist}::uuid))`);
  if (query.q) parts.push(Prisma.sql`(strpos(lower(e.title), lower(${query.q})) > 0
    OR EXISTS (SELECT 1 FROM "EditionArtist" ea JOIN "Artist" a ON a.id = ea."artistId" WHERE ea."editionId" = e.id AND strpos(lower(a.name), lower(${query.q})) > 0)
    OR EXISTS (SELECT 1 FROM "Track" t WHERE t."editionId" = e.id AND (strpos(lower(t.title), lower(${query.q})) > 0
      OR EXISTS (SELECT 1 FROM "TrackArtist" ta JOIN "Artist" a ON a.id = ta."artistId" WHERE ta."trackId" = t.id AND strpos(lower(a.name), lower(${query.q})) > 0))))`);
  const matching = offerMatch(query, now);
  if (query.minPrice !== undefined || query.maxPrice !== undefined || query.discCondition || query.sleeveCondition) parts.push(Prisma.sql`EXISTS (SELECT 1 FROM "Offer" o WHERE ${matching})`);
  const availableOffer = Prisma.sql`SELECT 1 FROM "Offer" o WHERE ${matching}
    AND o."stockOnHand" > COALESCE((SELECT SUM(r.quantity) FROM "Reservation" r
      WHERE r."offerId" = o.id AND r.status = 'ACTIVE' AND r."expiresAt" > ${now}), 0)`;
  if (query.available === true) parts.push(Prisma.sql`EXISTS (${availableOffer})`);
  if (query.available === false) parts.push(Prisma.sql`NOT EXISTS (${availableOffer})`);
  const where = Prisma.join(parts, ' AND ');
  const counts = await tx.$queryRaw<{ total: bigint }[]>(Prisma.sql`SELECT count(*)::bigint AS total FROM "Edition" e WHERE ${where}`);
  const total = Number(counts[0]!.total);
  const ids = await tx.$queryRaw<{ id: string }[]>(Prisma.sql`SELECT e.id FROM "Edition" e WHERE ${where} ORDER BY e.title ASC, e.id ASC LIMIT ${query.pageSize} OFFSET ${(query.page - 1) * query.pageSize}`);
  const rows = await tx.edition.findMany({ where: { id: { in: ids.map(row => row.id) } }, include: editionInclude, orderBy: [{ title: 'asc' }, { id: 'asc' }] });
  const offerIds = rows.flatMap(row => row.offers.map(offer => offer.id));
  const rules = await activePromotions(tx, offerIds, now);
  const holds = await reservedQuantities(tx, offerIds, now);
  return { items: rows.map(row => editionView(row, pricedOffers(row, rules, now, holds, query), holds)), page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) };
}
