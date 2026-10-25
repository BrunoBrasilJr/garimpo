import type { Accounts } from '../service.ts';
import { view } from '../service.ts';
import { AccountError } from '../errors.ts';
import { hashPassword } from '../credentials.ts';
import { serializable } from '../../../persistence/transaction.ts';
import { appendAudit } from '../../../core/audit.ts';
import type { Prisma } from '../../../persistence/client.ts';

async function admin(accounts: Accounts, tx: Prisma.TransactionClient, access: string) {
  const session = await accounts.authorize(tx, access);
  if (session.user.context !== 'STAFF' || session.user.role !== 'ADMIN') throw new AccountError(403, 'ADMIN_REQUIRED');
  return session.user;
}
export async function firstAdmin(accounts: Accounts, input: { name: string; email: string; password: string }) {
  const passwordHash = await hashPassword(input.password);
  return serializable(accounts.db, async tx => {
    if (await tx.user.count({ where: { context: 'STAFF' } })) throw new AccountError(409, 'BOOTSTRAP_ALREADY_USED');
    const user = await tx.user.create({ data: { name: input.name, emailNormalized: input.email, passwordHash,
      context: 'STAFF', role: 'ADMIN', createdAt: accounts.clock.now() } });
    await appendAudit(tx, { actorId: user.id, action: 'STAFF.BOOTSTRAP', targetType: 'USER', targetId: user.id,
      result: 'SUCCESS', reason: 'EXPLICIT_LOCAL_BOOTSTRAP', changes: { role: 'ADMIN', context: 'STAFF' } }, accounts.clock);
    return view(user);
  });
}
export async function createStaff(accounts: Accounts, access: string, input: { name: string; email: string; password: string; role: 'ADMIN' | 'OPERATOR' }) {
  await admin(accounts, accounts.db, access);
  const passwordHash = await hashPassword(input.password);
  try {
    return await serializable(accounts.db, async tx => {
      const actor = await admin(accounts, tx, access);
      const user = await tx.user.create({ data: { name: input.name, emailNormalized: input.email,
        passwordHash, context: 'STAFF', role: input.role, createdAt: accounts.clock.now() } });
      await appendAudit(tx, { actorId: actor.id, action: 'STAFF.CREATE', targetType: 'USER', targetId: user.id,
        result: 'SUCCESS', reason: 'ADMIN_REQUEST', changes: { role: input.role } }, accounts.clock);
      return view(user);
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new AccountError(409, 'ACCOUNT_CONFLICT');
    throw error;
  }
}
export async function listStaff(accounts: Accounts, access: string, page: number, pageSize: number) {
  await admin(accounts, accounts.db, access);
  const where = { context: 'STAFF' as const };
  const [rows, total] = await accounts.db.$transaction([
    accounts.db.user.findMany({ where, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], skip: (page - 1) * pageSize, take: pageSize }),
    accounts.db.user.count({ where })
  ]);
  return { items: rows.map(view), total, page, pageSize };
}
export async function changeStaff(accounts: Accounts, access: string, id: string, command: 'EDIT' | 'BLOCK' | 'UNBLOCK' | 'DEACTIVATE', input: { name?: string | undefined; role?: 'ADMIN' | 'OPERATOR' | undefined; reason?: string | undefined }) {
  return serializable(accounts.db, async tx => {
    const actor = await admin(accounts, tx, access);
    const target = await tx.user.findFirst({ where: { id, context: 'STAFF' } });
    if (!target) throw new AccountError(404, 'STAFF_NOT_FOUND');
    const losesAdmin = target.role === 'ADMIN' && !target.blockedAt && !target.closedAt && !target.inactiveAt &&
      (command === 'BLOCK' || command === 'DEACTIVATE' || (command === 'EDIT' && input.role === 'OPERATOR'));
    if (losesAdmin && await tx.user.count({ where: { context: 'STAFF', role: 'ADMIN', blockedAt: null, closedAt: null, inactiveAt: null } }) <= 1) {
      throw new AccountError(409, 'LAST_ADMIN_REQUIRED');
    }
    const data: Prisma.UserUpdateInput = command === 'EDIT' ? { ...(input.name !== undefined ? { name: input.name } : {}), ...(input.role ? { role: input.role } : {}) }
      : command === 'BLOCK' ? { blockedAt: accounts.clock.now() }
      : command === 'UNBLOCK' ? { blockedAt: null } : { inactiveAt: accounts.clock.now() };
    const user = await tx.user.update({ where: { id }, data });
    if (command === 'BLOCK' || command === 'DEACTIVATE' || (command === 'EDIT' && input.role && input.role !== target.role)) {
      await tx.session.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: accounts.clock.now() } });
    }
    const reason = input.reason?.replace(/(?:password|senha|token|secret|authorization)\s*[:=]\s*\S+/gi, '[REDACTED]');
    await appendAudit(tx, { actorId: actor.id, action: `STAFF.${command}`, targetType: 'USER', targetId: id,
      result: 'SUCCESS', reason: 'ADMIN_REQUEST', changes: { role: user.role, ...(reason ? { reason } : {}) } }, accounts.clock);
    return view(user);
  });
}
