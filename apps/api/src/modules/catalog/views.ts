import type { Prisma } from '../../persistence/client.ts';
import type { CatalogEdition, CatalogImage, CatalogOffer, ConditionGradeCode } from '@garimpo/contracts';

export const imageOrder = [{ position: 'asc' }, { id: 'asc' }] as const;
export const editionInclude = {
  label: true, primaryGenre: true,
  artists: { include: { artist: true }, orderBy: { artist: { name: 'asc' } } },
  genres: { include: { genre: true }, orderBy: { genre: { name: 'asc' } } },
  tracks: { orderBy: { position: 'asc' }, include: { artists: { include: { artist: true }, orderBy: { artist: { name: 'asc' } } } } },
  offers: { orderBy: [{ kind: 'asc' }, { priceCents: 'asc' }, { id: 'asc' }], include: { images: { orderBy: [...imageOrder] } } },
  images: { orderBy: [...imageOrder] }
} satisfies Prisma.EditionInclude;
export type EditionRecord = Prisma.EditionGetPayload<{ include: typeof editionInclude }>;
export type OfferRecord = EditionRecord['offers'][number];
export function imageView(image: EditionRecord['images'][number]): CatalogImage {
  return { id: image.id, url: '/api/v1/media/products/' + image.storageKey, description: image.description,
    position: image.position, contentHash: image.contentHash, mimeType: image.mimeType,
    byteSize: image.byteSize, width: image.width, height: image.height };
}
export function offerView(offer: OfferRecord, editionActive: boolean): CatalogOffer {
  return { id: offer.id, editionId: offer.editionId, kind: offer.kind, priceCents: offer.priceCents,
    discGrade: offer.discGrade as ConditionGradeCode | null, sleeveGrade: offer.sleeveGrade as ConditionGradeCode | null,
    particulars: offer.particulars, stockOnHand: offer.stockOnHand, active: offer.active,
    available: editionActive && offer.active && offer.stockOnHand > 0, version: offer.version, images: offer.images.map(imageView) };
}
export function editionView(edition: EditionRecord, visibleOffers = edition.offers): CatalogEdition {
  const offers = visibleOffers.map(offer => offerView(offer, edition.active));
  const prices = offers.filter(offer => offer.active).map(offer => offer.priceCents);
  return { id: edition.id, title: edition.title, label: edition.label, primaryGenre: edition.primaryGenre,
    artists: edition.artists.map(item => item.artist), genres: edition.genres.map(item => item.genre),
    originalYear: edition.originalYear, editionYear: edition.editionYear, format: edition.format,
    catalogNumber: edition.catalogNumber, weightGrams: edition.weightGrams, pressingCountry: edition.pressingCountry,
    collectorEdition: edition.collectorEdition, lowStockNewThreshold: edition.lowStockNewThreshold,
    active: edition.active, available: offers.some(offer => offer.available), minPriceCents: prices.length ? Math.min(...prices) : null,
    tracks: edition.tracks.map(track => ({ id: track.id, position: track.position, title: track.title,
      durationSeconds: track.durationSeconds, audioUrl: track.audioUrl, artists: track.artists.map(item => item.artist) })),
    offers, images: edition.images.map(imageView) };
}
