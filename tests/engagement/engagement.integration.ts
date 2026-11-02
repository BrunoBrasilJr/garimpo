import { afterAll, beforeAll, expect, test } from 'vitest';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { Client } from 'pg';
import { createDatabase } from '../../apps/api/src/persistence/client.ts';
import type { Database } from '../../apps/api/src/persistence/client.ts';
import { Accounts } from '../../apps/api/src/modules/accounts/service.ts';
import type { SessionBundle } from '../../apps/api/src/modules/accounts/service.ts';
import { firstAdmin } from '../../apps/api/src/modules/accounts/staff/service.ts';
import { Catalog } from '../../apps/api/src/modules/catalog/service.ts';
import { Inventory } from '../../apps/api/src/modules/inventory/service.ts';
import { PublicImageStore } from '../../apps/api/src/modules/media/store.ts';
import { Engagement } from '../../apps/api/src/modules/engagement/service.ts';
import { availability, availabilityReturned } from '../../apps/api/src/modules/engagement/availability.ts';
import { AccessMessages } from '../../apps/api/src/modules/messaging/service.ts';
import { MessageProtection } from '../../apps/api/src/modules/messaging/protection.ts';
import { consumeAvailability, deliverAvailability } from '../../apps/api/src/modules/messaging/availability.ts';
import { deliverNext } from '../../apps/api/src/modules/messaging/worker.ts';
import { openCatalogServer, web } from '../catalog/http.ts';
import { isolatedNoCommercialBindings } from '../inventory/fixtures.ts';

let db: Database, other: Database, accounts: Accounts, engagement: Engagement, second: Engagement, catalog: Catalog, inventory: Inventory, messages: AccessMessages, otherMessages: AccessMessages;
let admin: SessionBundle, customer: SessionBundle, another: SessionBundle, server: Awaited<ReturnType<typeof openCatalogServer>>, png: Buffer, control: Client;
const password = 'Uma frase segura e longa para desejos!', clock = { now: () => new Date('2026-11-02T16:00:00Z') };
const credentials = (session: SessionBundle) => web({ cookie: `__Host-garimpo-access=${session.accessToken}; __Host-garimpo-refresh=${session.refreshToken}; __Host-garimpo-csrf=${session.csrfToken}`, csrf: session.csrfToken });
async function edition() {
  const artist = await catalog.changeMetadata(admin.accessToken, 'artist', 'Artista ' + randomUUID()), genre = await catalog.changeMetadata(admin.accessToken, 'genre', 'Genero ' + randomUUID());
  const draft = await catalog.createEdition(admin.accessToken, { title: 'Desejo ' + randomUUID(), format: 'LP', artistIds: [artist.id], genreIds: [genre.id], primaryGenreId: genre.id, active: false });
  await catalog.upload(admin.accessToken, 'edition', draft.id, png, 'image/png', 'Capa sintética');
  await catalog.updateEdition(admin.accessToken, draft.id, { active: true });
  const offer = await catalog.createOffer(admin.accessToken, draft.id, { kind: 'NEW', priceCents: 5000, stockOnHand: 0, active: true }, randomUUID());
  return { id: draft.id, offer: offer.id };
}
async function drain() { for (let i = 0; i < 100; i++) if (await consumeAvailability(messages) === 'EMPTY') break; }
beforeAll(async () => {
  const value = process.env.TEST_DATABASE_URL; if (!value) throw new Error('Separate test database required.');
  const url = new URL(value); if (url.pathname !== '/garimpo_test' || !/^task012_[a-f0-9]{32}$/.test(url.searchParams.get('schema') ?? '')) throw new Error('Only isolated TASK-012 schema accepted.');
  url.searchParams.set('application_name', 'TASK012_A'); db = createDatabase(url.href);
  url.searchParams.set('application_name', 'TASK012_B'); other = createDatabase(url.href);
  accounts = new Accounts(db, clock); engagement = new Engagement(accounts); second = new Engagement(new Accounts(other, clock));
  const adminEmail = randomUUID() + '@example.invalid'; await firstAdmin(accounts, { name: 'Admin sintético', email: adminEmail, password }); admin = await accounts.login(adminEmail, password);
  const first = randomUUID() + '@example.invalid', next = randomUUID() + '@example.invalid';
  await accounts.register({ name: 'Cliente um', email: first, password }); await accounts.register({ name: 'Cliente dois', email: next, password });
  customer = await accounts.login(first, password); another = await accounts.login(next, password);
  const root = await mkdtemp(join(tmpdir(), 'garimpo-engagement-'));
  catalog = new Catalog(accounts, new PublicImageStore(root), isolatedNoCommercialBindings); inventory = new Inventory(catalog);
  const protection = new MessageProtection(randomBytes(32).toString('hex'), randomBytes(32).toString('base64url'));
  messages = new AccessMessages(accounts, protection, 'https://localhost:5173'); otherMessages = new AccessMessages(new Accounts(other, clock), protection, 'https://localhost:5173');
  server = await openCatalogServer({ db, clock, mediaRoot: root, commercialBindings: isolatedNoCommercialBindings });
  png = await sharp({ create: { width: 4, height: 4, channels: 3, background: 'green' } }).png().toBuffer();
  control = new Client({ connectionString: value }); await control.connect(); await control.query(`SET search_path TO "${url.searchParams.get('schema')}"`);
});
afterAll(async () => { await server?.close(); await control?.end(); await Promise.all([db?.$disconnect(), other?.$disconnect()]); });

