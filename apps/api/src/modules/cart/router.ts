import express from 'express';
import type { Request, ErrorRequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import type { AccountsOptions } from '../accounts/router.ts';
import { createDatabase } from '../../persistence/client.ts';
import { publicError } from '../../core/errors.ts';
import { PricingError } from '../pricing/errors.ts';
import { CartError } from './errors.ts';
import { Carts } from './service.ts';
import { Checkouts } from '../checkout/service.ts';
import type { PendingOrders } from '../checkout/pending-orders.ts';
import * as input from './validation.ts';

export interface CheckoutOptions extends AccountsOptions { pendingOrders?: PendingOrders }
const prefix = /^\/(?:me\/cart(?:\/|$)|me\/checkout(?:\/|$)|checkouts(?:\/|$))/;
function cookies(request: Request) {
  const values = new Map<string, string>();
  for (const part of (request.get('cookie') ?? '').split(';')) {
    const index = part.indexOf('='); if (index < 0) continue;
    const name = part.slice(0, index).trim(); if (!['__Host-garimpo-access', '__Host-garimpo-refresh', '__Host-garimpo-csrf'].includes(name)) continue;
    if (values.has(name)) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    try { values.set(name, decodeURIComponent(part.slice(index + 1).trim())); } catch { throw new AccountError(422, 'INVALID_INPUT'); }
  } return values;
}
const mobile = (request: Request) => request.get('x-garimpo-client') === 'mobile';
const access = (request: Request) => mobile(request) ? /^Bearer ([\w-]{43})$/.exec(request.get('authorization') ?? '')?.[1] ?? '' : cookies(request).get('__Host-garimpo-access') ?? '';
const empty = z.object({}).strict();
export function createCartRouter(options: CheckoutOptions = {}) {
  const router = express.Router(), db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined);
  const accounts = db ? new Accounts(db, options.clock, options.policy) : undefined;
  const service = () => { if (!accounts) throw new CartError(503, 'DATABASE_UNAVAILABLE', 'O carrinho está temporariamente indisponível.'); return accounts; };
  const carts = () => new Carts(service()), checkouts = () => new Checkouts(service(), options.pendingOrders);
  const origin = options.webOrigin ?? process.env.WEB_ORIGIN ?? 'https://localhost:5173';
  if (new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin) throw new Error('WEB_ORIGIN must be an exact HTTPS origin.');
  router.use((req, _res, next) => { if (!prefix.test(req.path)) { next('router'); return; } next(); });
  router.use(async (req, res, next) => {
    res.set('Cache-Control', 'no-store'); res.set('X-Content-Type-Options', 'nosniff');
    if (!req.secure) throw new AccountError(403, 'HTTPS_REQUIRED');
    const suppliedOrigin = req.get('origin'); if (suppliedOrigin && suppliedOrigin !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
    if (suppliedOrigin) { res.set('Access-Control-Allow-Origin', origin); res.set('Access-Control-Allow-Credentials', 'true'); res.vary('Origin'); }
    if (req.method === 'OPTIONS') {
      if (suppliedOrigin !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
      res.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS'); res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Garimpo-Client,Idempotency-Key,X-Garimpo-Account'); res.sendStatus(204); return;
    }
    if (req.get('x-garimpo-client') && !mobile(req)) throw new AccountError(422, 'INVALID_CLIENT');
    const values = cookies(req);
    if (mobile(req) && values.size || !mobile(req) && req.get('authorization')) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    if (!['GET', 'HEAD'].includes(req.method) && !mobile(req)) {
      if (suppliedOrigin !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED');
      const proof = req.get('x-csrf-token') ?? ''; if (!proof || proof !== values.get('__Host-garimpo-csrf')) throw new AccountError(403, 'CSRF_INVALID');
      await service().csrf(access(req), proof);
    }
    const { user } = await service().authorize(service().db, access(req), true), expected = req.get('x-garimpo-account');
    if (expected && input.parse(input.id, expected) !== user.id) throw new CartError(403, 'ACCOUNT_CONTEXT_CHANGED', 'Sua conta mudou em outro acesso. Atualize a página ou entre novamente antes de alterar o carrinho.');
    next();
  });
  router.use(express.json({ limit: '32kb', strict: true }));
  router.get('/me/cart', async (req, res) => { const value = input.parse(input.preview, req.query); res.json(await carts().read(access(req), value.couponCode)); });
  router.post('/me/cart/items', async (req, res) => { const value = input.parse(input.add, req.body); res.status(201).json(await carts().change(access(req), { type: 'ADD', ...value }, input.parse(input.key, req.get('idempotency-key')))); });
  router.patch('/me/cart/items/:id', async (req, res) => { const value = input.parse(input.update, req.body); res.json(await carts().change(access(req), { type: 'UPDATE', itemId: input.parse(input.id, req.params.id), ...value })); });
  router.delete('/me/cart/items/:id', async (req, res) => { input.parse(empty, req.body ?? {}); const value = input.parse(input.remove, req.query); res.json(await carts().change(access(req), { type: 'REMOVE', itemId: input.parse(input.id, req.params.id), ...value })); });
  router.delete('/me/cart/items', async (req, res) => { input.parse(empty, req.query); input.parse(empty, req.body ?? {}); res.json(await carts().change(access(req), { type: 'CLEAR' })); });
  router.post('/me/cart/merge', async (req, res) => { const value = input.parse(input.merge, req.body); res.json(await carts().change(access(req), { type: 'MERGE', ...value }, input.parse(input.key, req.get('idempotency-key')))); });
  router.post('/checkouts', async (req, res) => { const value = input.parse(input.reserve, req.body); res.status(201).json(await checkouts().reserve(access(req), value, input.parse(input.key, req.get('idempotency-key')))); });
  router.get('/me/checkout', async (req, res) => { input.parse(empty, req.query); res.json(await checkouts().current(access(req))); });
  router.delete('/checkouts/:id', async (req, res) => { input.parse(empty, req.query); input.parse(empty, req.body ?? {}); await checkouts().cancel(access(req), input.parse(input.id, req.params.id)); res.sendStatus(204); });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    void _next; const correlationId = randomUUID();
    if (error instanceof AccountError || error instanceof CartError || error instanceof PricingError) { res.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error instanceof AccountError ? error.fieldErrors : {}, correlationId }); return; }
    if (error instanceof SyntaxError || error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') { res.status(422).json({ code: 'INVALID_INPUT', message: 'Verifique os dados informados.', fieldErrors: {}, correlationId }); return; }
    const result = publicError(error, correlationId); res.status(result.status).json(result.body);
  };
  router.use(errors); return router;
}
