import express from 'express';
import type { Request, ErrorRequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Accounts } from '../accounts/service.ts';
import type { AccountsOptions } from '../accounts/router.ts';
import { AccountError } from '../accounts/errors.ts';
import { createDatabase } from '../../persistence/client.ts';
import { publicError } from '../../core/errors.ts';
import { CartError } from '../cart/errors.ts';
import { PricingError } from '../pricing/errors.ts';
import { FreightError } from './errors.ts';
import { Freight } from './service.ts';
import { CheckoutQuotes } from '../checkout/quotes.ts';
import { Orders } from '../orders/service.ts';
import * as input from './validation.ts';
import * as orderInput from '../orders/validation.ts';
const prefix = /^\/(?:admin\/freight-rates(?:\/|$)|checkout\/quote(?:\/|$)|checkouts\/[^/]+\/address(?:\/|$)|orders(?:\/|$))/;
const empty = z.object({}).strict();
function cookies(request: Request) {
  const values = new Map<string, string>();
  for (const part of (request.get('cookie') ?? '').split(';')) { const index = part.indexOf('='); if (index < 0) continue; const name = part.slice(0, index).trim();
    if (!['__Host-garimpo-access', '__Host-garimpo-refresh', '__Host-garimpo-csrf'].includes(name)) continue;
    if (values.has(name)) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    try { values.set(name, decodeURIComponent(part.slice(index + 1).trim())); } catch { throw new AccountError(422, 'INVALID_INPUT'); }
  } return values;
}
const mobile = (request: Request) => request.get('x-garimpo-client') === 'mobile';
const access = (request: Request) => mobile(request) ? /^Bearer ([\w-]{43})$/.exec(request.get('authorization') ?? '')?.[1] ?? '' : cookies(request).get('__Host-garimpo-access') ?? '';
export function createFreightOrderRouter(options: AccountsOptions = {}) {
  const router = express.Router(), db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined), accounts = db ? new Accounts(db, options.clock, options.policy) : undefined;
  const service = () => { if (!accounts) throw new FreightError(503, 'DATABASE_UNAVAILABLE', 'A cotação está temporariamente indisponível.'); return accounts; };
  const origin = options.webOrigin ?? process.env.WEB_ORIGIN ?? 'https://localhost:5173';
  if (new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin) throw new Error('WEB_ORIGIN must be an exact HTTPS origin.');
  async function customer(request: Request) {
    if (!['GET', 'HEAD'].includes(request.method) && !mobile(request)) {
      if (request.get('origin') !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED');
      const proof = request.get('x-csrf-token') ?? ''; if (!proof || proof !== cookies(request).get('__Host-garimpo-csrf')) throw new AccountError(403, 'CSRF_INVALID'); await service().csrf(access(request), proof);
    }
    const { user } = await service().authorize(service().db, access(request), true), expected = request.get('x-garimpo-account');
    if (expected && input.parse(input.id, expected) !== user.id) throw new CartError(403, 'ACCOUNT_CONTEXT_CHANGED', 'Sua conta mudou. Atualize antes de confirmar a compra.');
  }
  router.use((req, _res, next) => { if (!prefix.test(req.path)) { next('router'); return; } next(); });
  router.use(async (req, res, next) => {
    res.set('Cache-Control', 'no-store'); res.set('X-Content-Type-Options', 'nosniff'); if (!req.secure) throw new AccountError(403, 'HTTPS_REQUIRED');
    const supplied = req.get('origin'); if (supplied && supplied !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
    if (supplied) { res.set('Access-Control-Allow-Origin', origin); res.set('Access-Control-Allow-Credentials', 'true'); res.vary('Origin'); }
    if (req.method === 'OPTIONS') { if (supplied !== origin) throw new AccountError(403, 'ORIGIN_INVALID'); res.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS'); res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Garimpo-Client,Idempotency-Key,X-Garimpo-Account'); res.sendStatus(204); return; }
    if (req.get('x-garimpo-client') && !mobile(req)) throw new AccountError(422, 'INVALID_CLIENT'); const values = cookies(req);
    if (mobile(req) && values.size || !mobile(req) && req.get('authorization')) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    if (req.path.startsWith('/admin/')) {
      if (mobile(req)) throw new AccountError(403, 'STAFF_WEB_ONLY'); await new Freight(service()).admin(service().db, access(req));
      if (!['GET', 'HEAD'].includes(req.method)) { if (supplied !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED'); const proof = req.get('x-csrf-token') ?? ''; if (!proof || proof !== values.get('__Host-garimpo-csrf')) throw new AccountError(403, 'CSRF_INVALID'); await service().csrf(access(req), proof); }
    } else if (req.path !== '/checkout/quote' || req.method !== 'POST') await customer(req);
    next();
  });
  router.use(express.json({ limit: '32kb', strict: true }));
  router.get('/admin/freight-rates', async (req, res) => { res.json(await new Freight(service()).list(access(req), input.parse(input.list, req.query))); });
  router.post('/admin/freight-rates', async (req, res) => { input.parse(empty, req.query); res.status(201).json(await new Freight(service()).create(access(req), input.parse(input.create, req.body))); });
  router.patch('/admin/freight-rates/:id', async (req, res) => { input.parse(empty, req.query); res.json(await new Freight(service()).update(access(req), input.parse(input.id, req.params.id), input.parse(input.update, req.body))); });
  router.post('/checkout/quote', async (req, res) => { input.parse(empty, req.query); const value = orderInput.parse(orderInput.quote, req.body); if ('checkoutId' in value) await customer(req); res.json(await new CheckoutQuotes(service()).quote(access(req), value)); });
  router.patch('/checkouts/:id/address', async (req, res) => { input.parse(empty, req.query); res.json(await new CheckoutQuotes(service()).accept(access(req), input.parse(input.id, req.params.id), orderInput.parse(orderInput.address, req.body))); });
  router.post('/orders', async (req, res) => { input.parse(empty, req.query); res.status(201).json(await new Orders(service()).create(access(req), orderInput.parse(orderInput.create, req.body), orderInput.parse(orderInput.key, req.get('idempotency-key')))); });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    void _next; const correlationId = randomUUID();
    if (error instanceof AccountError || error instanceof CartError || error instanceof PricingError || error instanceof FreightError) { res.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error instanceof AccountError ? error.fieldErrors : {}, correlationId }); return; }
    if (error instanceof SyntaxError || error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') { res.status(422).json({ code: 'INVALID_INPUT', message: 'Confira os dados informados.', fieldErrors: {}, correlationId }); return; }
    const result = publicError(error, correlationId); res.status(result.status).json(result.body);
  }; router.use(errors); return router;
}