test('concurrent wishes are idempotent, private, and never reserve stock or subscribe an alert', async () => {
  const item = await edition();
  const [a, b] = await Promise.all([engagement.wish(customer.accessToken, item.id), second.wish(customer.accessToken, item.id)]);
  expect(a?.id).toBe(b?.id); expect(await db.wishlistEntry.count({ where: { editionId: item.id } })).toBe(1);
  expect(await db.availabilityAlert.count({ where: { editionId: item.id } })).toBe(0); expect((await db.offer.findUniqueOrThrow({ where: { id: item.offer } })).stockOnHand).toBe(0);
  expect((await engagement.wishes(another.accessToken)).items).toHaveLength(0);
  await engagement.wish(customer.accessToken, item.id, true); await engagement.wish(customer.accessToken, item.id, true);
  expect((await engagement.wishes(customer.accessToken)).items.some(row => row.edition.id === item.id)).toBe(false);
});

test('real HTTPS endpoints enforce CUSTOMER, origin, CSRF, ownership, payloads and pagination', async () => {
  const item = await edition(), path = '/me/wishlist/' + item.id;
  expect((await server.call(path, 'PUT', {}, credentials(customer), true)).status).toBe(403);
  expect((await server.call(path, 'PUT', {}, { ...credentials(customer), 'X-CSRF-Token': '' })).status).toBe(403);
  expect((await server.call(path, 'PUT', {}, { ...credentials(customer), Origin: 'https://evil.invalid' })).status).toBe(403);
  expect((await server.call('/me/wishlist')).status).toBe(401);
  expect((await server.call(path, 'PUT', {}, credentials(admin))).status).toBe(403);
  expect((await server.call(path, 'PUT', { userId: another.user.id }, credentials(customer))).status).toBe(422);
  expect((await server.call(path, 'PUT', {}, credentials(customer))).status).toBe(200);
  expect((await server.call('/me/wishlist?pageSize=101', 'GET', undefined, credentials(customer))).status).toBe(422);
  expect((await server.call('/me/availability-alerts', 'POST', { editionId: item.id, kind: 'VG+' }, credentials(customer))).status).toBe(422);
  const alert = await engagement.subscribe(customer.accessToken, item.id, 'NEW');
  expect((await server.call('/me/availability-alerts/' + alert.id, 'DELETE', undefined, credentials(another))).status).toBe(404);
  const mobile = await accounts.login(customer.user.email, password, 'mobile');
  expect((await server.call('/me/wishlist', 'GET', undefined, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + mobile.accessToken })).status).toBe(200);
  expect((await server.call('/me/wishlist', 'GET', undefined, { ...credentials(customer), 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + mobile.accessToken })).status).toBe(422);
  await engagement.cancel(customer.accessToken, alert.id);
});

test('all compatible activations receive one protected message, failures retain ACTIVE and retries close atomically', async () => {
  const item = await edition(), ids = [];
  ids.push((await engagement.subscribe(customer.accessToken, item.id, 'NEW')).id, (await engagement.subscribe(another.accessToken, item.id, 'ANY')).id);
  const used = await engagement.subscribe(customer.accessToken, item.id, 'USED');
  await expect(engagement.subscribe(customer.accessToken, item.id, 'NEW')).rejects.toMatchObject({ status: 409 });
  await inventory.adjust(admin.accessToken, item.offer, 1, 'Reposição sintética', randomUUID()); await drain();
  const queued = await db.demoMessage.findMany({ where: { availabilityAlertId: { in: ids } } }); expect(queued).toHaveLength(2);
  expect(await db.demoMessage.count({ where: { availabilityAlertId: used.id } })).toBe(0);
  for (const row of queued) { expect(row.restrictedBody).not.toContain(customer.user.email); const body = JSON.parse(messages.protection.open(row.id, row.restrictedBody)); expect(body.notice).toContain('sem reserva'); }
  expect(await deliverNext(messages)).toBe('EMPTY');
  expect(await deliverAvailability(messages, () => { throw new Error('Local failure'); })).toBe('FAILED');
  expect(await db.availabilityAlert.count({ where: { id: { in: ids }, status: 'ACTIVE' } })).toBe(2);
  expect(await deliverAvailability(messages)).toBe('DELIVERED'); expect(await deliverAvailability(messages)).toBe('DELIVERED');
  expect(await deliverAvailability(messages)).toBe('EMPTY'); expect(await db.availabilityAlert.count({ where: { id: { in: ids }, status: 'DELIVERED' } })).toBe(2);
  expect(await db.demoMessage.count({ where: { availabilityAlertId: { in: ids } } })).toBe(2);
  expect((await db.offer.findUniqueOrThrow({ where: { id: item.offer } })).stockOnHand).toBe(1);
  await engagement.cancel(customer.accessToken, used.id);
});

