import { afterAll, beforeAll, expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';
import sharp from 'sharp';
import type { CouponView, PromotionView, CatalogPage } from '@garimpo/contracts';
import { createDatabase } from '../../apps/api/src/persistence/client.ts';
import type { Database } from '../../apps/api/src/persistence/client.ts';
import { Accounts } from '../../apps/api/src/modules/accounts/service.ts';
import type { SessionBundle } from '../../apps/api/src/modules/accounts/service.ts';
import { firstAdmin, createStaff } from '../../apps/api/src/modules/accounts/staff/service.ts';
import { Catalog } from '../../apps/api/src/modules/catalog/service.ts';
import { PublicImageStore } from '../../apps/api/src/modules/media/store.ts';
import { Pricing } from '../../apps/api/src/modules/pricing/service.ts';
import * as input from '../../apps/api/src/modules/pricing/validation.ts';
import { serializable } from '../../apps/api/src/persistence/transaction.ts';
import { openCatalogServer, web } from '../catalog/http.ts';
const password = 'Uma frase longa para descontos seguros!', initial = Date.parse('2026-11-02T20:00:00Z');
let current = initial;
const clock = { now: () => new Date(current) }, period = { startsAt: '2026-11-01T00:00:00.000Z', endsAt: '2026-12-01T00:00:00.000Z' };
let db: Database, other: Database, accounts: Accounts, catalog: Catalog, pricing: Pricing, second: Pricing, server: Awaited<ReturnType<typeof openCatalogServer>>, control: Client;
let admin: SessionBundle, operator: SessionBundle, customer: SessionBundle, artistId: string, genreId: string, png: Buffer;
const credentials = (session: SessionBundle) => web({ cookie: `__Host-garimpo-access=${session.accessToken}; __Host-garimpo-refresh=${session.refreshToken}; __Host-garimpo-csrf=${session.csrfToken}`, csrf: session.csrfToken });
const code = () => 'C' + randomUUID().replaceAll('-', '').slice(0, 15).toUpperCase();
const couponInput = (extra: Record<string, unknown> = {}) => input.parse(input.couponCreate, { code: code(), type: 'FIXED', amount: 1000, ...period, ...extra });
const promotionInput = (offerId: string, extra: Record<string, unknown> = {}) => input.parse(input.promotionCreate, { name: 'Promo ' + randomUUID(), type: 'PERCENT', amount: 5000, offerIds: [offerId], ...period, ...extra });
async function shop(priceCents = 10000) {
  const edition = await catalog.createEdition(admin.accessToken, { title: 'Preço ' + randomUUID(), format: 'LP', artistIds: [artistId], genreIds: [genreId], primaryGenreId: genreId });
  await catalog.upload(admin.accessToken, 'edition', edition.id, png, 'image/png', 'Capa sintética'); await catalog.updateEdition(admin.accessToken, edition.id, { active: true });
  const offer = await catalog.createOffer(admin.accessToken, edition.id, { kind: 'NEW', priceCents, stockOnHand: 5, active: true }, randomUUID()); return { edition, offer };
}
beforeAll(async () => {
  const value = process.env.TEST_DATABASE_URL; if (!value) throw new Error('Separate test database required.');
  const url = new URL(value), schema = url.searchParams.get('schema'); if (url.pathname !== '/garimpo_test' || !/^task014_[a-f0-9]{32}$/.test(schema ?? '')) throw new Error('Only isolated TASK-014 schema accepted.');
  url.searchParams.set('application_name', 'TASK014_A'); db = createDatabase(url.href); url.searchParams.set('application_name', 'TASK014_B'); other = createDatabase(url.href);
  accounts = new Accounts(db, clock); pricing = new Pricing(accounts); second = new Pricing(new Accounts(other, clock));
  const email = randomUUID() + '@example.invalid'; await firstAdmin(accounts, { name: 'Admin sintético', email, password }); admin = await accounts.login(email, password);
  const op = randomUUID() + '@example.invalid'; await createStaff(accounts, admin.accessToken, { name: 'Operador sintético', email: op, password, role: 'OPERATOR' }); operator = await accounts.login(op, password);
  const buyer = randomUUID() + '@example.invalid'; await accounts.register({ name: 'Cliente sintético', email: buyer, password }); customer = await accounts.login(buyer, password);
  const mediaRoot = await mkdtemp(join(tmpdir(), 'garimpo-pricing-')); catalog = new Catalog(accounts, new PublicImageStore(mediaRoot));
  artistId = (await catalog.changeMetadata(admin.accessToken, 'artist', 'Artista ' + randomUUID())).id; genreId = (await catalog.changeMetadata(admin.accessToken, 'genre', 'Gênero ' + randomUUID())).id;
  png = await sharp({ create: { width: 4, height: 4, channels: 3, background: 'gold' } }).png().toBuffer();
  server = await openCatalogServer({ db, clock, mediaRoot }); control = new Client({ connectionString: value }); await control.connect(); await control.query(`SET search_path TO "${schema}"`);
});
afterAll(async () => { await server?.close(); await control?.end(); await Promise.all([db?.$disconnect(), other?.$disconnect()]); });

test('only ADMIN web can configure discounts, before parsing unauthorized input', async () => {
  const payload = couponInput();
  expect((await server.call('/admin/coupons', 'POST', payload, credentials(customer))).status).toBe(403);
  expect((await server.call('/admin/coupons', 'POST', payload, credentials(operator))).status).toBe(403);
  expect((await server.call('/admin/coupons', 'POST', Buffer.from('{broken'), { ...credentials(operator), 'Content-Type': 'application/json' })).status).toBe(403);
  expect((await server.call('/admin/coupons', 'GET', undefined, {}, true)).status).toBe(403);
  expect((await server.call('/admin/coupons', 'POST', payload, { ...credentials(admin), 'X-CSRF-Token': '' })).status).toBe(403);
  expect((await server.call('/admin/coupons', 'GET', undefined, { ...credentials(admin), Origin: 'https://evil.invalid' })).status).toBe(403);
  expect((await server.call('/admin/coupons', 'GET', undefined, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + admin.accessToken })).status).toBe(403);
  expect((await server.call('/admin/coupons', 'POST', Buffer.from('{broken'), { ...credentials(admin), 'Content-Type': 'application/json' })).status).toBe(422);
});
test('coupon code is normalized/unique, usage stays explicitly unknown and code cannot be renamed', async () => {
  const raw = couponInput(), response = await server.call<CouponView>('/admin/coupons', 'POST', { ...raw, code: raw.code.toLowerCase() }, credentials(admin));
  expect(response.status).toBe(201); expect(response.body.code).toBe(raw.code); expect(response.body.usage).toEqual({ status: 'NOT_INTEGRATED' });
  expect((await server.call('/admin/coupons', 'POST', raw, credentials(admin))).status).toBe(409);
  expect((await server.call('/admin/coupons/' + response.body.id, 'PATCH', { version: 1, code: code() }, credentials(admin))).status).toBe(422);
  expect((await server.call('/admin/coupons?pageSize=101', 'GET', undefined, credentials(admin))).status).toBe(422);
});
test('unknown/duplicate targets and invalid periods/percentages do not leave partial configurations', async () => {
  const raw = couponInput(), before = await db.coupon.count();
  expect((await server.call('/admin/coupons', 'POST', { ...raw, targets: [{ kind: 'OFFER', id: randomUUID() }] }, credentials(admin))).status).toBe(422);
  expect((await server.call('/admin/coupons', 'POST', { ...raw, targets: [{ kind: 'GENRE', id: genreId }, { kind: 'GENRE', id: genreId }] }, credentials(admin))).status).toBe(422);
  expect((await server.call('/admin/coupons', 'POST', { ...raw, startsAt: raw.endsAt }, credentials(admin))).status).toBe(422);
  expect((await server.call('/admin/coupons', 'POST', { ...raw, type: 'PERCENT', amount: 10001 }, credentials(admin))).status).toBe(422);
  expect(await db.coupon.count()).toBe(before);
});
test('coupon targets are exclusive in PostgreSQL and replacement is atomic/versioned', async () => {
  const { edition, offer } = await shop(), row = await pricing.createCoupon(admin.accessToken, couponInput({ targets: [{ kind: 'OFFER', id: offer.id }] }));
  await expect(db.couponTarget.create({ data: { couponId: row.id, offerId: offer.id, editionId: edition.id } })).rejects.toThrow();
  const next = await pricing.updateCoupon(admin.accessToken, row.id, input.parse(input.couponPatch, { version: row.version, targets: [{ kind: 'GENRE', id: genreId }], allowPromotional: true, totalLimit: 20, perUserLimit: 2 }));
  expect(next.version).toBe(2); expect(next.targets).toMatchObject([{ kind: 'GENRE', id: genreId }]); expect(next.allowPromotional).toBe(true);
  await expect(pricing.updateCoupon(admin.accessToken, row.id, { version: row.version, active: false })).rejects.toMatchObject({ status: 409 });
  expect((await db.coupon.findUniqueOrThrow({ where: { id: row.id } })).active).toBe(true);
});
test('public detail and price filters use the same lowest promotion while administration keeps the base price', async () => {
  const { edition, offer } = await shop();
  await pricing.createPromotion(admin.accessToken, promotionInput(offer.id)); await pricing.createPromotion(admin.accessToken, promotionInput(offer.id, { type: 'FIXED', amount: 6000 }));
  expect((await catalog.detail(edition.id)).offers[0]!.priceCents).toBe(4000); expect((await catalog.detail(edition.id, admin.accessToken)).offers[0]!.priceCents).toBe(10000);
  const found = await server.call<CatalogPage>('/editions?q=' + encodeURIComponent(edition.title) + '&minPrice=4000&maxPrice=4000'); expect(found.status).toBe(200); expect(found.body.total).toBe(1); expect(found.body.items[0]!.minPriceCents).toBe(4000);
  const excluded = await server.call<CatalogPage>('/editions?q=' + encodeURIComponent(edition.title) + '&minPrice=9000'); expect(excluded.body.total).toBe(0);
  expect((await db.offer.findUniqueOrThrow({ where: { id: offer.id } })).stockOnHand).toBe(5);
});
test('promotional price, grade and availability cannot be combined across different offers', async () => {
  const { edition, offer } = await shop(); await pricing.createPromotion(admin.accessToken, promotionInput(offer.id));
  const used = await catalog.createOffer(admin.accessToken, edition.id, { kind: 'USED', priceCents: 7500, stockOnHand: 1, active: false, discGrade: 'VG+', sleeveGrade: 'NM', particulars: 'Conferido individualmente' }, randomUUID());
  await catalog.upload(admin.accessToken, 'offer', used.id, png, 'image/png', 'Foto própria'); await catalog.updateOffer(admin.accessToken, used.id, { version: used.version, active: true });
  const query = '/editions?q=' + encodeURIComponent(edition.title) + '&minPrice=4000&maxPrice=6000&discCondition=VG%2B&sleeveCondition=NM&available=true';
  expect((await server.call<CatalogPage>(query)).body.total).toBe(0);
  await pricing.createPromotion(admin.accessToken, promotionInput(used.id, { type: 'FIXED', amount: 2500 }));
  const found = await server.call<CatalogPage>(query); expect(found.body.total).toBe(1); expect(found.body.items[0]!.offers.map(item => item.id)).toEqual([used.id]); expect(found.body.items[0]!.minPriceCents).toBe(5000);
});
test('scheduled/expired promotions honor exact boundaries identically in SQL filters and DTO prices', async () => {
  const { edition, offer } = await shop(10001), start = initial + 100, end = initial + 1000;
  await pricing.createPromotion(admin.accessToken, promotionInput(offer.id, { amount: 3333, startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString() }));
  try {
    expect((await catalog.detail(edition.id)).offers[0]!.priceCents).toBe(10001);
    current = start; expect((await catalog.detail(edition.id)).offers[0]!.priceCents).toBe(6668);
    const found = await server.call<CatalogPage>('/editions?q=' + encodeURIComponent(edition.title) + '&minPrice=6668&maxPrice=6668'); expect(found.body.total).toBe(1);
    current = end; expect((await catalog.detail(edition.id)).offers[0]!.priceCents).toBe(10001);
    expect((await server.call<CatalogPage>('/editions?q=' + encodeURIComponent(edition.title) + '&maxPrice=6668')).body.total).toBe(0);
  } finally { current = initial; }
});
test('canonical quote ignores supplied prices, caps fixed coupon, and does not change stock or create usage', async () => {
  const { offer } = await shop(), promotion = await pricing.createPromotion(admin.accessToken, promotionInput(offer.id));
  const row = await pricing.createCoupon(admin.accessToken, couponInput({ amount: 99999, allowPromotional: true, minimumEligibleCents: 5000, targets: [{ kind: 'OFFER', id: offer.id }] }));
  const requested = [{ id: 'stable-unit', offerId: offer.id, basePriceCents: 1 }];
  const result = await serializable(db, tx => pricing.quote(tx, requested, row.code.toLowerCase()));
  expect(result.units[0]).toMatchObject({ basePriceCents: 10000, promotionalPriceCents: 5000, promotionId: promotion.id, couponDiscountCents: 5000, netPriceCents: 0 }); expect(result.totalCents).toBe(0);
  expect((await db.offer.findUniqueOrThrow({ where: { id: offer.id } })).stockOnHand).toBe(5);
  expect((await pricing.coupons(admin.accessToken, { page: 1, pageSize: 100 })).items.find(item => item.id === row.id)!.usage.status).toBe('NOT_INTEGRATED');
});
test('merged configuration is validated before changing type or dates and base monetary constraints hold in SQL', async () => {
  const row = await pricing.createCoupon(admin.accessToken, couponInput({ amount: 20000 }));
  await expect(pricing.updateCoupon(admin.accessToken, row.id, { version: row.version, type: 'PERCENT' })).rejects.toMatchObject({ status: 422 });
  await expect(db.coupon.update({ where: { id: row.id }, data: { amount: -1 } })).rejects.toThrow();
  expect((await db.coupon.findUniqueOrThrow({ where: { id: row.id } })).version).toBe(1);
});
test('two real configuration edits overlap on a coupon lock and only one current version commits', async () => {
  const row = await pricing.createCoupon(admin.accessToken, couponInput()); await control.query('BEGIN'); await control.query('SELECT id FROM "Coupon" WHERE id = $1 FOR UPDATE', [row.id]);
  const first = pricing.updateCoupon(admin.accessToken, row.id, { version: row.version, amount: 200 }), next = second.updateCoupon(admin.accessToken, row.id, { version: row.version, amount: 300 });
  const settled = Promise.allSettled([first, next]); let overlap = false;
  try {
    for (let i = 0; i < 100; i++) { const result = await control.query("SELECT count(*)::int AS n FROM pg_stat_activity WHERE application_name IN ('TASK014_A','TASK014_B') AND wait_event_type = 'Lock'"); if (result.rows[0].n >= 2) { overlap = true; break; } await new Promise(resolve => setTimeout(resolve, 20)); }
  } finally { await control.query('ROLLBACK'); }
  const results = await settled; expect(overlap).toBe(true); expect(results.filter(value => value.status === 'fulfilled')).toHaveLength(1);
  const rejected = results.find(value => value.status === 'rejected'); expect(rejected?.status === 'rejected' && rejected.reason).toMatchObject({ status: 409 }); expect((await db.coupon.findUniqueOrThrow({ where: { id: row.id } })).version).toBe(2);
});
test('audit persistence failure rolls back coupon fields, version and target replacement together', async () => {
  const { offer } = await shop(), row = await pricing.createCoupon(admin.accessToken, couponInput({ targets: [{ kind: 'OFFER', id: offer.id }] }));
  await control.query(`CREATE FUNCTION reject_pricing_audit_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action = 'PRICING.COUPON_UPDATED' THEN RAISE EXCEPTION 'isolated audit failure'; END IF; RETURN NEW; END $$`);
  await control.query('CREATE TRIGGER reject_pricing_audit_test BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION reject_pricing_audit_test()');
  try { await expect(pricing.updateCoupon(admin.accessToken, row.id, { version: row.version, amount: 777, targets: [{ kind: 'GENRE', id: genreId }] })).rejects.toThrow(); }
  finally { await control.query('DROP TRIGGER reject_pricing_audit_test ON "AuditLog"'); await control.query('DROP FUNCTION reject_pricing_audit_test()'); }
  const actual = (await pricing.coupons(admin.accessToken, { page: 1, pageSize: 100 })).items.find(item => item.id === row.id)!; expect(actual.amount).toBe(row.amount); expect(actual.version).toBe(row.version); expect(actual.targets).toEqual(row.targets);
});
test('promotion update is versioned, deactivation restores the public base price, and unknown offers fail atomically', async () => {
  const { edition, offer } = await shop(), before = await db.promotion.count();
  expect((await server.call('/admin/promotions', 'POST', promotionInput(randomUUID()), credentials(admin))).status).toBe(422); expect(await db.promotion.count()).toBe(before);
  const made = await server.call<PromotionView>('/admin/promotions', 'POST', promotionInput(offer.id), credentials(admin)); expect(made.status).toBe(201);
  expect((await catalog.detail(edition.id)).offers[0]!.priceCents).toBe(5000);
  const changed = await server.call<PromotionView>('/admin/promotions/' + made.body.id, 'PATCH', { version: made.body.version, active: false }, credentials(admin)); expect(changed.status).toBe(200); expect(changed.body.version).toBe(2);
  expect((await catalog.detail(edition.id)).offers[0]!.priceCents).toBe(10000);
  expect((await server.call('/admin/promotions/' + made.body.id, 'PATCH', { version: made.body.version, amount: 1000 }, credentials(admin))).status).toBe(409);
});
