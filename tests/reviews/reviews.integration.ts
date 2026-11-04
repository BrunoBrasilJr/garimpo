import { unavailableReviewPurchases } from '../../apps/api/src/modules/reviews/purchases.ts';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { Client } from 'pg';
import type { PrivateReview, PublicReviewPage } from '@garimpo/contracts';
import { createDatabase } from '../../apps/api/src/persistence/client.ts';
import type { Database } from '../../apps/api/src/persistence/client.ts';
import { Accounts } from '../../apps/api/src/modules/accounts/service.ts';
import type { SessionBundle } from '../../apps/api/src/modules/accounts/service.ts';
import { firstAdmin, createStaff } from '../../apps/api/src/modules/accounts/staff/service.ts';
import { Catalog } from '../../apps/api/src/modules/catalog/service.ts';
import { PublicImageStore } from '../../apps/api/src/modules/media/store.ts';
import { Reviews } from '../../apps/api/src/modules/reviews/service.ts';
import { PurchaseFixture } from './fixtures.ts';
import { openCatalogServer, web } from '../catalog/http.ts';

const password = 'Uma frase longa segura para avaliacoes!', clock = { now: () => new Date('2026-11-02T18:00:00Z') }, purchases = new PurchaseFixture();
let db: Database, other: Database, accounts: Accounts, reviews: Reviews, second: Reviews, catalog: Catalog, server: Awaited<ReturnType<typeof openCatalogServer>>, closedServer: Awaited<ReturnType<typeof openCatalogServer>>, control: Client;
let admin: SessionBundle, operator: SessionBundle, customer: SessionBundle, another: SessionBundle, editionId: string;
const credentials = (session: SessionBundle) => web({ cookie: `__Host-garimpo-access=${session.accessToken}; __Host-garimpo-refresh=${session.refreshToken}; __Host-garimpo-csrf=${session.csrfToken}`, csrf: session.csrfToken });
function purchase(session = customer, orderId = randomUUID(), retainedUnits = 1) { purchases.set({ userId: session.user.id, editionId, orderId }, { status: 'KNOWN', delivered: true, retainedUnits }); return orderId; }
const draft = (rating = 5, comment = 'Disco conferido e compra entregue.') => ({ rating, comment });
async function create(session = customer, rating = 5) { return reviews.create(session.accessToken, editionId, purchase(session), draft(rating)); }
beforeAll(async () => {
  const value = process.env.TEST_DATABASE_URL; if (!value) throw new Error('Separate test database required.');
  const url = new URL(value), schema = url.searchParams.get('schema'); if (url.pathname !== '/garimpo_test' || !/^task013_[a-f0-9]{32}$/.test(schema ?? '')) throw new Error('Only isolated TASK-013 schema accepted.');
  url.searchParams.set('application_name', 'TASK013_A'); db = createDatabase(url.href); url.searchParams.set('application_name', 'TASK013_B'); other = createDatabase(url.href);
  accounts = new Accounts(db, clock); reviews = new Reviews(accounts, purchases); second = new Reviews(new Accounts(other, clock), purchases);
  const email = randomUUID() + '@example.invalid'; await firstAdmin(accounts, { name: 'Admin sintético', email, password }); admin = await accounts.login(email, password);
  const op = randomUUID() + '@example.invalid'; await createStaff(accounts, admin.accessToken, { name: 'Operador sintético', email: op, password, role: 'OPERATOR' }); operator = await accounts.login(op, password);
  for (const name of ['Cliente Um', 'Cliente Dois']) { const email = randomUUID() + '@example.invalid'; await accounts.register({ name, email, password }); const bundle = await accounts.login(email, password); if (!customer) customer = bundle; else another = bundle; }
  const mediaRoot = await mkdtemp(join(tmpdir(), 'garimpo-reviews-')); catalog = new Catalog(accounts, new PublicImageStore(mediaRoot));
  const artist = await catalog.changeMetadata(admin.accessToken, 'artist', 'Artista ' + randomUUID()), genre = await catalog.changeMetadata(admin.accessToken, 'genre', 'Genero ' + randomUUID());
  const edition = await catalog.createEdition(admin.accessToken, { title: 'Avaliações ' + randomUUID(), format: 'LP', artistIds: [artist.id], genreIds: [genre.id], primaryGenreId: genre.id });
  const image = await sharp({ create: { width: 4, height: 4, channels: 3, background: 'green' } }).png().toBuffer(); await catalog.upload(admin.accessToken, 'edition', edition.id, image, 'image/png', 'Capa sintética');
  await catalog.updateEdition(admin.accessToken, edition.id, { active: true }); editionId = edition.id;
  server = await openCatalogServer({ db, clock, mediaRoot }, { db, clock, purchases }); closedServer = await openCatalogServer({ db, clock, mediaRoot }, { purchases: unavailableReviewPurchases });
  control = new Client({ connectionString: value }); await control.connect(); await control.query(`SET search_path TO "${schema}"`);
});
afterAll(async () => { await Promise.all([server?.close(), closedServer?.close()]); await control?.end(); await Promise.all([db?.$disconnect(), other?.$disconnect()]); });

