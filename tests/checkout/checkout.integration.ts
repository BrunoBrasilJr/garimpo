import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import type { CheckoutView, OrderCreationView } from '@garimpo/contracts';
import type { SessionBundle } from '../../apps/api/src/modules/accounts/service.ts';
import { Checkouts } from '../../apps/api/src/modules/checkout/service.ts';
import { orderPendingCount } from '../../apps/api/src/modules/orders/pending-orders.ts';
import { reservedQuantities } from '../../apps/api/src/modules/inventory/reservations.ts';
import { expireReservations } from '../../apps/api/src/jobs/reservations.ts';
import { foundation, credentials } from './fixtures.ts';
let f: Awaited<ReturnType<typeof foundation>>, buyer: SessionBundle;
beforeAll(async () => { f = await foundation(); });
beforeEach(async () => { await f.freshRoles(); buyer = await f.customer(); });
afterAll(async () => { await f?.close(); });

test('new configuration and order endpoints retain HTTPS, role, CSRF, origin, credential and account binding before body parsing', async () => {
  const bad = Buffer.from('{broken'), json = { 'Content-Type': 'application/json' };
  expect((await f.server.call('/admin/freight-rates', 'POST', bad, { ...credentials(f.operator), ...json })).status).toBe(403);
  expect((await f.server.call('/admin/freight-rates', 'GET', undefined, credentials(buyer))).status).toBe(403);
  expect((await f.server.call('/orders', 'POST', bad, { ...credentials(f.admin), ...json })).status).toBe(403);
  expect((await f.server.call('/orders', 'POST', bad, { ...credentials(buyer), 'X-CSRF-Token': '', ...json })).status).toBe(403);
  expect((await f.server.call('/orders', 'POST', bad, { ...credentials(buyer), Origin: 'https://evil.invalid', ...json })).status).toBe(403);
  expect((await f.server.call('/orders', 'POST', bad, { ...credentials(buyer), Authorization: 'Bearer ' + buyer.accessToken, ...json })).status).toBe(422);
  const context = await f.server.call<{ code: string }>('/orders', 'POST', bad, { ...credentials(buyer), 'X-Garimpo-Account': f.admin.user.id, ...json }); expect(context.status).toBe(403); expect(context.body.code).toBe('ACCOUNT_CONTEXT_CHANGED');
  expect((await f.server.call('/orders', 'POST', {}, {}, true)).status).toBe(403);
  expect((await f.server.call('/admin/freight-rates', 'GET', undefined, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + f.admin.accessToken })).status).toBe(403);
});

test('absent configuration yields no coverage or fictitious total and public quoting never creates a cart or hold', async () => {
  expect(await f.db.freightRate.count()).toBe(0); const product = await f.offer();
  const before = { carts: await f.db.cart.count(), holds: await f.db.reservation.count(), checkouts: await f.db.checkout.count() };
  const response = await f.server.call<{ freight: { served: boolean; reason: string }; totalCents: null }>('/checkout/quote', 'POST', { items: [{ offerId: product.id, quantity: 1 }], zip: '99999999' });
  expect(response.status).toBe(200); expect(response.body.freight).toMatchObject({ served: false, reason: 'NO_RATE' }); expect(response.body.totalCents).toBeNull();
  expect({ carts: await f.db.cart.count(), holds: await f.db.reservation.count(), checkouts: await f.db.checkout.count() }).toEqual(before);
});

test('inclusive coverage and non-served regions use actual configured values and reject overlaps and invalid states', async () => {
  const area = await f.rate(), denied = await f.rate(false);
  for (const zip of [area.ranges[0]!.startZip, area.ranges[0]!.endZip]) expect(await f.db.$transaction(tx => f.freight.quote(tx, zip))).toMatchObject({ served: true, amountCents: 1500, deliveryDays: 5 });
  expect(await f.db.$transaction(tx => f.freight.quote(tx, denied.zip))).toMatchObject({ served: false, reason: 'NOT_SERVED' });
  await expect(f.freight.create(f.admin.accessToken, { region: 'Sobreposição sintética', served: true, amountCents: 1, deliveryDays: 0, ranges: [{ startZip: area.ranges[0]!.endZip, endZip: area.ranges[0]!.endZip }] })).rejects.toMatchObject({ code: 'FREIGHT_RANGE_CONFLICT' });
  await expect(f.freight.update(f.admin.accessToken, area.id, { version: area.version, served: false })).rejects.toMatchObject({ status: 422 });
  const changed = await f.freight.update(f.admin.accessToken, area.id, { version: area.version, served: false, amountCents: null, deliveryDays: null }); expect(changed.version).toBe(2);
  expect(await f.db.auditLog.count({ where: { targetId: area.id, action: 'FREIGHT.UPDATED' } })).toBe(1);
});

