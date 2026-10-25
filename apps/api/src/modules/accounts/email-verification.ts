import { AccessMessages, available } from '../messaging/service.ts';
import { serializable } from '../../persistence/transaction.ts';
import { tokenHash } from './credentials.ts';
import { AccountError } from './errors.ts';
import { appendAudit } from '../../core/audit.ts';

export async function requestVerification(messages: AccessMessages, email: string) {
  await serializable(messages.accounts.db, async tx => {
    const user = await tx.user.findUnique({ where: { emailNormalized: email } });
    if (user && available(user) && !user.emailVerifiedAt) await messages.issue(tx, user, 'VERIFY');
  });
}
export async function confirmVerification(messages: AccessMessages, token: string) {
  await serializable(messages.accounts.db, async tx => {
    const record = await tx.emailToken.findUnique({ where: { tokenHash: tokenHash('email-verify', token) }, include: { user: true } });
    const now = messages.accounts.clock.now();
    if (!record || record.purpose !== 'VERIFY' || record.usedAt || record.expiresAt <= now || !available(record.user) || record.pendingEmail !== record.user.emailNormalized) throw new AccountError(422, 'INVALID_ACCESS_LINK');
    await tx.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: now } });
    await tx.emailToken.updateMany({ where: { userId: record.userId, purpose: 'VERIFY', usedAt: null }, data: { usedAt: now } });
    await appendAudit(tx, { actorId: record.userId, action: 'ACCESS.EMAIL_VERIFIED', targetType: 'USER', targetId: record.userId,
      result: 'SUCCESS', reason: 'ONE_TIME_LINK_CONSUMED', changes: {} }, messages.accounts.clock);
  });
}
