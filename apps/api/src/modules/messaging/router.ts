import { randomUUID } from 'node:crypto';
import express from 'express';
import type { Request, ErrorRequestHandler } from 'express';
import { z } from 'zod';
import { AccountError } from '../accounts/errors.ts';
import { parse, email, registration } from '../accounts/validation.ts';
import { publicError } from '../../core/errors.ts';
import { configuredMessages } from './config.ts';
import type { MessagingOptions } from './config.ts';
import { requestPasswordReset, confirmPasswordReset } from '../accounts/password-reset.ts';
import { requestVerification, confirmVerification } from '../accounts/email-verification.ts';
import { requestEmailChange, confirmEmailChange } from '../accounts/email-change.ts';

const generic = { message: 'Se a conta estiver elegível, a mensagem será disponibilizada pelo canal configurado.' };
const token = z.string().regex(/^[\w-]{43}$/);
function cookie(request: Request, name: string) {
  const values = (request.get('cookie') ?? '').split(';').map(value => value.trim()).filter(value => value.startsWith(name + '='));
  if (values.length > 1) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
  try { return values[0] ? decodeURIComponent(values[0].slice(name.length + 1)) : ''; }
  catch { throw new AccountError(422, 'INVALID_INPUT'); }
}
export function createMessagingRouter(options: MessagingOptions = {}) {
  const messages = configuredMessages(options), router = express.Router();
  const origin = options.webOrigin ?? process.env.WEB_ORIGIN ?? 'https://localhost:5173';
  const service = () => { if (!messages) throw new AccountError(503, 'MESSAGE_CHANNEL_UNAVAILABLE'); return messages; };
  const guard: express.RequestHandler = (request, response, next) => {
    response.set('Cache-Control', 'no-store'); response.set('Referrer-Policy', 'no-referrer');
    if (!request.secure) throw new AccountError(403, 'HTTPS_REQUIRED');
    const supplied = request.get('origin'), mobile = request.get('x-garimpo-client');
    if (supplied && supplied !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
    if (mobile && mobile !== 'mobile') throw new AccountError(422, 'INVALID_CLIENT');
    if (mobile && /(?:^|;\s*)__Host-garimpo-/.test(request.get('cookie') ?? '')) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    if (supplied) { response.set('Access-Control-Allow-Origin', origin); response.set('Access-Control-Allow-Credentials', 'true'); response.vary('Origin'); }
    if (request.method === 'OPTIONS') {
      if (supplied !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
      response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
      response.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Garimpo-Client');
      response.sendStatus(204); return;
    }
    if (request.method !== 'GET' && !mobile && supplied !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED');
    next();
  };
  const authenticated = async (request: Request) => {
    if (request.get('x-garimpo-client') === 'mobile') return /^Bearer ([\w-]{43})$/.exec(request.get('authorization') ?? '')?.[1] ?? '';
    if (request.get('authorization')) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    const access = cookie(request, '__Host-garimpo-access'), proof = request.get('x-csrf-token') ?? '';
    if (!proof || cookie(request, '__Host-garimpo-csrf') !== proof) throw new AccountError(403, 'CSRF_INVALID');
    await service().accounts.csrf(access, proof); return access;
  };
  const publicPaths = ['/auth/password-reset', '/auth/password-reset/confirm', '/auth/email-verification', '/auth/email-verification/confirm', '/auth/email-change/confirm', '/me/email-change'];
  const demoPaths = ['/demo/messages', '/demo/messages/:id'];
  const json = express.json({ limit: '16kb', strict: true });
  router.options([...publicPaths, ...demoPaths], guard);
  for (const [path, operation, action] of [
    ['/auth/password-reset', 'RESET', requestPasswordReset], ['/auth/email-verification', 'VERIFY', requestVerification]
  ] as const) {
    router.post(path, guard, json, async (request, response) => {
      const input = parse(z.object({ email }).strict(), request.body), instance = service();
      await instance.rate(operation, request.socket.remoteAddress ?? 'unknown', input.email);
      await action(instance, input.email); response.status(202).json(generic);
    });
  }
  for (const [path, operation, action] of [
    ['/auth/email-verification/confirm', 'VERIFY_CONFIRM', confirmVerification], ['/auth/email-change/confirm', 'CHANGE_CONFIRM', confirmEmailChange]
  ] as const) {
    router.post(path, guard, json, async (request, response) => {
      const input = parse(z.object({ token }).strict(), request.body), instance = service();
      await instance.rate(operation, request.socket.remoteAddress ?? 'unknown');
      await action(instance, input.token); response.json({ message: 'E-mail confirmado.' });
    });
  }
  router.post('/auth/password-reset/confirm', guard, json, async (request, response) => {
    const input = parse(z.object({ token, newPassword: registration.shape.password }).strict(), request.body), instance = service();
    await instance.rate('RESET_CONFIRM', request.socket.remoteAddress ?? 'unknown');
    await confirmPasswordReset(instance, input.token, input.newPassword); response.json({ message: 'Senha alterada. Entre novamente.' });
  });
  router.post('/me/email-change', guard, json, async (request, response) => {
    const input = parse(z.object({ email }).strict(), request.body), access = await authenticated(request);
    const instance = service(), user = (await instance.accounts.authorize(instance.accounts.db, access)).user;
    await instance.rate('CHANGE', request.socket.remoteAddress ?? 'unknown', user.emailNormalized);
    await requestEmailChange(instance, access, input.email); response.status(202).json(generic);
  });
  // Email-only slice of the existing staff PATCH; unrelated fields remain in accounts/staff.
  router.patch('/admin/staff/:id', json, (request, response, next) => {
    if (!request.body || !Object.hasOwn(request.body, 'email')) { next('router'); return; }
    guard(request, response, next);
  }, async (request, response) => {
    if (request.get('x-garimpo-client')) throw new AccountError(403, 'STAFF_WEB_ONLY');
    const input = parse(z.object({ email }).strict(), request.body), id = parse(z.string().uuid(), request.params.id);
    const access = await authenticated(request), instance = service();
    await instance.rate('CHANGE', request.socket.remoteAddress ?? 'unknown');
    response.json(await requestEmailChange(instance, access, input.email, id));
  });
  for (const path of demoPaths) router.get(path, guard, async (request, response) => {
    if (!messages || process.env.NODE_ENV === 'production') throw new AccountError(403, 'TECHNICAL_CHANNEL_DISABLED');
    if (request.get('cookie')) throw new AccountError(403, 'TECHNICAL_ACCESS_REQUIRED');
    const proof = /^Bearer ([\w-]{43})$/.exec(request.get('authorization') ?? '')?.[1] ?? '';
    if (!messages.protection.permits(proof)) throw new AccountError(403, 'TECHNICAL_ACCESS_REQUIRED');
    const filter = parse(z.object({ recipient: email.optional(), type: z.enum(['ACCESS.RESET', 'ACCESS.VERIFY', 'ACCESS.CHANGE']).optional(),
      page: z.coerce.number().int().min(1).max(100000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }).strict(), request.query);
    response.json(await messages.mailbox(request.params.id ? parse(z.string().uuid(), request.params.id) : undefined,
      { page: filter.page, pageSize: filter.pageSize, ...(filter.recipient ? { recipient: filter.recipient } : {}), ...(filter.type ? { type: filter.type } : {}) }));
  });
  const errors: ErrorRequestHandler = (error: unknown, _request, response, next) => {
    void next;
    const correlationId = randomUUID();
    if (error instanceof AccountError) { response.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error.fieldErrors, correlationId }); return; }
    if (error instanceof SyntaxError || (error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large')) {
      response.status(422).json({ code: 'INVALID_INPUT', message: 'Verifique os dados informados.', fieldErrors: {}, correlationId }); return;
    }
    const result = publicError(error, correlationId); response.status(result.status).json(result.body);
  };
  router.use(errors); return router;
}