for (const method of ['PIX', 'BOLETO'] as const) test(method + ' transfers every hold atomically, preserves original checkout deadline and starts its complete new payment window', async () => {
  const ready = await f.ready(buyer), response = await f.server.call<OrderCreationView>('/orders', 'POST', { ...ready.body, method }, { ...credentials(buyer), 'Idempotency-Key': ready.key });
  expect(response.status).toBe(201); const order = response.body; expect(order.status).toBe('PENDING'); expect(order.totalCents).toBe(11500); expect(order.charges).toHaveLength(1); expect(order.charges[0]).toMatchObject({ method, status: 'ACTIVE', amountCents: 11500, expiresAt: order.expiresAt });
  expect(Date.parse(order.expiresAt!) - Date.parse(order.createdAt)).toBe(method === 'PIX' ? 1800000 : 172800000);
  const original = await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } }); expect(original.status).toBe('CONVERTED'); expect(original.expiresAt.toISOString()).toBe(ready.checkout.expiresAt);
  const holds = await f.db.reservation.findMany({ where: { checkoutItem: { checkoutId: ready.checkout.id } } }); expect(holds).toHaveLength(1); expect(holds[0]).toMatchObject({ status: 'ACTIVE', quantity: 1 }); expect(holds[0]!.orderItemId).not.toBeNull(); expect(holds[0]!.expiresAt.toISOString()).toBe(order.expiresAt);
  expect((await f.db.offer.findUniqueOrThrow({ where: { id: ready.offer.id } })).stockOnHand).toBe(20); expect((await f.carts.read(buyer.accessToken)).items).toEqual([]);
  expect((await f.server.call('/me/checkout', 'GET', undefined, credentials(buyer))).status).toBe(404);
  f.advance(16 * 60 * 1000); await expireReservations(f.db, f.clock); expect((await f.db.reservation.findUniqueOrThrow({ where: { id: holds[0]!.id } })).status).toBe('ACTIVE');
  expect(await f.db.$transaction(tx => reservedQuantities(tx, [ready.offer.id], f.clock.now()))).toEqual(new Map([[ready.offer.id, 1]]));
});

test('first unconfirmed email cannot create an order, while confirmation allows the same failed key to be safely retried', async () => {
  const unverified = await f.customer(false), ready = await f.ready(unverified);
  await expect(f.orders.create(unverified.accessToken, ready.body, ready.key)).rejects.toMatchObject({ code: 'EMAIL_CONFIRMATION_REQUIRED' });
  expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0); expect((await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } })).status).toBe('ACTIVE');
  await f.db.user.update({ where: { id: unverified.user.id }, data: { emailVerifiedAt: f.clock.now() } }); expect((await f.orders.create(unverified.accessToken, ready.body, ready.key)).status).toBe('PENDING');
});

test('foreign checkout and address stay private, card approval fields cannot bypass the initial-order protocol', async () => {
  const ready = await f.ready(buyer), other = await f.customer(), address = await f.address(other, ready.rate.zip);
  expect((await f.server.call('/checkout/quote', 'POST', { checkoutId: ready.checkout.id, addressId: ready.address.id }, credentials(other))).status).toBe(404);
  expect((await f.server.call('/checkout/quote', 'POST', { checkoutId: ready.checkout.id, addressId: address.id }, credentials(buyer))).status).toBe(404);
  expect((await f.server.call('/orders', 'POST', ready.body, { ...credentials(other), 'Idempotency-Key': ready.key })).status).toBe(404);
  for (const body of [{ ...ready.body, method: 'CARD' }, { ...ready.body, approved: true }]) expect((await f.server.call('/orders', 'POST', body, { ...credentials(buyer), 'Idempotency-Key': randomUUID() })).status).toBe(422);
  expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0);
});

