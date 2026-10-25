import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest';
import { createDatabase } from '../../apps/api/src/persistence/client';
import type { Database } from '../../apps/api/src/persistence/client';
import { Accounts } from '../../apps/api/src/modules/accounts/service';
import { firstAdmin, createStaff, changeStaff } from '../../apps/api/src/modules/accounts/staff/service';
import { tokenHash } from '../../apps/api/src/modules/accounts/credentials';
import { openServer, mobile, web, origin } from './http';
import type { AccountView } from '@garimpo/contracts';

const PASSWORD = 'Senha sintética de teste 2026!';
let db: Database, other: Database;
let current = new Date('2026-10-25T19:00:00Z').getTime();
const clock = { now: () => new Date(current) };
let accounts: Accounts, second: Accounts;
let server: Awaited<ReturnType<typeof openServer>>;
let adminEmail = `admin-${randomUUID()}@example.invalid`;
const email = () => `${randomUUID()}@example.invalid`;
interface LoginBody { accessToken: string; refreshToken: string; csrfToken: string; accessExpiresAt: string; refreshExpiresAt: string; user: AccountView }
async function customer() {
  const input = { name: 'Conta de teste', email: email(), password: PASSWORD };
  const created = await server.call<AccountView>('/auth/register', 'POST', input);
  expect(created.status).toBe(201);
  return { input, user: created.body };
}
async function login(email: string, channel: 'web' | 'mobile' = 'mobile') {
  return server.call<LoginBody>('/auth/login', 'POST', { email, password: PASSWORD }, channel === 'mobile' ? mobile() : { Origin: origin });
}
beforeAll(async () => {
  const value = process.env.TEST_DATABASE_URL;
  if (!value || new URL(value).pathname !== '/garimpo_test' || !['localhost', '127.0.0.1'].includes(new URL(value).hostname)) throw new Error('Separate loopback test database required.');
  const first = new URL(value); first.searchParams.set('application_name', 'TASK004_A');
  const next = new URL(value); next.searchParams.set('application_name', 'TASK004_B');
  db = createDatabase(first.href); other = createDatabase(next.href);
  accounts = new Accounts(db, clock); second = new Accounts(other, clock);
  await firstAdmin(accounts, { name: 'Administrador de teste', email: adminEmail, password: PASSWORD });
  server = await openServer({ db, clock });
});
beforeEach(() => { current += 3600000; });
afterAll(async () => { await server?.close(); await Promise.all([db?.$disconnect(), other?.$disconnect()]); });

test('registration creates CUSTOMER/USER, stores a hash and durable verification event, rejects duplicates and elevated input', async () => {
  const data = await customer();
  expect(data.user).toMatchObject({ role: 'USER', context: 'CUSTOMER', emailVerifiedAt: null });
  expect(data.user).not.toHaveProperty('passwordHash');
  const stored = await db.user.findUniqueOrThrow({ where: { id: data.user.id } });
  expect(stored.passwordHash).toMatch(/^scrypt\$1\$131072/);
  expect(await db.domainEvent.count({ where: { aggregateId: stored.id, type: 'ACCOUNT.EMAIL_VERIFICATION_REQUESTED' } })).toBe(1);
  expect((await server.call('/auth/register', 'POST', data.input)).status).toBe(409);
  for (const extra of [{ role: 'ADMIN' }, { context: 'STAFF' }, { emailVerifiedAt: clock.now().toISOString() }]) {
    expect((await server.call('/auth/register', 'POST', { ...data.input, email: email(), ...extra })).status).toBe(422);
  }
  expect((await server.call('/auth/register', 'POST', { ...data.input, email: email(), password: 'short' })).status).toBe(422);
});

test('login is generic for unknown/wrong credentials, logout revokes access and refresh', async () => {
  const data = await customer();
  const unknown = await login(email());
  const wrong = await server.call('/auth/login', 'POST', { email: data.input.email, password: 'incorrect password' });
  expect(unknown.status).toBe(401); expect(wrong.status).toBe(401);
  expect(unknown.body).toMatchObject({ code: wrong.body.code, message: wrong.body.message });
  const valid = await login(data.input.email); expect(valid.status).toBe(200);
  expect((await server.call('/me', 'GET', undefined, mobile(valid.body.accessToken))).status).toBe(200);
  expect((await server.call('/auth/logout', 'POST', { refreshToken: valid.body.refreshToken })).status).toBe(204);
  expect((await server.call('/me', 'GET', undefined, mobile(valid.body.accessToken))).status).toBe(401);
  expect((await server.call('/auth/refresh', 'POST', { refreshToken: valid.body.refreshToken })).status).toBe(401);
});

