import { randomUUID } from 'node:crypto';
import express from 'express';
import type { Request, ErrorRequestHandler } from 'express';
import { z } from 'zod';
import type { AccountsOptions } from './router.ts';
import type { MessagingOptions } from '../messaging/config.ts';
import { configuredMessages } from '../messaging/config.ts';
import { Accounts } from './service.ts';
import { createDatabase } from '../../persistence/client.ts';
import { AccountError } from './errors.ts';
import { CartError } from '../cart/errors.ts';
import { publicError } from '../../core/errors.ts';
import { Customers } from './blocking.ts';
import { closeAccount } from './closure.ts';
import { confirmReactivation, requestReactivation } from './reactivation.ts';
import { staff } from './blocking-helpers.ts';
import * as input from './blocking-validation.ts';

const generic = { message: 'Se a conta estiver elegível, a mensagem será disponibilizada pelo canal configurado.' }, empty = z.object({}).strict();
function cookie(req: Request, name: string) {
  const pairs = (req.get('cookie') ?? '').split(';').map(v => v.trim()).filter(v => v.startsWith(name + '='));
  if (pairs.length > 1) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
  try { return pairs[0] ? decodeURIComponent(pairs[0].slice(name.length + 1)) : ''; } catch { throw new AccountError(422, 'INVALID_INPUT'); }
}
function access(req: Request) { return req.get('x-garimpo-client') === 'mobile' ? /^Bearer ([\w-]{43})$/.exec(req.get('authorization') ?? '')?.[1] ?? '' : cookie(req, '__Host-garimpo-access'); }
export function createAccountLifecycleRouter(accountsOptions: AccountsOptions = {}, messagingOptions: MessagingOptions = {}) {
  const options = { ...accountsOptions, ...messagingOptions }, db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined), accounts = db ? new Accounts(db, options.clock, options.policy) : undefined;
  const messages = configuredMessages(options), origin = options.webOrigin ?? process.env.WEB_ORIGIN ?? 'https://localhost:5173';
  if (new URL(origin).origin !== origin || new URL(origin).protocol !== 'https:') throw new Error('Exact HTTPS origin required.');
  const service = () => { if (!accounts) throw new AccountError(503, 'DATABASE_UNAVAILABLE'); return accounts; }, mailbox = () => { if (!messages) throw new AccountError(503, 'MESSAGE_CHANNEL_UNAVAILABLE'); return messages; };
  const router = express.Router();
  router.use(async (req, res, next) => {
    if (!(req.path === '/admin/customers' || req.path.startsWith('/admin/customers/') || req.path === '/me/closure' || req.path === '/auth/reactivation' || req.path === '/auth/reactivation/confirm')) { next('router'); return; }
    res.set('Cache-Control', 'no-store'); res.set('Referrer-Policy', 'no-referrer');
    if (!req.secure) throw new AccountError(403, 'HTTPS_REQUIRED');
    const supplied = req.get('origin'), mobile = req.get('x-garimpo-client');
    if (supplied && supplied !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
    if (mobile && mobile !== 'mobile') throw new AccountError(422, 'INVALID_CLIENT');
    if (mobile && /(?:^|;\s*)__Host-garimpo-/.test(req.get('cookie') ?? '') || !mobile && req.get('authorization')) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    if (supplied) { res.set('Access-Control-Allow-Origin', origin); res.set('Access-Control-Allow-Credentials', 'true'); res.vary('Origin'); }
    if (req.method === 'OPTIONS') {
      if (supplied !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED');
      res.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS'); res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Garimpo-Client,X-Garimpo-Account,Idempotency-Key'); res.sendStatus(204); return;
    }
    if (!mobile && !['GET', 'HEAD'].includes(req.method) && supplied !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED');
    if (!req.path.startsWith('/auth/')) {
      const team = req.path.startsWith('/admin/');
      if (team && mobile) throw new AccountError(403, 'STAFF_WEB_ONLY');
      const actor = team ? await staff(service(), service().db, access(req), !['GET', 'HEAD'].includes(req.method)) : (await service().authorize(service().db, access(req), true)).user;
      const expected = req.get('x-garimpo-account'); if (expected && input.parse(input.id, expected) !== actor.id) throw new AccountError(403, 'ACCOUNT_CONTEXT_CHANGED');
      if (!mobile && !['GET', 'HEAD'].includes(req.method)) { const proof = req.get('x-csrf-token') ?? ''; if (!proof || cookie(req, '__Host-garimpo-csrf') !== proof) throw new AccountError(403, 'CSRF_INVALID'); await service().csrf(access(req), proof); }
    }
    next();
  });
  router.use(express.json({ limit: '32kb', strict: true }));
  router.get('/admin/customers', async (req, res) => { res.json(await new Customers(service()).list(access(req), req.query)); });
  router.get('/admin/customers/:id', async (req, res) => { input.parse(empty, req.query); res.json(await new Customers(service()).detail(access(req), req.params.id!)); });
  for (const [path, action] of [['block', 'BLOCK'], ['unblock', 'UNBLOCK']] as const) router.post('/admin/customers/:id/' + path, async (req, res) => {
    input.parse(empty, req.query); res.json(await new Customers(service()).restrict(access(req), req.params.id!, action, req.body, req.get('idempotency-key') ?? ''));
  });
  router.patch('/admin/customers/:id', async (req, res) => { input.parse(empty, req.query); res.json(await new Customers(service()).correct(access(req), req.params.id!, req.body, req.get('idempotency-key') ?? '', messages)); });
  router.post('/me/closure', async (req, res) => {
    input.parse(empty, req.query); const result = await closeAccount(service(), access(req), req.body, req.get('idempotency-key') ?? '');
    if (req.get('x-garimpo-client') !== 'mobile') for (const name of ['access', 'refresh', 'csrf']) res.clearCookie('__Host-garimpo-' + name, { path: '/', secure: true, sameSite: 'lax', httpOnly: name !== 'csrf' });
    res.json(result);
  });
  router.post('/auth/reactivation', async (req, res) => { input.parse(empty, req.query); const command = input.parse(input.reactivation, req.body), instance = mailbox(); await instance.rate('REACTIVATE', req.socket.remoteAddress ?? 'unknown', command.email); await requestReactivation(instance, command.email); res.status(202).json(generic); });
  router.post('/auth/reactivation/confirm', async (req, res) => { input.parse(empty, req.query); const command = input.parse(input.confirmation, req.body), instance = mailbox(); await instance.rate('REACTIVATE_CONFIRM', req.socket.remoteAddress ?? 'unknown'); await confirmReactivation(instance, command.token); res.json({ message: 'Conta reativada. Entre novamente com sua senha.' }); });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    void _next; const correlationId = randomUUID();
    if (error instanceof AccountError || error instanceof CartError) { res.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error instanceof AccountError ? error.fieldErrors : {}, correlationId }); return; }
    if (error instanceof SyntaxError || error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') { res.status(422).json({ code: 'INVALID_INPUT', message: 'Confira os dados informados.', fieldErrors: {}, correlationId }); return; }
    const result = publicError(error, correlationId); res.status(result.status).json(result.body);
  }; router.use(errors); return router;
}
