import { randomBytes, randomUUID } from 'node:crypto';
import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest';
import { createDatabase } from '../../apps/api/src/persistence/client';
import type { Database } from '../../apps/api/src/persistence/client';
import { Accounts } from '../../apps/api/src/modules/accounts/service';
import { firstAdmin, createStaff } from '../../apps/api/src/modules/accounts/staff/service';
import { AccessMessages } from '../../apps/api/src/modules/messaging/service';
import { MessageProtection } from '../../apps/api/src/modules/messaging/protection';
import { configuredMessages } from '../../apps/api/src/modules/messaging/config';
import { consumeRegistration, deliverNext } from '../../apps/api/src/modules/messaging/worker';
import { confirmPasswordReset } from '../../apps/api/src/modules/accounts/password-reset';
import { confirmEmailChange } from '../../apps/api/src/modules/accounts/email-change';
import { openServer, mobile, web, origin } from './http';
import type { AccountView, RestrictedMessage } from '@garimpo/contracts';

const PASSWORD = 'Senha sintética de teste 2026!', NEW_PASSWORD = 'Outra senha sintética válida 2026!';
const encryptionKey = randomBytes(32).toString('hex'), technicalSecret = randomBytes(32).toString('base64url');
const tech = { Authorization: `Bearer ${technicalSecret}` };
let db: Database, other: Database, accounts: Accounts, second: Accounts, messages: AccessMessages, otherMessages: AccessMessages;
let server: Awaited<ReturnType<typeof openServer>>;
let time = Date.parse('2026-10-25T21:00:00Z');
const clock = { now: () => new Date(time) }, email = () => `${randomUUID()}@example.invalid`;
let adminEmail: string;
interface Login { accessToken: string; refreshToken: string; user: AccountView }
const login = (address: string, password = PASSWORD) => server.call<Login>('/auth/login', 'POST', { email: address, password });
async function drain() {
  for (let index = 0; index < 100; index++) { const result = await consumeRegistration(messages); if (result === 'EMPTY') break; expect(result).toBe('PROCESSED'); }
  for (let index = 0; index < 100; index++) { const result = await deliverNext(messages); if (result === 'EMPTY') break; expect(result).toBe('DELIVERED'); }
}
async function customer() {
  const input = { name: 'Titular de teste', email: email(), password: PASSWORD };
  const created = await server.call<AccountView>('/auth/register', 'POST', input); expect(created.status).toBe(201);
  await drain(); return { input, user: created.body };
}
async function latest(recipient: string, type: string) {
  const reply = await server.call<{ items: RestrictedMessage[] }>(`/demo/messages?recipient=${encodeURIComponent(recipient)}&type=${type}`, 'GET', undefined, tech);
  expect(reply.status).toBe(200); const message = reply.body.items[0]; if (!message) throw new Error('Expected restricted test message.');
  const token = new URL(message.content.link).hash.split('token=')[1]; if (!token) throw new Error('Expected fragment token.');
  return { message, token };
}
async function resetRequest(address: string) {
  time += 1;
  const result = await server.call('/auth/password-reset', 'POST', { email: address }); expect(result.status).toBe(202);
  return latest(address, 'ACCESS.RESET');
}
beforeAll(async () => {
  const value = process.env.TEST_DATABASE_URL; if (!value || new URL(value).pathname !== '/garimpo_test') throw new Error('Separate test database required.');
  const a = new URL(value), b = new URL(value); a.searchParams.set('application_name', 'TASK005_A'); b.searchParams.set('application_name', 'TASK005_B');
  db = createDatabase(a.href); other = createDatabase(b.href); accounts = new Accounts(db, clock); second = new Accounts(other, clock);
  const protection = new MessageProtection(encryptionKey, technicalSecret);
  messages = new AccessMessages(accounts, protection, origin, { account: 5, ip: 200 }); otherMessages = new AccessMessages(second, protection, origin, { account: 5, ip: 200 });
  adminEmail = email(); await firstAdmin(accounts, { name: 'Admin teste', email: adminEmail, password: PASSWORD });
  server = await openServer({ db, clock }, { db, clock, webOrigin: origin, mode: 'local-test', encryptionKey, technicalSecret, limits: { account: 5, ip: 200 } });
});
beforeEach(() => { time += 2 * 86400000; });
afterAll(async () => { await server?.close(); await Promise.all([db?.$disconnect(), other?.$disconnect()]); });