test('changing address preserves frozen products and checkout deadline while accepting only the newly quoted freight', async () => {
  const ready = await f.ready(buyer), area = await f.rate(); await f.freight.update(f.admin.accessToken, area.id, { version: area.version, amountCents: 2500 }); const destination = await f.address(buyer, area.zip);
  await f.catalog.updateOffer(f.admin.accessToken, ready.offer.id, { version: ready.offer.version, priceCents: 9000 });
  const quote = await f.quotes.quote(buyer.accessToken, { checkoutId: ready.checkout.id, addressId: destination.id }); expect(quote.quote).toEqual(ready.checkout.quote); expect(quote.freight).toMatchObject({ amountCents: 2500 });
  const changed = await f.quotes.accept(buyer.accessToken, ready.checkout.id, { version: ready.checkout.version, addressId: destination.id, freightRevision: quote.freightRevision });
  expect(changed.expiresAt).toBe(ready.checkout.expiresAt); expect(changed.products).toEqual(ready.checkout.products); expect(changed.quote).toEqual(ready.checkout.quote); expect(changed.freight?.address.id).toBe(destination.id);
  const order = await f.orders.create(buyer.accessToken, { ...ready.body, version: changed.version, addressId: destination.id, freightRevision: quote.freightRevision }, ready.key); expect(order.totalCents).toBe(12500);
});

test('non-served destination blocks acceptance and purchase without prematurely closing the checkout', async () => {
  const ready = await f.ready(buyer), area = await f.rate(false), destination = await f.address(buyer, area.zip), quote = await f.quotes.quote(buyer.accessToken, { checkoutId: ready.checkout.id, addressId: destination.id });
  expect(quote.freight.served).toBe(false); expect(quote.totalCents).toBeNull(); await expect(f.quotes.accept(buyer.accessToken, ready.checkout.id, { version: ready.checkout.version, addressId: destination.id, freightRevision: quote.freightRevision })).rejects.toMatchObject({ code: 'ZIP_NOT_SERVED' });
  await expect(f.orders.create(buyer.accessToken, { ...ready.body, addressId: destination.id, freightRevision: quote.freightRevision }, ready.key)).rejects.toMatchObject({ code: 'FREIGHT_CONFIRMATION_REQUIRED' });
  const row = await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } }); expect(row.status).toBe('ACTIVE'); expect(row.expiresAt.toISOString()).toBe(ready.checkout.expiresAt);
});

test('changed rate or address contents require fresh freight acceptance instead of silently charging new values', async () => {
  const ready = await f.ready(buyer); await f.freight.update(f.admin.accessToken, ready.rate.id, { version: ready.rate.version, amountCents: 1600 });
  await expect(f.orders.create(buyer.accessToken, ready.body, ready.key)).rejects.toMatchObject({ code: 'FREIGHT_CONFIRMATION_REQUIRED' });
  await expect(f.quotes.accept(buyer.accessToken, ready.checkout.id, { version: ready.checkout.version, addressId: ready.address.id, freightRevision: ready.body.freightRevision })).rejects.toMatchObject({ code: 'FREIGHT_CONFIRMATION_REQUIRED' });
  const quote = await f.quotes.quote(buyer.accessToken, { checkoutId: ready.checkout.id, addressId: ready.address.id }), accepted = await f.quotes.accept(buyer.accessToken, ready.checkout.id, { version: ready.checkout.version, addressId: ready.address.id, freightRevision: quote.freightRevision });
  await f.accounts.addresses(buyer.accessToken, 'UPDATE', { number: '2' }, ready.address.id);
  await expect(f.orders.create(buyer.accessToken, { ...ready.body, version: accepted.version, freightRevision: quote.freightRevision }, ready.key)).rejects.toMatchObject({ code: 'FREIGHT_CONFIRMATION_REQUIRED' }); expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0);
});

