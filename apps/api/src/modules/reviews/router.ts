import express from 'express';
import type { Request, ErrorRequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import type { AccountsOptions } from '../accounts/router.ts';
import { parse } from '../accounts/validation.ts';
import { publicError } from '../../core/errors.ts';
import { createDatabase } from '../../persistence/client.ts';
import { Reviews } from './service.ts';
import type { ReviewPurchases } from './purchases.ts';
import { ReviewError } from './errors.ts';

export interface ReviewOptions extends AccountsOptions { purchases?: ReviewPurchases }
const prefix = /^\/(?:editions\/[^/]+\/reviews(?:\/|$)|me\/reviews(?:\/|$)|admin\/reviews(?:\/|$))/;
const id = z.string().uuid(), draft = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().min(1).max(4000).refine(value => !value.includes('\0')) }).strict();
const pagination = { page: z.coerce.number().int().min(1).max(100000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) };
const list = z.object({ ...pagination, editionId: id.optional(), visibility: z.enum(['PUBLIC', 'HIDDEN']).optional() }).strict();
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
export function createReviewsRouter(options: ReviewOptions = {}) {
  const router = express.Router(), db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined);
  const accounts = db ? new Accounts(db, options.clock, options.policy) : undefined;
  const reviews = accounts ? new Reviews(accounts, options.purchases) : undefined;
  const service = () => { if (!reviews) throw new ReviewError(503, 'DATABASE_UNAVAILABLE', 'As avaliações estão temporariamente indisponíveis.'); return reviews; };
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
      res.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS'); res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Garimpo-Client'); res.sendStatus(204); return;
    }
    if (req.get('x-garimpo-client') && !mobile(req)) throw new AccountError(422, 'INVALID_CLIENT');
    const values = cookies(req);
    if (mobile(req) && values.size || !mobile(req) && req.get('authorization')) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    if (req.path.startsWith('/admin/') && mobile(req)) throw new AccountError(403, 'STAFF_WEB_ONLY');
    if (!['GET', 'HEAD'].includes(req.method) && !mobile(req)) {
      if (suppliedOrigin !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED');
      const proof = req.get('x-csrf-token') ?? ''; if (!proof || proof !== values.get('__Host-garimpo-csrf')) throw new AccountError(403, 'CSRF_INVALID');
      await service().accounts.csrf(access(req), proof);
    }
    next();
  });
  router.use(express.json({ limit: '32kb', strict: true }));
  router.get('/editions/:id/reviews', async (req, res) => { const q = parse(z.object(pagination).strict(), req.query); res.json(await service().publicList(parse(id, req.params.id), q.page, q.pageSize)); });
  router.post('/editions/:id/reviews', async (req, res) => { const value = parse(draft.extend({ orderId: id }).strict(), req.body); res.status(201).json(await service().create(access(req), parse(id, req.params.id), value.orderId, { rating: value.rating, comment: value.comment })); });
  router.get('/me/reviews', async (req, res) => { res.json(await service().list(access(req), parse(list, req.query))); });
  router.patch('/me/reviews/:id', async (req, res) => { const value = parse(draft.extend({ revision: z.number().int().positive() }).strict(), req.body); res.json(await service().edit(access(req), parse(id, req.params.id), value.revision, { rating: value.rating, comment: value.comment })); });
  router.get('/admin/reviews', async (req, res) => { res.json(await service().list(access(req), parse(list, req.query), true)); });
  router.get('/admin/reviews/:id/history', async (req, res) => { res.json(await service().history(access(req), parse(id, req.params.id))); });
  for (const action of ['hide', 'release'] as const) router.post('/admin/reviews/:id/' + action, async (req, res) => {
    const value = parse(z.object({ revision: z.number().int().positive(), reason: z.string().trim().min(1).max(500) }).strict(), req.body);
    res.json(await service().moderate(access(req), parse(id, req.params.id), value.revision, value.reason, action === 'release'));
  });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    void _next; const correlationId = randomUUID();
    if (error instanceof AccountError || error instanceof ReviewError) { res.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error instanceof AccountError ? error.fieldErrors : {}, correlationId }); return; }
    if (error instanceof SyntaxError || error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large') { res.status(422).json({ code: 'INVALID_INPUT', message: 'Verifique os dados informados.', fieldErrors: {}, correlationId }); return; }
    const result = publicError(error, correlationId); res.status(result.status).json(result.body);
  };
  router.use(errors); return router;
}
