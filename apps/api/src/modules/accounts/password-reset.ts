import { AccessMessages, available } from '../messaging/service.ts';
import { serializable } from '../../persistence/transaction.ts';
import { tokenHash, hashPassword } from './credentials.ts';
import { AccountError } from './errors.ts';
import { appendAudit } from '../../core/audit.ts';

export async function requestPasswordReset(messages: AccessMessages, email: string) {
  await serializable(messages.accounts.db, async tx => {
    const user = await tx.user.findUnique({ where: { emailNormalized: email } });
    if (user && available(user)) await messages.issue(tx, user, 'RESET');
  });
}
export async function confirmPasswordReset(messages: AccessMessages, token: string, newPassword: string) {
  const passwordHash = await hashPassword(newPassword);
  await serializable(messages.accounts.db, async tx => {
    const reset = await tx.passwordReset.findUnique({ where: { tokenHash: tokenHash('password-reset', token) }, include: { user: true } });
    const now = messages.accounts.clock.now();
    if (!reset || reset.usedAt || reset.expiresAt <= now || !available(reset.user)) throw new AccountError(422, 'INVALID_ACCESS_LINK');
    await tx.user.update({ where: { id: reset.userId }, data: { passwordHash } });
    await tx.passwordReset.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: now } });
    await tx.emailToken.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: now } });
    await tx.session.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: now } });
    await appendAudit(tx, { actorId: reset.userId, action: 'ACCESS.PASSWORD_RESET', targetType: 'USER', targetId: reset.userId,
      result: 'SUCCESS', reason: 'ONE_TIME_LINK_CONSUMED', changes: {} }, messages.accounts.clock);
  });
}
