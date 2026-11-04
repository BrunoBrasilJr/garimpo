import type { CustomerDetail, CustomerPage, CustomerRecord } from '@garimpo/contracts';
import type { Accounts } from './service.ts';
import type { AccessMessages } from '../messaging/service.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';
import { AccountError } from './errors.ts';
import { cancelAccountCommitments } from '../orders/account-lifecycle.ts';
import { cents } from '../orders/service.ts';
import { checkRevision, customerView, lockIdentities, receipt, revokeAccess, staff } from './blocking-helpers.ts';
import * as input from './blocking-validation.ts';
export class Customers {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }
  async list(access: string, value: unknown): Promise<CustomerPage> {
    const query = input.parse(input.list, value);
    return serializable(this.accounts.db, async tx => {
      await staff(this.accounts, tx, access);
      const where = { context: 'CUSTOMER' as const, ...(query.state === 'ACTIVE' ? { blockedAt: null, closedAt: null, inactiveAt: null } : query.state === 'BLOCKED' ? { blockedAt: { not: null } } : query.state === 'CLOSED' ? { closedAt: { not: null } } : {}), ...(query.search ? { OR: [{ name: { contains: query.search, mode: 'insensitive' as const } }, { emailNormalized: { contains: query.search, mode: 'insensitive' as const } }] } : {}) };
      const total = await tx.user.count({ where }), rows = await tx.user.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (query.page - 1) * query.pageSize, take: query.pageSize });
      return { items: rows.map(customerView), total, page: query.page, pageSize: query.pageSize, totalPages: Math.ceil(total / query.pageSize) };
    });
  }
  async detail(access: string, id: string): Promise<CustomerDetail> {
    id = input.parse(input.id, id);
    return serializable(this.accounts.db, async tx => {
      await staff(this.accounts, tx, access);
      const user = await tx.user.findFirst({ where: { id, context: 'CUSTOMER' } }); if (!user) throw new AccountError(404, 'CUSTOMER_NOT_FOUND');
      const addresses = await tx.address.findMany({ where: { userId: id, deletedAt: null }, select: { id: true, recipient: true, zip: true, region: true, city: true, neighborhood: true, street: true, number: true, complement: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
      const orderCount = await tx.order.count({ where: { userId: id } }), rows = await tx.order.findMany({ where: { userId: id }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 10, select: { id: true, status: true, method: true, version: true, totalCents: true, createdAt: true, paidAt: true, expiresAt: true } });
      return { ...customerView(user), addresses, orderCount, orders: rows.map(row => ({ ...row, totalCents: cents(row.totalCents), createdAt: row.createdAt.toISOString(), expiresAt: row.expiresAt?.toISOString() ?? null, paidAt: row.paidAt?.toISOString() ?? null })) };
    });
  }
  async restrict(access: string, id: string, action: 'BLOCK' | 'UNBLOCK', value: unknown, key: string): Promise<CustomerRecord> {
    id = input.parse(input.id, id); key = input.parse(input.key, key); const command = input.parse(input.restriction, value);
    return serializable(this.accounts.db, async tx => {
      const first = await staff(this.accounts, tx, access, true); await lockIdentities(tx, [first.id, id]); const actor = await staff(this.accounts, tx, access, true);
      const user = await tx.user.findFirst({ where: { id, context: 'CUSTOMER' } }); if (!user) throw new AccountError(404, 'CUSTOMER_NOT_FOUND');
      const record = await receipt(tx, actor.id, 'CUSTOMER.' + action, key, { id, command }); if (record.replayed) return customerView(user);
      checkRevision(user, command.revision); const now = this.accounts.clock.now();
      if (action === 'BLOCK') { await cancelAccountCommitments(tx, this.accounts.clock, id, actor, 'ACCOUNT_BLOCKED'); await revokeAccess(tx, id, now); }
      const result = await tx.user.update({ where: { id }, data: { blockedAt: action === 'BLOCK' ? user.blockedAt ?? now : null } });
      const reason = command.reason.replace(/(?:password|senha|token|secret|authorization)\s*[:=]\s*\S+/gi, '[REDACTED]');
      await appendAudit(tx, { actorId: actor.id, action: 'CUSTOMER.' + action, targetType: 'USER', targetId: id, result: 'SUCCESS', reason: 'ADMIN_REQUEST', changes: { reason } }, this.accounts.clock); await record.save(id, now);
      return customerView(result);
    });
  }
  async correct(access: string, id: string, value: unknown, key: string, messages?: AccessMessages): Promise<CustomerRecord> {
    id = input.parse(input.id, id); key = input.parse(input.key, key); const command = input.parse(input.correction, value);
    try {
      return await serializable(this.accounts.db, async tx => {
        const first = await staff(this.accounts, tx, access, true); await lockIdentities(tx, [first.id, id]); const actor = await staff(this.accounts, tx, access, true);
        const user = await tx.user.findFirst({ where: { id, context: 'CUSTOMER' } }); if (!user) throw new AccountError(404, 'CUSTOMER_NOT_FOUND');
        const record = await receipt(tx, actor.id, 'CUSTOMER.CORRECT', key, { id, command }); if (record.replayed) return customerView(user);
        checkRevision(user, command.revision); if (user.inactiveAt) throw new AccountError(409, 'CUSTOMER_UNAVAILABLE');
        if (command.email !== undefined) {
          if (!messages) throw new AccountError(503, 'MESSAGE_CHANNEL_UNAVAILABLE');
          if (command.email === user.emailNormalized || await tx.user.findUnique({ where: { emailNormalized: command.email } })) throw new AccountError(409, 'ACCOUNT_CONFLICT');
          const proof = await messages.issue(tx, user, 'CHANGE', command.email);
          await appendAudit(tx, { actorId: actor.id, action: 'CUSTOMER.EMAIL_CHANGE_AUTHORIZED', targetType: 'EMAIL_CHANGE_PROOF', targetId: proof.tokenRef, result: 'SUCCESS', reason: 'NEW_ADDRESS_CONFIRMATION_ONLY', changes: { customerId: user.id, issuerRole: actor.role, blockedAt: user.blockedAt?.toISOString() ?? null, closedAt: user.closedAt?.toISOString() ?? null } }, this.accounts.clock);
        }
        const result = command.name !== undefined ? await tx.user.update({ where: { id }, data: { name: command.name } }) : user;
        await appendAudit(tx, { actorId: actor.id, action: 'CUSTOMER.CORRECT', targetType: 'USER', targetId: id, result: 'SUCCESS', reason: 'ADMIN_PROFILE_CORRECTION', changes: { nameChanged: command.name !== undefined, emailConfirmationQueued: command.email !== undefined } }, this.accounts.clock); await record.save(id, this.accounts.clock.now());
        return customerView(result);
      });
    } catch (cause) { if (cause && typeof cause === 'object' && 'code' in cause && cause.code === 'P2002') throw new AccountError(409, 'ACCOUNT_CONFLICT'); throw cause; }
  }
}
