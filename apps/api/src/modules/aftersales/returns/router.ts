import express from 'express';
import type { ErrorRequestHandler, Request } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { publicError } from '../../../core/errors.ts';
import { createDatabase } from '../../../persistence/client.ts';
import { AccountError } from '../../accounts/errors.ts';
import type { AccountsOptions } from '../../accounts/router.ts';
import { Accounts } from '../../accounts/service.ts';
import { CartError } from '../../cart/errors.ts';
import { MAX_IMAGE_BYTES } from '../../media/store.ts';
import * as orderInput from '../../orders/history-validation.ts';
import { LocalGateway } from '../../payments/gateway.ts';
import type { PaymentGateway } from '../../payments/gateway.ts';
import { AutomaticRefunds } from '../../refunds/automatic.ts';
import { addEvidence, readEvidence } from '../shared/evidence.ts';
import { Returns } from './service.ts';
import * as input from './validation.ts';

const prefix = /^\/(?:orders\/[^/]+\/returns\/?$|(?:me\/|admin\/)?returns\/[^/]+(?:\/|$)|(?:admin\/)?aftersales\/[^/]+(?:\/|$))/;
const empty = z.object({}).strict();
const mobile = (request: Request) => request.get('x-garimpo-client') === 'mobile';
const guardedCookies = new Set(['__Host-garimpo-access', '__Host-garimpo-refresh', '__Host-garimpo-csrf']);

function cookies(request: Request) {
  const values = new Map<string, string>();
  for (const part of (request.get('cookie') ?? '').split(';')) {
    const index = part.indexOf('=');
    if (index < 0) continue;
    const name = part.slice(0, index).trim();
    if (!guardedCookies.has(name)) continue;
    if (values.has(name)) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    try { values.set(name, decodeURIComponent(part.slice(index + 1).trim())); }
    catch { throw new AccountError(422, 'INVALID_INPUT'); }
  }
  return values;
}