test('same key replays its original immutable order after a new service instance and commercial edits', async () => {
  const ready = await f.ready(buyer), original = await f.orders.create(buyer.accessToken, ready.body, ready.key);
  await f.catalog.updateEdition(f.admin.accessToken, ready.offer.editionId, { title: 'Título posterior sintético' }); await f.catalog.updateOffer(f.admin.accessToken, ready.offer.id, { version: ready.offer.version, priceCents: 50000 });
  await f.freight.update(f.admin.accessToken, ready.rate.id, { version: ready.rate.version, amountCents: 6000 }); await f.accounts.addresses(buyer.accessToken, 'UPDATE', { number: '99' }, ready.address.id);
  expect(await f.secondOrders.create(buyer.accessToken, ready.body, ready.key)).toEqual(original);
  await expect(f.orders.create(buyer.accessToken, { ...ready.body, method: 'BOLETO' }, ready.key)).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  await expect(f.orders.create(buyer.accessToken, ready.body, randomUUID())).rejects.toMatchObject({ code: 'CHECKOUT_UNAVAILABLE' }); expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(1);
  await expect(f.db.order.update({ where: { id: original.id }, data: { totalCents: 1n } })).rejects.toThrow();
  await expect(f.db.orderUnit.update({ where: { id: original.units[0]!.id }, data: { netPaidCents: 1 } })).rejects.toThrow();
});

test('coupon usage becomes final on creation with exact unit allocation including a retained free unit', async () => {
  const coupon = await f.pricing.createCoupon(f.admin.accessToken, { code: 'C' + randomUUID().replaceAll('-', '').slice(0, 14).toUpperCase(), type: 'FIXED', amount: 1, totalLimit: 1, allowPromotional: true, startsAt: new Date(f.clock.now().getTime() - 1000).toISOString(), endsAt: new Date(f.clock.now().getTime() + 86400000).toISOString() });
  const product = await f.offer('NEW', 2, 1), ready = await f.ready(buyer, { offer: product, quantity: 2, couponCode: coupon.code }), order = await f.orders.create(buyer.accessToken, ready.body, ready.key);
  expect(order.units.map(unit => unit.netPaidCents).sort()).toEqual([0, 1]); expect(order.totalCents).toBe(1501); expect((await f.db.orderUnit.findMany({ where: { id: { in: order.units.map(unit => unit.id) } } })).every(unit => unit.commercialState === 'KEPT')).toBe(true);
  expect(await f.db.couponUsage.findUniqueOrThrow({ where: { checkoutId: ready.checkout.id } })).toMatchObject({ status: 'CONSUMED', orderId: order.id });
  const other = await f.customer(), available = await f.offer(), preview = await f.draft(other, available.id, 1, coupon.code);
  const denied = await f.server.call<{ code: string }>('/checkouts', 'POST', preview, { ...credentials(other), 'Idempotency-Key': randomUUID() }); expect(denied.status).toBe(409); expect(denied.body.code).toBe('COUPON_LIMIT_REACHED');
});

test('default runtime reads real orders, caps pending purchases at three and ignores expired slots without a late job extending holds', async () => {
  const created: OrderCreationView[] = [];
  for (let index = 0; index < 3; index++) { const ready = await f.ready(buyer); created.push(await f.orders.create(buyer.accessToken, ready.body, ready.key)); }
  expect(await f.db.$transaction(tx => orderPendingCount(f.clock).inspect(tx, buyer.user.id))).toEqual({ status: 'KNOWN', count: 3 });
  const product = await f.offer(), preview = await f.draft(buyer, product.id), denied = await f.server.call<{ code: string }>('/checkouts', 'POST', preview, { ...credentials(buyer), 'Idempotency-Key': randomUUID() }); expect(denied.status).toBe(409); expect(denied.body.code).toBe('PENDING_ORDER_LIMIT');
  expect(await f.db.checkout.count({ where: { userId: buyer.user.id, status: 'ACTIVE' } })).toBe(0);
  f.advance(31 * 60 * 1000); const renewed = await f.accounts.renew(buyer.refreshToken, buyer.csrfToken);
  expect(await f.db.$transaction(tx => orderPendingCount(f.clock).inspect(tx, buyer.user.id))).toEqual({ status: 'KNOWN', count: 0 });
  const resumed = await f.server.call<CheckoutView>('/checkouts', 'POST', preview, { ...credentials(renewed), 'Idempotency-Key': randomUUID() }); expect(resumed.status).toBe(201);
  const oldOfferIds = created.flatMap(order => order.units.map(unit => unit.offerId)); expect(await f.db.$transaction(tx => reservedQuantities(tx, oldOfferIds, f.clock.now()))).toEqual(new Map());
  // Expiry transitions and notifications themselves belong to TASK-019, not this observation.
});

