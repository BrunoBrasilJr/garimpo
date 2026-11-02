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
