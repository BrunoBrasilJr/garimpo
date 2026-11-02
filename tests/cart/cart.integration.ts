import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';
import sharp from 'sharp';
import type { CartChange, CheckoutView } from '@garimpo/contracts';
import { createDatabase } from '../../apps/api/src/persistence/client.ts';
import type { Database } from '../../apps/api/src/persistence/client.ts';
import { Accounts } from '../../apps/api/src/modules/accounts/service.ts';
import type { SessionBundle } from '../../apps/api/src/modules/accounts/service.ts';
import { firstAdmin } from '../../apps/api/src/modules/accounts/staff/service.ts';
import { Catalog } from '../../apps/api/src/modules/catalog/service.ts';
import { Inventory } from '../../apps/api/src/modules/inventory/service.ts';
import { PublicImageStore } from '../../apps/api/src/modules/media/store.ts';
import { Carts } from '../../apps/api/src/modules/cart/service.ts';
import { Checkouts } from '../../apps/api/src/modules/checkout/service.ts';
import type { ReserveInput } from '../../apps/api/src/modules/checkout/service.ts';
import type { PendingOrders } from '../../apps/api/src/modules/checkout/pending-orders.ts';
import { unavailablePendingOrders } from '../../apps/api/src/modules/checkout/pending-orders.ts';
import { Pricing } from '../../apps/api/src/modules/pricing/service.ts';
import { expireReservations } from '../../apps/api/src/jobs/reservations.ts';
import { isolatedNoCommercialBindings } from '../inventory/fixtures.ts';
import { openCatalogServer, web } from '../catalog/http.ts';

