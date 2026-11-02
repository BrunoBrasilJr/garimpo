import type { AlertView, AvailabilityKind, EngagementPage, WishView } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';

const editionSelect = { id: true, title: true, active: true } as const;
export class Engagement {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }
  private async actor(tx: Prisma.TransactionClient, access: string) { return (await this.accounts.authorize(tx, access, true)).user; }
  private async lockEdition(tx: Prisma.TransactionClient, id: string, active = false) {
    const rows = await tx.$queryRaw<{ id: string; active: boolean }[]>`SELECT id, active FROM "Edition" WHERE id = ${id}::uuid FOR UPDATE`;
    if (!rows.length || (active && !rows[0]!.active)) throw new AccountError(404, 'EDITION_NOT_FOUND');
  }
  private async audit(tx: Prisma.TransactionClient, actorId: string, action: string, targetId: string) {
    await appendAudit(tx, { actorId, action, targetType: 'ENGAGEMENT', targetId, result: 'SUCCESS', reason: 'CUSTOMER_COMMAND', changes: {} }, this.accounts.clock);
  }
  async wishes(access: string, page = 1, pageSize = 20): Promise<EngagementPage<WishView>> {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.actor(tx, access), where = { userId: actor.id };
      const total = await tx.wishlistEntry.count({ where });
      const rows = await tx.wishlistEntry.findMany({ where, include: { edition: { select: editionSelect } }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (page - 1) * pageSize, take: pageSize });
      return { items: rows.map(row => ({ id: row.id, edition: row.edition, createdAt: row.createdAt.toISOString() })), total, page, pageSize };
    });
  }
  async wish(access: string, editionId: string, remove = false) {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.actor(tx, access); await this.lockEdition(tx, editionId, !remove);
      const where = { userId: actor.id, editionId };
      if (remove) { await tx.wishlistEntry.deleteMany({ where }); await this.audit(tx, actor.id, 'WISH.REMOVED', editionId); return null; }
      const row = await tx.wishlistEntry.upsert({ where: { userId_editionId: where }, create: { ...where, createdAt: this.accounts.clock.now() }, update: {}, include: { edition: { select: editionSelect } } });
      await this.audit(tx, actor.id, 'WISH.SAVED', editionId);
      return { id: row.id, edition: row.edition, createdAt: row.createdAt.toISOString() };
    });
  }
  async alerts(access: string, page = 1, pageSize = 20): Promise<EngagementPage<AlertView>> {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.actor(tx, access), where = { userId: actor.id }, total = await tx.availabilityAlert.count({ where });
      const rows = await tx.availabilityAlert.findMany({ where, include: { edition: { select: editionSelect }, message: { select: { status: true, attempts: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], skip: (page - 1) * pageSize, take: pageSize });
      return { items: rows.map(row => ({ id: row.id, edition: row.edition, kind: row.kind, status: row.status, createdAt: row.createdAt.toISOString(), closedAt: row.closedAt?.toISOString() ?? null, delivery: row.message })), total, page, pageSize };
    });
  }
  async subscribe(access: string, editionId: string, kind: AvailabilityKind) {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.actor(tx, access); await this.lockEdition(tx, editionId, true);
      if (await tx.availabilityAlert.findFirst({ where: { userId: actor.id, editionId, kind, status: 'ACTIVE' } })) throw new AccountError(409, 'ALERT_ALREADY_ACTIVE');
      const row = await tx.availabilityAlert.create({ data: { userId: actor.id, editionId, kind, createdAt: this.accounts.clock.now() } });
      await this.audit(tx, actor.id, 'ALERT.SUBSCRIBED', row.id); return { id: row.id, kind: row.kind, status: row.status };
    }).catch((error: unknown) => {
      // PostgreSQL's partial unique index is the final arbiter for overlapping snapshots.
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new AccountError(409, 'ALERT_ALREADY_ACTIVE');
      throw error;
    });
  }
  async cancel(access: string, id: string) {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.actor(tx, access);
      const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "AvailabilityAlert" WHERE id = ${id}::uuid AND "userId" = ${actor.id}::uuid FOR UPDATE`;
      if (!rows.length) throw new AccountError(404, 'ALERT_NOT_FOUND');
      await tx.availabilityAlert.updateMany({ where: { id, userId: actor.id, status: 'ACTIVE' }, data: { status: 'CANCELLED', closedAt: this.accounts.clock.now() } });
      await this.audit(tx, actor.id, 'ALERT.CANCELLED', id);
    });
  }
}