test('default runtime fails closed without a purchase adapter and fixtures cannot be selected through payloads', async () => {
  const orderId = purchase();
  expect((await closedServer.call('/editions/' + editionId + '/reviews', 'POST', { orderId, ...draft() }, credentials(customer))).status).toBe(503);
  expect((await closedServer.call('/editions/' + editionId + '/reviews', 'POST', { orderId, ...draft(), purchases: 'KNOWN' }, credentials(customer))).status).toBe(422);
  expect(await db.review.count()).toBe(0);
});

test('only delivered purchases with retained units publish; invalid adapter snapshots also fail closed', async () => {
  const orderId = randomUUID(), key = { userId: customer.user.id, editionId, orderId };
  for (const value of [{ status: 'KNOWN' as const, delivered: false, retainedUnits: 1 }, { status: 'KNOWN' as const, delivered: true, retainedUnits: 0 }]) {
    purchases.set(key, value); await expect(reviews.create(customer.accessToken, editionId, orderId, draft())).rejects.toMatchObject({ status: 403 });
  }
  purchases.set(key, { status: 'KNOWN', delivered: true, retainedUnits: NaN }); await expect(reviews.create(customer.accessToken, editionId, orderId, draft())).rejects.toMatchObject({ status: 503 });
  purchases.set(key, { status: 'KNOWN', delivered: true, retainedUnits: 3 }); const row = await reviews.create(customer.accessToken, editionId, orderId, draft()); expect(row.visibility).toBe('PUBLIC');
  await expect(reviews.create(customer.accessToken, editionId, orderId, draft())).rejects.toMatchObject({ status: 409 });
});

test('key includes order: same edition in another delivered order gets its own review, units and exchanges do not add rights', async () => {
  const order = purchase(customer, randomUUID(), 2), first = await reviews.create(customer.accessToken, editionId, order, draft());
  await expect(reviews.create(customer.accessToken, editionId, order, draft())).rejects.toMatchObject({ status: 409 });
  const second = await create(); expect(second.id).not.toBe(first.id); expect(await db.review.count({ where: { userId: customer.user.id, editionId, orderId: order } })).toBe(1);
});

test('public views omit purchase, email, actor IDs and moderation history; averages exclude hidden reviews', async () => {
  const row = await create(another, 1), before = await reviews.publicList(editionId);
  const publicRow = before.items.find(item => item.id === row.id)!; expect(publicRow).toBeDefined();
  expect(publicRow).not.toHaveProperty('orderId'); expect(publicRow).not.toHaveProperty('userId'); expect(publicRow).not.toHaveProperty('email'); expect(publicRow).not.toHaveProperty('hiddenReason');
  const hidden = await reviews.moderate(operator.accessToken, row.id, row.version, 'Conteúdo sob análise', false); expect(hidden.visibility).toBe('HIDDEN');
  const after = await reviews.publicList(editionId); expect(after.total).toBe(before.total - 1); expect(after.items.some(item => item.id === row.id)).toBe(false);
  const actual = await db.review.aggregate({ where: { editionId, visibility: 'PUBLIC' }, _avg: { rating: true } }); expect(after.summary.average).toBe(Math.round(actual._avg.rating! * 10) / 10);
});