const password = 'Uma frase longa e segura para reservar discos!', emails = Array.from({ length: 4 }, () => randomUUID() + '@example.invalid');
let current = Date.now(); const clock = { now: () => new Date(current) };
// Only the pending-order seam is synthetic, as explicitly staged by TASK-016. Stock, prices, holds and API are real.
const pending = new Map<string, number>(), pendingOrders: PendingOrders = { async inspect(_tx, userId) { return { status: 'KNOWN', count: pending.get(userId) ?? 0 }; } };
let db: Database, other: Database, accounts: Accounts, otherAccounts: Accounts, carts: Carts, checkout: Checkouts, second: Checkouts, catalog: Catalog, pricing: Pricing, control: Client;
let admin: SessionBundle, buyers: SessionBundle[], png: Buffer, artistId: string, genreId: string, mediaRoot: string;
let server: Awaited<ReturnType<typeof openCatalogServer>>, closed: Awaited<ReturnType<typeof openCatalogServer>>;
const credentials = (session: SessionBundle) => web({ cookie: `__Host-garimpo-access=${session.accessToken}; __Host-garimpo-refresh=${session.refreshToken}; __Host-garimpo-csrf=${session.csrfToken}`, csrf: session.csrfToken });
const period = () => ({ startsAt: new Date(current - 86400000).toISOString(), endsAt: new Date(current + 86400000).toISOString() });
async function offer(kind: 'NEW' | 'USED' = 'NEW', stock = 5, priceCents = 10000) {
  const edition = await catalog.createEdition(admin.accessToken, { title: 'Reserva ' + randomUUID(), format: 'LP', artistIds: [artistId], genreIds: [genreId], primaryGenreId: genreId });
  await catalog.upload(admin.accessToken, 'edition', edition.id, png, 'image/png', 'Capa de teste'); await catalog.updateEdition(admin.accessToken, edition.id, { active: true });
  let row = await catalog.createOffer(admin.accessToken, edition.id, kind === 'NEW' ? { kind, stockOnHand: stock, priceCents, active: true } : { kind, stockOnHand: stock, priceCents, discGrade: 'VG+', sleeveGrade: 'NM', particulars: 'Exemplar conferido individualmente', active: false }, randomUUID());
  if (kind === 'USED') { await catalog.upload(admin.accessToken, 'offer', row.id, png, 'image/png', 'Foto própria'); row = await catalog.updateOffer(admin.accessToken, row.id, { version: row.version, active: true }); }
  return { ...row, editionId: edition.id };
}
async function add(buyer: SessionBundle, offerId: string, quantity = 1) { const cart = await carts.read(buyer.accessToken); return (await carts.change(buyer.accessToken, { type: 'ADD', version: cart.version, offerId, quantity }, randomUUID())).cart; }
async function preview(buyer: SessionBundle, couponCode?: string): Promise<ReserveInput> {
  const cart = await carts.read(buyer.accessToken, couponCode); if (cart.pricing.status !== 'READY') throw new Error('Expected ready synthetic cart: ' + cart.pricing.code);
  return { version: cart.version, pricingRevision: cart.pricing.revision, ...(couponCode ? { couponCode } : {}) };
}
async function coupon(extra: { totalLimit?: number; perUserLimit?: number; amount?: number } = {}) {
  return pricing.createCoupon(admin.accessToken, { code: 'C' + randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase(), type: 'FIXED', amount: 1000, allowPromotional: true, ...period(), ...extra });
}
beforeAll(async () => {
  const value = process.env.TEST_DATABASE_URL; if (!value) throw new Error('Separate test database required.');
  const url = new URL(value), schema = url.searchParams.get('schema'); if (url.pathname !== '/garimpo_test' || !/^task016_[a-f0-9]{32}$/.test(schema ?? '')) throw new Error('Only isolated TASK-016 schema accepted.');
  url.searchParams.set('application_name', 'TASK016_A'); db = createDatabase(url.href); url.searchParams.set('application_name', 'TASK016_B'); other = createDatabase(url.href);
  accounts = new Accounts(db, clock); otherAccounts = new Accounts(other, clock); carts = new Carts(accounts); checkout = new Checkouts(accounts, pendingOrders); second = new Checkouts(otherAccounts, pendingOrders); pricing = new Pricing(accounts);
  await firstAdmin(accounts, { name: 'Admin sintético', email: emails[0]!, password }); admin = await accounts.login(emails[0]!, password); buyers = [];
  for (const email of emails.slice(1)) { await accounts.register({ name: 'Cliente sintético', email, password }); buyers.push(await accounts.login(email, password)); }
  mediaRoot = await mkdtemp(join(tmpdir(), 'garimpo-cart-')); catalog = new Catalog(accounts, new PublicImageStore(mediaRoot));
  artistId = (await catalog.changeMetadata(admin.accessToken, 'artist', 'Artista ' + randomUUID())).id; genreId = (await catalog.changeMetadata(admin.accessToken, 'genre', 'Gênero ' + randomUUID())).id;
  png = await sharp({ create: { width: 5, height: 5, channels: 3, background: 'gold' } }).png().toBuffer();
  server = await openCatalogServer({ db, clock, mediaRoot }, undefined, { db, clock, pendingOrders }); closed = await openCatalogServer({ db, clock, mediaRoot }, undefined, { db, clock, pendingOrders: unavailablePendingOrders });
  control = new Client({ connectionString: value }); await control.connect(); await control.query(`SET search_path TO "${schema}"`);
});
beforeEach(async () => {
  pending.clear();
  if (admin.accessExpiresAt.getTime() <= current) { admin = await accounts.login(emails[0]!, password); for (let i = 0; i < buyers.length; i++) buyers[i] = await accounts.login(emails[i + 1]!, password); }
  for (const buyer of buyers) await carts.change(buyer.accessToken, { type: 'CLEAR' });
});
afterAll(async () => { await Promise.all([server?.close(), closed?.close()]); await control?.end(); await Promise.all([db?.$disconnect(), other?.$disconnect()]); });

