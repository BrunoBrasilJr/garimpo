import express from 'express';
import type { Request, ErrorRequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import type { AccountsOptions } from '../accounts/router.ts';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { staff } from '../accounts/blocking-helpers.ts';
import { createDatabase } from '../../persistence/client.ts';
import { publicError } from '../../core/errors.ts';
import { CartError } from '../cart/errors.ts';
import { Reports } from './service.ts';
import { parse } from './validation.ts';

function credential(req: Request) {
  if (req.get('x-garimpo-client') || req.get('authorization')) throw new AccountError(403, 'STAFF_WEB_ONLY');
  const values = new Map<string, string>();
  for (const part of (req.get('cookie') ?? '').split(';')) {
    const index = part.indexOf('='), name = part.slice(0, index).trim();
    if (index < 0 || !['__Host-garimpo-access', '__Host-garimpo-refresh', '__Host-garimpo-csrf'].includes(name)) continue;
    if (values.has(name)) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    try { values.set(name, decodeURIComponent(part.slice(index + 1).trim())); }
    catch { throw new AccountError(422, 'INVALID_INPUT'); }
  }
  return values.get('__Host-garimpo-access') ?? '';
}
export function createReportsRouter(options: AccountsOptions = {}) {
  const router = express.Router();
  const db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined);
  const accounts = db ? new Accounts(db, options.clock, options.policy) : null;
  const origin = options.webOrigin ?? process.env.WEB_ORIGIN ?? 'https://localhost:5173';
  if (new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin) throw new Error('WEB_ORIGIN must be exact HTTPS.');
  const access = new WeakMap<Request, string>();
  router.use((req, _res, next) => { if (!/^\/admin\/reports(?:\/|$)/i.test(req.path)) { next('router'); return; } next(); });
  router.use(async (req, res, next) => {
    res.set('Cache-Control', 'private, no-store'); res.set('X-Content-Type-Options', 'nosniff');
    if (!req.secure) throw new AccountError(403, 'HTTPS_REQUIRED');
    const supplied = req.get('origin');
    if (supplied && supplied !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
    if (supplied) { res.set('Access-Control-Allow-Origin', origin); res.set('Access-Control-Allow-Credentials', 'true'); res.vary('Origin'); }
    if (req.method === 'OPTIONS') {
      if (supplied !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
      res.set('Access-Control-Allow-Methods', 'GET,OPTIONS'); res.set('Access-Control-Allow-Headers', 'X-Garimpo-Account'); res.sendStatus(204); return;
    }
    if (!accounts) throw new CartError(503, 'DATABASE_UNAVAILABLE', 'Os relatórios estão temporariamente indisponíveis.');
    const token = credential(req), actor = await staff(accounts, accounts.db, token, true);
    const expected = req.get('x-garimpo-account');
    if (expected && expected.toLowerCase() !== actor.id) throw new AccountError(403, 'ACCOUNT_CONTEXT_CHANGED');
    access.set(req, token); next();
  });
  for (const mode of ['sales', 'genres', 'products'] as const) {
    router.get('/admin/reports/' + mode, async (req, res) => {
      const reports = new Reports(accounts!);
      const input = parse(req.query);
      res.json(await reports.read(access.get(req)!, input, mode));
    });
  }
  const errors: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
    void _next;
    const correlationId = randomUUID();
    if (error instanceof AccountError || error instanceof CartError) {
      res.status(error.status).json({ code: error.code, message: error.message, fieldErrors: {}, correlationId }); return;
    }
    const result = publicError(error, correlationId); res.status(result.status).json(result.body);
  };
  router.use(errors); return router;
}