test('late subscriptions cannot receive an earlier event even with the same controlled timestamp; cancellation wins before delivery', async () => {
  const item = await edition(), old = await engagement.subscribe(customer.accessToken, item.id, 'ANY');
  await inventory.adjust(admin.accessToken, item.offer, 1, 'Reposição sintética', randomUUID());
  const late = await engagement.subscribe(another.accessToken, item.id, 'NEW'); await drain();
  expect(await db.demoMessage.count({ where: { availabilityAlertId: late.id } })).toBe(0);
  await engagement.cancel(customer.accessToken, old.id); expect(await deliverAvailability(messages)).toBe('EMPTY');
  expect((await db.demoMessage.findUniqueOrThrow({ where: { availabilityAlertId: old.id } })).status).toBe('PENDING');
  await engagement.cancel(another.accessToken, late.id);
});

test('only a zero-to-positive condition transition triggers; a new activation is required after successful delivery', async () => {
  const item = await edition(), first = await engagement.subscribe(customer.accessToken, item.id, 'NEW');
  await inventory.adjust(admin.accessToken, item.offer, 1, 'Primeira reposição', randomUUID()); await drain(); expect(await deliverAvailability(messages)).toBe('DELIVERED');
  const next = await engagement.subscribe(customer.accessToken, item.id, 'NEW'); expect(next.id).not.toBe(first.id);
  await inventory.adjust(admin.accessToken, item.offer, 1, 'Mais saldo sem retorno', randomUUID()); await drain();
  expect(await db.demoMessage.count({ where: { availabilityAlertId: next.id } })).toBe(0);
  await inventory.adjust(admin.accessToken, item.offer, -2, 'Saída física sintética', randomUUID());
  await inventory.adjust(admin.accessToken, item.offer, 1, 'Nova reposição', randomUUID()); await drain(); expect(await deliverAvailability(messages)).toBe('DELIVERED');
  expect(await db.demoMessage.count({ where: { availabilityAlertId: { in: [first.id, next.id] } } })).toBe(2);
});

test('stock, audience and outbox roll back together on transaction failure', async () => {
  const item = await edition(), alert = await engagement.subscribe(customer.accessToken, item.id, 'NEW');
  const count = await db.domainEvent.count({ where: { type: 'AVAILABILITY.RETURNED', aggregateId: item.id } });
  await expect(db.$transaction(async tx => {
    await tx.$queryRaw`SELECT id FROM "Edition" WHERE id = ${item.id}::uuid FOR UPDATE`;
    const before = await availability(tx, item.id); await tx.offer.update({ where: { id: item.offer }, data: { stockOnHand: 1 } });
    await availabilityReturned(tx, item.id, before, clock); throw new Error('Rollback requested');
  })).rejects.toThrow('Rollback requested');
  expect((await db.offer.findUniqueOrThrow({ where: { id: item.offer } })).stockOnHand).toBe(0);
  expect((await db.availabilityAlert.findUniqueOrThrow({ where: { id: alert.id } })).triggerEventId).toBeNull();
  expect(await db.domainEvent.count({ where: { type: 'AVAILABILITY.RETURNED', aggregateId: item.id } })).toBe(count);
  await engagement.cancel(customer.accessToken, alert.id);
});

test('two independent consumers cannot deliver twice while contending on an activation lock', async () => {
  const item = await edition(), alert = await engagement.subscribe(customer.accessToken, item.id, 'NEW');
  await inventory.adjust(admin.accessToken, item.offer, 1, 'Reposição concorrente', randomUUID()); await drain();
  await control.query('BEGIN'); await control.query('SELECT id FROM "AvailabilityAlert" WHERE id = $1 FOR UPDATE', [alert.id]);
  try { expect(await Promise.all([deliverAvailability(messages), deliverAvailability(otherMessages)])).toEqual(['EMPTY', 'EMPTY']); }
  finally { await control.query('ROLLBACK'); }
  const results = await Promise.all([deliverAvailability(messages), deliverAvailability(otherMessages)]);
  expect(results.filter(value => value === 'DELIVERED')).toHaveLength(1);
  expect((await db.demoMessage.findUniqueOrThrow({ where: { availabilityAlertId: alert.id } })).attempts).toBe(1);
});
