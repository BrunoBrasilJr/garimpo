import { randomUUID } from 'node:crypto';
import express from 'express';
import type { ErrorRequestHandler, Request } from 'express';
import { z } from 'zod';
import type { AccountsOptions } from '../accounts/router.ts';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { createDatabase } from '../../persistence/client.ts';
import { publicError } from '../../core/errors.ts';
import { PublicImageStore, MAX_IMAGE_BYTES } from '../media/store.ts';
import { Catalog } from './service.ts';
import { CatalogError, missing, conflict } from './errors.ts';
import * as input from './validation.ts';

export interface CatalogOptions extends AccountsOptions { mediaRoot?: string }
const routePrefix = /^\/(editions|catalog|admin\/(editions|offers|images|catalog-metadata)|media\/products)(\/|$)/;
function cookie(request: Request, name: string) {
  const values = (request.get('cookie') ?? '').split(';').map(value => value.trim()).filter(value => value.startsWith(name + '='));
  if (values.length > 1) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
  try { return values[0] ? decodeURIComponent(values[0].slice(name.length + 1)) : ''; }
  catch { throw new AccountError(422, 'INVALID_INPUT'); }
}
const access = (request: Request) => cookie(request, '__Host-garimpo-access');
export function createCatalogRouter(options: CatalogOptions = {}) {
  const router = express.Router();
  const db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined);
  const accounts = db ? new Accounts(db, options.clock, options.policy) : undefined;
  const images = new PublicImageStore(options.mediaRoot ?? process.env.MEDIA_PUBLIC_ROOT);
  const catalog = accounts ? new Catalog(accounts, images) : undefined;
  const service = () => { if (!catalog) throw new CatalogError(503, 'DATABASE_UNAVAILABLE', 'O catálogo está temporariamente indisponível.'); return catalog; };
  const origin = options.webOrigin ?? process.env.WEB_ORIGIN ?? 'https://localhost:5173';
  if (new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin) throw new Error('WEB_ORIGIN must be an exact HTTPS origin.');
  // Unrelated auth/message routes must never pass through catalog parsers or guards.
  router.use((request, _response, next) => { if (!routePrefix.test(request.path)) { next('router'); return; } next(); });
  router.use((request, response, next) => {
    response.set('X-Content-Type-Options', 'nosniff');
    response.set('Cache-Control', 'no-store');
    if (!request.secure) throw new AccountError(403, 'HTTPS_REQUIRED');
    const suppliedOrigin = request.get('origin');
    if (suppliedOrigin && suppliedOrigin !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
    if (suppliedOrigin) { response.set('Access-Control-Allow-Origin', origin); response.set('Access-Control-Allow-Credentials', 'true'); response.vary('Origin'); }
    if (request.method === 'OPTIONS') {
      if (suppliedOrigin !== origin) throw new AccountError(403, 'ORIGIN_INVALID');
      response.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
      response.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-CSRF-Token,X-Garimpo-Client,Idempotency-Key');
      response.sendStatus(204); return;
    }
    next();
  });
  router.use('/admin', async (request, _response, next) => {
    if (request.get('x-garimpo-client')) throw new AccountError(403, 'STAFF_WEB_ONLY');
    if (request.get('authorization')) throw new AccountError(422, 'AMBIGUOUS_CREDENTIALS');
    // Also reject duplicated renewal/CSRF cookies, even though this route does not renew.
    cookie(request, '__Host-garimpo-refresh'); cookie(request, '__Host-garimpo-csrf');
    await service().staff(service().db, access(request));
    if (!['GET', 'HEAD'].includes(request.method)) {
      if (request.get('origin') !== origin) throw new AccountError(403, 'ORIGIN_REQUIRED');
      const proof = request.get('x-csrf-token') ?? '';
      if (!proof || proof !== cookie(request, '__Host-garimpo-csrf')) throw new AccountError(403, 'CSRF_INVALID');
      await service().accounts.csrf(access(request), proof);
    }
    next();
  });
  router.use(express.json({ limit: '128kb', strict: true }));
  router.get('/catalog/filters', async (_request, response) => { response.json(await service().filters()); });
  router.get('/editions', async (request, response) => { response.json(await service().list(input.parse(input.catalogQuery, request.query))); });
  router.get('/editions/:id', async (request, response) => { response.json(await service().detail(input.parse(input.id, request.params.id))); });
  router.get('/admin/editions', async (request, response) => { response.json(await service().list(input.parse(input.catalogQuery, request.query), access(request))); });
  router.get('/admin/editions/:id', async (request, response) => { response.json(await service().detail(input.parse(input.id, request.params.id), access(request))); });
  router.post('/admin/editions', async (request, response) => { response.status(201).json(await service().createEdition(access(request), input.parse(input.editionCreate, request.body))); });
  router.patch('/admin/editions/:id', async (request, response) => { response.json(await service().updateEdition(access(request), input.parse(input.id, request.params.id), input.parse(input.editionPatch, request.body))); });
  router.post('/admin/editions/:id/offers', async (request, response) => {
    const key = input.parse(z.string().min(1).max(128), request.get('idempotency-key'));
    response.status(201).json(await service().createOffer(access(request), input.parse(input.id, request.params.id), input.parse(input.offerCreate, request.body), key));
  });
  router.patch('/admin/offers/:id', async (request, response) => { response.json(await service().updateOffer(access(request), input.parse(input.id, request.params.id), input.parse(input.offerPatch, request.body))); });
  for (const owner of ['edition', 'offer'] as const) {
    const plural = owner === 'edition' ? 'editions' : 'offers';
    router.post(`/admin/${plural}/:id/images`, express.raw({ type: ['image/jpeg', 'image/png', 'image/webp'], limit: MAX_IMAGE_BYTES }), async (request, response) => {
      const metadata = input.parse(input.imageQuery, request.query);
      if (!Buffer.isBuffer(request.body)) throw new CatalogError(415, 'INVALID_IMAGE_TYPE', 'Envie uma imagem JPEG, PNG ou WebP como corpo binário.');
      response.status(201).json(await service().upload(access(request), owner, input.parse(input.id, request.params.id), request.body,
        request.get('content-type')?.split(';')[0]?.trim() ?? '', metadata.description, metadata.position));
    });
    router.post(`/admin/${plural}/:id/inactivate`, async (request, response) => {
      const { reason } = input.parse(input.reasonInput, request.body), id = input.parse(input.id, request.params.id);
      response.json(owner === 'edition' ? await service().updateEdition(access(request), id, { active: false }, reason) : await service().updateOffer(access(request), id, { active: false }, reason));
    });
    router.delete(`/admin/${plural}/:id`, async (request, response) => { await service().remove(access(request), owner, input.parse(input.id, request.params.id)); response.sendStatus(204); });
  }
  router.delete('/admin/images/:id', async (request, response) => { await service().deleteImage(access(request), input.parse(input.id, request.params.id)); response.sendStatus(204); });
  router.get('/admin/catalog-metadata', async (request, response) => {
    const query = input.parse(z.object({ type: input.metadataType }).strict(), request.query);
    response.json(await service().metadata(access(request), query.type));
  });
  router.post('/admin/catalog-metadata', async (request, response) => {
    const value = input.parse(input.metadataCreate, request.body);
    response.status(201).json(await service().changeMetadata(access(request), value.type, value.name));
  });
  router.patch('/admin/catalog-metadata/:type/:id', async (request, response) => {
    response.json(await service().changeMetadata(access(request), input.parse(input.metadataType, request.params.type), input.parse(input.metadataInput, request.body).name, input.parse(input.id, request.params.id)));
  });
  router.delete('/admin/catalog-metadata/:type/:id', async (request, response) => {
    await service().changeMetadata(access(request), input.parse(input.metadataType, request.params.type), undefined, input.parse(input.id, request.params.id)); response.sendStatus(204);
  });
  router.get('/media/products/:key', (request, response, next) => {
    const key = request.params.key;
    if (!PublicImageStore.key(key)) throw missing();
    response.sendFile(key, { root: images.root, dotfiles: 'deny', immutable: true, maxAge: '1y',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" }
    }, error => { if (error) next(missing()); });
  });
  const errors: ErrorRequestHandler = (error: unknown, request, response, next) => {
    if (response.headersSent) { next(error); return; }
    const correlationId = randomUUID();
    if (error instanceof CatalogError || error instanceof AccountError) {
      response.status(error.status).json({ code: error.code, message: error.message, fieldErrors: error.fieldErrors, correlationId }); return;
    }
    if (error && typeof error === 'object' && 'code' in error) {
      const code = String(error.code);
      if (code === 'P2025') { const result = missing(); response.status(result.status).json({ code: result.code, message: result.message, fieldErrors: {}, correlationId }); return; }
      if (code === 'P2003' && request.method !== 'DELETE') { response.status(422).json({ code: 'INVALID_REFERENCE', message: 'Confira os metadados selecionados.', fieldErrors: {}, correlationId }); return; }
      if (['P2002', 'P2003', 'P2004'].includes(code)) { const result = conflict(); response.status(result.status).json({ code: result.code, message: result.message, fieldErrors: {}, correlationId }); return; }
    }
    if (error instanceof SyntaxError || (error && typeof error === 'object' && 'type' in error && error.type === 'entity.too.large')) {
      const largeImage = request.path.endsWith('/images');
      response.status(largeImage ? 413 : 422).json({ code: largeImage ? 'IMAGE_TOO_LARGE' : 'INVALID_INPUT', message: largeImage ? 'A imagem deve ter no máximo 5 MB.' : 'Verifique os dados informados.', fieldErrors: {}, correlationId }); return;
    }
    const result = publicError(error, correlationId); response.status(result.status).json(result.body);
  };
  router.use(errors);
  return router;
}
