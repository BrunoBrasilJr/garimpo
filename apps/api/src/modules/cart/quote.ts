import type { CheckoutSnapshot, CheckoutProduct } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import type { Accounts } from '../accounts/service.ts';
import { Pricing, activePromotions } from '../pricing/service.ts';
import { promoted } from '../pricing/calculate.ts';
import { payloadHash } from '../../core/idempotency.ts';
import { reservedQuantities } from '../inventory/reservations.ts';
import { CartError } from './errors.ts';
import { quantities, unitIdentity } from './rules.ts';
const images = { orderBy: [{ position: 'asc' }, { id: 'asc' }] } satisfies Prisma.ProductImageFindManyArgs;
export const cartInclude = { items: { orderBy: { id: 'asc' }, include: { offer: { include: {
  edition: { include: { artists: { include: { artist: true } }, primaryGenre: true, genres: { include: { genre: true }, orderBy: { genreId: 'asc' } }, label: true, images } }, images
} } } } } satisfies Prisma.CartInclude;
export type CartRecord = Prisma.CartGetPayload<{ include: typeof cartInclude }>;
export const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export async function physicalLines(tx: Prisma.TransactionClient, cart: CartRecord, now: Date, ignoreCheckoutId?: string) {
  const ids = cart.items.map(item => item.offerId), reserved = await reservedQuantities(tx, ids, now, ignoreCheckoutId), promotions = await activePromotions(tx, ids, now);
  return cart.items.map(item => ({ id: item.id, offerId: item.offerId, editionId: item.offer.editionId, title: item.offer.edition.title, kind: item.offer.kind, quantity: item.quantity,
    active: item.offer.active && item.offer.edition.active, availableQuantity: item.offer.active && item.offer.edition.active ? Math.max(0, item.offer.stockOnHand - (reserved.get(item.offerId) ?? 0)) : 0,
    lastSeenPriceCents: item.lastSeenPriceCents, currentPriceCents: promoted({ offerId: item.offerId, basePriceCents: item.offer.priceCents }, promotions, now).priceCents,
    discGrade: item.offer.discGrade, sleeveGrade: item.offer.sleeveGrade }));
}
export async function captureQuote(tx: Prisma.TransactionClient, accounts: Accounts, cart: CartRecord, couponCode?: string): Promise<{ snapshot: CheckoutSnapshot; revision: string }> {
  quantities(cart.items);
  if (!cart.items.length) throw new CartError(409, 'EMPTY_CART', 'Adicione um disco ao carrinho antes de finalizar.');
  const requested = cart.items.flatMap(item => Array.from({ length: item.quantity }, (_unused, index) => ({ id: unitIdentity(item.id, index), offerId: item.offerId })));
  const quote = await new Pricing(accounts).quote(tx, requested, couponCode);
  const products: CheckoutProduct[] = cart.items.map(item => ({ offerId: item.offerId, editionId: item.offer.editionId, title: item.offer.edition.title, kind: item.offer.kind, quantity: item.quantity,
    discGrade: item.offer.discGrade, sleeveGrade: item.offer.sleeveGrade, particulars: item.offer.particulars,
    originalYear: item.offer.edition.originalYear, editionYear: item.offer.edition.editionYear, format: item.offer.edition.format,
    artists: item.offer.edition.artists.map(value => value.artist.name).sort(), primaryGenre: item.offer.edition.primaryGenre.name, primaryGenreId: item.offer.edition.primaryGenreId,
    genres: item.offer.edition.genres.map(value => ({ id: value.genreId, name: value.genre.name })), label: item.offer.edition.label ? { id: item.offer.edition.label.id, name: item.offer.edition.label.name } : null,
    catalogNumber: item.offer.edition.catalogNumber, pressingCountry: item.offer.edition.pressingCountry, collectorEdition: item.offer.edition.collectorEdition, weightGrams: item.offer.edition.weightGrams,
    images: (item.offer.kind === 'USED' ? item.offer.images : item.offer.edition.images).map(image => ({ id: image.id, url: '/api/v1/media/products/' + image.storageKey, description: image.description,
      position: image.position, contentHash: image.contentHash, mimeType: image.mimeType, byteSize: image.byteSize, width: image.width, height: image.height })),
    unitIds: requested.filter(unit => unit.offerId === item.offerId).map(unit => unit.id) }));
  const couponSnapshot = quote.couponId ? await tx.coupon.findUniqueOrThrow({ where: { id: quote.couponId }, include: { targets: { orderBy: { id: 'asc' } } } }) : null;
  const promotionSnapshots = await tx.promotion.findMany({ where: { id: { in: [...new Set(quote.units.map(unit => unit.promotionId).filter((id): id is string => id !== null))] } }, orderBy: { id: 'asc' } });
  const snapshot = JSON.parse(JSON.stringify({ quote, products, couponSnapshot, promotionSnapshots })) as CheckoutSnapshot;
  return { snapshot, revision: payloadHash({ cartId: cart.id, version: cart.version, couponCode: couponCode ?? null, ...snapshot }) };
}