test('expired checkout is closed durably at the exact boundary and no order or initial charge is created', async () => {
  const ready = await f.ready(buyer); f.advance(Date.parse(ready.checkout.expiresAt) - f.clock.now().getTime()); const renewed = await f.accounts.renew(buyer.refreshToken, buyer.csrfToken);
  await expect(f.orders.create(renewed.accessToken, ready.body, ready.key)).rejects.toMatchObject({ code: 'CHECKOUT_EXPIRED' }); expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0);
  expect((await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } })).status).toBe('EXPIRED'); expect((await f.db.reservation.findFirstOrThrow({ where: { checkoutItem: { checkoutId: ready.checkout.id } } })).status).toBe('EXPIRED');
});

test('audit failure rolls back order, charge, unit materialization, transfer, consumption, cart cleanup and receipt together', async () => {
  const ready = await f.ready(buyer); await f.control.query(`CREATE FUNCTION fail_task018_order_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."targetType" = 'ORDER' THEN RAISE EXCEPTION 'isolated order audit failure'; END IF; RETURN NEW; END $$`);
  await f.control.query('CREATE TRIGGER fail_task018_order_audit BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION fail_task018_order_audit()');
  try { await expect(f.orders.create(buyer.accessToken, ready.body, ready.key)).rejects.toThrow(); }
  finally { await f.control.query('DROP TRIGGER fail_task018_order_audit ON "AuditLog"'); await f.control.query('DROP FUNCTION fail_task018_order_audit()'); }
  expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0); expect((await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } })).status).toBe('ACTIVE');
  expect(await f.db.reservation.findFirstOrThrow({ where: { checkoutItem: { checkoutId: ready.checkout.id } } })).toMatchObject({ orderItemId: null, status: 'ACTIVE', expiresAt: new Date(ready.checkout.expiresAt) });
  expect((await f.carts.read(buyer.accessToken)).items).toHaveLength(1); expect(await f.db.idempotencyRecord.count({ where: { actorScope: buyer.user.id, operation: 'ORDER.CREATE', key: ready.key } })).toBe(0);
  expect((await f.orders.create(buyer.accessToken, ready.body, ready.key)).status).toBe('PENDING');
});

async function waiting(expected: number) {
  for (let index = 0; index < 250; index++) {
    await f.control.query('SELECT pg_stat_clear_snapshot()');
    const result = await f.control.query("SELECT count(DISTINCT application_name)::int AS n FROM pg_stat_activity WHERE application_name IN ('TASK018_A','TASK018_B') AND state='active' AND wait_event_type='Lock'");
    if (result.rows[0].n === expected) return true; await new Promise(resolve => setTimeout(resolve, 20));
  } return false;
}
async function overlap<T, U>(table: 'User' | 'Offer' | 'FreightRate', id: string, one: () => Promise<T>, two: () => Promise<U>) {
  await f.control.query('BEGIN'); await f.control.query(`SELECT id FROM "${table}" WHERE id=$1 FOR UPDATE`, [id]); const results = Promise.allSettled([one(), two()]); let observed: boolean;
  try { observed = await waiting(2); } finally { await f.control.query('ROLLBACK'); }
  const settled = await results; expect(observed, 'Both independent DB sessions must actually wait before release.').toBe(true); return settled;
}

