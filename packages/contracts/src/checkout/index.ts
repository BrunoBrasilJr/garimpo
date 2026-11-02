import type { PriceQuote } from '../pricing/index.js';
import type { OfferKind, CatalogImage } from '../catalog/index.js';
import type { AcceptedFreight, FreightQuote, DeliveryAddressSnapshot } from '../freight/index.js';
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
  freight?: AcceptedFreight | null;
}
export interface CheckoutQuote {
  quote: PriceQuote; freight: FreightQuote; freightRevision: string; totalCents: number | null; serverTime: string;
  checkout: { id: string; version: number; expiresAt: string } | null;
}
export interface InitialChargeView { id: string; method: 'PIX' | 'BOLETO'; amountCents: number; status: 'ACTIVE' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'SUPERSEDED'; expiresAt: string }
export interface OrderCreationView extends CheckoutSnapshot {
  id: string; checkoutId: string; status: 'PENDING' | 'PAID' | 'PREPARING' | 'SEPARATED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'; method: 'PIX' | 'BOLETO' | 'CARD'; version: number;
  address: DeliveryAddressSnapshot; freight: Extract<FreightQuote, { served: true }>; totalCents: number; createdAt: string; expiresAt: string | null;
  units: { id: string; offerId: string; logicalIndex: number; netPaidCents: number }[]; charges: InitialChargeView[];
}