test('editing hidden content remains hidden awaiting analysis and explicit release revalidates the current revision', async () => {
  const row = await create(), hidden = await reviews.moderate(admin.accessToken, row.id, row.version, 'Motivo original', false);
  const edited = await reviews.edit(customer.accessToken, row.id, hidden.version, draft(4, 'Comentário revisado pelo autor.')); expect(edited.visibility).toBe('HIDDEN'); expect(edited.awaitingModeration).toBe(true); expect(edited.hiddenReason).toBe('Motivo original');
  await expect(reviews.moderate(operator.accessToken, row.id, hidden.version, 'Liberar revisão antiga', true)).rejects.toMatchObject({ status: 409 });
  const released = await reviews.moderate(operator.accessToken, row.id, edited.version, 'Revisão atual conferida', true); expect(released.visibility).toBe('PUBLIC'); expect(released.awaitingModeration).toBe(false);
  const history = await reviews.history(admin.accessToken, row.id); expect(history.items.map(item => item.action)).toEqual(['CREATED', 'HIDDEN', 'EDITED', 'RELEASED']); expect(history.items[0]!.comment).toBe(row.comment);
});

test('fully returned purchase cannot create, edit or release; partial retention remains eligible', async () => {
  const row = await create(), hidden = await reviews.moderate(operator.accessToken, row.id, row.version, 'Análise da compra', false);
  const key = { userId: customer.user.id, editionId, orderId: row.orderId }; purchases.set(key, { status: 'KNOWN', delivered: true, retainedUnits: 0 });
  await expect(reviews.edit(customer.accessToken, row.id, hidden.version, draft())).rejects.toMatchObject({ status: 403 });
  await expect(reviews.moderate(admin.accessToken, row.id, hidden.version, 'Não pode liberar devolvida', true)).rejects.toMatchObject({ status: 403 });
  await expect(reviews.create(customer.accessToken, editionId, row.orderId, draft())).rejects.toMatchObject({ status: 403 });
  purchases.set(key, { status: 'KNOWN', delivered: true, retainedUnits: 1 }); expect((await reviews.edit(customer.accessToken, row.id, hidden.version, draft(3))).visibility).toBe('HIDDEN');
});

test('server enforces HTTPS, CSRF, ownership, role, mobile staff restriction, schema and unsupported deletion', async () => {
  const row = await create(), path = '/editions/' + editionId + '/reviews';
  expect((await server.call(path, 'GET', undefined, {}, true)).status).toBe(403);
  expect((await server.call(path, 'POST', { orderId: purchase(), ...draft() }, { ...credentials(customer), 'X-CSRF-Token': '' })).status).toBe(403);
  expect((await server.call('/me/reviews/' + row.id, 'PATCH', { revision: row.version, ...draft() }, credentials(another))).status).toBe(404);
  expect((await server.call('/admin/reviews', 'GET', undefined, credentials(customer))).status).toBe(403);
  expect((await server.call('/admin/reviews', 'GET', undefined, credentials(operator))).status).toBe(200);
  expect((await server.call(path, 'POST', { orderId: purchase(), ...draft(6) }, credentials(customer))).status).toBe(422);
  expect((await server.call('/me/reviews/' + row.id, 'DELETE', undefined, credentials(customer))).status).toBe(404);
  expect((await server.call('/admin/reviews', 'GET', undefined, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + operator.accessToken })).status).toBe(403);
  const mobile = await accounts.login(customer.user.email, password, 'mobile');
  expect((await server.call('/me/reviews', 'GET', undefined, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + mobile.accessToken })).status).toBe(200);
  expect((await server.call('/me/reviews', 'GET', undefined, { ...credentials(customer), 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + mobile.accessToken })).status).toBe(422);
});