test('cart API enforces real HTTPS, CSRF/origin, customer ownership and separate mobile bearer credentials before input parsing', async () => {
  const buyer = buyers[0]!;
  expect((await server.call('/me/cart', 'GET', undefined, {}, true)).status).toBe(403);
  expect((await server.call('/me/cart', 'GET')).status).toBe(401);
  expect((await server.call('/me/cart', 'GET', undefined, { ...credentials(buyer), Origin: 'https://evil.invalid' })).status).toBe(403);
  expect((await server.call('/me/cart/items', 'POST', Buffer.from('{bad'), { ...credentials(admin), 'Content-Type': 'application/json' })).status).toBe(403);
  expect((await server.call('/me/cart/items', 'POST', {}, { ...credentials(buyer), 'X-CSRF-Token': '' })).status).toBe(403);
  expect((await server.call('/me/cart', 'GET', undefined, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + buyer.accessToken })).status).toBe(200);
  expect((await server.call('/me/cart', 'GET', undefined, { ...credentials(buyer), 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + buyer.accessToken })).status).toBe(422);
  expect((await server.call('/me/cart', 'GET', undefined, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + admin.accessToken })).status).toBe(403);
  expect((await server.call('/me/cart/items', 'POST', Buffer.from(JSON.stringify({ text: 'x'.repeat(33000) })), { ...credentials(buyer), 'Content-Type': 'application/json' })).status).toBe(422);
});
test('adding and editing a cart never reserve stock; ownership, stale revisions and physical single-copy quantity hold', async () => {
  const buyer = buyers[0]!, row = await offer(), used = await offer('USED', 1), before = await db.reservation.count();
  const userBefore = await db.user.findUniqueOrThrow({ where: { id: buyer.user.id } });
  const cart = await add(buyer, row.id, 2); expect(cart.items[0]).toMatchObject({ quantity: 2, availableQuantity: 5 }); expect(await db.reservation.count()).toBe(before);
  expect((await db.offer.findUniqueOrThrow({ where: { id: row.id } })).stockOnHand).toBe(5);
  const foreignCart = await carts.read(buyers[1]!.accessToken);
  expect((await server.call('/me/cart/items/' + cart.items[0]!.id, 'PATCH', { version: foreignCart.version, quantity: 3 }, credentials(buyers[1]!))).status).toBe(404);
  await carts.change(buyer.accessToken, { type: 'UPDATE', itemId: cart.items[0]!.id, version: cart.version, quantity: 3 });
  await expect(carts.change(buyer.accessToken, { type: 'UPDATE', itemId: cart.items[0]!.id, version: cart.version, quantity: 1 })).rejects.toMatchObject({ status: 409 });
  await add(buyer, used.id); await expect(add(buyer, used.id)).rejects.toMatchObject({ code: 'USED_QUANTITY' });
  expect(await db.user.findUniqueOrThrow({ where: { id: buyer.user.id } })).toEqual(userBefore);
});
test('guest merge sums new copies only to current capacity, deduplicates used copies, warns and replays without doubling', async () => {
  const buyer = buyers[0]!, fresh = await offer('NEW', 3), used = await offer('USED', 1), gone = await offer('NEW', 0); await add(buyer, fresh.id, 2);
  const cart = await carts.read(buyer.accessToken), body = { version: cart.version, items: [{ offerId: fresh.id, quantity: 6 }, { offerId: used.id, quantity: 1 }, { offerId: used.id, quantity: 1 }, { offerId: gone.id, quantity: 1 }] }, key = randomUUID(), headers = { ...credentials(buyer), 'Idempotency-Key': key };
  const first = await server.call<CartChange>('/me/cart/merge', 'POST', body, headers), replay = await server.call<CartChange>('/me/cart/merge', 'POST', body, headers);
  expect(first.status).toBe(200); expect(first.body.cart.items.map(item => [item.offerId, item.quantity]).sort()).toEqual([[fresh.id, 3], [used.id, 1]].sort()); expect(first.body.warnings).toHaveLength(3); expect(replay.body).toEqual(first.body);
  expect((await server.call('/me/cart/merge', 'POST', { ...body, items: [] }, headers)).status).toBe(409);
  expect(await db.reservation.count({ where: { status: 'ACTIVE' } })).toBe(0);
});
test('default runtime refuses checkout without the real pending-order adapter and cannot select a fixture from HTTP', async () => {
  const buyer = buyers[0]!, row = await offer(); await add(buyer, row.id); const value = await preview(buyer), headers = { ...credentials(buyer), 'Idempotency-Key': randomUUID() };
  expect((await closed.call('/checkouts', 'POST', value, headers)).status).toBe(503);
  expect((await closed.call('/checkouts', 'POST', { ...value, pendingCount: 0 }, headers)).status).toBe(422);
  pending.set(buyer.user.id, 3); await expect(checkout.reserve(buyer.accessToken, value, randomUUID())).rejects.toMatchObject({ code: 'PENDING_ORDER_LIMIT' });
  expect(await db.checkout.count({ where: { userId: buyer.user.id, status: 'ACTIVE' } })).toBe(0);
});
test('mobile POST reserves through real HTTPS, web GET resumes the same deadline and replay cannot duplicate holds', async () => {
  const buyer = buyers[0]!, row = await offer(); await add(buyer, row.id); const body = await preview(buyer), headers = { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + buyer.accessToken, 'Idempotency-Key': randomUUID() };
  const made = await server.call<CheckoutView>('/checkouts', 'POST', body, headers), replay = await server.call<CheckoutView>('/checkouts', 'POST', body, headers);
  expect(made.status).toBe(201); expect(replay.body.id).toBe(made.body.id); expect(made.cookie).toBe('');
  const webResume = await server.call<CheckoutView>('/me/checkout', 'GET', undefined, credentials(buyer)); expect(webResume.body.id).toBe(made.body.id); expect(webResume.body.expiresAt).toBe(made.body.expiresAt); expect(Date.parse(made.body.expiresAt) - Date.parse(made.body.createdAt)).toBe(900000);
  expect(await db.reservation.count({ where: { checkoutItem: { checkoutId: made.body.id } } })).toBe(1);
  expect((await server.call('/me/checkout', 'GET', undefined, credentials(buyers[1]!))).status).toBe(404);
});
test('checkout freezes promotion/coupon configuration and exact per-unit allocation, without inventing shipping or consumed usage', async () => {
  const buyer = buyers[0]!, row = await offer('NEW', 5, 101), discount = await coupon({ amount: 100 });
  await pricing.createPromotion(admin.accessToken, { name: 'Metade de teste', type: 'PERCENT', amount: 5000, offerIds: [row.id], ...period() }); await add(buyer, row.id, 3);
  const frozen = await checkout.reserve(buyer.accessToken, await preview(buyer, discount.code), randomUUID());
  expect(frozen.quote.totalCents).toBe(53); expect(frozen.quote.units.reduce((sum, unit) => sum + unit.couponDiscountCents, 0)).toBe(100); expect(frozen.quote.units.reduce((sum, unit) => sum + unit.netPriceCents, 0)).toBe(53);
  expect(frozen.products[0]!.unitIds).toEqual(frozen.quote.units.map(unit => unit.id)); expect(frozen.couponSnapshot).toMatchObject({ id: discount.id, amount: 100 }); expect(frozen.promotionSnapshots).toMatchObject([{ amount: 5000 }]);
  expect((await db.couponUsage.findUniqueOrThrow({ where: { checkoutId: frozen.id } })).status).toBe('RESERVED');
  await expect(db.checkout.update({ where: { id: frozen.id }, data: { quoteSnapshot: {} } })).rejects.toThrow();
});
test('real ledger counts consumed fixture history as well as current reservations for per-user and total coupon limits', async () => {
  const discount = await coupon({ totalLimit: 2, perUserLimit: 1 }), row = await offer(); await add(buyers[0]!, row.id); const history = await checkout.reserve(buyers[0]!.accessToken, await preview(buyers[0]!, discount.code), randomUUID());
  // Only fixture setup represents a future order's consumed state. No runtime order/payment producer exists in TASK-016.
  await db.$transaction(async tx => {
    await tx.couponUsage.update({ where: { checkoutId: history.id }, data: { status: 'CONSUMED' } });
    await tx.reservation.updateMany({ where: { checkoutItem: { checkoutId: history.id } }, data: { status: 'CONSUMED', releasedAt: clock.now() } });
    await tx.checkout.update({ where: { id: history.id }, data: { status: 'CONVERTED', closedAt: clock.now() } });
  });
  await expect(checkout.reserve(buyers[0]!.accessToken, await preview(buyers[0]!, discount.code), randomUUID())).rejects.toMatchObject({ code: 'COUPON_LIMIT_REACHED' });
  await add(buyers[1]!, (await offer()).id); await checkout.reserve(buyers[1]!.accessToken, await preview(buyers[1]!, discount.code), randomUUID());
  await add(buyers[2]!, (await offer()).id); await expect(checkout.reserve(buyers[2]!.accessToken, await preview(buyers[2]!, discount.code), randomUUID())).rejects.toMatchObject({ code: 'COUPON_LIMIT_REACHED' });
  expect(await db.couponUsage.count({ where: { couponId: discount.id, status: { in: ['CONSUMED', 'RESERVED'] } } })).toBe(2);
});
test('price changes require explicit current confirmation; successful checkout freezes exact prices and metadata without physical movement', async () => {
  const buyer = buyers[0]!, row = await offer(), initialStock = row.stockOnHand; await add(buyer, row.id); const old = await preview(buyer);
  const changed = await catalog.updateOffer(admin.accessToken, row.id, { version: row.version, priceCents: 12000 });
  await expect(checkout.reserve(buyer.accessToken, old, randomUUID())).rejects.toMatchObject({ code: 'PRICE_CONFIRMATION_REQUIRED' });
  const frozen = await checkout.reserve(buyer.accessToken, await preview(buyer), randomUUID()); expect(frozen.quote.totalCents).toBe(12000); expect(frozen.products[0]!.images[0]!.url).toMatch(/^\/api\/v1\/media\/products\//);
  await catalog.updateOffer(admin.accessToken, row.id, { version: changed.version, priceCents: 20000 });
  expect((await checkout.current(buyer.accessToken)).quote.totalCents).toBe(12000); expect((await db.offer.findUniqueOrThrow({ where: { id: row.id } })).stockOnHand).toBe(initialStock);
  await expect(db.checkout.update({ where: { id: frozen.id }, data: { expiresAt: new Date(Date.parse(frozen.expiresAt) + 1) } })).rejects.toThrow();
  await expect(db.checkoutItem.updateMany({ where: { checkoutId: frozen.id }, data: { quantity: 2 } })).rejects.toThrow();
});
test('one unavailable line aborts the whole reservation, with no partial checkout, coupon usage or physical movement', async () => {
  const buyer = buyers[0]!, first = await offer('NEW', 1), last = await offer('NEW', 1), discount = await coupon(); await add(buyer, first.id); await add(buyer, last.id); const value = await preview(buyer, discount.code), before = await db.checkout.count();
  await new Inventory(new Catalog(accounts, new PublicImageStore(mediaRoot), isolatedNoCommercialBindings)).adjust(admin.accessToken, last.id, -1, 'Perda antes de qualquer reserva', randomUUID());
  await expect(checkout.reserve(buyer.accessToken, value, randomUUID())).rejects.toMatchObject({ code: 'INSUFFICIENT_STOCK' });
  expect(await db.checkout.count()).toBe(before); expect(await db.couponUsage.count({ where: { couponId: discount.id } })).toBe(0); expect((await db.offer.findUniqueOrThrow({ where: { id: first.id } })).stockOnHand).toBe(1);
});
test('same cart and coupon resume the original checkout from another client, and every successful key retains its original result', async () => {
  const buyer = buyers[0]!, row = await offer(); await add(buyer, row.id); const value = await preview(buyer), key = randomUUID();
  const first = await checkout.reserve(buyer.accessToken, value, randomUUID()), resumed = await second.reserve(buyer.accessToken, value, key); expect(resumed.id).toBe(first.id); expect(resumed.expiresAt).toBe(first.expiresAt);
  current += 900000; const relogin = await accounts.login(emails[1]!, password);
  const replay = await checkout.reserve(relogin.accessToken, value, key); expect(replay.id).toBe(first.id); expect(replay.status).toBe('EXPIRED'); expect(replay.expiresAt).toBe(first.expiresAt);
  await expect(checkout.reserve(relogin.accessToken, { ...value, pricingRevision: '0'.repeat(64) }, key)).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
});
test('cart quantity change releases the old whole hold and a new reservation receives a new deadline and current prices', async () => {
  const buyer = buyers[0]!, row = await offer(), discount = await coupon(); const cart = await add(buyer, row.id), old = await checkout.reserve(buyer.accessToken, await preview(buyer, discount.code), randomUUID()); current += 1000;
  await carts.change(buyer.accessToken, { type: 'UPDATE', itemId: cart.items[0]!.id, version: cart.version, quantity: 2 });
  expect((await db.checkout.findUniqueOrThrow({ where: { id: old.id } })).status).toBe('CANCELLED'); expect((await db.couponUsage.findUniqueOrThrow({ where: { checkoutId: old.id } })).status).toBe('RELEASED');
  const next = await checkout.reserve(buyer.accessToken, await preview(buyer, discount.code), randomUUID()); expect(next.id).not.toBe(old.id); expect(Date.parse(next.expiresAt) - Date.parse(old.expiresAt)).toBe(1000); expect(next.quote.totalCents).toBe(19000);
});
test('changing to an invalid coupon leaves the prior checkout released instead of restoring its old hold', async () => {
  const buyer = buyers[0]!, row = await offer(), discount = await coupon(); await add(buyer, row.id); const old = await checkout.reserve(buyer.accessToken, await preview(buyer, discount.code), randomUUID());
  await expect(checkout.reserve(buyer.accessToken, { version: old.cartVersion, pricingRevision: '0'.repeat(64), couponCode: 'NAOEXISTE' }, randomUUID())).rejects.toMatchObject({ code: 'COUPON_UNAVAILABLE' });
  expect((await db.checkout.findUniqueOrThrow({ where: { id: old.id } })).status).toBe('CANCELLED'); expect(await db.reservation.count({ where: { status: 'ACTIVE', checkoutItem: { checkoutId: old.id } } })).toBe(0);
  expect((await db.couponUsage.findUniqueOrThrow({ where: { checkoutId: old.id } })).status).toBe('RELEASED');
});
test('address metadata is owned/versioned and never changes products, amounts or the original deadline', async () => {
  const buyer = buyers[0]!, row = await offer(); await add(buyer, row.id); const frozen = await checkout.reserve(buyer.accessToken, await preview(buyer), randomUUID());
  const make = (userId: string) => db.address.create({ data: { userId, recipient: 'Destinatário sintético', zip: '01001000', region: 'SP', city: 'Cidade', neighborhood: 'Bairro', street: 'Rua', number: '1' } });
  const own = await make(buyer.user.id), foreign = await make(buyers[1]!.user.id);
  await expect(checkout.selectAddress(buyer.accessToken, frozen.id, frozen.version, foreign.id)).rejects.toMatchObject({ status: 404 });
  const next = await checkout.selectAddress(buyer.accessToken, frozen.id, frozen.version, own.id); expect(next.addressId).toBe(own.id); expect(next.expiresAt).toBe(frozen.expiresAt); expect(next.quote).toEqual(frozen.quote); expect(next.products).toEqual(frozen.products);
  await expect(checkout.selectAddress(buyer.accessToken, frozen.id, frozen.version, own.id)).rejects.toMatchObject({ status: 409 });
});
test('customer cancellation is owned and idempotent, releases coupon/stock once and runtime stock reduction stays protected', async () => {
  const buyer = buyers[0]!, row = await offer(), discount = await coupon(); await add(buyer, row.id); const frozen = await checkout.reserve(buyer.accessToken, await preview(buyer, discount.code), randomUUID());
  expect((await server.call('/checkouts/' + frozen.id, 'DELETE', undefined, credentials(buyers[1]!))).status).toBe(404);
  await expect(new Inventory(catalog).adjust(admin.accessToken, row.id, -5, 'Não invadir reserva', randomUUID())).rejects.toMatchObject({ status: 503 });
  expect((await server.call('/checkouts/' + frozen.id, 'DELETE', undefined, credentials(buyer))).status).toBe(204); await checkout.cancel(buyer.accessToken, frozen.id);
  expect(await db.auditLog.count({ where: { action: 'CHECKOUT.CANCELLED', targetId: frozen.id } })).toBe(1); expect((await db.couponUsage.findUniqueOrThrow({ where: { checkoutId: frozen.id } })).status).toBe('RELEASED');
  expect((await db.offer.findUniqueOrThrow({ where: { id: row.id } })).stockOnHand).toBe(5);
});

async function overlap(table: 'Offer' | 'Coupon' | 'User', id: string, one: () => Promise<unknown>, two: () => Promise<unknown>) {
  await control.query('BEGIN'); await control.query(`SELECT id FROM "${table}" WHERE id = $1 FOR UPDATE`, [id]);
  const results = Promise.allSettled([one(), two()]); let observed = false;
  try { for (let i = 0; i < 150; i++) { await control.query('SELECT pg_stat_clear_snapshot()'); const state = await control.query("SELECT count(DISTINCT application_name)::int AS n FROM pg_stat_activity WHERE application_name IN ('TASK016_A','TASK016_B') AND state='active' AND wait_event_type='Lock'"); if (state.rows[0].n === 2) { observed = true; break; } await new Promise(resolve => setTimeout(resolve, 20)); } }
  finally { await control.query('ROLLBACK'); }
  const settled = await results; expect(observed).toBe(true); return settled;
}
for (const kind of ['NEW', 'USED'] as const) test('two real customers cannot reserve the same last ' + kind + ' physical unit', async () => {
  const row = await offer(kind, 1); await add(buyers[0]!, row.id); await add(buyers[1]!, row.id); const first = await preview(buyers[0]!), next = await preview(buyers[1]!);
  const results = await overlap('Offer', row.id, () => checkout.reserve(buyers[0]!.accessToken, first, randomUUID()), () => second.reserve(buyers[1]!.accessToken, next, randomUUID()));
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1); expect(await db.reservation.count({ where: { offerId: row.id, status: 'ACTIVE' } })).toBe(1); expect((await db.offer.findUniqueOrThrow({ where: { id: row.id } })).stockOnHand).toBe(1);
});
test('two forced-overlap customers contend for the last coupon use without exceeding its real database quota', async () => {
  const one = await offer(), two = await offer(), discount = await coupon({ totalLimit: 1 }); await add(buyers[0]!, one.id); await add(buyers[1]!, two.id); const first = await preview(buyers[0]!, discount.code), next = await preview(buyers[1]!, discount.code);
  const results = await overlap('Coupon', discount.id, () => checkout.reserve(buyers[0]!.accessToken, first, randomUUID()), () => second.reserve(buyers[1]!.accessToken, next, randomUUID()));
  expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1); expect(await db.couponUsage.count({ where: { couponId: discount.id, status: 'RESERVED' } })).toBe(1); expect(await db.checkout.count({ where: { couponCode: discount.code, status: 'ACTIVE' } })).toBe(1);
});
test('overlapping requests for the same customer return one checkout, two durable key bindings and one original deadline', async () => {
  const buyer = buyers[0]!, row = await offer(); await add(buyer, row.id); const value = await preview(buyer);
  const results = await overlap('User', buyer.user.id, () => checkout.reserve(buyer.accessToken, value, randomUUID()), () => second.reserve(buyer.accessToken, value, randomUUID()));
  expect(results.every(result => result.status === 'fulfilled')).toBe(true); const views = results.map(result => result.status === 'fulfilled' ? result.value as CheckoutView : undefined); expect(views[0]!.id).toBe(views[1]!.id); expect(views[0]!.expiresAt).toBe(views[1]!.expiresAt);
  expect(await db.idempotencyRecord.count({ where: { actorScope: buyer.user.id, operation: 'CHECKOUT.RESERVE', resultRef: views[0]!.id } })).toBe(2);
});
test('a failure writing checkout audit rolls back the entire new hold, coupon usage, outbox and successful receipt', async () => {
  const buyer = buyers[0]!, row = await offer(), discount = await coupon(); await add(buyer, row.id); const value = await preview(buyer, discount.code), key = randomUUID(), count = await db.checkout.count();
  await control.query(`CREATE FUNCTION reject_checkout_audit_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='CHECKOUT.CREATED' THEN RAISE EXCEPTION 'isolated failure'; END IF; RETURN NEW; END $$`); await control.query('CREATE TRIGGER reject_checkout_audit_test BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION reject_checkout_audit_test()');
  try { await expect(checkout.reserve(buyer.accessToken, value, key)).rejects.toThrow(); } finally { await control.query('DROP TRIGGER reject_checkout_audit_test ON "AuditLog"'); await control.query('DROP FUNCTION reject_checkout_audit_test()'); }
  expect(await db.checkout.count()).toBe(count); expect(await db.couponUsage.count({ where: { couponId: discount.id } })).toBe(0); expect(await db.idempotencyRecord.count({ where: { actorScope: buyer.user.id, operation: 'CHECKOUT.RESERVE', key } })).toBe(0);
  const recovered = await checkout.reserve(buyer.accessToken, value, key); expect(recovered.status).toBe('ACTIVE');
});
test('late expiry job cannot retain capacity: another customer can reserve while expired rows await cleanup', async () => {
  const row = await offer('USED', 1), discount = await coupon({ totalLimit: 1 }); await add(buyers[0]!, row.id); const first = await checkout.reserve(buyers[0]!.accessToken, await preview(buyers[0]!, discount.code), randomUUID());
  current += 900000; const next = await accounts.login(emails[2]!, password); await add(next, row.id);
  const reserved = await checkout.reserve(next.accessToken, await preview(next, discount.code), randomUUID()); expect(reserved.id).not.toBe(first.id);
  expect((await db.checkout.findUniqueOrThrow({ where: { id: first.id } })).status).toBe('ACTIVE'); expect(reserved.quote.couponId).toBe(discount.id);
  expect(await expireReservations(db, clock)).toBe(1); expect((await db.checkout.findUniqueOrThrow({ where: { id: first.id } })).status).toBe('EXPIRED');
});
test('two expiry workers forced to overlap release a durable checkout exactly once', async () => {
  const buyer = buyers[0]!, row = await offer(), discount = await coupon(); await add(buyer, row.id); const frozen = await checkout.reserve(buyer.accessToken, await preview(buyer, discount.code), randomUUID()); current += 900000;
  const results = await overlap('User', buyer.user.id, () => expireReservations(db, clock), () => expireReservations(other, clock));
  expect(results.every(result => result.status === 'fulfilled')).toBe(true); expect(results.map(result => result.status === 'fulfilled' ? result.value : -1).sort()).toEqual([0, 1]);
  expect(await db.auditLog.count({ where: { action: 'CHECKOUT.EXPIRED', targetId: frozen.id } })).toBe(1); expect(await db.domainEvent.count({ where: { type: 'CHECKOUT.EXPIRED', aggregateId: frozen.id } })).toBe(1);
  expect((await db.auditLog.findFirstOrThrow({ where: { action: 'CHECKOUT.EXPIRED', targetId: frozen.id } })).actorId).toBeNull();
});
test('actual source CLI in a separate process expires persisted state and a restart has no duplicate effect', async () => {
  const buyer = buyers[0]!, row = await offer(), oldClock = { now: () => new Date(Date.now() - 16 * 60000) }, oldAccounts = new Accounts(db, oldClock), oldCarts = new Carts(oldAccounts), oldCheckouts = new Checkouts(oldAccounts, pendingOrders);
  const session = await oldAccounts.login(emails[1]!, password), empty = await oldCarts.read(session.accessToken);
  await oldCarts.change(session.accessToken, { type: 'ADD', version: empty.version, offerId: row.id, quantity: 1 }, randomUUID()); const cart = await oldCarts.read(session.accessToken); if (cart.pricing.status !== 'READY') throw new Error('Expected ready isolated old-clock cart.');
  const frozen = await oldCheckouts.reserve(session.accessToken, { version: cart.version, pricingRevision: cart.pricing.revision }, randomUUID());
  const run = () => spawnSync(process.execPath, ['--experimental-strip-types', 'apps/api/src/jobs/reservations-cli.ts'], { env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL! }, encoding: 'utf8' });
  const first = run(), replay = run(); expect(first.status).toBe(0); expect(JSON.parse(first.stdout)).toEqual({ expiredCheckouts: 1 }); expect(replay.status).toBe(0); expect(JSON.parse(replay.stdout)).toEqual({ expiredCheckouts: 0 });
  expect((await db.checkout.findUniqueOrThrow({ where: { id: frozen.id } })).status).toBe('EXPIRED'); expect(await db.auditLog.count({ where: { action: 'CHECKOUT.EXPIRED', targetId: frozen.id } })).toBe(1); expect((await db.offer.findUniqueOrThrow({ where: { id: row.id } })).stockOnHand).toBe(5); expect(buyer.user.id).toBe(session.user.id);
});