export function createReturnsRouter(options: AccountsOptions = {}, gateway?: PaymentGateway) {
  const router = express.Router();
  const db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined);
  const accounts = db ? new Accounts(db, options.clock, options.policy) : null;
  const service = accounts ? new Returns(accounts, new AutomaticRefunds(accounts, gateway ?? new LocalGateway(accounts.db, accounts.clock))) : null;
  const origin = options.webOrigin ?? process.env.WEB_ORIGIN ?? 'https://localhost:5173';
  if (new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin) throw new Error('WEB_ORIGIN must be an exact HTTPS origin.');

  const auth = new WeakMap<Request, { access: string; internal: boolean }>();
  router.use((req, _res, next) => { if (!prefix.test(req.path)) { next('router'); return; } next(); });
  router.use(async (req, res, next) => {
    res.set('Cache-Control', 'private, no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    if (!req.secure) throw new AccountError(403, 'HTTPS_REQUIRED');
    const supplied = req.get('origin');
    if (supplied && supplied !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
    if (supplied) { res.set('Access-Control-Allow-Origin', origin); res.set('Access-Control-Allow-Credentials', 'true'); res.vary('Origin'); }
    if (req.method === 'OPTIONS') {
      if (supplied !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
      res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Garimpo-Client,Idempotency-Key,X-Garimpo-Account');
      res.sendStatus(204); return;
    }
    if (!accounts || !service) throw new CartError(503, 'DATABASE_UNAVAILABLE', 'O atendimento está temporariamente indisponível.');
    if (req.get('x-garimpo-client') && !mobile(req)) throw new AccountError(422, 'INVALID_CLIENT');
    const values = cookies(req);
    if (mobile(req) && values.size || !mobile(req) && req.get('authorization')) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    const access = mobile(req) ? /^Bearer ([\w-]{43})$/.exec(req.get('authorization') ?? '')?.[1] ?? '' : values.get('__Host-garimpo-access') ?? '';
    const { user } = await accounts.authorize(accounts.db, access);
    const internal = user.context === 'STAFF';
    const path = req.path.toLowerCase();
    if (internal && (mobile(req) || path.startsWith('/me/') || path.startsWith('/orders/'))) throw new AccountError(403, mobile(req) ? 'STAFF_WEB_ONLY' : 'CUSTOMER_REQUIRED');
    if (path.startsWith('/admin/') && !internal) throw new AccountError(403, 'STAFF_REQUIRED');
    if (internal && !['ADMIN', 'OPERATOR'].includes(user.role)) throw new AccountError(403, 'STAFF_REQUIRED');
    if (/(?:refund-authorization|posting-extension|inspection-exception)\/?$/.test(path) && user.role !== 'ADMIN') throw new AccountError(403, 'ADMIN_REQUIRED');
    const expected = req.get('x-garimpo-account');
    if (expected && orderInput.parse(orderInput.id, expected) !== user.id) throw new AccountError(403, 'ACCOUNT_CONTEXT_CHANGED');
    if (!['GET', 'HEAD'].includes(req.method) && !mobile(req)) {
      if (supplied !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED');
      const proof = req.get('x-csrf-token') ?? '';
      if (!proof || proof !== values.get('__Host-garimpo-csrf')) throw new AccountError(403, 'CSRF_INVALID');
      await accounts.csrf(access, proof);
    }
    auth.set(req, { access, internal });
    next();
  });

  const id = (req: Request) => orderInput.parse(orderInput.id, req.params.id);
  const key = (req: Request) => orderInput.parse(orderInput.key, req.get('idempotency-key'));
  const json = express.json({ limit: '1mb', strict: true });
  router.post('/orders/:id/returns', json, async (req, res) => {
    orderInput.parse(empty, req.query);
    res.status(201).json(await service!.open(auth.get(req)!.access, id(req), orderInput.parse(input.request, req.body), key(req)));
  });
  router.get(['/me/returns/:id', '/admin/returns/:id'], async (req, res) => {
    orderInput.parse(empty, req.query);
    const { access, internal } = auth.get(req)!;
    res.json(await service!.detail(access, id(req), internal));
  });

  const routes = [
    ['/admin/returns/:id/decision', 'decision', input.decision],
    ['/returns/:id/posting', 'posting', input.posting],
    ['/admin/returns/:id/receipt', 'receipt', input.receipt],
    ['/admin/returns/:id/refund-authorization', 'authorization', input.authorization],
    ['/admin/aftersales/:id/posting-extension', 'extension', input.extension],
    ['/admin/aftersales/:id/rejected-shipment', 'rejected-shipment', input.rejectedShipment],
    ['/admin/aftersales/:id/rejected-delivery', 'rejected-delivery', input.rejectedDelivery],
    ['/admin/aftersales/:id/inspection-exception', 'inspection-exception', input.inspectionException]
  ] as const;
  for (const [path, type, schema] of routes) {
    router.post(path, json, async (req, res) => {
      orderInput.parse(empty, req.query);
      const { access, internal } = auth.get(req)!;
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) throw new CartError(422, 'INVALID_RETURN_INPUT', 'Confira os dados do atendimento.');
      const command = { type, data: parsed.data } as Parameters<Returns['change']>[2];
      res.json(await service!.change(access, id(req), command, internal, type === 'authorization' ? key(req) : undefined));
    });
  }
  router.post('/aftersales/:id/evidence', async (req, _res, next) => {
    orderInput.parse(empty, req.query);
    const { access, internal } = auth.get(req)!;
    await service!.detail(access, id(req), internal);
    next();
  }, express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: MAX_IMAGE_BYTES, inflate: false }), async (req, res) => {
    const { access, internal } = auth.get(req)!;
    const mediaType = (req.get('content-type') ?? '').split(';', 1)[0]!.trim().toLowerCase();
    res.status(201).json(await addEvidence(service!, access, internal, id(req), mediaType, req.body));
  });
  router.get('/aftersales/:id/evidence/:imageId', async (req, res) => {
    orderInput.parse(empty, req.query);
    const { access, internal } = auth.get(req)!;
    const row = await readEvidence(service!, access, internal, id(req), orderInput.parse(orderInput.id, req.params.imageId));
    res.set('Content-Security-Policy', "default-src 'none'; sandbox");
    res.type(row.mediaType).send(Buffer.from(row.content));
  });
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    void _next;
    const correlationId = randomUUID();
    if (error instanceof AccountError || error instanceof CartError) {
      res.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error instanceof AccountError ? error.fieldErrors : {}, correlationId });
      return;
    }
    if (error instanceof SyntaxError || error && typeof error === 'object' && 'type' in error) {
      const status = error instanceof SyntaxError ? 422 : error.type === 'entity.too.large' ? 413 : error.type === 'encoding.unsupported' ? 415 : 422;
      res.status(status).json({ code: 'INVALID_RETURN_INPUT', message: 'Confira os dados e o tamanho do arquivo.', fieldErrors: {}, correlationId });
      return;
    }
    const result = publicError(error, correlationId);
    res.status(result.status).json(result.body);
  };
  router.use(errors);
  return router;
}