test('concurrent creation for the same logical purchase produces only one review and initial revision', async () => {
  const orderId = purchase(), results = await Promise.allSettled([reviews.create(customer.accessToken, editionId, orderId, draft()), second.create(customer.accessToken, editionId, orderId, draft())]);
  expect(results.filter(value => value.status === 'fulfilled')).toHaveLength(1);
  const failure = results.find(value => value.status === 'rejected'); expect(failure?.status === 'rejected' && failure.reason).toMatchObject({ status: 409 });
  const row = await db.review.findUniqueOrThrow({ where: { userId_editionId_orderId: { userId: customer.user.id, editionId, orderId } } }); expect(await db.reviewRevision.count({ where: { reviewId: row.id } })).toBe(1);
});

test('two real edit transactions overlap under a third-client lock; exactly one current revision wins', async () => {
  const row = await create(); await control.query('BEGIN'); await control.query('SELECT id FROM "Review" WHERE id = $1 FOR UPDATE', [row.id]);
  const first = reviews.edit(customer.accessToken, row.id, row.version, draft(2)), next = second.edit(customer.accessToken, row.id, row.version, draft(3));
  const settled = Promise.allSettled([first, next]); let overlap = false;
  try {
    for (let i = 0; i < 100; i++) { const result = await control.query("SELECT count(*)::int AS n FROM pg_stat_activity WHERE application_name IN ('TASK013_A','TASK013_B') AND wait_event_type = 'Lock'"); if (result.rows[0].n >= 2) { overlap = true; break; } await new Promise(resolve => setTimeout(resolve, 20)); }
  } finally { await control.query('ROLLBACK'); }
  const results = await settled; expect(overlap).toBe(true); expect(results.filter(value => value.status === 'fulfilled')).toHaveLength(1);
  const failure = results.find(value => value.status === 'rejected'); expect(failure?.status === 'rejected' && failure.reason).toMatchObject({ status: 409 });
  expect(await db.reviewRevision.count({ where: { reviewId: row.id } })).toBe(2);
});

test('revision rows are immutable in PostgreSQL and a failed history write rolls back the review itself', async () => {
  const row = await create();
  await expect(db.reviewRevision.updateMany({ where: { reviewId: row.id }, data: { comment: 'Tentativa de reescrever histórico' } })).rejects.toThrow();
  await expect(db.reviewRevision.deleteMany({ where: { reviewId: row.id } })).rejects.toThrow();
  await control.query(`CREATE FUNCTION fail_review_snapshot_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'isolated snapshot failure'; END $$`);
  await control.query('CREATE TRIGGER fail_review_snapshot_test BEFORE INSERT ON "ReviewRevision" FOR EACH ROW EXECUTE FUNCTION fail_review_snapshot_test()');
  try { await expect(reviews.edit(customer.accessToken, row.id, row.version, draft(1, 'Não deve persistir'))).rejects.toThrow(); }
  finally { await control.query('DROP TRIGGER fail_review_snapshot_test ON "ReviewRevision"'); await control.query('DROP FUNCTION fail_review_snapshot_test()'); }
  expect((await db.review.findUniqueOrThrow({ where: { id: row.id } })).comment).toBe(row.comment);
  expect(await db.reviewRevision.count({ where: { reviewId: row.id } })).toBe(1);
});

test('public HTTP contract paginates visible reviews without private purchase fields', async () => {
  const response = await server.call<PublicReviewPage>('/editions/' + editionId + '/reviews?pageSize=1'); expect(response.status).toBe(200); expect(response.body.items).toHaveLength(1); expect(response.body.summary.count).toBe(response.body.total);
  expect(JSON.stringify(response.body)).not.toContain('orderId'); expect(JSON.stringify(response.body)).not.toContain(customer.user.email);
  const own = await server.call<{ items: PrivateReview[] }>('/me/reviews?pageSize=100', 'GET', undefined, credentials(customer)); expect(own.status).toBe(200); expect(own.body.items.every(item => item.orderId)).toBe(true);
});
