import { expect, test } from 'vitest';
import { MobileAccountClient } from '../../../apps/mobile/src/features/account/client';
import type { TokenStore } from '../../../apps/mobile/src/features/account/client';
import { readRoute } from '../../../apps/web/src/navigation/route';
const user = { id: 'synthetic', name: 'Titular', email: 'test@example.invalid', context: 'CUSTOMER', role: 'USER' };
const session = (index: number) => ({ user, accessToken: `access-${index}`, refreshToken: `refresh-${index}` });
function storage() {
  let stored: string | null = null;
  const writes: string[] = [];
  const store: TokenStore = { get: async () => stored, set: async value => { stored = value; writes.push(value); }, clear: async () => { stored = null; } };
  return { store, writes, read: () => stored };
}
function response(value: unknown, status = 200) { return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } }); }
test('mobile credentials use HTTPS, access in memory and only rotated refresh in secure storage; restart restores and logout clears', async () => {
  const saved = storage(), requests: { path: string; options: RequestInit | undefined }[] = [];
  const transport: typeof fetch = async (input, options) => {
    const path = String(input); requests.push({ path, options });
    return path.endsWith('/auth/login') ? response(session(1)) : path.endsWith('/auth/refresh') ? response(session(2)) : path.endsWith('/auth/logout') ? new Response(null, { status: 204 }) : response(user);
  };
  expect(() => new MobileAccountClient('http://localhost:3001', saved.store, transport)).toThrow();
  for (const invalid of ['https://user:secret@localhost', 'https://localhost/path', 'https://localhost?token=secret', 'https://localhost:99999']) expect(() => new MobileAccountClient(invalid, saved.store, transport)).toThrow();
  const first = new MobileAccountClient('https://localhost:8443', saved.store, transport);
  await first.login(user.email, 'synthetic password'); expect(saved.writes).toEqual(['refresh-1']);
  await first.request('/me'); expect(requests.at(-1)?.options?.headers).toMatchObject({ Authorization: 'Bearer access-1', 'X-Garimpo-Client': 'mobile' });
  const restarted = new MobileAccountClient('https://localhost:8443', saved.store, transport);
  expect(await restarted.restore()).toEqual(user); expect(saved.read()).toBe('refresh-2');
  await restarted.logout(); expect(saved.read()).toBeNull();
  expect(saved.writes).not.toContain('access-1'); expect(saved.writes).not.toContain('synthetic password');
  expect(requests.every(item => item.options?.credentials === 'omit')).toBe(true);
});
test('concurrent expired requests coordinate one mobile renewal and retry with the new in-memory access', async () => {
  const saved = storage(); let renewals = 0;
  const transport: typeof fetch = async (input, options) => {
    const path = String(input);
    if (path.endsWith('/auth/login')) return response(session(1));
    if (path.endsWith('/auth/refresh')) { renewals++; await new Promise(resolve => setTimeout(resolve, 5)); return response(session(2)); }
    return (options?.headers as Record<string, string>).Authorization === 'Bearer access-2' ? response(user) : response({ message: 'Expired' }, 401);
  };
  const client = new MobileAccountClient('https://localhost:8443', saved.store, transport); await client.login(user.email, 'synthetic');
  await Promise.all([client.request('/me'), client.request('/me'), client.request('/me')]); expect(renewals).toBe(1); expect(saved.read()).toBe('refresh-2');
});
test('logout waits for in-flight rotation then revokes that credential and never leaves a renewed token persisted', async () => {
  const saved = storage(); let started!: () => void, release!: () => void, revoked = '';
  const ready = new Promise<void>(resolve => { started = resolve; }), gate = new Promise<void>(resolve => { release = resolve; });
  const transport: typeof fetch = async (input, options) => {
    const path = String(input);
    if (path.endsWith('/auth/login')) return response(session(1));
    if (path.endsWith('/auth/refresh')) { started(); await gate; return response(session(2)); }
    if (path.endsWith('/auth/logout')) { revoked = (JSON.parse(String(options?.body)) as { refreshToken: string }).refreshToken; return new Response(null, { status: 204 }); }
    return response({ message: 'Expired' }, 401);
  };
  const client = new MobileAccountClient('https://localhost:8443', saved.store, transport); await client.login(user.email, 'synthetic');
  const request = client.request('/me').catch(() => {}); await ready; const leaving = client.logout(); release(); await Promise.all([request, leaving]);
  expect(revoked).toBe('refresh-2'); expect(saved.read()).toBeNull();
});
test('revoked refresh clears storage, storage failure is surfaced and internal credentials cannot become a mobile session', async () => {
  const saved = storage(); await saved.store.set('revoked');
  const client = new MobileAccountClient('https://localhost:8443', saved.store, async () => response({ message: 'Revoked' }, 401));
  await expect(client.restore()).rejects.toMatchObject({ status: 401 }); expect(saved.read()).toBeNull();
  const broken: TokenStore = { get: async () => null, set: async () => { throw new Error('Synthetic device failure'); }, clear: async () => {} };
  await expect(new MobileAccountClient('https://localhost:8443', broken, async () => response(session(1))).login('test', 'synthetic')).rejects.toThrow('segurança');
  const staff = new MobileAccountClient('https://localhost:8443', saved.store, async () => response({ ...session(1), user: { ...user, context: 'STAFF', role: 'ADMIN' } }));
  await expect(staff.login('staff', 'synthetic')).rejects.toMatchObject({ status: 403 }); expect(saved.read()).toBeNull();
});
test('navigation recognizes link purposes without persisting tokens or accepting unknown routes', () => {
  expect(readRoute('#/email-verification?token=synthetic')).toEqual({ name: 'email-verification', token: 'synthetic' });
  expect(readRoute('#/email-change?token=synthetic')).toEqual({ name: 'email-change', token: 'synthetic' });
  expect(readRoute('#/unknown')).toEqual({ name: 'login', token: '' });
});

test('failed logout clears local credentials, retains only an in-memory revocation retry, and surfaces a secure-store clear failure', async () => {
  const saved = storage(); let offline = true, revoked = '';
  const transport: typeof fetch = async (input, options) => {
    if (String(input).endsWith('/auth/login')) return response(session(1));
    if (offline) throw new Error('Synthetic offline connection');
    revoked = (JSON.parse(String(options?.body)) as { refreshToken: string }).refreshToken;
    return new Response(null, { status: 204 });
  };
  const client = new MobileAccountClient('https://localhost:8443', saved.store, transport);
  await client.login(user.email, 'synthetic');
  await expect(client.logout()).rejects.toThrow('conectar'); expect(saved.read()).toBeNull();
  offline = false; await client.logout(); expect(revoked).toBe('refresh-1'); expect(saved.read()).toBeNull();
  const broken: TokenStore = { get: async () => null, set: async () => {}, clear: async () => { throw new Error('Synthetic hardware failure'); } };
  await expect(new MobileAccountClient('https://localhost:8443', broken, transport).logout()).rejects.toThrow('remover o acesso seguro');
});
