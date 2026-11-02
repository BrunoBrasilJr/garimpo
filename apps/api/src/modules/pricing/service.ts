import type { CouponView, NamedPricingTarget, PricingPage, PromotionView, PricingTarget } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import { serializable } from '../../persistence/transaction.ts';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { appendAudit } from '../../core/audit.ts';
import { PricingError } from './errors.ts';
import { quote } from './calculate.ts';
import type { PromotionRule, CouponRule } from './calculate.ts';
import * as validate from './validation.ts';
import type { CouponCreate, CouponPatch, PromotionCreate, PromotionPatch, PricingQuery } from './validation.ts';
const couponInclude = { targets: { include: { offer: { include: { edition: { select: { title: true } } } }, edition: { select: { title: true } }, genre: { select: { name: true } } }, orderBy: { id: 'asc' } } } satisfies Prisma.CouponInclude;
const promotionInclude = { offers: { include: { offer: { include: { edition: { select: { title: true } } } } }, orderBy: { offerId: 'asc' } } } satisfies Prisma.PromotionInclude;
type CouponRow = Prisma.CouponGetPayload<{ include: typeof couponInclude }>;
type PromotionRow = Prisma.PromotionGetPayload<{ include: typeof promotionInclude }>;
const offerLabel = (offer: { id: string; kind: string; edition: { title: string } }) => `${offer.edition.title} · ${offer.kind === 'NEW' ? 'novo' : 'usado'} · ref. ${offer.id.slice(0, 8)}`;
const namedTargets = (row: CouponRow): NamedPricingTarget[] => row.targets.map(item => item.offer ? { kind: 'OFFER', id: item.offerId!, label: offerLabel(item.offer) } : item.edition ? { kind: 'EDITION', id: item.editionId!, label: item.edition.title } : { kind: 'GENRE', id: item.genreId!, label: item.genre!.name });
function couponView(row: CouponRow): CouponView { return { id: row.id, code: row.code, type: row.type, amount: row.amount, minimumEligibleCents: row.minimumEligibleCents, allowPromotional: row.allowPromotional, totalLimit: row.totalLimit, perUserLimit: row.perUserLimit, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString(), active: row.active, version: row.version, targets: namedTargets(row), usage: { status: 'NOT_INTEGRATED' } }; }
function promotionView(row: PromotionRow): PromotionView { return { id: row.id, name: row.name, type: row.type, amount: row.amount, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString(), active: row.active, version: row.version, offers: row.offers.map(item => ({ id: item.offerId, label: offerLabel(item.offer) })) }; }
const period = (input: { type: 'PERCENT' | 'FIXED'; amount: number; startsAt: string; endsAt: string; active?: boolean }) => ({ type: input.type, amount: input.amount, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt), active: input.active ?? true });
const targetData = (input: PricingTarget) => ({ ...(input.kind === 'OFFER' ? { offerId: input.id } : input.kind === 'EDITION' ? { editionId: input.id } : { genreId: input.id }) });
const conflict = () => new PricingError(409, 'PRICING_VERSION_CONFLICT', 'A configuração mudou. Atualize e confira a versão atual.');
const missing = () => new PricingError(404, 'PRICING_NOT_FOUND', 'Esta configuração não está disponível.');

