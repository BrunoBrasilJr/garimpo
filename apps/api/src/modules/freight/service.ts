import type { FreightPage, FreightRateView, FreightQuote, DeliveryAddressSnapshot } from '@garimpo/contracts';
import type { Database, Prisma } from '../../persistence/client.ts';
import { serializable } from '../../persistence/transaction.ts';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { appendAudit } from '../../core/audit.ts';
import { payloadHash } from '../../core/idempotency.ts';
import { FreightError, freightConflict, isExclusion, rangeConflict } from './errors.ts';
import * as input from './validation.ts';
const include = { ranges: { orderBy: [{ startZip: 'asc' }, { id: 'asc' }] } } satisfies Prisma.FreightRateInclude;
type RateRecord = Prisma.FreightRateGetPayload<{ include: typeof include }>;
const view = (row: RateRecord): FreightRateView => ({ id: row.id, version: row.version, region: row.region, served: row.served, amountCents: row.amountCents, deliveryDays: row.deliveryDays, ranges: row.ranges.map(({ id, startZip, endZip }) => ({ id, startZip, endZip })) });
const json = (value: unknown) => JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
export const freightRevision = (freight: FreightQuote, address: DeliveryAddressSnapshot | { zip: string }) => payloadHash({ freight, address });
export class Freight {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }
  async admin(tx: Prisma.TransactionClient | Database, access: string) { const { user } = await this.accounts.authorize(tx, access); if (user.context !== 'STAFF' || user.role !== 'ADMIN') throw new AccountError(403, 'ADMIN_REQUIRED'); return user; }
  async list(access: string, query: input.RateQuery): Promise<FreightPage> {
    return serializable(this.accounts.db, async tx => { await this.admin(tx, access); const total = await tx.freightRate.count(), rows = await tx.freightRate.findMany({ include, orderBy: [{ region: 'asc' }, { id: 'asc' }], take: query.pageSize, skip: (query.page - 1) * query.pageSize }); return { items: rows.map(view), total, page: query.page, pageSize: query.pageSize }; });
  }
  private async checkRanges(tx: Prisma.TransactionClient, ranges: input.RateInput['ranges'], except?: string) {
    for (const range of [...ranges].sort((a, b) => a.startZip.localeCompare(b.startZip))) {
      if (await tx.cepRange.findFirst({ where: { startZip: { lte: range.endZip }, endZip: { gte: range.startZip }, ...(except ? { freightRateId: { not: except } } : {}) }, select: { id: true } })) throw rangeConflict();
    }
  }
  async create(access: string, value: input.RateInput): Promise<FreightRateView> {
    value = input.parse(input.create, value);
    try { return await serializable(this.accounts.db, async tx => {
      const actor = await this.admin(tx, access); await this.checkRanges(tx, value.ranges);
      const { ranges, ...fields } = value, now = this.accounts.clock.now();
      const row = await tx.freightRate.create({ data: { ...fields, createdAt: now, updatedAt: now, ranges: { create: ranges } }, include });
      await appendAudit(tx, { actorId: actor.id, action: 'FREIGHT.CREATED', targetType: 'FREIGHT_RATE', targetId: row.id, result: 'SUCCESS', reason: 'ADMIN_CONFIGURATION', changes: json({ after: view(row) }) }, this.accounts.clock); return view(row);
    }); } catch (error) { if (isExclusion(error)) throw rangeConflict(); throw error; }
  }
  async update(access: string, id: string, changes: input.RateUpdate): Promise<FreightRateView> {
    changes = input.parse(input.update, changes);
    try { return await serializable(this.accounts.db, async tx => {
      const actor = await this.admin(tx, access); await tx.$queryRaw`SELECT id FROM "FreightRate" WHERE id = ${id}::uuid FOR UPDATE`;
      const before = await tx.freightRate.findUnique({ where: { id }, include }); if (!before) throw new FreightError(404, 'FREIGHT_NOT_FOUND', 'Esta configuração não está disponível.'); if (before.version !== changes.version) throw freightConflict();
      const { version, ...patch } = changes; void version;
      const value = input.parse(input.create, { region: before.region, served: before.served, amountCents: before.amountCents, deliveryDays: before.deliveryDays, ranges: before.ranges.map(({ startZip, endZip }) => ({ startZip, endZip })), ...patch });
      await this.checkRanges(tx, value.ranges, id); const { ranges, ...fields } = value;
      const row = await tx.freightRate.update({ where: { id, version: changes.version }, data: { ...fields, version: { increment: 1 }, updatedAt: this.accounts.clock.now(), ranges: { deleteMany: {}, create: ranges } }, include });
      await appendAudit(tx, { actorId: actor.id, action: 'FREIGHT.UPDATED', targetType: 'FREIGHT_RATE', targetId: row.id, result: 'SUCCESS', reason: 'ADMIN_CONFIGURATION', changes: json({ before: view(before), after: view(row) }) }, this.accounts.clock); return view(row);
    }); } catch (error) { if (isExclusion(error)) throw rangeConflict(); throw error; }
  }
  /** Read-only quote; row lock is used only while accepting freight/creating an order. */
  async quote(tx: Prisma.TransactionClient, zip: string, lock = false): Promise<FreightQuote> {
    zip = input.parse(input.zip, zip);
    const range = await tx.cepRange.findFirst({ where: { startZip: { lte: zip }, endZip: { gte: zip } }, include: { freightRate: true } });
    if (!range) return { served: false, zip, reason: 'NO_RATE', region: null };
    if (lock) await tx.$queryRaw`SELECT id FROM "FreightRate" WHERE id = ${range.freightRateId}::uuid FOR SHARE`;
    const row = range.freightRate; if (!row.served) return { served: false, zip, reason: 'NOT_SERVED', region: row.region };
    if (row.amountCents === null || row.deliveryDays === null || row.amountCents <= 0) throw new FreightError(503, 'FREIGHT_UNAVAILABLE', 'Não foi possível conferir a configuração de frete.');
    return { served: true, zip, rateId: row.id, rateVersion: row.version, region: row.region, amountCents: row.amountCents, deliveryDays: row.deliveryDays };
  }
}