test('two independent sessions replaying the same order key commit one order, charge, unit and receipt', async () => {
  const ready = await f.ready(buyer), result = await overlap('User', buyer.user.id, () => f.orders.create(buyer.accessToken, ready.body, ready.key), () => f.secondOrders.create(buyer.accessToken, ready.body, ready.key));
  expect(result.every(value => value.status === 'fulfilled')).toBe(true); const ids = result.map(value => value.status === 'fulfilled' ? value.value.id : 'failed'); expect(new Set(ids).size).toBe(1);
  expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(1); expect(await f.db.paymentCharge.count({ where: { orderId: ids[0]! } })).toBe(1); expect(await f.db.idempotencyRecord.count({ where: { actorScope: buyer.user.id, operation: 'ORDER.CREATE', key: ready.key } })).toBe(1);
  expect(await f.db.auditLog.count({ where: { targetId: ids[0]!, action: 'ORDER.CREATED' } })).toBe(1); expect(await f.db.domainEvent.count({ where: { aggregateId: ids[0]!, type: 'ORDER.CREATED' } })).toBe(1);
});

test('reservation-to-order transfer never exposes the same unique used copy to another concurrent checkout', async () => {
  const used = await f.offer('USED'), other = await f.customer(), preview = await f.draft(other, used.id), ready = await f.ready(buyer, { offer: used });
  const second = new Checkouts(f.secondAccounts, orderPendingCount(f.clock));
  const result = await overlap('Offer', used.id, () => f.orders.create(buyer.accessToken, ready.body, ready.key), () => second.reserve(other.accessToken, preview, randomUUID()));
  expect(result[0]!.status).toBe('fulfilled'); expect(result[1]).toMatchObject({ status: 'rejected', reason: { code: 'INSUFFICIENT_STOCK' } });
  expect((await f.db.offer.findUniqueOrThrow({ where: { id: used.id } })).stockOnHand).toBe(1); expect(await f.db.reservation.count({ where: { offerId: used.id, status: 'ACTIVE' } })).toBe(1);
});

test('concurrent overlapping postal ranges are rejected by the database rather than passing two independent prechecks', async () => {
  const common = { served: true, amountCents: 1500, deliveryDays: 5 }, one = { ...common, region: 'Disputa sintética A', ranges: [{ startZip: '30000000', endZip: '30999999' }] }, two = { ...common, region: 'Disputa sintética B', ranges: [{ startZip: '30500000', endZip: '31500000' }] };
  await f.control.query('BEGIN'); await f.control.query('LOCK TABLE "CepRange" IN SHARE MODE'); const results = Promise.allSettled([f.freight.create(f.admin.accessToken, one), f.secondFreight.create(f.admin.accessToken, two)]); let observed: boolean;
  try { observed = await waiting(2); } finally { await f.control.query('ROLLBACK'); }
  const settled = await results; expect(observed).toBe(true); expect(settled.filter(value => value.status === 'fulfilled')).toHaveLength(1); expect(settled.find(value => value.status === 'rejected')).toMatchObject({ reason: { status: 409, code: 'FREIGHT_RANGE_CONFLICT' } });
});

test('concurrent edits of the same freight version have one winner and one explicit version conflict', async () => {
  const area = await f.rate(), result = await overlap('FreightRate', area.id, () => f.freight.update(f.admin.accessToken, area.id, { version: area.version, amountCents: 1600 }), () => f.secondFreight.update(f.admin.accessToken, area.id, { version: area.version, amountCents: 1700 }));
  expect(result.filter(value => value.status === 'fulfilled')).toHaveLength(1); expect(result.find(value => value.status === 'rejected')).toMatchObject({ reason: { code: 'FREIGHT_VERSION_CONFLICT' } });
  expect(await f.db.auditLog.count({ where: { targetId: area.id, action: 'FREIGHT.UPDATED' } })).toBe(1);
});