export async function activePromotions(tx: Prisma.TransactionClient, offerIds: string[], now: Date): Promise<PromotionRule[]> {
  if (!offerIds.length) return [];
  const rows = await tx.promotion.findMany({ where: { active: true, startsAt: { lte: now }, endsAt: { gt: now }, offers: { some: { offerId: { in: offerIds } } } }, include: { offers: { select: { offerId: true } } } });
  return rows.map(row => ({ ...row, offerIds: row.offers.map(item => item.offerId) }));
}
export class Pricing {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }
  async admin(tx: Prisma.TransactionClient, access: string) { const { user } = await this.accounts.authorize(tx, access); if (user.context !== 'STAFF' || user.role !== 'ADMIN') throw new AccountError(403, 'ADMIN_REQUIRED'); return user; }
  private async audit(tx: Prisma.TransactionClient, actorId: string, action: string, id: string, value: unknown) {
    const changes = JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
    await appendAudit(tx, { actorId, action: 'PRICING.' + action, targetType: 'PRICING', targetId: id, result: 'SUCCESS', reason: 'ADMIN_CONFIGURATION', changes }, this.accounts.clock);
  }
  private async targets(tx: Prisma.TransactionClient, values: PricingTarget[]) {
    for (const kind of ['OFFER', 'EDITION', 'GENRE'] as const) {
      const ids = values.filter(value => value.kind === kind).map(value => value.id); if (!ids.length) continue;
      const where = { id: { in: ids } }, count = kind === 'OFFER' ? await tx.offer.count({ where }) : kind === 'EDITION' ? await tx.edition.count({ where }) : await tx.genre.count({ where });
      if (count !== ids.length) throw new PricingError(422, 'PRICING_TARGET_NOT_FOUND', 'Um dos alvos não existe mais. Atualize a seleção.');
    }
  }
  async coupons(access: string, query: PricingQuery): Promise<PricingPage<CouponView>> {
    return serializable(this.accounts.db, async tx => {
      await this.admin(tx, access); const where = query.active === undefined ? {} : { active: query.active }, total = await tx.coupon.count({ where });
      const rows = await tx.coupon.findMany({ where, include: couponInclude, orderBy: [{ code: 'asc' }, { id: 'asc' }], take: query.pageSize, skip: (query.page - 1) * query.pageSize }); return { items: rows.map(couponView), total, page: query.page, pageSize: query.pageSize };
    });
  }
  async promotions(access: string, query: PricingQuery): Promise<PricingPage<PromotionView>> {
    return serializable(this.accounts.db, async tx => {
      await this.admin(tx, access); const where = query.active === undefined ? {} : { active: query.active }, total = await tx.promotion.count({ where });
      const rows = await tx.promotion.findMany({ where, include: promotionInclude, orderBy: [{ name: 'asc' }, { id: 'asc' }], take: query.pageSize, skip: (query.page - 1) * query.pageSize }); return { items: rows.map(promotionView), total, page: query.page, pageSize: query.pageSize };
    });
  }
  async createCoupon(access: string, input: CouponCreate) {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.admin(tx, access); await this.targets(tx, input.targets ?? []);
      const row = await tx.coupon.create({ data: { ...period(input), code: input.code, minimumEligibleCents: input.minimumEligibleCents ?? 0, allowPromotional: input.allowPromotional ?? false, totalLimit: input.totalLimit ?? null, perUserLimit: input.perUserLimit ?? null, targets: { create: (input.targets ?? []).map(targetData) }, createdAt: this.accounts.clock.now(), updatedAt: this.accounts.clock.now() }, include: couponInclude });
      const view = couponView(row); await this.audit(tx, actor.id, 'COUPON_CREATED', row.id, { after: { ...view } }); return view;
    }).catch((error: unknown) => { if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new PricingError(409, 'COUPON_CODE_EXISTS', 'Este código de cupom já existe.'); throw error; });
  }
  async createPromotion(access: string, input: PromotionCreate) {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.admin(tx, access); await this.targets(tx, input.offerIds.map(id => ({ kind: 'OFFER', id })));
      const row = await tx.promotion.create({ data: { ...period(input), name: input.name, offers: { create: input.offerIds.map(offerId => ({ offerId })) }, createdAt: this.accounts.clock.now(), updatedAt: this.accounts.clock.now() }, include: promotionInclude });
      const view = promotionView(row); await this.audit(tx, actor.id, 'PROMOTION_CREATED', row.id, { after: { ...view } }); return view;
    });
  }
  async updateCoupon(access: string, id: string, input: CouponPatch) {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.admin(tx, access); await tx.$queryRaw`SELECT id FROM "Coupon" WHERE id = ${id}::uuid FOR UPDATE`;
      const previous = await tx.coupon.findUnique({ where: { id }, include: couponInclude }); if (!previous) throw missing(); if (previous.version !== input.version) throw conflict();
      const before = couponView(previous), { version, ...changes } = input;
      const value = validate.parse(validate.couponCreate, { code: before.code, type: before.type, amount: before.amount, startsAt: before.startsAt, endsAt: before.endsAt, active: before.active, minimumEligibleCents: before.minimumEligibleCents, allowPromotional: before.allowPromotional, totalLimit: before.totalLimit, perUserLimit: before.perUserLimit, targets: before.targets.map(item => ({ kind: item.kind, id: item.id })), ...changes });
      await this.targets(tx, value.targets ?? []);
      const row = await tx.coupon.update({ where: { id, version }, data: { ...period(value), minimumEligibleCents: value.minimumEligibleCents ?? 0, allowPromotional: value.allowPromotional ?? false, totalLimit: value.totalLimit ?? null, perUserLimit: value.perUserLimit ?? null, version: { increment: 1 }, updatedAt: this.accounts.clock.now(), targets: { deleteMany: {}, create: (value.targets ?? []).map(targetData) } }, include: couponInclude });
      const after = couponView(row); await this.audit(tx, actor.id, 'COUPON_UPDATED', id, { before: { ...before }, after: { ...after } }); return after;
    });
  }
  async updatePromotion(access: string, id: string, input: PromotionPatch) {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.admin(tx, access); await tx.$queryRaw`SELECT id FROM "Promotion" WHERE id = ${id}::uuid FOR UPDATE`;
      const previous = await tx.promotion.findUnique({ where: { id }, include: promotionInclude }); if (!previous) throw missing(); if (previous.version !== input.version) throw conflict();
      const before = promotionView(previous), { version, ...changes } = input;
      const value = validate.parse(validate.promotionCreate, { name: before.name, type: before.type, amount: before.amount, startsAt: before.startsAt, endsAt: before.endsAt, active: before.active, offerIds: before.offers.map(item => item.id), ...changes });
      await this.targets(tx, value.offerIds.map(id => ({ kind: 'OFFER', id })));
      const row = await tx.promotion.update({ where: { id, version }, data: { ...period(value), name: value.name, version: { increment: 1 }, updatedAt: this.accounts.clock.now(), offers: { deleteMany: {}, create: value.offerIds.map(offerId => ({ offerId })) } }, include: promotionInclude });
      const after = promotionView(row); await this.audit(tx, actor.id, 'PROMOTION_UPDATED', id, { before: { ...before }, after: { ...after } }); return after;
    });
  }
  /** Canonical units are read from the transaction; this quote does not consume/reserve usage. */
  async quote(tx: Prisma.TransactionClient, requested: { id: string; offerId: string }[], couponCode?: string) {
    const ids = [...new Set(requested.map(unit => unit.offerId))], now = this.accounts.clock.now();
    const offers = await tx.offer.findMany({ where: { id: { in: ids } }, include: { edition: { include: { genres: true } } } });
    if (offers.length !== ids.length || offers.some(offer => !offer.active || !offer.edition.active)) throw new PricingError(422, 'PRICE_OFFER_UNAVAILABLE', 'Uma das ofertas não está disponível para cotação.');
    const byId = new Map(offers.map(offer => [offer.id, offer]));
    const units = requested.map(unit => { const offer = byId.get(unit.offerId)!; return { ...unit, editionId: offer.editionId, genreIds: offer.edition.genres.map(item => item.genreId), basePriceCents: offer.priceCents }; });
    let coupon: CouponRule | null = null;
    if (couponCode) { const row = await tx.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() }, include: couponInclude }); if (!row) throw new PricingError(422, 'COUPON_UNAVAILABLE', 'Este cupom não está disponível.'); coupon = { ...row, targets: namedTargets(row) }; }
    return quote(units, await activePromotions(tx, ids, now), coupon, now);
  }
}