test('registration event produces one protected initial message; confirmation is single-use and resending supersedes old links', async () => {
  const data = await customer(), initial = await latest(data.input.email, 'ACCESS.VERIFY');
  expect(initial.message.status).toBe('DELIVERED');
  expect(Date.parse(initial.message.content.expiresAt) - clock.now().getTime()).toBe(86400000);
  expect(await consumeRegistration(messages)).toBe('EMPTY');
  expect(await db.demoMessage.count({ where: { userId: data.user.id, type: 'ACCESS.VERIFY' } })).toBe(1);
  expect((await server.call('/auth/email-verification', 'POST', { email: data.input.email })).status).toBe(202);
  const resend = await latest(data.input.email, 'ACCESS.VERIFY');
  // Identical controlled timestamps are ordered by id; find the still-live token's message explicitly.
  const live = await db.emailToken.findFirstOrThrow({ where: { userId: data.user.id, purpose: 'VERIFY', usedAt: null } });
  const queued = await db.demoMessage.findFirstOrThrow({ where: { tokenRef: live.id } });
  const detail = await server.call<RestrictedMessage>(`/demo/messages/${queued.id}`, 'GET', undefined, tech);
  const liveToken = new URL(detail.body.content.link).hash.split('token=')[1]!;
  expect((await server.call('/auth/email-verification/confirm', 'POST', { token: initial.token })).status).toBe(422);
  expect((await server.call('/auth/email-verification/confirm', 'POST', { token: liveToken })).status).toBe(200);
  expect((await server.call('/auth/email-verification/confirm', 'POST', { token: liveToken })).status).toBe(422);
  expect((await db.user.findUniqueOrThrow({ where: { id: data.user.id } })).emailVerifiedAt).not.toBeNull();
  expect(resend.message.type).toBe('ACCESS.VERIFY');
});

test('initial verification expires at exactly 24 hours and resend remains available', async () => {
  const data = await customer(), initial = await latest(data.input.email, 'ACCESS.VERIFY');
  time += 86400000;
  expect((await server.call('/auth/email-verification/confirm', 'POST', { token: initial.token })).status).toBe(422);
  expect((await server.call('/auth/email-verification', 'POST', { email: data.input.email })).status).toBe(202);
  const fresh = await latest(data.input.email, 'ACCESS.VERIFY');
  expect((await server.call('/auth/email-verification/confirm', 'POST', { token: fresh.token })).status).toBe(200);
});

test('password reset changes once, revokes every session and all active link purposes without confirming email', async () => {
  const data = await customer(), initial = await latest(data.input.email, 'ACCESS.VERIFY');
  const first = await login(data.input.email), another = await login(data.input.email);
  expect((await server.call('/me/email-change', 'POST', { email: email() }, mobile(first.body.accessToken))).status).toBe(202);
  const reset = await resetRequest(data.input.email);
  expect(Date.parse(reset.message.content.expiresAt) - clock.now().getTime()).toBe(30 * 60000);
  expect((await server.call('/auth/password-reset/confirm', 'POST', { token: reset.token, newPassword: NEW_PASSWORD })).status).toBe(200);
  expect((await server.call('/auth/password-reset/confirm', 'POST', { token: reset.token, newPassword: PASSWORD })).status).toBe(422);
  for (const signed of [first, another]) {
    expect((await server.call('/me', 'GET', undefined, mobile(signed.body.accessToken))).status).toBe(401);
    expect((await server.call('/auth/refresh', 'POST', { refreshToken: signed.body.refreshToken })).status).toBe(401);
  }
  expect((await login(data.input.email)).status).toBe(401); expect((await login(data.input.email, NEW_PASSWORD)).status).toBe(200);
  expect((await server.call('/auth/email-verification/confirm', 'POST', { token: initial.token })).status).toBe(422);
  expect(await db.emailToken.count({ where: { userId: data.user.id, usedAt: null } })).toBe(0);
  expect((await db.user.findUniqueOrThrow({ where: { id: data.user.id } })).emailVerifiedAt).toBeNull();
});