test('rotation invalidates old access; forged refresh does not revoke, genuine replay revokes the entire session', async () => {
  const data = await customer(), first = await login(data.input.email);
  const forged = first.body.refreshToken.slice(0, 37) + 'a'.repeat(43);
  expect((await server.call('/auth/refresh', 'POST', { refreshToken: forged })).status).toBe(401);
  expect((await server.call('/me', 'GET', undefined, mobile(first.body.accessToken))).status).toBe(200);
  const rotated = await server.call<LoginBody>('/auth/refresh', 'POST', { refreshToken: first.body.refreshToken });
  expect(rotated.status).toBe(200); expect(rotated.body.accessToken).not.toBe(first.body.accessToken);
  expect((await server.call('/me', 'GET', undefined, mobile(first.body.accessToken))).status).toBe(401);
  expect((await server.call('/me', 'GET', undefined, mobile(rotated.body.accessToken))).status).toBe(200);
  expect((await server.call('/auth/refresh', 'POST', { refreshToken: first.body.refreshToken })).status).toBe(401);
  expect((await server.call('/me', 'GET', undefined, mobile(rotated.body.accessToken))).status).toBe(401);
});

test('15-minute access and absolute seven-day renewal boundaries use controlled server time', async () => {
  const data = await customer(), first = await login(data.input.email);
  current += 15 * 60000;
  expect((await server.call('/me', 'GET', undefined, mobile(first.body.accessToken))).status).toBe(401);
  const rotated = await server.call<LoginBody>('/auth/refresh', 'POST', { refreshToken: first.body.refreshToken });
  expect(rotated.status).toBe(200);
  expect(rotated.body.refreshExpiresAt).toBe(first.body.refreshExpiresAt);
  current = new Date(first.body.refreshExpiresAt).getTime() - 60000;
  const last = await server.call<LoginBody>('/auth/refresh', 'POST', { refreshToken: rotated.body.refreshToken });
  expect(last.status).toBe(200); expect(last.body.accessExpiresAt).toBe(first.body.refreshExpiresAt);
  current += 60000;
  expect((await server.call('/auth/refresh', 'POST', { refreshToken: last.body.refreshToken })).status).toBe(401);
});

test('blocked, closed and inactive accounts cannot authenticate or use an existing session', async () => {
  const data = await customer(), valid = await login(data.input.email);
  for (const field of ['blockedAt', 'closedAt', 'inactiveAt'] as const) {
    await db.user.update({ where: { id: data.user.id }, data: { blockedAt: null, closedAt: null, inactiveAt: null, [field]: clock.now() } });
    expect((await server.call('/me', 'GET', undefined, mobile(valid.body.accessToken))).status).toBe(403);
    expect((await login(data.input.email)).status).toBe(401);
  }
});

test('HTTPS, exact Origin, host-only secure cookies and session-bound CSRF are enforced', async () => {
  const data = await customer(), signed = await login(data.input.email, 'web');
  expect(signed.status).toBe(200); expect(signed.body).not.toHaveProperty('accessToken'); expect(signed.body).not.toHaveProperty('refreshToken');
  const set = signed.headers['set-cookie']!;
  expect(set).toHaveLength(3);
  for (const cookie of set) { expect(cookie).toContain('Secure'); expect(cookie).toContain('SameSite=Lax'); expect(cookie).toContain('Path=/'); expect(cookie).not.toContain('Domain='); }
  for (const cookie of set.filter(value => !value.startsWith('__Host-garimpo-csrf='))) expect(cookie).toContain('HttpOnly');
  const withoutProof = { Origin: origin, Cookie: signed.cookie };
  expect((await server.call('/me', 'PATCH', { name: 'Alterado' }, withoutProof)).status).toBe(403);
  expect((await server.call('/me', 'PATCH', { name: 'Alterado' }, { ...web(signed), Origin: 'https://evil.invalid' })).status).toBe(403);
  expect((await server.call('/me', 'PATCH', { name: 'Alterado' }, web(signed))).status).toBe(200);
  expect((await server.call('/auth/refresh', 'POST', {}, withoutProof)).status).toBe(403);
  const renewed = await server.call('/auth/refresh', 'POST', {}, web(signed)); expect(renewed.status).toBe(200);
  expect((await server.call('/auth/login', 'POST', { email: 'fake@example.invalid', password: 'No real credential' }, { ...mobile(), 'X-Forwarded-Proto': 'https' }, true)).status).toBe(403);
  expect((await server.call('/me', 'GET', undefined, { ...mobile(), Cookie: signed.cookie })).status).toBe(422);
});

