export interface PublicReview { id: string; authorName: string; rating: number; comment: string; createdAt: string; updatedAt: string }
export interface PrivateReview extends PublicReview { editionId: string; editionTitle: string; orderId: string; version: number; visibility: 'PUBLIC' | 'HIDDEN'; awaitingModeration: boolean; hiddenReason: string | null }
export interface ReviewPage<T> { items: T[]; page: number; pageSize: number; total: number }
export interface PublicReviewPage extends ReviewPage<PublicReview> { summary: { count: number; average: number | null } }
export interface ReviewDraft { rating: number; comment: string }
export interface ReviewRevisionView { version: number; rating: number; comment: string; visibility: 'PUBLIC' | 'HIDDEN'; awaitingModeration: boolean; action: string; reason: string; actorName: string; createdAt: string }
