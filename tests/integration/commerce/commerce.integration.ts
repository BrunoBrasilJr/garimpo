import { stockRace } from '../../concurrency/commerce/stock.ts';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, expect, test } from 'vitest';
import type { CatalogEdition, CatalogPage, CheckoutView, StockPage } from '@garimpo/contracts';
import { foundation, credentials } from '../../accounts/lifecycle/fixtures.ts';
import { expireOrders } from '../../../apps/api/src/jobs/order-expiry.ts';
import { expireReservations } from '../../../apps/api/src/jobs/reservations.ts';
import { closeAccount } from '../../../apps/api/src/modules/accounts/closure.ts';

let fixture: Awaited<ReturnType<typeof foundation>>;
beforeAll(async () => { fixture = await foundation(undefined, '023'); });
afterAll(async () => { await fixture?.close(); });

test('public catalog, stock guard and history use real reservations and preserve an inactive purchase', async () => {
  await fixture.freshRoles();
  const buyer = await fixture.customer();
  const offer = await fixture.offer('USED');
  const held = await fixture.ready(buyer, { offer });
  const detail = () => fixture.server.call<CatalogEdition>('/editions/' + offer.editionId);
  expect((await detail()).body.offers[0]).toMatchObject({ available: false, stockOnHand: 1 });
  const available = await fixture.server.call<CatalogPage>('/editions?available=true');
  expect(available.body.items.some(item => item.id === offer.editionId)).toBe(false);
  const staff = credentials(fixture.admin);
  const panel = await fixture.server.call<StockPage>('/admin/stock?editionId=' + offer.editionId, 'GET', undefined, staff);
  expect(panel.body.items[0]?.offers[0]).toMatchObject({ reservedQuantity: 1, protectedQuantity: 1, availableQuantity: 0 });
  const reduction = await fixture.server.call('/admin/offers/' + offer.id + '/stock-adjustments', 'POST',
    { delta: -1, reason: 'Avaria sintética' }, { ...staff, 'Idempotency-Key': randomUUID() });
  expect(reduction).toMatchObject({ status: 409, body: { code: 'STOCK_COMMERCIALLY_BOUND' } });
  await fixture.catalog.updateOffer(fixture.admin.accessToken, offer.id, { active: false });
  const order = await fixture.orders.create(buyer.accessToken, held.body, held.key);
  const payment = await fixture.payments.charge(buyer.accessToken, order.id, {
    chargeId: order.charges[0]!.id, scenario: 'APPROVED'
  }, randomUUID());
  expect(payment.order?.status).toBe('PAID');
  const deletion = await fixture.server.call('/admin/offers/' + offer.id, 'DELETE', undefined, staff);
  expect(deletion).toMatchObject({ status: 409, body: { code: 'COMMERCIAL_REFERENCE' } });
});

test('review endpoint checks ownership, real delivery and one review per purchase and edition', async () => {
  await fixture.freshRoles();
  const buyer = await fixture.customer();
  const stranger = await fixture.customer();
  const held = await fixture.ready(buyer);
  const wrongEdition = await fixture.offer();
  const order = await fixture.orders.create(buyer.accessToken, held.body, held.key);
  const draft = { orderId: order.id, rating: 5, comment: 'Compra sintética verificada' };
  const submit = (editionId: string, access = buyer) => fixture.server.call(
    '/editions/' + editionId + '/reviews', 'POST', draft, credentials(access)
  );
  expect((await submit(held.offer.editionId)).status).toBe(403);
  const paid = await fixture.payments.charge(buyer.accessToken, order.id, {
    chargeId: order.charges[0]!.id, scenario: 'APPROVED'
  }, randomUUID());
  let version = paid.order!.version;
  for (const status of ['PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED'] as const) {
    const at = fixture.clock.now().toISOString();
    const common = { version, reason: 'Logística sintética validada' };
    const command = status === 'SHIPPED' ? { ...common, status, trackingCode: 'COMMERCE-TEST', postedAt: at }
      : status === 'DELIVERED' ? { ...common, status, deliveredAt: at } : { ...common, status };
    const record = await fixture.logistics.change(fixture.admin.accessToken, order.id, command, randomUUID());
    version = record.version;
  }
  expect((await submit(held.offer.editionId, stranger)).status).toBe(403);
  expect((await submit(wrongEdition.editionId)).status).toBe(403);
  expect((await submit(held.offer.editionId)).status).toBe(201);
  expect((await submit(held.offer.editionId)).status).toBe(409);
});