test('waiting for freight lock cannot authorize an order after the checkout deadline has passed', async () => {
  const ready = await f.ready(buyer); await f.control.query('BEGIN'); await f.control.query('SELECT id FROM "FreightRate" WHERE id=$1 FOR UPDATE', [ready.rate.id]); const result = f.orders.create(buyer.accessToken, ready.body, ready.key).catch(cause => cause); let observed: boolean;
  try { observed = await waiting(1); f.advance(Date.parse(ready.checkout.expiresAt) - f.clock.now().getTime()); } finally { await f.control.query('ROLLBACK'); }
  expect(observed).toBe(true); expect(await result).toMatchObject({ code: 'CHECKOUT_EXPIRED' }); expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0); expect((await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } })).status).toBe('EXPIRED');
});

test('persisted blocked customer state is revalidated before any order or transfer is committed', async () => {
  const ready = await f.ready(buyer); await f.db.user.update({ where: { id: buyer.user.id }, data: { blockedAt: f.clock.now() } });
  await expect(f.orders.create(buyer.accessToken, ready.body, ready.key)).rejects.toMatchObject({ code: 'ACCOUNT_UNAVAILABLE' }); expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0); expect((await f.db.reservation.findFirstOrThrow({ where: { checkoutItem: { checkoutId: ready.checkout.id } } })).orderItemId).toBeNull();
  // Administrative cancellation of existing holds belongs to TASK-022; no fake cancellation is asserted.
});

test('customer bearer creates only the owned initial order without web cookies or a simulated payment approval', async () => {
  const ready = await f.ready(buyer), result = await f.server.call<OrderCreationView>('/orders', 'POST', ready.body, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + buyer.accessToken, 'X-Garimpo-Account': buyer.user.id, 'Idempotency-Key': ready.key });
  expect(result.status).toBe(201); expect(result.headers['set-cookie']).toBeUndefined(); expect(result.body.status).toBe('PENDING'); expect(result.body.charges[0]!.status).toBe('ACTIVE');
});

test('freight acceptance also revalidates expiry after a contended configuration lock and leaves the old address untouched', async () => {
  const ready = await f.ready(buyer), destination = await f.address(buyer, ready.rate.zip), quote = await f.quotes.quote(buyer.accessToken, { checkoutId: ready.checkout.id, addressId: destination.id });
  await f.control.query('BEGIN'); await f.control.query('SELECT id FROM "FreightRate" WHERE id=$1 FOR UPDATE', [ready.rate.id]); const result = f.quotes.accept(buyer.accessToken, ready.checkout.id, { version: ready.checkout.version, addressId: destination.id, freightRevision: quote.freightRevision }).catch(cause => cause); let observed: boolean;
  try { observed = await waiting(1); f.advance(Date.parse(ready.checkout.expiresAt) - f.clock.now().getTime()); } finally { await f.control.query('ROLLBACK'); }
  expect(observed).toBe(true); expect(await result).toMatchObject({ code: 'CHECKOUT_EXPIRED' }); const row = await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } }); expect(row.status).toBe('EXPIRED'); expect(row.addressId).toBe(ready.address.id);
});

test('freight configuration and all its coverage ranges roll back together when its required audit cannot be written', async () => {
  const before = { rates: await f.db.freightRate.count(), ranges: await f.db.cepRange.count() }, input = { region: 'Falha de auditoria sintética', served: true, amountCents: 1500, deliveryDays: 5, ranges: [{ startZip: '40000000', endZip: '40999999' }] };
  await f.control.query(`CREATE FUNCTION fail_task018_freight_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW."targetType" = 'FREIGHT_RATE' THEN RAISE EXCEPTION 'isolated freight audit failure'; END IF; RETURN NEW; END $$`); await f.control.query('CREATE TRIGGER fail_task018_freight_audit BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION fail_task018_freight_audit()');
  try { await expect(f.freight.create(f.admin.accessToken, input)).rejects.toThrow(); }
  finally { await f.control.query('DROP TRIGGER fail_task018_freight_audit ON "AuditLog"'); await f.control.query('DROP FUNCTION fail_task018_freight_audit()'); }
  expect({ rates: await f.db.freightRate.count(), ranges: await f.db.cepRange.count() }).toEqual(before); expect((await f.freight.create(f.admin.accessToken, input)).version).toBe(1);
});
