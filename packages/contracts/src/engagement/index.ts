export type AvailabilityKind = 'NEW' | 'USED' | 'ANY';
export interface SavedEdition { id: string; title: string; active: boolean }
export interface WishView { id: string; edition: SavedEdition; createdAt: string }
export interface AlertView { id: string; edition: SavedEdition; kind: AvailabilityKind; status: 'ACTIVE' | 'DELIVERED' | 'CANCELLED'; createdAt: string; closedAt: string | null; delivery: { status: 'PENDING' | 'FAILED' | 'DELIVERED'; attempts: number } | null }
export interface EngagementPage<T> { items: T[]; page: number; pageSize: number; total: number }
/** Protected technical mailbox variant; stock notices have no access-token expiry. */
export interface AvailabilityMessageContent { recipient: string; purpose: 'AVAILABILITY'; editionId: string; title: string; kind: 'NEW' | 'USED'; link: string; notice: string }
