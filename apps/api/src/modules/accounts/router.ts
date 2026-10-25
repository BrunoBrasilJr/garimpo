import { randomUUID } from 'node:crypto';
import express from 'express';
import type { Request, Response, ErrorRequestHandler } from 'express';
import { z } from 'zod';
import type { Clock } from '../../core/clock.ts';
import { publicError } from '../../core/errors.ts';
import { createDatabase } from '../../persistence/client.ts';
import type { Database } from '../../persistence/client.ts';
import { Accounts, defaultAuthPolicy } from './service.ts';
import type { AuthPolicy, SessionBundle } from './service.ts';
import { AccountError } from './errors.ts';
import * as validate from './validation.ts';
import { createStaff, listStaff, changeStaff } from './staff/service.ts';

const names = { access: '__Host-garimpo-access', refresh: '__Host-garimpo-refresh', csrf: '__Host-garimpo-csrf' };
function cookies(request: Request): Map<string, string> {
  const result = new Map<string, string>();
  for (const part of (request.get('cookie') ?? '').split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    if (!Object.values(names).includes(key)) continue;
    if (result.has(key)) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    try { result.set(key, decodeURIComponent(part.slice(index + 1).trim())); }
    catch { throw new AccountError(422, 'INVALID_INPUT'); }
  }
  return result;
}
function mobile(request: Request) { return request.get('x-garimpo-client') === 'mobile'; }
function access(request: Request) {
  if (mobile(request)) return /^Bearer ([\w-]{43})$/.exec(request.get('authorization') ?? '')?.[1] ?? '';
  if (request.get('authorization')) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
  return cookies(request).get(names.access) ?? '';
}
function csrf(request: Request) {
  const value = request.get('x-csrf-token') ?? '';
  if (!value || cookies(request).get(names.csrf) !== value) throw new AccountError(403, 'CSRF_INVALID');
  return value;
}
function refresh(request: Request) {
  if (mobile(request)) return validate.parse(z.object({ refreshToken: z.string().max(100) }).strict(), request.body).refreshToken;
  validate.parse(z.object({}).strict(), request.body ?? {});
  return cookies(request).get(names.refresh) ?? '';
}
function sendSession(request: Request, response: Response, bundle: SessionBundle) {
  const result = { user: bundle.user, accessExpiresAt: bundle.accessExpiresAt, refreshExpiresAt: bundle.refreshExpiresAt };
  if (mobile(request)) { response.json({ ...result, accessToken: bundle.accessToken, refreshToken: bundle.refreshToken }); return; }
  const options = { secure: true, sameSite: 'lax' as const, path: '/', httpOnly: true };
  response.cookie(names.access, bundle.accessToken, { ...options, expires: bundle.accessExpiresAt });
  response.cookie(names.refresh, bundle.refreshToken, { ...options, expires: bundle.refreshExpiresAt });
  response.cookie(names.csrf, bundle.csrfToken, { ...options, httpOnly: false, expires: bundle.refreshExpiresAt });
  response.json({ ...result, csrfToken: bundle.csrfToken });
}
export interface AccountsOptions { db?: Database; clock?: Clock; policy?: AuthPolicy; webOrigin?: string }
export function createAccountsRouter(options: AccountsOptions = {}) {
  const db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined);
  const origin = options.webOrigin ?? process.env.WEB_ORIGIN ?? 'https://localhost:5173';
  if (new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin) throw new Error('WEB_ORIGIN must be an exact HTTPS origin.');
  const policy = options.policy ?? Object.fromEntries(Object.entries(defaultAuthPolicy).map(([key, value]) => [
    key, process.env[`AUTH_${key.replace(/[A-Z]/g, letter => '_' + letter).toUpperCase()}`] ? Number(process.env[`AUTH_${key.replace(/[A-Z]/g, letter => '_' + letter).toUpperCase()}`]) : value
  ])) as unknown as AuthPolicy;
  const accounts = db ? new Accounts(db, options.clock, policy) : undefined;
  const service = () => { if (!accounts) throw new AccountError(503, 'DATABASE_UNAVAILABLE'); return accounts; };
  const router = express.Router();
  router.use(['/auth', '/me', '/admin/staff'], (request, response, next) => {
    response.set('Cache-Control', 'no-store');
    if (!request.secure) throw new AccountError(403, 'HTTPS_REQUIRED');
    const suppliedOrigin = request.get('origin');
    if (suppliedOrigin && suppliedOrigin !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
    if (suppliedOrigin) {
      response.set('Access-Control-Allow-Origin', origin); response.set('Access-Control-Allow-Credentials', 'true'); response.vary('Origin');
    }
    if (request.method === 'OPTIONS') {
      if (suppliedOrigin !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
      response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      response.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Garimpo-Client');
      response.sendStatus(204); return;
    }
    if (mobile(request) && cookies(request).size) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    if (request.get('x-garimpo-client') && !mobile(request)) throw new AccountError(422, 'INVALID_CLIENT');
    if (!mobile(request) && !['GET', 'HEAD'].includes(request.method) && suppliedOrigin !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED');
    next();
  });
  router.use(express.json({ limit: '32kb', strict: true }));
  router.use('/admin/staff', (request, _response, next) => {
    if (mobile(request)) throw new AccountError(403, 'STAFF_WEB_ONLY');
    next();
  });
  router.post('/auth/register', async (request, response) => {
    const input = validate.parse(validate.registration, request.body);
    await service().rate('REGISTER', request.socket.remoteAddress ?? 'unknown');
    response.status(201).json(await service().register(input));
  });
  router.post('/auth/login', async (request, response) => {
    const input = validate.parse(validate.loginInput, request.body);
    await service().rate('LOGIN', request.socket.remoteAddress ?? 'unknown', input.email);
    sendSession(request, response, await service().login(input.email, input.password, mobile(request) ? 'mobile' : 'web'));
  });
  router.post('/auth/refresh', async (request, response) => {
    const token = refresh(request), proof = mobile(request) ? undefined : csrf(request);
    await service().rate('REFRESH', request.socket.remoteAddress ?? 'unknown');
    sendSession(request, response, await service().renew(token, proof));
  });
  router.post('/auth/logout', async (request, response) => {
    await service().logout(refresh(request), mobile(request) ? undefined : csrf(request));
    for (const name of Object.values(names)) response.clearCookie(name, { secure: true, sameSite: 'lax', path: '/', httpOnly: name !== names.csrf });
    response.sendStatus(204);
  });
  const mutation = async (request: Request) => { if (!mobile(request)) await service().csrf(access(request), csrf(request)); };
  router.get('/me', async (request, response) => { response.json(await service().profile(access(request))); });
  router.patch('/me', async (request, response) => {
    await mutation(request);
    response.json(await service().profile(access(request), validate.parse(validate.profileInput, request.body).name));
  });
  router.get('/me/addresses', async (request, response) => { response.json(await service().addresses(access(request), 'LIST')); });
  router.post('/me/addresses', async (request, response) => {
    await mutation(request); response.status(201).json(await service().addresses(access(request), 'CREATE', validate.parse(validate.addressInput, request.body)));
  });
  router.patch('/me/addresses/:id', async (request, response) => {
    await mutation(request); response.json(await service().addresses(access(request), 'UPDATE', validate.parse(validate.addressPatch, request.body), validate.parse(validate.idInput, request.params.id)));
  });
  router.delete('/me/addresses/:id', async (request, response) => {
    await mutation(request); await service().addresses(access(request), 'DELETE', undefined, validate.parse(validate.idInput, request.params.id)); response.sendStatus(204);
  });
  router.get('/admin/staff', async (request, response) => {
    const query = validate.parse(z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }).strict(), request.query);
    response.json(await listStaff(service(), access(request), query.page, query.pageSize));
  });
  router.post('/admin/staff', async (request, response) => {
    await mutation(request); response.json(await createStaff(service(), access(request), validate.parse(validate.staffInput, request.body)));
  });
  router.patch('/admin/staff/:id', async (request, response) => {
    await mutation(request); response.json(await changeStaff(service(), access(request), validate.parse(validate.idInput, request.params.id), 'EDIT', validate.parse(validate.staffPatch, request.body)));
  });
  for (const [path, command] of [['block', 'BLOCK'], ['deactivate', 'DEACTIVATE'], ['unblock', 'UNBLOCK']] as const) {
    router.post(`/admin/staff/:id/${path}`, async (request, response) => {
      await mutation(request); response.json(await changeStaff(service(), access(request), validate.parse(validate.idInput, request.params.id), command, validate.parse(validate.reasonInput, request.body)));
    });
  }
  const errors: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
    void _next;
    const correlationId = randomUUID();
    if (error instanceof AccountError) {
      response.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error.fieldErrors, correlationId }); return;
    }
    if (error instanceof SyntaxError || (error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large')) {
      response.status(422).json({ code: 'INVALID_INPUT', message: 'Verifique os dados informados.', fieldErrors: {}, correlationId }); return;
    }
    const result = publicError(error, correlationId); response.status(result.status).json(result.body);
  };
  router.use(errors);
  return router;
}