test('checkout expiry restores public availability and freezes the alert audience once', async () => {
  const buyer = await fixture.customer();
  const observer = await fixture.customer();
  const offer = await fixture.offer('USED');
  await fixture.ready(buyer, { offer });
  const subscribed = await fixture.server.call<{ id: string }>('/me/availability-alerts', 'POST',
    { editionId: offer.editionId, kind: 'USED' }, credentials(observer));
  expect(subscribed.status).toBe(201);
  fixture.advance(15 * 60000);
  const publicView = await fixture.server.call<CatalogEdition>('/editions/' + offer.editionId);
  expect(publicView.body.available).toBe(true);
  await expireReservations(fixture.db, fixture.clock);
  const { triggerEventId } = await fixture.db.availabilityAlert.findUniqueOrThrow({ where: { id: subscribed.body.id } });
  expect(triggerEventId).not.toBeNull();
  await expireReservations(fixture.db, fixture.clock);
  expect((await fixture.db.availabilityAlert.findUniqueOrThrow({ where: { id: subscribed.body.id } })).triggerEventId).toBe(triggerEventId);
});

test('expiry and account closure return availability for committed pending orders', async () => {
  for (const action of ['EXPIRE', 'CLOSE'] as const) {
    const buyer = await fixture.customer();
    const observer = await fixture.customer();
    const offer = await fixture.offer('USED');
    const held = await fixture.ready(buyer, { offer });
    const order = await fixture.orders.create(buyer.accessToken, held.body, held.key);
    const alert = await fixture.server.call<{ id: string }>('/me/availability-alerts', 'POST',
      { editionId: offer.editionId, kind: 'ANY' }, credentials(observer));
    expect(alert.status).toBe(201);
    if (action === 'EXPIRE') {
      fixture.advance(30 * 60000);
      await expireOrders(fixture.db, fixture.clock);
    } else {
      await closeAccount(fixture.accounts, buyer.accessToken, { confirm: true }, randomUUID());
    }
    expect((await fixture.db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('CANCELLED');
    expect((await fixture.db.availabilityAlert.findUniqueOrThrow({ where: { id: alert.body.id } })).triggerEventId).not.toBeNull();
  }
});

test('same-item renewal does not announce availability between expired and replacement reservations', async () => {
  const buyer = await fixture.customer();
  const observer = await fixture.customer();
  const offer = await fixture.offer('USED');
  const first = await fixture.ready(buyer, { offer });
  const alert = await fixture.server.call<{ id: string }>('/me/availability-alerts', 'POST',
    { editionId: offer.editionId, kind: 'USED' }, credentials(observer));
  expect(alert.status).toBe(201);
  fixture.advance(15 * 60000);
  const renewed = await fixture.accounts.renew(buyer.refreshToken, buyer.csrfToken);
  const persisted = await fixture.db.checkout.findUniqueOrThrow({ where: { id: first.checkout.id } });
  // Reading the cart itself materializes expiry. Use the persisted cart and the previous accepted pricing revision.
  const replacement = await fixture.server.call<CheckoutView>('/checkouts', 'POST', {
    version: persisted.cartVersion, pricingRevision: persisted.pricingRevision
  }, { ...credentials(renewed), 'Idempotency-Key': randomUUID() });
  expect(replacement.status).toBe(201);
  expect(replacement.body.id).not.toBe(first.checkout.id);
  expect((await fixture.db.availabilityAlert.findUniqueOrThrow({ where: { id: alert.body.id } })).triggerEventId).toBeNull();
});

test('two real transactions cannot reserve and remove the same last unit', async () => stockRace(fixture));
