import type { PriceQuote, OfferKind } from '../index.js';
export interface CartLine {
  id: string; offerId: string; editionId: string; title: string; kind: OfferKind; quantity: number;
  active: boolean; availableQuantity: number; lastSeenPriceCents: number; currentPriceCents: number;
  discGrade: string | null; sleeveGrade: string | null;
}
export type CartPricing = { status: 'READY'; revision: string; quote: PriceQuote; couponCode: string | null }
  | { status: 'UNAVAILABLE'; code: string; message: string };
export interface CartView { id: string; version: number; items: CartLine[]; pricing: CartPricing; serverTime: string }
export interface CartChange { cart: CartView; warnings: string[] }
