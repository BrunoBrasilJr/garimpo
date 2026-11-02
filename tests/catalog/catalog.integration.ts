import { afterAll, beforeAll, expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';
import sharp from 'sharp';
import type { CatalogEdition, CatalogOffer, CatalogImage, CatalogMetadata, CatalogPage, CatalogFilters } from '@garimpo/contracts';
import { createDatabase } from '../../apps/api/src/persistence/client.ts';
import type { Database } from '../../apps/api/src/persistence/client.ts';
import { Accounts } from '../../apps/api/src/modules/accounts/service.ts';
import type { SessionBundle } from '../../apps/api/src/modules/accounts/service.ts';
import { firstAdmin, createStaff } from '../../apps/api/src/modules/accounts/staff/service.ts';
import { Catalog } from '../../apps/api/src/modules/catalog/service.ts';
import { PublicImageStore, MAX_IMAGE_BYTES } from '../../apps/api/src/modules/media/store.ts';
import { offerCreate, parse } from '../../apps/api/src/modules/catalog/validation.ts';
import { openCatalogServer, web } from './http.ts';
import { isolatedNoCommercialBindings } from '../inventory/fixtures.ts';

const password = 'Uma frase longa de teste para catalogo!';
const clock = { now: () => new Date('2026-11-02T03:00:00Z') };
let db: Database, other: Database, accounts: Accounts, catalog: Catalog, second: Catalog, server: Awaited<ReturnType<typeof openCatalogServer>>, control: Client;
let admin: SessionBundle, operator: SessionBundle, customer: SessionBundle, png: Buffer, mediaRoot: string;
function credentials(bundle: SessionBundle) { return { cookie: `__Host-garimpo-access=${bundle.accessToken}; __Host-garimpo-refresh=${bundle.refreshToken}; __Host-garimpo-csrf=${bundle.csrfToken}`, csrf: bundle.csrfToken }; }
const staffHeaders = () => web(credentials(admin));
async function metadata(type: 'artist' | 'genre' | 'label', name = `${type}-${randomUUID()}`) {
  const result = await server.call<CatalogMetadata>('/admin/catalog-metadata', 'POST', { type, name }, staffHeaders());
  expect(result.status).toBe(201); return result.body;
}
async function draft(extra: Record<string, unknown> = {}) {
  const [artist, genre] = await Promise.all([metadata('artist'), metadata('genre')]);
  const result = await server.call<CatalogEdition>('/admin/editions', 'POST', { title: `Disco-${randomUUID()}`, artistIds: [artist.id], genreIds: [genre.id], primaryGenreId: genre.id, format: 'LP', ...extra }, staffHeaders());
  expect(result.status).toBe(201); return result.body;
}
async function upload(owner: 'edition' | 'offer', id: string, position?: number) {
  return server.call<CatalogImage>(`/admin/${owner === 'edition' ? 'editions' : 'offers'}/${id}/images?description=Capa%20de%20teste${position === undefined ? '' : '&position=' + position}`, 'POST', png, { ...staffHeaders(), 'Content-Type': 'image/png' });
}
async function published(extra: Record<string, unknown> = {}) {
  const edition = await draft(extra); expect((await upload('edition', edition.id)).status).toBe(201);
  const result = await server.call<CatalogEdition>('/admin/editions/' + edition.id, 'PATCH', { active: true }, staffHeaders());
  expect(result.status).toBe(200); return result.body;
}
async function offer(editionId: string, extra: Record<string, unknown> = {}) {
  const result = await server.call<CatalogOffer>(`/admin/editions/${editionId}/offers`, 'POST', { kind: 'NEW', priceCents: 5000, stockOnHand: 3, active: true, ...extra }, { ...staffHeaders(), 'Idempotency-Key': randomUUID() });
  expect(result.status).toBe(201); return result.body;
}
async function used(editionId: string, extra: Record<string, unknown> = {}) {
  const result = await offer(editionId, { kind: 'USED', stockOnHand: 1, discGrade: 'VG+', sleeveGrade: 'NM', particulars: 'Pequeno sinal na capa.', active: false, ...extra });
  expect((await upload('offer', result.id)).status).toBe(201);
  const active = await server.call<CatalogOffer>('/admin/offers/' + result.id, 'PATCH', { version: result.version, active: true }, staffHeaders());
  expect(active.status).toBe(200); return active.body;
}
beforeAll(async () => {
  const value = process.env.TEST_DATABASE_URL;
  if (!value) throw new Error('Separate TEST_DATABASE_URL required.');
  const url = new URL(value), schema = url.searchParams.get('schema');
  if (url.pathname !== '/garimpo_test' || !schema || !/^task008_[a-f0-9]{32}$/.test(schema)) throw new Error('Only isolated TASK-008 schema accepted.');
  url.searchParams.set('application_name', 'TASK008_A'); db = createDatabase(url.href);
  url.searchParams.set('application_name', 'TASK008_B'); other = createDatabase(url.href);
  accounts = new Accounts(db, clock);
  const email = `${randomUUID()}@example.invalid`;
  await firstAdmin(accounts, { name: 'Admin sintético', email, password }); admin = await accounts.login(email, password, 'web');
  const operatorEmail = `${randomUUID()}@example.invalid`, customerEmail = `${randomUUID()}@example.invalid`;
  await createStaff(accounts, admin.accessToken, { name: 'Operador sintético', email: operatorEmail, password, role: 'OPERATOR' });
  operator = await accounts.login(operatorEmail, password, 'web');
  await accounts.register({ name: 'Cliente sintético', email: customerEmail, password }); customer = await accounts.login(customerEmail, password, 'web');
  mediaRoot = await mkdtemp(join(tmpdir(), 'garimpo-catalog-media-'));
  catalog = new Catalog(accounts, new PublicImageStore(mediaRoot)); second = new Catalog(new Accounts(other, clock), new PublicImageStore(mediaRoot));
  server = await openCatalogServer({ db, clock, mediaRoot, commercialBindings: isolatedNoCommercialBindings });
  png = await sharp({ create: { width: 4, height: 6, channels: 3, background: 'orange' } }).png().toBuffer();
  control = new Client({ connectionString: value }); await control.connect();
  await control.query(`SET search_path TO "${schema}"`);
});
afterAll(async () => { await server?.close(); await control?.end(); await Promise.all([db?.$disconnect(), other?.$disconnect()]); });

test('public catalog begins empty and exposes the complete immutable grade vocabulary', async () => {
  const page = await server.call<CatalogPage>('/editions'); expect(page.status).toBe(200); expect(page.body.items).toEqual([]);
  const filters = await server.call<CatalogFilters>('/catalog/filters');
  expect(filters.body.conditions.map(item => item.code)).toEqual(['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P']);
});
test('administration enforces web STAFF, HTTPS, origin, session-bound CSRF and duplicate credential rejection', async () => {
  expect((await server.call('/admin/editions')).status).toBe(401);
  expect((await server.call('/admin/editions', 'GET', undefined, web(credentials(customer)))).status).toBe(403);
  expect((await server.call('/admin/editions', 'GET', undefined, web(credentials(operator)))).status).toBe(200);
  expect((await server.call('/admin/editions', 'GET', undefined, { ...staffHeaders(), 'X-Garimpo-Client': 'mobile' })).status).toBe(403);
  expect((await server.call('/admin/editions', 'GET', undefined, staffHeaders(), true)).status).toBe(403);
  expect((await server.call('/admin/catalog-metadata', 'POST', { type: 'artist', name: 'Sem CSRF' }, { ...staffHeaders(), 'X-CSRF-Token': '' })).status).toBe(403);
  expect((await server.call('/admin/catalog-metadata', 'POST', { type: 'artist', name: 'CSRF de outro' }, { ...staffHeaders(), 'X-CSRF-Token': operator.csrfToken })).status).toBe(403);
  const exchanged = credentials(admin).cookie.replace('__Host-garimpo-csrf=' + admin.csrfToken, '__Host-garimpo-csrf=' + operator.csrfToken);
  expect((await server.call('/admin/catalog-metadata', 'POST', { type: 'artist', name: 'Prova não vinculada' }, { ...staffHeaders(), Cookie: exchanged, 'X-CSRF-Token': operator.csrfToken })).status).toBe(403);
  expect((await server.call('/admin/catalog-metadata', 'POST', { type: 'artist', name: 'Origem hostil' }, { ...staffHeaders(), Origin: 'https://hostile.invalid' })).status).toBe(403);
  expect((await server.call('/admin/editions', 'GET', undefined, { ...staffHeaders(), Cookie: credentials(admin).cookie + '; __Host-garimpo-access=another' })).status).toBe(422);
});
test('metadata CRUD is audited and rejects case-folded duplicates or linked deletion', async () => {
  const artist = await metadata('artist', 'Artista ' + randomUUID());
  const duplicate = await server.call('/admin/catalog-metadata', 'POST', { type: 'artist', name: artist.name.toUpperCase() }, staffHeaders()); expect(duplicate.status).toBe(409);
  const renamed = await server.call<CatalogMetadata>('/admin/catalog-metadata/artist/' + artist.id, 'PATCH', { name: artist.name + ' novo' }, staffHeaders()); expect(renamed.status).toBe(200);
  expect((await server.call('/admin/catalog-metadata/artist/' + artist.id, 'DELETE', undefined, staffHeaders())).status).toBe(204);
  const edition = await draft();
  expect((await server.call('/admin/catalog-metadata/artist/' + edition.artists[0]!.id, 'DELETE', undefined, staffHeaders())).status).toBe(409);
  expect(await db.auditLog.count({ where: { targetId: artist.id } })).toBe(3);
});
test('publication requires edition-owned photo and a failed command rolls back audit, outbox and edition', async () => {
  const [artist, genre] = await Promise.all([metadata('artist'), metadata('genre')]);
  const before = [await db.edition.count(), await db.auditLog.count(), await db.domainEvent.count()];
  const failed = await server.call('/admin/editions', 'POST', { title: 'Não publicar', artistIds: [artist.id], genreIds: [genre.id], primaryGenreId: genre.id, format: 'LP', active: true }, staffHeaders());
  expect(failed.status).toBe(422); expect(failed.body.code).toBe('PUBLICATION_INCOMPLETE');
  expect([await db.edition.count(), await db.auditLog.count(), await db.domainEvent.count()]).toEqual(before);
  const edition = await draft(); expect((await server.call('/editions/' + edition.id)).status).toBe(404);
  expect((await server.call('/admin/editions/' + edition.id, 'PATCH', { active: true }, staffHeaders())).status).toBe(422);
  expect((await upload('edition', edition.id)).status).toBe(201);
  expect((await server.call('/admin/editions/' + edition.id, 'PATCH', { active: true }, staffHeaders())).status).toBe(200);
  expect((await server.call('/editions/' + edition.id)).status).toBe(200);
});
test('distinct years, track artists and optional audio remain searchable without invented dates or external fetches', async () => {
  const guest = await metadata('artist', 'Convidado ' + randomUUID());
  const edition = await published({ originalYear: 1959, editionYear: 2021, tracks: [{ position: 1, title: 'Faixa ' + randomUUID(), artistIds: [guest.id], audioUrl: 'https://example.invalid/unreachable-preview' }] });
  const byArtist = await server.call<CatalogPage>('/editions?artist=' + guest.id); expect(byArtist.body.items.map(item => item.id)).toContain(edition.id);
  const byName = await server.call<CatalogPage>('/editions?q=' + encodeURIComponent(guest.name)); expect(byName.body.items.map(item => item.id)).toContain(edition.id);
  const old = await server.call<CatalogPage>('/editions?decade=1950'); expect(old.body.items.map(item => item.id)).not.toContain(edition.id);
  const current = await server.call<CatalogPage>('/editions?decade=2020'); expect(current.body.items.map(item => item.id)).toContain(edition.id);
  const unknown = await published({ originalYear: 1964, editionYear: null });
  const sixties = await server.call<CatalogPage>('/editions?decade=1960'); expect(sixties.body.items.map(item => item.id)).not.toContain(unknown.id);
  const detail = await server.call<CatalogEdition>('/editions/' + edition.id); expect(detail.body.tracks[0]!.audioUrl).toBe('https://example.invalid/unreachable-preview');
});
test('literal wildcard characters do not turn a search into match-all and pagination remains stable', async () => {
  const marker = randomUUID(), match = await published({ title: marker + ' 100%_ real' });
  await published({ title: marker + ' 100abc outro' });
  const page = await server.call<CatalogPage>('/editions?q=' + encodeURIComponent(marker + ' 100%_'));
  expect(page.body.items.map(item => item.id)).toEqual([match.id]);
  const first = await server.call<CatalogPage>('/editions?pageSize=1'), again = await server.call<CatalogPage>('/editions?pageSize=1');
  expect(first.body.items[0]!.id).toBe(again.body.items[0]!.id); expect(first.body.totalPages).toBe(first.body.total);
});
test('used publication needs independent grades, particulars and its own photograph', async () => {
  const edition = await published(); const pending = await offer(edition.id, { kind: 'USED', stockOnHand: 1, active: false });
  expect((await server.call('/admin/offers/' + pending.id, 'PATCH', { version: 1, active: true }, staffHeaders())).status).toBe(422);
  expect((await upload('offer', pending.id)).status).toBe(201);
  expect((await server.call('/admin/offers/' + pending.id, 'PATCH', { version: 1, active: true }, staffHeaders())).status).toBe(422);
  const result = await server.call<CatalogOffer>('/admin/offers/' + pending.id, 'PATCH', { version: 1, active: true, discGrade: 'VG+', sleeveGrade: 'P', particulars: 'Capa bastante gasta.' }, staffHeaders());
  expect(result.status).toBe(200); expect(result.body).toMatchObject({ discGrade: 'VG+', sleeveGrade: 'P', available: true });
  const fresh = await offer(edition.id);
  expect((await upload('offer', fresh.id)).status).toBe(422);
});
test('price, both conditions and availability match the same offer', async () => {
  const edition = await published(), sought = await used(edition.id, { priceCents: 7000, discGrade: 'VG+', sleeveGrade: 'NM' });
  await used(edition.id, { priceCents: 1000, discGrade: 'G', sleeveGrade: 'P' });
  const bad = await server.call<CatalogPage>('/editions?maxPrice=2000&discCondition=VG%2B'); expect(bad.body.items.map(item => item.id)).not.toContain(edition.id);
  const good = await server.call<CatalogPage>('/editions?minPrice=6000&maxPrice=8000&discCondition=VG%2B&sleeveCondition=NM&available=true');
  const found = good.body.items.find(item => item.id === edition.id); expect(found?.offers.map(item => item.id)).toEqual([sought.id]); expect(found?.minPriceCents).toBe(7000);
  const empty = await published(); const unavailable = await server.call<CatalogPage>('/editions?available=false'); expect(unavailable.body.items.map(item => item.id)).toContain(empty.id);
});
test('stock is integer, used remains individual and metadata patches cannot change stock or kind', async () => {
  const edition = await published();
  expect((await server.call(`/admin/editions/${edition.id}/offers`, 'POST', { kind: 'USED', priceCents: 100, stockOnHand: 2 }, { ...staffHeaders(), 'Idempotency-Key': randomUUID() })).status).toBe(422);
  const item = await offer(edition.id, { stockOnHand: 4 });
  for (const patch of [{ stockOnHand: 100 }, { kind: 'USED' }, { priceCents: 1.5 }]) expect((await server.call('/admin/offers/' + item.id, 'PATCH', { version: item.version, ...patch }, staffHeaders())).status).toBe(422);
  expect(await db.offer.findUnique({ where: { id: item.id } })).toMatchObject({ stockOnHand: 4, kind: 'NEW' });
  await expect(db.offer.create({ data: { editionId: edition.id, kind: 'USED', priceCents: 100, stockOnHand: 2 } })).rejects.toBeDefined();
});
test('image bytes, size and MIME are enforced; public image route exposes only generated image keys', async () => {
  const edition = await draft(), path = `/admin/editions/${edition.id}/images?description=Teste`;
  expect((await server.call(path, 'POST', Buffer.from('<svg/>'), { ...staffHeaders(), 'Content-Type': 'image/png' })).status).toBe(415);
  expect((await server.call(path, 'POST', png, { ...staffHeaders(), 'Content-Type': 'image/jpeg' })).status).toBe(415);
  expect((await server.call(path, 'POST', Buffer.alloc(MAX_IMAGE_BYTES + 1), { ...staffHeaders(), 'Content-Type': 'image/png' })).status).toBe(413);
  const saved = await upload('edition', edition.id); expect(saved.status).toBe(201);
  const content = await server.call(saved.body.url.replace('/api/v1', ''));
  expect(content.status).toBe(200); expect(content.headers['content-type']).toContain('image/png'); expect(content.headers['x-content-type-options']).toBe('nosniff');
  expect(content.raw).toEqual(await readFile(join(mediaRoot, saved.body.url.split('/').at(-1)!)));
  for (const key of ['server.key', 'credentials.json', 'not-an-image.svg', '%2e%2e%2fprivate.jpg']) expect((await server.call('/media/products/' + key)).status).toBe(404);
});
test('edition/used image limits and image slot ownership remain separate', async () => {
  const edition = await draft();
  for (let position = 1; position <= 10; position++) expect((await upload('edition', edition.id, position)).status).toBe(201);
  expect((await upload('edition', edition.id)).status).toBe(409);
  const item = await offer(edition.id, { kind: 'USED', active: false, stockOnHand: 1 });
  for (let position = 1; position <= 8; position++) expect((await upload('offer', item.id, position)).status).toBe(201);
  expect((await upload('offer', item.id)).status).toBe(409);
  expect((await upload('offer', item.id, 9)).status).toBe(409);
});

async function overlap<T>(editionId: string, first: () => Promise<T>, next: () => Promise<T>) {
  await control.query('BEGIN'); await control.query('SELECT id FROM "Edition" WHERE id = $1 FOR UPDATE', [editionId]);
  const completed = Promise.allSettled([first(), next()]);
  let simultaneous = false;
  try {
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline) {
      await control.query('SELECT pg_stat_clear_snapshot()');
      const result = await control.query<{ count: string }>("SELECT count(DISTINCT application_name)::text AS count FROM pg_stat_activity WHERE application_name IN ('TASK008_A', 'TASK008_B') AND state = 'active' AND wait_event_type = 'Lock'");
      if (result.rows[0]?.count === '2') { simultaneous = true; break; }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  } finally { await control.query('COMMIT'); }
  const results = await completed; expect(simultaneous).toBe(true); return results;
}
test('two independent upload transactions are forced to overlap and cannot publish an eleventh edition photo', async () => {
  const edition = await draft(); for (let count = 0; count < 9; count++) expect((await upload('edition', edition.id)).status).toBe(201);
  const results = await overlap(edition.id, () => catalog.upload(admin.accessToken, 'edition', edition.id, png, 'image/png', 'Concorrente A'), () => second.upload(admin.accessToken, 'edition', edition.id, png, 'image/png', 'Concorrente B'));
  expect(results.filter(item => item.status === 'fulfilled')).toHaveLength(1);
  expect(await db.productImage.count({ where: { editionId: edition.id } })).toBe(10);
});
test('two overlapping removals preserve the last photo of a published edition', async () => {
  const edition = await published(), extra = await upload('edition', edition.id); expect(extra.status).toBe(201);
  const results = await overlap(edition.id, () => catalog.deleteImage(admin.accessToken, edition.images[0]!.id), () => second.deleteImage(admin.accessToken, extra.body.id));
  expect(results.filter(item => item.status === 'fulfilled')).toHaveLength(1);
  expect(await db.productImage.count({ where: { editionId: edition.id } })).toBe(1);
  expect((await db.edition.findUniqueOrThrow({ where: { id: edition.id } })).active).toBe(true);
});
test('concurrent initial-stock command replay has one durable offer, audit and effect', async () => {
  const edition = await published(), key = randomUUID(), payload = parse(offerCreate, { kind: 'NEW', priceCents: 3000, stockOnHand: 5 });
  const results = await overlap(edition.id, () => catalog.createOffer(admin.accessToken, edition.id, payload, key), () => second.createOffer(admin.accessToken, edition.id, payload, key));
  expect(results.every(item => item.status === 'fulfilled')).toBe(true);
  const offers = await db.offer.findMany({ where: { editionId: edition.id } }); expect(offers).toHaveLength(1); expect(offers[0]!.stockOnHand).toBe(5);
  expect(await db.auditLog.count({ where: { targetId: offers[0]!.id, action: 'CATALOG.OFFER_CREATED' } })).toBe(1);
  await expect(catalog.createOffer(admin.accessToken, edition.id, { ...payload, stockOnHand: 6 }, key)).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
});
test('stale offer revision conflicts instead of silently replacing a newer price', async () => {
  const edition = await published(), item = await offer(edition.id);
  const first = await server.call<CatalogOffer>('/admin/offers/' + item.id, 'PATCH', { version: item.version, priceCents: 7000 }, staffHeaders()); expect(first.status).toBe(200);
  expect((await server.call('/admin/offers/' + item.id, 'PATCH', { version: item.version, priceCents: 10 }, staffHeaders())).status).toBe(409);
  expect((await db.offer.findUniqueOrThrow({ where: { id: item.id } })).priceCents).toBe(7000);
});
test('inactivation preserves identities and stock; restrictive references prevent destructive deletion atomically', async () => {
  const edition = await published(), item = await offer(edition.id, { stockOnHand: 0 });
  // A structural FK fixture, not a claim that orders/reviews have already been implemented.
  await db.$executeRawUnsafe('CREATE TABLE "CatalogReferenceProbe" (id UUID PRIMARY KEY, "editionId" UUID REFERENCES "Edition"(id) ON DELETE RESTRICT, "offerId" UUID REFERENCES "Offer"(id) ON DELETE RESTRICT)');
  await db.$executeRaw`INSERT INTO "CatalogReferenceProbe" (id, "editionId", "offerId") VALUES (${randomUUID()}::uuid, ${edition.id}::uuid, ${item.id}::uuid)`;
  expect((await server.call('/admin/offers/' + item.id, 'DELETE', undefined, staffHeaders())).status).toBe(409);
  expect((await server.call('/admin/editions/' + edition.id, 'DELETE', undefined, staffHeaders())).status).toBe(409);
  expect((await server.call('/admin/editions/' + edition.id + '/inactivate', 'POST', { reason: 'Pausa comercial' }, staffHeaders())).status).toBe(200);
  expect(await db.offer.findUnique({ where: { id: item.id } })).toMatchObject({ stockOnHand: item.stockOnHand, priceCents: item.priceCents });
  expect((await server.call('/editions/' + edition.id)).status).toBe(404);
  expect((await server.call('/admin/editions/' + edition.id, 'GET', undefined, staffHeaders())).status).toBe(200);
});
test('unreferenced records can be deleted, while immutable image bytes await retention-aware collection', async () => {
  const edition = await draft(), saved = await upload('edition', edition.id); expect(saved.status).toBe(201);
  expect((await server.call('/admin/images/' + saved.body.id, 'DELETE', undefined, staffHeaders())).status).toBe(204);
  expect((await server.call(saved.body.url.replace('/api/v1', ''))).status).toBe(200);
  expect((await server.call('/admin/editions/' + edition.id, 'DELETE', undefined, staffHeaders())).status).toBe(204);
  expect(await db.edition.findUnique({ where: { id: edition.id } })).toBeNull();
});
test('principal genre membership is enforced by the database, not only request parsing', async () => {
  const edition = await draft();
  await expect(db.editionGenre.deleteMany({ where: { editionId: edition.id } })).rejects.toBeDefined();
  expect(await db.editionGenre.count({ where: { editionId: edition.id, genreId: edition.primaryGenre.id } })).toBe(1);
});
test('invalid references and inputs return structured errors without SQL, paths or credentials', async () => {
  const edition = await draft();
  const invalid = await server.call('/admin/editions/' + edition.id, 'PATCH', { labelId: randomUUID() }, staffHeaders());
  expect(invalid.status).toBe(422); expect(invalid.body).toHaveProperty('correlationId');
  for (const query of ['page=0', 'minPrice=200&maxPrice=100', 'discCondition=UNKNOWN', 'active=false']) expect((await server.call('/editions?' + query)).status).toBe(422);
  expect(JSON.stringify(invalid.body)).not.toMatch(/SELECT|INSERT|postgres|passwordHash|\/home\//i);
  for (const name of ['Nome\0inválido', 'ﬃ'.repeat(150)]) expect((await server.call('/admin/catalog-metadata', 'POST', { type: 'artist', name }, staffHeaders())).status).toBe(422);
});