test('reset expires at 30 minutes; newer requests invalidate older links and token purposes cannot be exchanged', async () => {
  const data = await customer(), verify = await latest(data.input.email, 'ACCESS.VERIFY'), reset = await resetRequest(data.input.email);
  expect((await server.call('/auth/email-verification/confirm', 'POST', { token: reset.token })).status).toBe(422);
  expect((await server.call('/auth/password-reset/confirm', 'POST', { token: verify.token, newPassword: NEW_PASSWORD })).status).toBe(422);
  time += 30 * 60000;
  expect((await server.call('/auth/password-reset/confirm', 'POST', { token: reset.token, newPassword: NEW_PASSWORD })).status).toBe(422);
  const next = await resetRequest(data.input.email); time += 1;
  const newest = await resetRequest(data.input.email);
  expect((await server.call('/auth/password-reset/confirm', 'POST', { token: next.token, newPassword: NEW_PASSWORD })).status).toBe(422);
  expect((await server.call('/auth/password-reset/confirm', 'POST', { token: newest.token, newPassword: NEW_PASSWORD })).status).toBe(200);
});

test('unknown, blocked, closed and inactive accounts receive the same public acceptance and no recovery links', async () => {
  const unknown = await server.call('/auth/password-reset', 'POST', { email: email() });
  for (const state of ['blockedAt', 'closedAt', 'inactiveAt'] as const) {
    const data = await customer();
    await db.user.update({ where: { id: data.user.id }, data: { [state]: clock.now() } });
    const known = await server.call('/auth/password-reset', 'POST', { email: data.input.email });
    expect(known.status).toBe(202); expect(known.body).toEqual(unknown.body);
    expect(await db.passwordReset.count({ where: { userId: data.user.id } })).toBe(0);
    expect((await server.call('/auth/email-verification', 'POST', { email: data.input.email })).status).toBe(202);
  }
});

test('email change preserves old address until confirmation, rejects stale/reused links and duplicate target addresses', async () => {
  const data = await customer(), signed = await login(data.input.email), destination = email();
  expect((await server.call('/me/email-change', 'POST', { email: destination }, mobile(signed.body.accessToken))).status).toBe(202);
  expect((await db.user.findUniqueOrThrow({ where: { id: data.user.id } })).emailNormalized).toBe(data.input.email);
  expect((await login(data.input.email)).status).toBe(200); expect((await login(destination)).status).toBe(401);
  const link = await latest(destination, 'ACCESS.CHANGE');
  expect((await server.call('/auth/email-change/confirm', 'POST', { token: link.token })).status).toBe(200);
  expect((await server.call('/auth/email-change/confirm', 'POST', { token: link.token })).status).toBe(422);
  expect((await login(destination)).status).toBe(200); expect((await login(data.input.email)).status).toBe(401);
  const duplicate = await customer();
  expect((await server.call('/me/email-change', 'POST', { email: duplicate.input.email }, mobile(signed.body.accessToken))).status).toBe(409);
});

test('change token expires after 24 hours; uniqueness is revalidated at confirmation rather than reserved at request', async () => {
  const data = await customer(), signed = await login(data.input.email), destination = email();
  expect((await server.call('/me/email-change', 'POST', { email: destination }, mobile(signed.body.accessToken))).status).toBe(202);
  const link = await latest(destination, 'ACCESS.CHANGE');
  await accounts.register({ name: 'Titular concorrente', email: destination, password: PASSWORD });
  expect((await server.call('/auth/email-change/confirm', 'POST', { token: link.token })).status).toBe(409);
  time += 86400000;
  expect((await server.call('/auth/email-change/confirm', 'POST', { token: link.token })).status).toBe(422);
  expect((await db.user.findUniqueOrThrow({ where: { id: data.user.id } })).emailNormalized).toBe(data.input.email);
});

test('ADMIN correction of internal email requires web and confirmation; OPERATOR cannot initiate it', async () => {
  const admin = await server.call<Login>('/auth/login', 'POST', { email: adminEmail, password: PASSWORD }, { Origin: origin });
  const operatorEmail = email(), destination = email();
  const created = await createStaff(accounts, cookieAccess(admin.cookie), { name: 'Operador teste', email: operatorEmail, password: PASSWORD, role: 'OPERATOR' });
  const operator = await server.call<Login>('/auth/login', 'POST', { email: operatorEmail, password: PASSWORD }, { Origin: origin });
  expect((await server.call(`/admin/staff/${created.id}`, 'PATCH', { email: destination }, web(operator))).status).toBe(403);
  expect((await server.call(`/admin/staff/${created.id}`, 'PATCH', { email: destination }, web(admin))).status).toBe(200);
  expect((await db.user.findUniqueOrThrow({ where: { id: created.id } })).emailNormalized).toBe(operatorEmail);
  const link = await latest(destination, 'ACCESS.CHANGE');
  expect((await server.call('/auth/email-change/confirm', 'POST', { token: link.token })).status).toBe(200);
  expect((await db.user.findUniqueOrThrow({ where: { id: created.id } })).emailNormalized).toBe(destination);
});
function cookieAccess(value: string) { return value.split('; ').find(part => part.startsWith('__Host-garimpo-access='))!.split('=')[1]!; }

