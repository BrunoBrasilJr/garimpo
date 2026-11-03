/** Operational bootstrap only; business contracts belong to their own TASKs. */
export interface HealthResponse {
  status: 'ok';
  service: 'garimpo-api';
}
export type { ErrorEnvelope } from './errors.js';
export type { AccountView, AddressInput } from './accounts/index.js';
export type { AccessRequestAccepted, RestrictedMessage } from './messaging/index.js';
export { GOLDMINE_GRADES } from './catalog/index.js';
export type { ConditionGradeCode, OfferKind, MetadataType, CatalogMetadata, CatalogImage, CatalogTrack, CatalogOffer, CatalogEdition, CatalogPage, CatalogFilters } from './catalog/index.js';
export type { StockMovementView, StockOfferView, StockEditionView, StockPage, StockAdjustmentResult } from './inventory/index.js';
export type { AvailabilityKind, SavedEdition, WishView, AlertView, EngagementPage, AvailabilityMessageContent } from './engagement/index.js';
export type { PublicReview, PrivateReview, ReviewPage, PublicReviewPage, ReviewDraft, ReviewRevisionView } from './reviews/index.js';
export type { DiscountType, PricingTarget, NamedPricingTarget, DiscountView, PromotionView, CouponView, PricingPage, PricedUnit, PriceQuote } from './pricing/index.js';
export type { CartLine, CartPricing, CartView, CartChange } from './cart/index.js';
export type { CheckoutProduct, CheckoutSnapshot, CheckoutView, CheckoutQuote, InitialChargeView, OrderCreationView } from './checkout/index.js';
export type { CepRangeInput, FreightRateInput, FreightRateView, FreightPage, FreightQuote, DeliveryAddressSnapshot, AcceptedFreight } from './freight/index.js';
export { GuestCartStore, GuestDataError, decodeGuest, guestTag } from './cart/guest.js';
export type { GuestLine, GuestMergeIntent, GuestCartState, GuestStorage, GuestExclusive } from './cart/guest.js';
export type { PaymentScenario, PaymentView, PaymentPage, RefundView, CommerceMessageContent } from './payments/index.js';
