import { expect, test } from 'vitest';
import { MobileAccountClient } from '../../../apps/mobile/src/features/account/client';
const a = 'b7bec80b-74b5-4149-b47a-57053d7fdd90', b = 'e1397905-cfff-46ca-994e-116470350297';
const user = (id: string) => ({ id, context: 'CUSTOMER', role: 'USER', name: 'Sintético', email: 'test@example.invalid' });
const session = (id: string, token: string) => ({ user: user(id), accessToken: token, refreshToken: 'refresh-' + token });
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
test('same-account mobile renewal preserves the original command body, key, account binding and cookie omission', async () => {
  let saved: string | null = null; const commands: RequestInit[] = [];
  const transport: typeof fetch = async (input, options) => {
    if (String(input).endsWith('/auth/login')) return response(session(a, 'old'));
    if (String(input).endsWith('/auth/refresh')) return response(session(a, 'new'));
    commands.push(options!); return commands.length === 1 ? response({ code: 'INVALID_SESSION' }, 401) : response({ ok: true });
  };
  const client = new MobileAccountClient('https://localhost:8443', { get: async () => saved, set: async value => { saved = value; }, clear: async () => { saved = null; } }, transport);
  await client.login('test@example.invalid', 'synthetic'); await client.request('/me/cart/merge', 'POST', { version: 1, items: [] }, true, { accountId: a, idempotencyKey: 'fixed-key' });
  expect(commands).toHaveLength(2); expect(commands[0]!.body).toBe(commands[1]!.body);
  for (const command of commands) { expect(command.credentials).toBe('omit'); expect(command.headers).toMatchObject({ 'X-Garimpo-Account': a, 'Idempotency-Key': 'fixed-key' }); }
  expect(commands[1]!.headers).toMatchObject({ Authorization: 'Bearer new' });
});
test('switching mobile identity while a command waits cannot change its captured account binding during retry', async () => {
  let saved: string | null = null, release!: () => void, entered!: () => void; const waiting = new Promise<void>(resolve => { release = resolve; }), started = new Promise<void>(resolve => { entered = resolve; }), commands: RequestInit[] = [];
  const transport: typeof fetch = async (input, options) => {
    if (String(input).endsWith('/auth/login')) return response(session(JSON.parse(String(options?.body)).email === 'a' ? a : b, JSON.parse(String(options?.body)).email));
    commands.push(options!); if (commands.length === 1) { entered(); await waiting; return response({ code: 'INVALID_SESSION' }, 401); }
    return response({ code: 'ACCOUNT_CONTEXT_CHANGED', message: 'Conta mudou.' }, 403);
  };
  const client = new MobileAccountClient('https://localhost:8443', { get: async () => saved, set: async value => { saved = value; }, clear: async () => { saved = null; } }, transport);
  await client.login('a', 'synthetic'); const command = client.request('/me/cart/merge', 'POST', { version: 1, items: [] }, true, { accountId: a, idempotencyKey: 'same-intent' }); const observed = command.catch(cause => cause);
  await started; await client.login('b', 'synthetic'); release(); expect(await observed).toMatchObject({ status: 403, code: 'ACCOUNT_CONTEXT_CHANGED' });
  expect(commands[1]!.headers).toMatchObject({ Authorization: 'Bearer b', 'X-Garimpo-Account': a, 'Idempotency-Key': 'same-intent' }); expect(commands[1]!.body).toBe(commands[0]!.body);
});