test('technical mailbox rejects commercial sessions, query credentials, HTTP and hostile origins; production disables channel', async () => {
  const data = await customer(), signed = await login(data.input.email);
  expect((await server.call('/demo/messages')).status).toBe(403);
  expect((await server.call('/demo/messages', 'GET', undefined, mobile(signed.body.accessToken))).status).toBe(403);
  expect((await server.call(`/demo/messages?secret=${technicalSecret}`, 'GET', undefined, {})).status).toBe(403);
  expect((await server.call('/demo/messages', 'GET', undefined, tech, true)).status).toBe(403);
  expect((await server.call('/demo/messages', 'GET', undefined, { ...tech, Origin: 'https://evil.invalid' })).status).toBe(403);
  const webLogin = await server.call<Login>('/auth/login', 'POST', { email: data.input.email, password: PASSWORD }, { Origin: origin });
  expect((await server.call('/me/email-change', 'POST', { email: email() }, { Origin: origin, Cookie: webLogin.cookie })).status).toBe(403);
  expect((await server.call('/me/email-change', 'POST', { email: email() }, web(webLogin))).status).toBe(202);
  const before = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    expect(configuredMessages({ db, clock, mode: 'local-test', encryptionKey, technicalSecret })).toBeUndefined();
    expect((await server.call('/demo/messages', 'GET', undefined, tech)).status).toBe(403);
  } finally { if (before === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = before; }
  expect(configuredMessages({ db, mode: 'disabled', encryptionKey, technicalSecret })).toBeUndefined();
});

test('delivery failure is durable, auditable and retryable across instances without duplicate message or business rollback', async () => {
  await drain();
  const data = await customer(), reset = await resetRequest(data.input.email);
  expect(await deliverNext(messages, () => { throw new Error('Synthetic failure with confidential text'); })).toBe('FAILED');
  expect((await db.demoMessage.findUniqueOrThrow({ where: { id: reset.message.id } })).status).toBe('FAILED');
  const results = await Promise.all([deliverNext(messages), deliverNext(otherMessages)]);
  expect(results.sort()).toEqual(['DELIVERED', 'EMPTY']);
  const delivered = await db.demoMessage.findUniqueOrThrow({ where: { id: reset.message.id } });
  expect(delivered.attempts).toBe(2); expect(delivered.status).toBe('DELIVERED');
  expect(await db.demoMessage.count({ where: { dedupKey: delivered.dedupKey } })).toBe(1);
  expect(await db.auditLog.count({ where: { targetId: delivered.id, action: 'MESSAGE.DELIVERY_FAILED' } })).toBe(1);
  expect((await server.call('/auth/password-reset/confirm', 'POST', { token: reset.token, newPassword: NEW_PASSWORD })).status).toBe(200);
});

test('preparation failure rolls back partial token/message while retaining the event and audited retry', async () => {
  await drain();
  const created = await accounts.register({ name: 'Falha sintética', email: email(), password: PASSWORD });
  const broken = new MessageProtection(encryptionKey, technicalSecret);
  broken.seal = () => { throw new Error('Synthetic protected preparation failure'); };
  const failed = new AccessMessages(accounts, broken, origin);
  expect(await consumeRegistration(failed)).toBe('FAILED');
  expect(await db.emailToken.count({ where: { userId: created.id } })).toBe(0);
  expect(await db.demoMessage.count({ where: { userId: created.id } })).toBe(0);
  const event = await db.domainEvent.findFirstOrThrow({ where: { aggregateId: created.id } });
  expect(event.processedAt).toBeNull(); expect(event.attempts).toBe(1); expect(event.lastErrorCode).toBe('MESSAGE_PREPARATION_FAILED');
  expect(await consumeRegistration(otherMessages)).toBe('PROCESSED');
  expect(await db.demoMessage.count({ where: { userId: created.id } })).toBe(1);
  expect((await db.domainEvent.findUniqueOrThrow({ where: { id: event.id } })).attempts).toBe(2);
  const unrelated = await db.domainEvent.create({ data: { type: 'UNSUPPORTED.TEST', aggregateId: randomUUID(), payload: {} } });
  expect(await consumeRegistration(messages)).toBe('EMPTY');
  expect((await db.domainEvent.findUniqueOrThrow({ where: { id: unrelated.id } })).processedAt).toBeNull();
});