test('profile accepts only owned name changes; email, context, role and state cannot be patched directly', async () => {
  const data = await customer(), signed = await login(data.input.email);
  const headers = mobile(signed.body.accessToken);
  expect((await server.call('/me', 'PATCH', { name: 'Novo nome' }, headers)).body).toMatchObject({ name: 'Novo nome' });
  for (const body of [{ email: email() }, { role: 'ADMIN' }, { context: 'STAFF' }, { blockedAt: null }]) expect((await server.call('/me', 'PATCH', body, headers)).status).toBe(422);
  expect((await db.user.findUniqueOrThrow({ where: { id: data.user.id } })).emailNormalized).toBe(data.input.email);
  expect((await server.call('/me', 'GET')).status).toBe(401);
});

test('address CRUD enforces ownership and validation while deletion preserves the historical record', async () => {
  const one = await customer(), two = await customer();
  const a = await login(one.input.email), b = await login(two.input.email);
  const input = { recipient: 'Destinatário', zip: '12345678', region: 'SP', city: 'Cidade', neighborhood: 'Bairro', street: 'Rua', number: '10' };
  expect((await server.call('/me/addresses', 'POST', { ...input, zip: 'bad' }, mobile(a.body.accessToken))).status).toBe(422);
  const created = await server.call('/me/addresses', 'POST', input, mobile(a.body.accessToken)); expect(created.status).toBe(201);
  const id = String(created.body.id);
  expect((await server.call('/me/addresses', 'GET', undefined, mobile(b.body.accessToken))).body).toEqual([]);
  expect((await server.call(`/me/addresses/${id}`, 'PATCH', { city: 'Outra' }, mobile(b.body.accessToken))).status).toBe(404);
  expect((await server.call(`/me/addresses/${id}`, 'DELETE', undefined, mobile(b.body.accessToken))).status).toBe(404);
  expect((await server.call(`/me/addresses/${id}`, 'PATCH', { complement: 'Apto 2' }, mobile(a.body.accessToken))).status).toBe(200);
  expect((await server.call(`/me/addresses/${id}`, 'DELETE', undefined, mobile(a.body.accessToken))).status).toBe(204);
  expect((await server.call('/me/addresses', 'GET', undefined, mobile(a.body.accessToken))).body).toEqual([]);
  expect((await db.address.findUniqueOrThrow({ where: { id } })).deletedAt).not.toBeNull();
});

test('staff management requires a web ADMIN; operator/customer cannot manage and staff cannot use purchasing-account addresses', async () => {
  const admin = await login(adminEmail, 'web'); expect(admin.status).toBe(200);
  expect((await login(adminEmail)).status).toBe(403);
  const operatorEmail = email();
  const created = await server.call('/admin/staff', 'POST', { name: 'Operador', email: operatorEmail, password: PASSWORD, role: 'OPERATOR' }, web(admin));
  expect(created.status).toBe(200); expect(created.body).toMatchObject({ role: 'OPERATOR', context: 'STAFF' });
  const operator = await login(operatorEmail, 'web'); expect(operator.status).toBe(200);
  expect((await server.call('/admin/staff', 'GET', undefined, web(operator))).status).toBe(403);
  expect((await server.call('/me/addresses', 'GET', undefined, web(operator))).status).toBe(403);
  const shopper = await customer(), shopperLogin = await login(shopper.input.email, 'web');
  expect((await server.call('/admin/staff', 'GET', undefined, web(shopperLogin))).status).toBe(403);
  const id = String(created.body.id);
  expect((await server.call(`/admin/staff/${id}/block`, 'POST', { reason: 'Teste administrativo' }, web(admin))).status).toBe(200);
  expect((await server.call('/me', 'GET', undefined, web(operator))).status).toBe(401);
  expect((await login(operatorEmail, 'web')).status).toBe(401);
  expect((await server.call(`/admin/staff/${id}/unblock`, 'POST', { reason: 'Teste administrativo' }, web(admin))).status).toBe(200);
  expect((await login(operatorEmail, 'web')).status).toBe(200);
  expect((await server.call(`/admin/staff/${id}/deactivate`, 'POST', { reason: 'Teste administrativo' }, web(admin))).status).toBe(200);
  expect((await login(operatorEmail, 'web')).status).toBe(401);
});

