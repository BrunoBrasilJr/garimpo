import type { PriceQuote, OfferKind } from '../index.js';
export interface CheckoutProduct {
  offerId: string; editionId: string; title: string; kind: OfferKind; quantity: number;
  discGrade: string | null; sleeveGrade: string | null; particulars: string | null;
  editionYear: number | null; format: string; artists: string[]; primaryGenre: string;
  images: { url: string; description: string }[]; unitIds: string[];
}
export interface CheckoutSnapshot {
  quote: PriceQuote; products: CheckoutProduct[]; couponSnapshot: unknown; promotionSnapshots: unknown[];
}
export interface CheckoutView extends CheckoutSnapshot {
  id: string; status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'CONVERTED'; version: number; cartVersion: number;
  couponCode: string | null; addressId: string | null; createdAt: string; expiresAt: string; serverTime: string;
}