test('public reset rate is persistent and configured limits cannot disable protection', async () => {
  const target = email();
  for (let index = 0; index < 5; index++) expect((await server.call('/auth/password-reset', 'POST', { email: target })).status).toBe(202);
  expect((await server.call('/auth/password-reset', 'POST', { email: target })).status).toBe(429);
  await expect(otherMessages.rate('RESET', '127.0.0.1', target)).rejects.toMatchObject({ status: 429 });
  time += 15 * 60000;
  expect((await server.call('/auth/password-reset', 'POST', { email: target })).status).toBe(202);
  expect(() => new AccessMessages(accounts, messages.protection, origin, { account: 0, ip: 20 })).toThrow();
});

test('tokens never appear in general audit/events/database message plaintext; only authorized detail decrypts them', async () => {
  const data = await customer(), reset = await resetRequest(data.input.email);
  const snapshot = JSON.stringify([await db.passwordReset.findMany(), await db.emailToken.findMany(), await db.demoMessage.findMany(), await db.domainEvent.findMany(), await db.auditLog.findMany()]);
  expect(snapshot).not.toContain(reset.token); expect(snapshot).not.toContain(PASSWORD); expect(snapshot).not.toContain(technicalSecret); expect(snapshot).not.toContain(encryptionKey);
  const detail = await server.call<RestrictedMessage>(`/demo/messages/${reset.message.id}`, 'GET', undefined, tech);
  expect(detail.status).toBe(200); expect(detail.body.content.link).toContain(reset.token); expect(detail.headers['cache-control']).toBe('no-store');
});

test('two independent reset transactions are forced to overlap and only one consumes the link', async () => {
  const data = await customer(), reset = await resetRequest(data.input.email);
  const results = await overlap(() => confirmPasswordReset(messages, reset.token, NEW_PASSWORD), () => confirmPasswordReset(otherMessages, reset.token, 'Terceira senha sintética válida!'));
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
  expect(await db.auditLog.count({ where: { actorId: data.user.id, action: 'ACCESS.PASSWORD_RESET' } })).toBe(1);
});

test('two independent confirmations competing for one new email preserve uniqueness and the loser old address', async () => {
  const first = await customer(), next = await customer(), destination = email();
  const a = await accounts.login(first.input.email, PASSWORD), b = await second.login(next.input.email, PASSWORD);
  await server.call('/me/email-change', 'POST', { email: destination }, mobile(a.accessToken));
  time += 1;
  await server.call('/me/email-change', 'POST', { email: destination }, mobile(b.accessToken));
  const records = await db.demoMessage.findMany({ where: { type: 'ACCESS.CHANGE', userId: { in: [first.user.id, next.user.id] } }, orderBy: { createdAt: 'asc' } });
  const tokens = records.map(row => (JSON.parse(messages.protection.open(row.id, row.restrictedBody)) as { link: string }).link.split('token=')[1]!);
  const results = await overlap(() => confirmEmailChange(messages, tokens[0]!), () => confirmEmailChange(otherMessages, tokens[1]!));
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
  expect(await db.user.count({ where: { emailNormalized: destination } })).toBe(1);
  expect(await db.user.count({ where: { emailNormalized: { in: [first.input.email, next.input.email] } } })).toBe(1);
});

async function overlap(a: () => Promise<unknown>, b: () => Promise<unknown>) {
  let locked!: () => void, release!: () => void;
  const ready = new Promise<void>(resolve => { locked = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
  const blocker = db.$transaction(async tx => { await tx.$executeRawUnsafe('LOCK TABLE "User" IN SHARE MODE'); locked(); await gate; }, { timeout: 10000 });
  await ready; const work = Promise.allSettled([a(), b()]);
  try {
    let waiting = false;
    for (let attempt = 0; attempt < 200; attempt++) {
      const rows = await db.$queryRaw<{ count: number }[]>`SELECT count(*)::int AS count FROM pg_stat_activity
        WHERE datname = current_database() AND application_name IN ('TASK005_A', 'TASK005_B') AND wait_event_type = 'Lock' AND query LIKE '%UPDATE%'`;
      if (rows[0]?.count === 2) { waiting = true; break; }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    expect(waiting).toBe(true);
  } finally { release(); await blocker; }
  return work;
}
