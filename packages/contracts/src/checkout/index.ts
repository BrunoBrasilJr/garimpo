import type { PriceQuote } from '../pricing/index.js';
import type { OfferKind, CatalogImage } from '../catalog/index.js';
export interface CheckoutProduct {
  offerId: string; editionId: string; title: string; kind: OfferKind; quantity: number;
  discGrade: string | null; sleeveGrade: string | null; particulars: string | null;
  originalYear: number | null; editionYear: number | null; format: string; artists: string[];
  primaryGenre: string; primaryGenreId: string; genres: { id: string; name: string }[];
  label: { id: string; name: string } | null; catalogNumber: string | null; pressingCountry: string | null;
  collectorEdition: boolean; weightGrams: number | null;
  images: CatalogImage[]; unitIds: string[];
}
export interface CheckoutSnapshot {
  quote: PriceQuote; products: CheckoutProduct[]; couponSnapshot: unknown; promotionSnapshots: unknown[];
}
export interface CheckoutView extends CheckoutSnapshot {
  id: string; status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'CONVERTED'; version: number; cartVersion: number;
  couponCode: string | null; addressId: string | null; createdAt: string; expiresAt: string; serverTime: string;
}
