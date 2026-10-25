import { randomUUID } from 'node:crypto';
import type { Prisma } from '../../persistence/client.ts';
import type { User } from '../../persistence/generated/client.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { secret, tokenHash } from '../accounts/credentials.ts';
import { MessageProtection } from './protection.ts';

export const available = (user: User) => !user.blockedAt && !user.closedAt && !user.inactiveAt;
export type AccessPurpose = 'RESET' | 'VERIFY' | 'CHANGE';
export class AccessMessages {
  readonly accounts: Accounts;
  readonly protection: MessageProtection;
  readonly webOrigin: string;
  readonly limits: { account: number; ip: number };
  constructor(accounts: Accounts, protection: MessageProtection, webOrigin: string,
    limits = { account: 5, ip: 20 }) {
    this.accounts = accounts; this.protection = protection; this.webOrigin = webOrigin; this.limits = limits;
    if (new URL(webOrigin).protocol !== 'https:' || new URL(webOrigin).origin !== webOrigin) throw new Error('Exact HTTPS origin required.');
    if (Object.values(limits).some(value => !Number.isInteger(value) || value < 1 || value > 10000)) throw new Error('Invalid message rate configuration.');
  }
  async rate(operation: string, ip: string, email?: string) {
    await serializable(this.accounts.db, async tx => {
      const keys = [{ value: `IP:${ip}`, limit: this.limits.ip }, ...(email ? [{ value: `ACCOUNT:${email}`, limit: this.limits.account }] : [])];
      for (const bucket of keys.sort((a, b) => a.value.localeCompare(b.value))) {
        const targetId = tokenHash('message-rate', `${operation}:${bucket.value}`);
        const where = { targetType: 'MESSAGE_RATE', targetId, action: `ACCESS.${operation}_ATTEMPT`, createdAt: { gt: new Date(this.accounts.clock.now().getTime() - 15 * 60000) } };
        if (await tx.auditLog.count({ where }) >= bucket.limit) throw new AccountError(429, 'ACCESS_RATE_LIMIT');
        await appendAudit(tx, { action: where.action, targetType: 'MESSAGE_RATE', targetId, result: 'SUCCESS', reason: 'ATTEMPT_RECORDED', changes: {} }, this.accounts.clock);
      }
    });
  }
  async issue(tx: Prisma.TransactionClient, user: User, purpose: AccessPurpose, recipient = user.emailNormalized, eventId?: string) {
    const now = this.accounts.clock.now(), token = secret(), id = randomUUID();
    const expiresAt = new Date(now.getTime() + (purpose === 'RESET' ? 30 * 60000 : 86400000));
    if (purpose === 'RESET') {
      await tx.passwordReset.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: now } });
      await tx.passwordReset.create({ data: { id, userId: user.id, tokenHash: tokenHash('password-reset', token), expiresAt, createdAt: now } });
    } else {
      await tx.emailToken.updateMany({ where: { userId: user.id, purpose, usedAt: null }, data: { usedAt: now } });
      await tx.emailToken.create({ data: { id, userId: user.id, purpose, pendingEmail: recipient,
        tokenHash: tokenHash(`email-${purpose.toLowerCase()}`, token), expiresAt, createdAt: now } });
    }
    const messageId = randomUUID();
    const path = purpose === 'RESET' ? 'password-reset' : purpose === 'VERIFY' ? 'email-verification' : 'email-change';
    const restrictedBody = this.protection.seal(messageId, JSON.stringify({ recipient, purpose,
      link: `${this.webOrigin}/#/${path}?token=${token}`, expiresAt: expiresAt.toISOString() }));
    await tx.demoMessage.create({ data: { id: messageId, userId: user.id, tokenRef: id, type: `ACCESS.${purpose}`,
      ...(eventId ? { eventId } : {}), restrictedBody, dedupKey: `access:${id}`, createdAt: now } });
    await appendAudit(tx, { actorId: user.id, action: `ACCESS.${purpose}_QUEUED`, targetType: 'MESSAGE', targetId: messageId,
      result: 'SUCCESS', reason: 'LOCAL_DELIVERY_QUEUED', changes: {} }, this.accounts.clock);
  }
  async mailbox(id?: string, filter: { recipient?: string; type?: string; page?: number; pageSize?: number } = {}) {
    const page = filter.page ?? 1, pageSize = filter.pageSize ?? 20;
    const where = { ...(id ? { id } : {}), ...(filter.type ? { type: filter.type } : {}) };
    // Recipient is inside the encrypted body. Bound scanning rather than pretending it is indexed plaintext.
    const rows = await this.accounts.db.demoMessage.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: filter.recipient ? 1000 : pageSize, skip: filter.recipient ? 0 : (page - 1) * pageSize });
    const opened = rows.map(row => ({ id: row.id, type: row.type, status: row.status, attempts: row.attempts,
      deliveredAt: row.deliveredAt?.toISOString() ?? null, content: JSON.parse(this.protection.open(row.id, row.restrictedBody)) as { recipient: string; purpose: string; link: string; expiresAt: string } }));
    const matched = filter.recipient ? opened.filter(row => row.content.recipient === filter.recipient).slice((page - 1) * pageSize, page * pageSize) : opened;
    if (id && !matched.length) throw new AccountError(404, 'MESSAGE_NOT_FOUND');
    return id ? matched[0]! : { items: matched, page, pageSize, recipientScanLimit: filter.recipient ? 1000 : null };
  }
}
