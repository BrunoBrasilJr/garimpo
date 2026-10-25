import { randomUUID } from 'node:crypto';
import type { AccountView, AddressInput } from '@garimpo/contracts';
import type { User } from '../../persistence/generated/client.ts';
import type { Database, Prisma } from '../../persistence/client.ts';
import { serializable } from '../../persistence/transaction.ts';
import type { Clock } from '../../core/clock.ts';
import { systemClock } from '../../core/clock.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { AccountError } from './errors.ts';
import { hashPassword, verifyPassword, secret, tokenHash, sameHash } from './credentials.ts';
import { parse, addressInput, addressPatch } from './validation.ts';

const active = (user: User) => !user.blockedAt && !user.closedAt && !user.inactiveAt;
export const view = (user: User): AccountView => ({
  id: user.id, name: user.name, email: user.emailNormalized, context: user.context, role: user.role,
  emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
  blockedAt: user.blockedAt?.toISOString() ?? null, inactiveAt: user.inactiveAt?.toISOString() ?? null
});
type Tx = Prisma.TransactionClient;
type Registration = { name: string; email: string; password: string };
export interface SessionBundle {
  user: AccountView; accessToken: string; refreshToken: string; csrfToken: string;
  accessExpiresAt: Date; refreshExpiresAt: Date;
}
export interface AuthPolicy { loginAccount: number; loginIp: number; registerIp: number; refreshIp: number }
export const defaultAuthPolicy: AuthPolicy = { loginAccount: 5, loginIp: 20, registerIp: 10, refreshIp: 120 };

