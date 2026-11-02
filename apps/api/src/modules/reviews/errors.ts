export class ReviewError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
export const missingReview = () => new ReviewError(404, 'REVIEW_NOT_FOUND', 'Esta avaliação não está disponível.');
export const staleReview = () => new ReviewError(409, 'REVIEW_REVISION_CONFLICT', 'A avaliação mudou. Atualize a página e confira a revisão atual.');
