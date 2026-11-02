import { afterAll, beforeAll, expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';
import type { CatalogEdition, CatalogOffer, CatalogMetadata, StockPage, StockAdjustmentResult } from '@garimpo/contracts';
import { createDatabase } from '../../apps/api/src/persistence/client.ts';
import type { Database } from '../../apps/api/src/persistence/client.ts';
import { Accounts } from '../../apps/api/src/modules/accounts/service.ts';
import type { SessionBundle } from '../../apps/api/src/modules/accounts/service.ts';
import { firstAdmin, createStaff } from '../../apps/api/src/modules/accounts/staff/service.ts';
import { Catalog } from '../../apps/api/src/modules/catalog/service.ts';
import type { CommercialBindings, CommercialSnapshot } from '../../apps/api/src/modules/catalog/lifecycle.ts';
import { Inventory } from '../../apps/api/src/modules/inventory/service.ts';
import { PublicImageStore } from '../../apps/api/src/modules/media/store.ts';
import { openCatalogServer, web } from '../catalog/http.ts';

const password = 'Uma frase longa para o estoque!';
const clock = { now: () => new Date('2026-11-02T04:00:00Z') };
let db: Database, other: Database, control: Client, accounts: Accounts, server: Awaited<ReturnType<typeof openCatalogServer>>, closed: Awaited<ReturnType<typeof openCatalogServer>>;
let admin: SessionBundle, operator: SessionBundle, customer: SessionBundle, first: Inventory, second: Inventory;
// Explicit isolated commercial scenarios, never a runtime fallback or environment bypass.
const snapshots = new Map<string, CommercialSnapshot>();
const bindings: CommercialBindings = { async inspect(_tx, editionId, ids) {
  return snapshots.get(editionId) ?? { status: 'KNOWN', hasHistory: false, offers: Object.fromEntries(ids.map(id => [id, { reservedQuantity: 0, protectedQuantity: 0 }])) };
} };
const headers = (bundle = admin) => web({ cookie: `__Host-garimpo-access=${bundle.accessToken}; __Host-garimpo-refresh=${bundle.refreshToken}; __Host-garimpo-csrf=${bundle.csrfToken}`, csrf: bundle.csrfToken });
async function edition() {
  const meta = async (type: 'artist' | 'genre') => (await server.call<CatalogMetadata>('/admin/catalog-metadata', 'POST', { type, name: randomUUID() }, headers())).body;
  const artist = await meta('artist'), genre = await meta('genre');
  const result = await server.call<CatalogEdition>('/admin/editions', 'POST', { title: randomUUID(), artistIds: [artist.id], genreIds: [genre.id], primaryGenreId: genre.id, format: 'LP' }, headers());
  expect(result.status).toBe(201); return result.body;
}
async function offer(editionId: string, stock = 3, kind = 'NEW', key = randomUUID()) {
  const result = await server.call<CatalogOffer>(`/admin/editions/${editionId}/offers`, 'POST', { kind, priceCents: 5000, stockOnHand: stock }, { ...headers(), 'Idempotency-Key': key });
  expect(result.status).toBe(201); return result.body;
}
const adjust = (id: string, delta: number, key = randomUUID(), bundle = admin) => server.call<StockAdjustmentResult>('/admin/offers/' + id + '/stock-adjustments', 'POST', { delta, reason: 'Conferência sintética' }, { ...headers(bundle), 'Idempotency-Key': key });
const list = (id: string, instance = server) => instance.call<StockPage>('/admin/stock?editionId=' + id, 'GET', undefined, headers());
beforeAll(async () => {
  const value = process.env.TEST_DATABASE_URL; if (!value) throw new Error('Separate test database required.');
  const url = new URL(value), schema = url.searchParams.get('schema');
  if (url.pathname !== '/garimpo_test' || !schema || !/^task009_[a-f0-9]{32}$/.test(schema)) throw new Error('Isolated TASK009 schema required.');
  url.searchParams.set('application_name', 'TASK009_A'); db = createDatabase(url.href);
  url.searchParams.set('application_name', 'TASK009_B'); other = createDatabase(url.href);
  accounts = new Accounts(db, clock); const email = randomUUID() + '@example.invalid';
  await firstAdmin(accounts, { name: 'Admin de estoque', email, password }); admin = await accounts.login(email, password, 'web');
  const operatorEmail = randomUUID() + '@example.invalid', customerEmail = randomUUID() + '@example.invalid';
  await createStaff(accounts, admin.accessToken, { name: 'Operador de estoque', email: operatorEmail, password, role: 'OPERATOR' }); operator = await accounts.login(operatorEmail, password, 'web');
  await accounts.register({ name: 'Cliente sintético', email: customerEmail, password }); customer = await accounts.login(customerEmail, password, 'web');
  const mediaRoot = await mkdtemp(join(tmpdir(), 'garimpo-inventory-'));
  server = await openCatalogServer({ db, clock, mediaRoot, commercialBindings: bindings }); closed = await openCatalogServer({ db, clock, mediaRoot });
  first = new Inventory(new Catalog(accounts, new PublicImageStore(mediaRoot), bindings));
  second = new Inventory(new Catalog(new Accounts(other, clock), new PublicImageStore(mediaRoot), bindings));
  control = new Client({ connectionString: value }); await control.connect(); await control.query(`SET search_path TO "${schema}"`);
});
afterAll(async () => { await Promise.all([server?.close(), closed?.close()]); await control?.end(); await Promise.all([db?.$disconnect(), other?.$disconnect()]); });

test('stock transport enforces staff, web-only, TLS, origin and session-bound CSRF', async () => {
  const row = await edition(), item = await offer(row.id);
  expect((await server.call('/admin/stock')).status).toBe(401);
  expect((await server.call('/admin/stock', 'GET', undefined, headers(customer))).status).toBe(403);
  expect((await server.call('/admin/stock', 'GET', undefined, { ...headers(), 'X-Garimpo-Client': 'mobile' })).status).toBe(403);
  expect((await server.call('/admin/stock', 'GET', undefined, headers(), true)).status).toBe(403);
  const path = '/admin/offers/' + item.id + '/stock-adjustments';
  expect((await server.call(path, 'POST', { delta: 1, reason: 'Entrada' }, { ...headers(), Origin: 'https://evil.invalid', 'Idempotency-Key': randomUUID() })).status).toBe(403);
  expect((await server.call(path, 'POST', { delta: 1, reason: 'Entrada' }, { ...headers(), 'X-CSRF-Token': operator.csrfToken, 'Idempotency-Key': randomUUID() })).status).toBe(403);
  expect((await adjust(item.id, 1, randomUUID(), operator)).status).toBe(201);
});
test('opening stock and replay have exactly one ledger entry and event', async () => {
  const row = await edition(), key = randomUUID(), item = await offer(row.id, 3, 'NEW', key);
  expect((await offer(row.id, 3, 'NEW', key)).id).toBe(item.id);
  expect(await db.stockMovement.findMany({ where: { offerId: item.id } })).toMatchObject([{ deltaOnHand: 3, balanceBefore: 0, balanceAfter: 3, actorId: admin.user.id }]);
  expect(await db.domainEvent.count({ where: { aggregateId: item.id, type: 'INVENTORY.STOCK_CHANGED' } })).toBe(1);
  const zero = await offer(row.id, 0); expect(await db.stockMovement.count({ where: { offerId: zero.id } })).toBe(0);
});
test('adjustments atomically keep ledger, audit, event and quantity, with idempotent replay and conflict', async () => {
  const row = await edition(), item = await offer(row.id), key = randomUUID();
  const result = await adjust(item.id, 2, key); expect(result.status).toBe(201); expect(result.body.stockOnHand).toBe(5);
  expect((await adjust(item.id, 2, key)).body.movement.id).toBe(result.body.movement.id);
  expect((await adjust(item.id, 3, key)).status).toBe(409);
  expect(await db.stockMovement.count({ where: { offerId: item.id } })).toBe(2);
  expect(await db.auditLog.count({ where: { targetId: item.id, action: 'INVENTORY.ADJUSTED' } })).toBe(1);
  expect(await db.domainEvent.count({ where: { aggregateId: item.id, type: 'INVENTORY.STOCK_CHANGED' } })).toBe(2);
  expect((await adjust(item.id, -5)).body.stockOnHand).toBe(0);
});
test('reserved and committed quantities prevent destructive reductions without leaving any effect', async () => {
  const row = await edition(), item = await offer(row.id);
  snapshots.set(row.id, { status: 'KNOWN', hasHistory: true, offers: { [item.id]: { reservedQuantity: 1, protectedQuantity: 2 } } });
  expect((await adjust(item.id, -2)).status).toBe(409);
  expect((await db.offer.findUniqueOrThrow({ where: { id: item.id } })).stockOnHand).toBe(3);
  expect(await db.stockMovement.count({ where: { offerId: item.id } })).toBe(1);
  expect(await db.auditLog.count({ where: { targetId: item.id, action: 'INVENTORY.ADJUSTED' } })).toBe(0);
  expect((await adjust(item.id, -1)).body.stockOnHand).toBe(2);
});
test('failure to enqueue rolls back quantity, ledger and audit together', async () => {
  const row = await edition(), item = await offer(row.id);
  await control.query('ALTER TABLE "DomainEvent" ADD CONSTRAINT task009_reject_effect CHECK (type <> \'INVENTORY.STOCK_CHANGED\') NOT VALID');
  try { expect((await adjust(item.id, 2)).status).toBeGreaterThanOrEqual(500); }
  finally { await control.query('ALTER TABLE "DomainEvent" DROP CONSTRAINT task009_reject_effect'); }
  expect((await db.offer.findUniqueOrThrow({ where: { id: item.id } })).stockOnHand).toBe(3);
  expect(await db.stockMovement.count({ where: { offerId: item.id } })).toBe(1);
  expect(await db.auditLog.count({ where: { targetId: item.id, action: 'INVENTORY.ADJUSTED' } })).toBe(0);
});
test('default runtime adapter preserves unknown balances, blocks reduction/deletion and allows safe addition/inactivation', async () => {
  const row = await edition(), item = await offer(row.id);
  await db.edition.update({ where: { id: row.id }, data: { active: true } }); await db.offer.update({ where: { id: item.id }, data: { active: true } });
  const panel = await list(row.id, closed); expect(panel.status).toBe(200);
  expect(panel.body.items[0]).toMatchObject({ bindingsStatus: 'UNAVAILABLE', newAvailable: null, lowStockNew: null, offers: [{ reservedQuantity: null, availableQuantity: null }] });
  const path = '/admin/offers/' + item.id;
  expect((await closed.call(path + '/stock-adjustments', 'POST', { delta: -1, reason: 'Avaria' }, { ...headers(), 'Idempotency-Key': randomUUID() })).status).toBe(503);
  expect((await closed.call(path, 'DELETE', undefined, headers())).status).toBe(503);
  expect((await closed.call(path + '/stock-adjustments', 'POST', { delta: 1, reason: 'Entrada' }, { ...headers(), 'Idempotency-Key': randomUUID() })).status).toBe(201);
  expect((await closed.call(path + '/inactivate', 'POST', { reason: 'Suspender venda' }, headers())).status).toBe(200);
});
test('used stock stays individual, negative balances and malformed input cannot write', async () => {
  const row = await edition(), item = await offer(row.id, 1, 'USED');
  expect((await adjust(item.id, 1)).status).toBe(422); expect((await adjust(item.id, -2)).status).toBe(409);
  expect((await adjust(item.id, -1)).body.stockOnHand).toBe(0); expect((await adjust(item.id, 1)).body.stockOnHand).toBe(1);
  for (const payload of [{ delta: 0, reason: 'Zero' }, { delta: 0.5, reason: 'Fração' }, { delta: 1, reason: '' }, { delta: 1, reason: 'Texto\0' }, { delta: 1, reason: 'Bypass', protectedQuantity: 0 }]) {
    expect((await server.call('/admin/offers/' + item.id + '/stock-adjustments', 'POST', payload, { ...headers(), 'Idempotency-Key': randomUUID() })).status).toBe(422);
  }
});
test('dashboard aggregates used copies by edition, thresholds use availability, and warnings send no messages', async () => {
  const row = await edition(), fresh = await offer(row.id, 5), usedA = await offer(row.id, 1, 'USED'), usedB = await offer(row.id, 1, 'USED');
  await db.edition.update({ where: { id: row.id }, data: { active: true } }); await db.offer.updateMany({ where: { editionId: row.id }, data: { active: true } });
  snapshots.set(row.id, { status: 'KNOWN', hasHistory: true, offers: { [fresh.id]: { reservedQuantity: 1, protectedQuantity: 3 }, [usedA.id]: { reservedQuantity: 1, protectedQuantity: 1 }, [usedB.id]: { reservedQuantity: 0, protectedQuantity: 0 } } });
  const before = await db.domainEvent.count(), messages = await db.demoMessage.count();
  expect((await server.call('/admin/editions/' + row.id + '/low-stock', 'PATCH', { lowStockNewThreshold: 2 }, headers(operator))).status).toBe(200);
  const panel = (await list(row.id)).body.items[0]!;
  expect(panel).toMatchObject({ newPhysical: 5, newAvailable: 2, lowStockNew: true, usedPhysical: 2, usedAvailable: 1, lowStockUsed: false });
  expect(await db.domainEvent.count()).toBe(before); expect(await db.demoMessage.count()).toBe(messages);
  expect((await server.call('/admin/stock?editionId=' + row.id + '&lowStock=true', 'GET', undefined, headers())).body).toHaveProperty('total', 1);
});
test('commercial history protects deletion even with zero current quantity; inactivation retains records', async () => {
  const row = await edition(), item = await offer(row.id, 0);
  snapshots.set(row.id, { status: 'KNOWN', hasHistory: true, offers: { [item.id]: { reservedQuantity: 0, protectedQuantity: 0 } } });
  expect((await server.call('/admin/offers/' + item.id, 'DELETE', undefined, headers())).status).toBe(409);
  expect((await server.call('/admin/editions/' + row.id, 'DELETE', undefined, headers())).status).toBe(409);
  expect((await server.call('/admin/editions/' + row.id + '/inactivate', 'POST', { reason: 'Histórico preservado' }, headers())).status).toBe(200);
  expect(await db.offer.findUnique({ where: { id: item.id } })).not.toBeNull();
});
async function overlap(editionId: string, one: () => Promise<unknown>, two: () => Promise<unknown>) {
  await control.query('BEGIN'); await control.query('SELECT id FROM "Edition" WHERE id=$1 FOR UPDATE', [editionId]);
  const results = Promise.allSettled([one(), two()]); let simultaneous = false;
  try {
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline) {
      await control.query('SELECT pg_stat_clear_snapshot()');
      const result = await control.query<{ count: string }>("SELECT count(DISTINCT application_name)::text count FROM pg_stat_activity WHERE application_name IN ('TASK009_A','TASK009_B') AND state='active' AND wait_event_type='Lock'");
      if (result.rows[0]?.count === '2') { simultaneous = true; break; }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  } finally { await control.query('COMMIT'); }
  const completed = await results; expect(simultaneous).toBe(true); return completed;
}
test('two truly overlapping losses cannot consume the same physical unit', async () => {
  const row = await edition(), item = await offer(row.id, 1, 'USED');
  const results = await overlap(row.id, () => first.adjust(admin.accessToken, item.id, -1, 'Perda A', randomUUID()), () => second.adjust(admin.accessToken, item.id, -1, 'Perda B', randomUUID()));
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
  expect((await db.offer.findUniqueOrThrow({ where: { id: item.id } })).stockOnHand).toBe(0);
  expect(await db.stockMovement.count({ where: { offerId: item.id } })).toBe(2);
});
test('concurrent retry of the same addition records one effect across independent clients', async () => {
  const row = await edition(), item = await offer(row.id, 0), key = randomUUID();
  const results = await overlap(row.id, () => first.adjust(admin.accessToken, item.id, 2, 'Entrada', key), () => second.adjust(admin.accessToken, item.id, 2, 'Entrada', key));
  expect(results.every(result => result.status === 'fulfilled')).toBe(true);
  expect((await db.offer.findUniqueOrThrow({ where: { id: item.id } })).stockOnHand).toBe(2);
  expect(await db.stockMovement.count({ where: { offerId: item.id } })).toBe(1);
});