export class Accounts {
  readonly db: Database;
  readonly clock: Clock;
  readonly policy: AuthPolicy;
  constructor(db: Database, clock: Clock = systemClock, policy: AuthPolicy = defaultAuthPolicy) {
    this.db = db; this.clock = clock; this.policy = policy;
    if (Object.values(policy).some(value => !Number.isInteger(value) || value < 1 || value > 10000)) throw new Error('Invalid auth rate configuration.');
  }
  async rate(operation: string, ip: string, email?: string) {
    const minutes = operation === 'REGISTER' ? 60 : 15;
    const buckets = [{ key: `IP:${ip}`, limit: operation === 'LOGIN' ? this.policy.loginIp : operation === 'REGISTER' ? this.policy.registerIp : this.policy.refreshIp }];
    if (email) buckets.push({ key: `ACCOUNT:${email}`, limit: this.policy.loginAccount });
    await serializable(this.db, async tx => {
      for (const bucket of buckets.sort((a, b) => a.key.localeCompare(b.key))) {
        const targetId = tokenHash('rate', `${operation}:${bucket.key}`);
        const now = this.clock.now();
        const where = { targetType: 'RATE', targetId, action: `AUTH.${operation}_ATTEMPT`, createdAt: { gt: new Date(now.getTime() - minutes * 60000) } };
        if (await tx.auditLog.count({ where }) >= bucket.limit) throw new AccountError(429, 'AUTH_RATE_LIMIT');
        await appendAudit(tx, { action: `AUTH.${operation}_ATTEMPT`, targetType: 'RATE', targetId,
          result: 'SUCCESS', reason: 'ATTEMPT_RECORDED', changes: {} }, this.clock);
      }
    });
  }
  async register(input: Registration) {
    const passwordHash = await hashPassword(input.password);
    try {
      return await serializable(this.db, async tx => {
        const user = await tx.user.create({ data: { name: input.name, emailNormalized: input.email,
          passwordHash, context: 'CUSTOMER', role: 'USER', createdAt: this.clock.now() } });
        await enqueue(tx, { type: 'ACCOUNT.EMAIL_VERIFICATION_REQUESTED', aggregateId: user.id, payload: { userId: user.id } }, this.clock);
        await appendAudit(tx, { actorId: user.id, action: 'ACCOUNT.REGISTER', targetType: 'USER', targetId: user.id,
          result: 'SUCCESS', reason: 'PUBLIC_REGISTRATION', changes: { context: 'CUSTOMER', role: 'USER' } }, this.clock);
        return view(user);
      });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') throw new AccountError(409, 'ACCOUNT_CONFLICT');
      throw error;
    }
  }
  async login(email: string, password: string, channel: 'web' | 'mobile' = 'web'): Promise<SessionBundle> {
    const candidate = await this.db.user.findUnique({ where: { emailNormalized: email } });
    const valid = await verifyPassword(password, candidate?.passwordHash);
    if (!candidate || !valid || !active(candidate)) throw new AccountError(401, 'INVALID_CREDENTIALS');
    if (channel === 'mobile' && candidate.context === 'STAFF') throw new AccountError(403, 'STAFF_WEB_ONLY');
    return serializable(this.db, async tx => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: candidate.id } });
      if (!active(user) || user.passwordHash !== candidate.passwordHash) throw new AccountError(401, 'INVALID_CREDENTIALS');
      const now = this.clock.now();
      const id = randomUUID();
      const accessToken = secret(), refreshToken = `${id}.${secret()}`, csrfToken = secret();
      const accessExpiresAt = new Date(now.getTime() + 15 * 60000), refreshExpiresAt = new Date(now.getTime() + 7 * 86400000);
      await tx.session.create({ data: { id, userId: user.id, credentialHash: tokenHash('access', accessToken),
        refreshHash: tokenHash('refresh', refreshToken), csrfHash: tokenHash('csrf', csrfToken),
        expiresAt: accessExpiresAt, refreshExpiresAt, createdAt: now } });
      await appendAudit(tx, { actorId: user.id, action: 'AUTH.LOGIN_SUCCESS', targetType: 'SESSION', targetId: id,
        result: 'SUCCESS', reason: 'CREDENTIALS_VALID', changes: {} }, this.clock);
      return { user: view(user), accessToken, refreshToken, csrfToken, accessExpiresAt, refreshExpiresAt };
    });
  }
  async authorize(tx: Tx, accessToken: string, customer = false) {
    if (!/^[\w-]{43}$/.test(accessToken)) throw new AccountError(401, 'INVALID_SESSION');
    const session = await tx.session.findUnique({ where: { credentialHash: tokenHash('access', accessToken) }, include: { user: true } });
    if (!session || session.revokedAt || session.expiresAt <= this.clock.now()) throw new AccountError(401, 'INVALID_SESSION');
    if (!active(session.user)) throw new AccountError(403, 'ACCOUNT_UNAVAILABLE');
    if (customer && session.user.context !== 'CUSTOMER') throw new AccountError(403, 'CUSTOMER_REQUIRED');
    return session;
  }
  async csrf(access: string, supplied: string) {
    const session = await this.authorize(this.db, access);
    if (!sameHash(session.csrfHash, tokenHash('csrf', supplied))) throw new AccountError(403, 'CSRF_INVALID');
  }
  async renew(refreshToken: string, csrf?: string): Promise<SessionBundle> {
    const id = /^([0-9a-f-]{36})\.[\w-]{43}$/.exec(refreshToken)?.[1];
    if (!id || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id)) throw new AccountError(401, 'INVALID_SESSION');
    const result = await serializable(this.db, async tx => {
      const session = await tx.session.findUnique({ where: { id }, include: { user: true } });
      if (!session || session.revokedAt || session.refreshExpiresAt <= this.clock.now() || !active(session.user)) throw new AccountError(401, 'INVALID_SESSION');
      const hash = tokenHash('refresh', refreshToken);
      if (!sameHash(hash, session.refreshHash)) {
        if (session.usedRefreshHashes.includes(hash)) {
          await tx.session.update({ where: { id }, data: { revokedAt: this.clock.now() } });
          await appendAudit(tx, { actorId: session.userId, action: 'AUTH.REFRESH_REUSED', targetType: 'SESSION', targetId: id,
            result: 'FAILURE', reason: 'CREDENTIAL_REUSE', changes: {} }, this.clock);
          return null;
        }
        throw new AccountError(401, 'INVALID_SESSION');
      }
      if (csrf !== undefined && !sameHash(session.csrfHash, tokenHash('csrf', csrf))) throw new AccountError(403, 'CSRF_INVALID');
      const now = this.clock.now(), accessToken = secret(), nextRefresh = `${id}.${secret()}`, csrfToken = secret();
      const accessExpiresAt = new Date(Math.min(now.getTime() + 15 * 60000, session.refreshExpiresAt.getTime()));
      await tx.session.update({ where: { id }, data: { credentialHash: tokenHash('access', accessToken),
        refreshHash: tokenHash('refresh', nextRefresh), usedRefreshHashes: { push: session.refreshHash },
        csrfHash: tokenHash('csrf', csrfToken), expiresAt: accessExpiresAt } });
      return { user: view(session.user), accessToken, refreshToken: nextRefresh, csrfToken, accessExpiresAt, refreshExpiresAt: session.refreshExpiresAt };
    });
    if (!result) throw new AccountError(401, 'INVALID_SESSION');
    return result;
  }
  async logout(refreshToken: string, csrf?: string) {
    const id = /^([0-9a-f-]{36})\.[\w-]{43}$/.exec(refreshToken)?.[1];
    if (!id || !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/.test(id)) throw new AccountError(401, 'INVALID_SESSION');
    await serializable(this.db, async tx => {
      const session = await tx.session.findUnique({ where: { id } });
      if (!session || !sameHash(session.refreshHash, tokenHash('refresh', refreshToken))) throw new AccountError(401, 'INVALID_SESSION');
      if (csrf !== undefined && !sameHash(session.csrfHash, tokenHash('csrf', csrf))) throw new AccountError(403, 'CSRF_INVALID');
      await tx.session.update({ where: { id }, data: { revokedAt: this.clock.now() } });
      await appendAudit(tx, { actorId: session.userId, action: 'AUTH.LOGOUT', targetType: 'SESSION', targetId: id,
        result: 'SUCCESS', reason: 'LOGOUT', changes: {} }, this.clock);
    });
  }
  async profile(access: string, name?: string) {
    return serializable(this.db, async tx => {
      const session = await this.authorize(tx, access, name !== undefined);
      if (name === undefined) return view(session.user);
      const user = await tx.user.update({ where: { id: session.userId }, data: { name } });
      return view(user);
    });
  }
  async addresses(access: string, command: 'LIST' | 'CREATE' | 'UPDATE' | 'DELETE', input?: { [K in keyof AddressInput]?: AddressInput[K] | undefined }, id?: string) {
    return serializable(this.db, async tx => {
      const session = await this.authorize(tx, access, true);
      if (command === 'LIST') return tx.address.findMany({ where: { userId: session.userId, deletedAt: null }, orderBy: { createdAt: 'asc' } });
      if (command === 'CREATE') {
        const address = parse(addressInput, input);
        return tx.address.create({ data: { userId: session.userId, recipient: address.recipient, zip: address.zip,
          region: address.region, city: address.city, neighborhood: address.neighborhood, street: address.street,
          number: address.number, ...(address.complement !== undefined ? { complement: address.complement } : {}), createdAt: this.clock.now() } });
      }
      const address = await tx.address.findFirst({ where: { id: id!, userId: session.userId, deletedAt: null } });
      if (!address) throw new AccountError(404, 'ADDRESS_NOT_FOUND');
      const data = command === 'UPDATE' ? Object.fromEntries(Object.entries(parse(addressPatch, input)).filter((entry): entry is [string, string] => typeof entry[1] === 'string')) : { deletedAt: this.clock.now() };
      return tx.address.update({ where: { id: address.id }, data });
    });
  }
}
