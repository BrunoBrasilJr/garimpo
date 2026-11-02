import type { PrivateReview, PublicReview, PublicReviewPage, ReviewPage, ReviewDraft, ReviewRevisionView } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import { serializable } from '../../persistence/transaction.ts';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { appendAudit } from '../../core/audit.ts';
import { requireEligible, unavailableReviewPurchases } from './purchases.ts';
import type { ReviewPurchases } from './purchases.ts';
import { missingReview, staleReview, ReviewError } from './errors.ts';
const include = { user: { select: { name: true } }, edition: { select: { title: true } } } satisfies Prisma.ReviewInclude;
type Row = Prisma.ReviewGetPayload<{ include: typeof include }>;
const publicView = (row: Row): PublicReview => ({ id: row.id, authorName: row.user.name.trim().split(/\s+/)[0] ?? 'Cliente', rating: row.rating, comment: row.comment, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
const privateView = (row: Row): PrivateReview => ({ ...publicView(row), editionId: row.editionId, editionTitle: row.edition.title, orderId: row.orderId, version: row.version, visibility: row.visibility, awaitingModeration: row.awaitingModeration, hiddenReason: row.hiddenReason });
export class Reviews {
  readonly accounts: Accounts;
  readonly purchases: ReviewPurchases;
  constructor(accounts: Accounts, purchases: ReviewPurchases = unavailableReviewPurchases) { this.accounts = accounts; this.purchases = purchases; }
  async staff(tx: Prisma.TransactionClient, access: string) {
    const { user } = await this.accounts.authorize(tx, access);
    if (user.context !== 'STAFF' || !['ADMIN', 'OPERATOR'].includes(user.role)) throw new AccountError(403, 'STAFF_REQUIRED'); return user;
  }
  private async eligible(tx: Prisma.TransactionClient, key: { userId: string; editionId: string; orderId: string }) { requireEligible(await this.purchases.inspect(tx, key)); }
  private async snapshot(tx: Prisma.TransactionClient, row: Row, actorId: string, action: string, reason: string) {
    await tx.reviewRevision.create({ data: { reviewId: row.id, actorId, version: row.version, rating: row.rating, comment: row.comment, visibility: row.visibility, awaitingModeration: row.awaitingModeration, action, reason, createdAt: this.accounts.clock.now() } });
    await appendAudit(tx, { actorId, action: 'REVIEW.' + action, targetType: 'REVIEW', targetId: row.id, result: 'SUCCESS', reason: 'REVIEW_COMMAND', changes: { revision: row.version, visibility: row.visibility, reason } }, this.accounts.clock);
  }
  async publicList(editionId: string, page = 1, pageSize = 20): Promise<PublicReviewPage> {
    return serializable(this.accounts.db, async tx => {
      if (!await tx.edition.findFirst({ where: { id: editionId, active: true } })) throw new ReviewError(404, 'EDITION_NOT_FOUND', 'Esta edição não está disponível.');
      const where = { editionId, visibility: 'PUBLIC' as const }, aggregate = await tx.review.aggregate({ where, _count: true, _avg: { rating: true } });
      const rows = await tx.review.findMany({ where, include, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (page - 1) * pageSize, take: pageSize });
      return { items: rows.map(publicView), page, pageSize, total: aggregate._count, summary: { count: aggregate._count, average: aggregate._avg.rating === null ? null : Math.round(aggregate._avg.rating * 10) / 10 } };
    });
  }
  async list(access: string, query: { page: number; pageSize: number; editionId?: string | undefined; visibility?: 'PUBLIC' | 'HIDDEN' | undefined }, staff = false): Promise<ReviewPage<PrivateReview>> {
    return serializable(this.accounts.db, async tx => {
      const actor = staff ? await this.staff(tx, access) : (await this.accounts.authorize(tx, access, true)).user;
      const where = { ...(!staff ? { userId: actor.id } : {}), ...(query.editionId ? { editionId: query.editionId } : {}), ...(query.visibility ? { visibility: query.visibility } : {}) };
      const total = await tx.review.count({ where });
      const rows = await tx.review.findMany({ where, include, orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }], skip: (query.page - 1) * query.pageSize, take: query.pageSize });
      return { items: rows.map(privateView), page: query.page, pageSize: query.pageSize, total };
    });
  }
  async create(access: string, editionId: string, orderId: string, draft: ReviewDraft) {
    return serializable(this.accounts.db, async tx => {
      const { user } = await this.accounts.authorize(tx, access, true);
      await this.eligible(tx, { userId: user.id, editionId, orderId });
      if (!await tx.edition.findUnique({ where: { id: editionId } })) throw missingReview();
      const row = await tx.review.create({ data: { userId: user.id, editionId, orderId, ...draft, createdAt: this.accounts.clock.now(), updatedAt: this.accounts.clock.now() }, include });
      await this.snapshot(tx, row, user.id, 'CREATED', 'CUSTOMER_PUBLICATION'); return privateView(row);
    }).catch((error: unknown) => {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new ReviewError(409, 'REVIEW_ALREADY_EXISTS', 'Esta compra já tem uma avaliação para a edição.'); throw error;
    });
  }
  private async lock(tx: Prisma.TransactionClient, id: string) {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Review" WHERE id = ${id}::uuid FOR UPDATE`; if (!rows.length) throw missingReview();
    return tx.review.findUniqueOrThrow({ where: { id }, include });
  }
  async edit(access: string, id: string, revision: number, draft: ReviewDraft) {
    return serializable(this.accounts.db, async tx => {
      const { user } = await this.accounts.authorize(tx, access, true), previous = await this.lock(tx, id);
      if (previous.userId !== user.id) throw missingReview(); if (previous.version !== revision) throw staleReview();
      await this.eligible(tx, previous);
      const row = await tx.review.update({ where: { id, version: revision }, data: { ...draft, version: { increment: 1 }, awaitingModeration: previous.visibility === 'HIDDEN', updatedAt: this.accounts.clock.now() }, include });
      await this.snapshot(tx, row, user.id, 'EDITED', 'CUSTOMER_EDIT'); return privateView(row);
    });
  }
  async moderate(access: string, id: string, revision: number, reason: string, release: boolean) {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.staff(tx, access), previous = await this.lock(tx, id);
      if (previous.version !== revision) throw staleReview(); if (release) await this.eligible(tx, previous);
      const row = await tx.review.update({ where: { id, version: revision }, data: { visibility: release ? 'PUBLIC' : 'HIDDEN', hiddenReason: release ? null : reason, awaitingModeration: false, version: { increment: 1 }, updatedAt: this.accounts.clock.now() }, include });
      await this.snapshot(tx, row, actor.id, release ? 'RELEASED' : 'HIDDEN', reason); return privateView(row);
    });
  }
  async history(access: string, id: string): Promise<{ items: ReviewRevisionView[] }> {
    return serializable(this.accounts.db, async tx => {
      await this.staff(tx, access); if (!await tx.review.findUnique({ where: { id } })) throw missingReview();
      const rows = await tx.reviewRevision.findMany({ where: { reviewId: id }, include: { actor: { select: { name: true } } }, orderBy: { version: 'asc' } });
      return { items: rows.map(row => ({ version: row.version, rating: row.rating, comment: row.comment, visibility: row.visibility, awaitingModeration: row.awaitingModeration, action: row.action, reason: row.reason, actorName: row.actor.name, createdAt: row.createdAt.toISOString() })) };
    });
  }
}
