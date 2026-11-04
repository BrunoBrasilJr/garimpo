import { randomUUID } from 'node:crypto';
import type { CustomerRecord } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import type { User } from '../../persistence/generated/client.ts';
import type { Accounts } from './service.ts';
import { view } from './service.ts';
import { AccountError } from './errors.ts';
import { payloadHash } from '../../core/idempotency.ts';

export function customerView(user: User): CustomerRecord {
  const values = { ...view(user), closedAt: user.closedAt?.toISOString() ?? null, createdAt: user.createdAt.toISOString() };
  return { ...values, revision: payloadHash({ ...values, updatedAt: user.updatedAt.toISOString() }) };
}
export async function staff(accounts: Accounts, tx: Prisma.TransactionClient | Accounts['db'], access: string, adminOnly = false) {
  const { user } = await accounts.authorize(tx, access);
  if (user.context !== 'STAFF' || !['ADMIN', 'OPERATOR'].includes(user.role) || adminOnly && user.role !== 'ADMIN') throw new AccountError(403, 'STAFF_REQUIRED');
  return user;
}
export async function lockIdentities(tx: Prisma.TransactionClient, ids: string[]) {
  for (const id of [...new Set(ids)].sort()) await tx.$queryRaw`UPDATE "User" SET "updatedAt"="updatedAt" WHERE id=${id}::uuid RETURNING id`;
}
export function checkRevision(user: User, revision: string) { if (customerView(user).revision !== revision) throw new AccountError(409, 'CUSTOMER_VERSION_CONFLICT'); }
export async function receipt(tx: Prisma.TransactionClient, actor: string, operation: string, key: string, payload: unknown) {
  const identity = { actorScope: actor, operation, key }, requestHash = payloadHash(payload);
  const existing = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: identity } });
  if (existing && existing.requestHash !== requestHash) throw new AccountError(409, 'IDEMPOTENCY_CONFLICT');
  return { replayed: Boolean(existing), save: async (resultRef: string, now: Date) => { await tx.idempotencyRecord.create({ data: { id: randomUUID(), ...identity, requestHash, resultRef, createdAt: now } }); } };
}
export async function revokeAccess(tx: Prisma.TransactionClient, userId: string, now: Date) {
  await tx.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: now } });
  await tx.emailToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: now } });
  await tx.passwordReset.updateMany({ where: { userId, usedAt: null }, data: { usedAt: now } });
}
