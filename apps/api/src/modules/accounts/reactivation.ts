import type { AccessMessages } from '../messaging/service.ts';
import { serializable } from '../../persistence/transaction.ts';
import { tokenHash } from './credentials.ts';
import { AccountError } from './errors.ts';
import { appendAudit } from '../../core/audit.ts';
import { lockIdentities, revokeAccess } from './blocking-helpers.ts';

export async function requestReactivation(messages: AccessMessages, email: string) {
  await serializable(messages.accounts.db, async tx => {
    const before = await tx.user.findUnique({ where: { emailNormalized: email } }); if (!before) return;
    await lockIdentities(tx, [before.id]);
    const user = await tx.user.findUniqueOrThrow({ where: { id: before.id } });
    if (user.context === 'CUSTOMER' && user.closedAt && !user.blockedAt && !user.inactiveAt && user.emailNormalized === email) await messages.issue(tx, user, 'REACTIVATE');
  });
}
export async function confirmReactivation(messages: AccessMessages, token: string) {
  await serializable(messages.accounts.db, async tx => {
    const hash = tokenHash('email-reactivate', token), before = await tx.emailToken.findUnique({ where: { tokenHash: hash } });
    if (!before) throw new AccountError(422, 'INVALID_ACCESS_LINK');
    await lockIdentities(tx, [before.userId]);
    const record = await tx.emailToken.findUniqueOrThrow({ where: { tokenHash: hash }, include: { user: true } }), now = messages.accounts.clock.now(), user = record.user;
    if (record.purpose !== 'REACTIVATE' || record.usedAt || record.expiresAt <= now || user.context !== 'CUSTOMER' || !user.closedAt || user.blockedAt || user.inactiveAt || record.pendingEmail !== user.emailNormalized) throw new AccountError(422, 'INVALID_ACCESS_LINK');
    await revokeAccess(tx, user.id, now);
    await tx.user.update({ where: { id: user.id }, data: { closedAt: null, emailVerifiedAt: now } });
    await appendAudit(tx, { actorId: user.id, action: 'ACCOUNT.REACTIVATED', targetType: 'USER', targetId: user.id, result: 'SUCCESS', reason: 'REGISTERED_EMAIL_CONFIRMED', changes: {} }, messages.accounts.clock);
  });
}
