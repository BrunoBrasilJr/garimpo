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
import { FreightError } from '../freight/errors.ts';
import * as input from './validation.ts';
import { Payments } from './service.ts';
import { AutomaticRefunds } from '../refunds/automatic.ts';
import { LocalGateway } from './gateway.ts';
import type { PaymentGateway } from './gateway.ts';
import * as paymentInput from './validation.ts';
const prefix = /^\/(?:orders\/[^/]+\/simulated-payments(?:\/|$)|checkouts\/[^/]+\/simulated-card-payments(?:\/|$)|me\/payment-attempts(?:\/|$)|admin\/automatic-refunds(?:\/|$))/;
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
export interface PaymentOptions extends AccountsOptions { gateway?: PaymentGateway }
export function createPaymentsRouter(options: PaymentOptions = {}) {
  const router = express.Router(), db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined), accounts = db ? new Accounts(db, options.clock, options.policy) : undefined;
  const gateway = () => options.gateway ?? new LocalGateway(service().db, service().clock);
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
      if (mobile(req)) throw new AccountError(403, 'STAFF_WEB_ONLY'); await new AutomaticRefunds(service(), gateway()).admin(service().db, access(req));
      if (!['GET', 'HEAD'].includes(req.method)) { if (supplied !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED'); const proof = req.get('x-csrf-token') ?? ''; if (!proof || proof !== values.get('__Host-garimpo-csrf')) throw new AccountError(403, 'CSRF_INVALID'); await service().csrf(access(req), proof); }
    } else await customer(req);
    next();
  });
  router.use(express.json({ limit: '32kb', strict: true }));
  router.post('/checkouts/:id/simulated-card-payments', async (req, res) => { input.parse(empty, req.query); res.json(await new Payments(service(), gateway()).card(access(req), input.parse(input.id, req.params.id), paymentInput.parse(paymentInput.card, req.body), paymentInput.parse(paymentInput.key, req.get('idempotency-key')))); });
  router.post('/orders/:id/simulated-payments', async (req, res) => { input.parse(empty, req.query); res.json(await new Payments(service(), gateway()).charge(access(req), input.parse(input.id, req.params.id), paymentInput.parse(paymentInput.charge, req.body), paymentInput.parse(paymentInput.key, req.get('idempotency-key')))); });
  router.get('/me/payment-attempts', async (req, res) => { res.json(await new Payments(service(), gateway()).list(access(req), paymentInput.parse(paymentInput.page, req.query))); });
  router.get('/me/payment-attempts/:id', async (req, res) => { input.parse(empty, req.query); res.json(await new Payments(service(), gateway()).own(access(req), input.parse(input.id, req.params.id))); });
  router.post('/admin/automatic-refunds/:id/retry', async (req, res) => { input.parse(empty, req.query); const body = paymentInput.parse(paymentInput.retry, req.body); res.json(await new AutomaticRefunds(service(), gateway()).run(input.parse(input.id, req.params.id), paymentInput.parse(paymentInput.key, req.get('idempotency-key')), body.scenario, access(req))); });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    void _next; const correlationId = randomUUID();
    if (error instanceof AccountError || error instanceof CartError || error instanceof PricingError || error instanceof FreightError) { res.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error instanceof AccountError ? error.fieldErrors : {}, correlationId }); return; }
    if (error instanceof SyntaxError || error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') { res.status(422).json({ code: 'INVALID_INPUT', message: 'Confira os dados informados.', fieldErrors: {}, correlationId }); return; }
    const result = publicError(error, correlationId); res.status(result.status).json(result.body);
  }; router.use(errors); return router;
}