test('sole active ADMIN cannot be blocked, deactivated or demoted, and bootstrap is explicit and one-time', async () => {
  const signed = await login(adminEmail, 'web');
  const id = signed.body.user.id;
  for (const action of ['block', 'deactivate']) expect((await server.call(`/admin/staff/${id}/${action}`, 'POST', { reason: 'Teste' }, web(signed))).status).toBe(409);
  expect((await server.call(`/admin/staff/${id}`, 'PATCH', { role: 'OPERATOR' }, web(signed))).status).toBe(409);
  await expect(firstAdmin(accounts, { name: 'Outro', email: email(), password: PASSWORD })).rejects.toMatchObject({ code: 'BOOTSTRAP_ALREADY_USED' });
  const before = await db.user.count();
  const env = { ...process.env }; delete env.BOOTSTRAP_ADMIN_PASSWORD;
  const result = spawnSync(process.execPath, ['--experimental-strip-types', 'scripts/bootstrap-admin.mjs'], { env, encoding: 'utf8' });
  expect(result.status).not.toBe(0); expect(await db.user.count()).toBe(before);
});

test('rate limits persist across service instances and open only after the configured window', async () => {
  const data = await customer();
  for (let attempt = 0; attempt < 5; attempt++) expect((await server.call('/auth/login', 'POST', { email: data.input.email, password: 'wrong password' })).status).toBe(401);
  expect((await login(data.input.email)).status).toBe(429);
  await expect(second.rate('LOGIN', '127.0.0.1', data.input.email)).rejects.toMatchObject({ status: 429 });
  current += 15 * 60000;
  expect((await login(data.input.email)).status).toBe(200);
  expect(() => new Accounts(db, clock, { loginAccount: 0, loginIp: 20, registerIp: 10, refreshIp: 120 })).toThrow();
});

test('concurrent refresh reuse never leaves the winning credential usable after replay detection', async () => {
  const data = await customer(), first = await login(data.input.email);
  const results = await Promise.allSettled([accounts.renew(first.body.refreshToken), second.renew(first.body.refreshToken)]);
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
  const result = results.find(result => result.status === 'fulfilled');
  if (!result || result.status !== 'fulfilled') throw new Error('Expected one committed rotation.');
  await expect(accounts.authorize(db, result.value.accessToken)).rejects.toMatchObject({ status: 401 });
});

test('session persistence and audit do not contain plaintext passwords or opaque credentials', async () => {
  const data = await customer(), signed = await login(data.input.email);
  const session = await db.session.findUniqueOrThrow({ where: { credentialHash: tokenHash('access', signed.body.accessToken) } });
  const stored = JSON.stringify([session, await db.auditLog.findMany()]);
  for (const sensitive of [PASSWORD, signed.body.accessToken, signed.body.refreshToken]) expect(stored).not.toContain(sensitive);
  expect(session.csrfHash).toMatch(/^[0-9a-f]{64}$/);
});

test('two independent transactions attempting to deactivate both ADMINs preserve one active administrator', async () => {
  const first = await accounts.login(adminEmail, PASSWORD);
  const anotherEmail = email();
  const another = await createStaff(accounts, first.accessToken, { name: 'Segundo ADMIN', email: anotherEmail, password: PASSWORD, role: 'ADMIN' });
  const secondLogin = await second.login(anotherEmail, PASSWORD);
  let locked!: () => void, release!: () => void;
  const ready = new Promise<void>(resolve => { locked = resolve; });
  const gate = new Promise<void>(resolve => { release = resolve; });
  const blocker = db.$transaction(async tx => {
    await tx.$executeRawUnsafe('LOCK TABLE "User" IN SHARE MODE'); locked(); await gate;
  }, { timeout: 10000 });
  await ready;
  const changes = Promise.allSettled([
    changeStaff(accounts, first.accessToken, first.user.id, 'DEACTIVATE', { reason: 'Teste concorrente' }),
    changeStaff(second, secondLogin.accessToken, another.id, 'DEACTIVATE', { reason: 'Teste concorrente' })
  ]);
  try {
    let waiting = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const rows = await db.$queryRaw<{ count: number }[]>`SELECT count(*)::int AS count FROM pg_stat_activity
        WHERE datname = current_database() AND application_name IN ('TASK004_A', 'TASK004_B') AND wait_event_type = 'Lock' AND query LIKE '%UPDATE%'`;
      if (rows[0]?.count === 2) { waiting = true; break; }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    expect(waiting).toBe(true);
  } finally { release(); await blocker; }
  const results = await changes;
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
  const survivors = await db.user.findMany({ where: { context: 'STAFF', role: 'ADMIN', blockedAt: null, inactiveAt: null, closedAt: null } });
  expect(survivors).toHaveLength(1);
  adminEmail = survivors[0]!.emailNormalized;
});
