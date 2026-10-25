import { AccessMessages, available } from '../messaging/service.ts';
import { serializable } from '../../persistence/transaction.ts';
import { tokenHash } from './credentials.ts';
import { AccountError } from './errors.ts';
import { appendAudit } from '../../core/audit.ts';
import { view } from './service.ts';

export async function requestEmailChange(messages: AccessMessages, access: string, email: string, staffId?: string) {
  return serializable(messages.accounts.db, async tx => {
    const actor = (await messages.accounts.authorize(tx, access)).user;
    if (staffId ? actor.context !== 'STAFF' || actor.role !== 'ADMIN' : actor.context !== 'CUSTOMER') throw new AccountError(403, 'EMAIL_CHANGE_FORBIDDEN');
    const target = staffId ? await tx.user.findFirst({ where: { id: staffId, context: 'STAFF' } }) : actor;
    if (!target || !available(target)) throw new AccountError(404, 'ACCOUNT_NOT_FOUND');
    if (target.emailNormalized === email || await tx.user.findUnique({ where: { emailNormalized: email } })) throw new AccountError(409, 'ACCOUNT_CONFLICT');
    await messages.issue(tx, target, 'CHANGE', email);
    await appendAudit(tx, { actorId: actor.id, action: 'ACCESS.EMAIL_CHANGE_REQUEST', targetType: 'USER', targetId: target.id,
      result: 'SUCCESS', reason: 'CONFIRM_NEW_ADDRESS', changes: {} }, messages.accounts.clock);
    return view(target);
  });
}
export async function confirmEmailChange(messages: AccessMessages, token: string) {
  try {
    await serializable(messages.accounts.db, async tx => {
      const record = await tx.emailToken.findUnique({ where: { tokenHash: tokenHash('email-change', token) }, include: { user: true } });
      const now = messages.accounts.clock.now();
      if (!record || record.purpose !== 'CHANGE' || record.usedAt || record.expiresAt <= now || !record.pendingEmail || !available(record.user)) throw new AccountError(422, 'INVALID_ACCESS_LINK');
      if (await tx.user.findUnique({ where: { emailNormalized: record.pendingEmail } })) throw new AccountError(409, 'ACCOUNT_CONFLICT');
      await tx.user.update({ where: { id: record.userId }, data: { emailNormalized: record.pendingEmail, emailVerifiedAt: now } });
      await tx.emailToken.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: now } });
      await tx.passwordReset.updateMany({ where: { userId: record.userId, usedAt: null }, data: { usedAt: now } });
      await appendAudit(tx, { actorId: record.userId, action: 'ACCESS.EMAIL_CHANGED', targetType: 'USER', targetId: record.userId,
        result: 'SUCCESS', reason: 'NEW_ADDRESS_CONFIRMED', changes: {} }, messages.accounts.clock);
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new AccountError(409, 'ACCOUNT_CONFLICT');
    throw error;
  }
}
