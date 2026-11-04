import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, expect, test } from 'vitest';
import type { AftersalesOverview, CatalogEdition, ExchangeView, ReturnView } from '@garimpo/contracts';
import { Exchanges } from '../../../apps/api/src/modules/aftersales/exchanges/service.ts';
import { credentials, foundation } from '../../accounts/lifecycle/fixtures.ts';

let fixture: Awaited<ReturnType<typeof foundation>>;
beforeAll(async () => { fixture = await foundation(undefined, '027'); });
afterAll(async () => { await fixture?.close(); });
const day = 86400000;
const now = () => fixture.clock.now().toISOString();

async function setup() {
  await fixture.freshRoles();
  const buyer = await fixture.customer(), offer = await fixture.offer('NEW', 2);
  const held = await fixture.ready(buyer, { offer });
  const order = await fixture.orders.create(buyer.accessToken, held.body, held.key);
  const paid = await fixture.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
  let version = paid.order!.version;
  for (const status of ['PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED'] as const) {
    const body = { version, reason: 'Entrega sintética do original' };
    const command = status === 'SHIPPED' ? { ...body, status, trackingCode: 'EXCHANGE-ORIGINAL', postedAt: now() }
      : status === 'DELIVERED' ? { ...body, status, deliveredAt: now() } : { ...body, status };
    version = (await fixture.logistics.change(fixture.admin.accessToken, order.id, command, randomUUID())).version;
  }
  const item = await fixture.db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
  const input = { reason: 'Condição divergente', items: [{ orderItemId: item.id, quantity: 1 }] };
  const opened = await call('/orders/' + order.id + '/exchanges', input, buyer);
  expect(opened.status).toBe(201);
  const approved = await call('/admin/exchanges/' + opened.body.id + '/decision',
    { version: opened.body.version, reason: 'Troca conferida', decision: 'APPROVE' });
  expect(approved.status).toBe(200);
  return { order, offer, buyer, input, row: approved.body };
}

function call(path: string, body: unknown, actor = fixture.operator) {
  return fixture.server.call<ExchangeView>(path, 'POST', body, { ...credentials(actor), 'Idempotency-Key': randomUUID() });
}
const adminPath = (row: ExchangeView, command: string) => '/admin/exchanges/' + row.id + '/' + command;
async function postAndInspect(row: ExchangeView, buyer: Awaited<ReturnType<typeof setup>>['buyer'], result: 'FIT' | 'REJECTED' = 'FIT') {
  const posted = await call('/exchanges/' + row.id + '/posting', { version: row.version, trackingCode: 'EXCHANGE-RETURN', postedAt: now() }, buyer);
  expect(posted.status).toBe(200);
  const inspected = await call(adminPath(row, 'receipt'), {
    version: posted.body.version, reason: 'Original recebido e conferido', receivedAt: now(),
    units: row.items.map(item => ({ id: item.id, result }))
  });
  expect(inspected.status).toBe(200);
  return inspected.body;
}
async function offerSubstitute(row: ExchangeView, offerId: string) {
  const offered = await call(adminPath(row, 'substitute-offers'), { version: row.version, offerId, equivalenceReason: 'Mesmo álbum e condição equivalente' });
  expect(offered.status).toBe(200);
  return offered.body;
}

test('an offer on day 29 keeps all 48 hours, then converts without authorizing any refund', async () => {
  const p = await setup();
  const waiting = await postAndInspect(p.row, p.buyer);
  const clock = new Exchanges(fixture.accounts);
  fixture.advance(29 * day);
  await fixture.freshRoles();
  const offered = await offerSubstitute(waiting, p.offer.id);
  const substitute = offered.substitutes[0]!;
  expect(Date.parse(substitute.expiresAt) - fixture.clock.now().getTime()).toBe(2 * day);
  expect((await fixture.server.call<CatalogEdition>('/editions/' + p.offer.editionId)).body.available).toBe(false);
  fixture.advance(day);
  expect(await clock.reconcile()).toBe(0);
  expect(await fixture.db.exchangeRequest.findUnique({ where: { id: p.row.id } })).toMatchObject({ state: 'WAITING_SUBSTITUTE' });
  fixture.advance(day);
  expect(await clock.reconcile()).toBe(1);
  expect(await clock.reconcile()).toBe(0);
  const converted = await fixture.db.exchangeRequest.findUniqueOrThrow({ where: { id: p.row.id } });
  expect(converted.state).toBe('CONVERTED');
  await fixture.freshRoles();
  const linked = await fixture.server.call<ReturnView>('/admin/returns/' + converted.convertedReturnId, 'GET', undefined, credentials(fixture.operator));
  expect(linked).toMatchObject({ status: 200, body: { state: 'AWAITING_REFUND', refund: null } });
  expect((await fixture.server.call<CatalogEdition>('/editions/' + p.offer.editionId)).body.available).toBe(true);
  expect(await fixture.db.refund.count({ where: { orderId: p.order.id } })).toBe(0);
});

test('acceptance reserves before inspection and replacement delivery starts a fresh seven-day window', async () => {
  const p = await setup();
  const overviewPath = '/orders/' + p.order.id + '/aftersales';
  const overview = await fixture.server.call<AftersalesOverview>(overviewPath, 'GET', undefined, credentials(p.buyer));
  expect(overview).toMatchObject({ status: 200, body: { exchanges: [{ id: p.row.id }], groups: [{ units: [{ available: false }] }] } });
  const outsider = await fixture.customer();
  expect((await fixture.server.call(overviewPath, 'GET', undefined, credentials(outsider))).status).toBe(404);
  expect((await call('/orders/' + p.order.id + '/returns', p.input, p.buyer)).status).toBe(409);
  const offered = await offerSubstitute(p.row, p.offer.id);
  const accepted = await call('/exchanges/' + p.row.id + '/substitute-offers/' + offered.substitutes[0]!.id + '/response',
    { version: offered.version, decision: 'ACCEPT' }, p.buyer);
  expect(accepted).toMatchObject({ status: 200, body: { substitutes: [{ state: 'ACCEPTED' }] } });
  const ship = (row: ExchangeView) => call(adminPath(row, 'shipment'), { version: row.version, trackingCode: 'EXCHANGE-REPLACEMENT', postedAt: now() });
  expect((await ship(accepted.body)).status).toBe(409);
  const waiting = await postAndInspect(accepted.body, p.buyer);
  fixture.advance(10 * day);
  await fixture.freshRoles();
  const shipped = await ship(waiting);
  expect(shipped).toMatchObject({ status: 200, body: { state: 'SHIPPED' } });
  const delivered = await call(adminPath(shipped.body, 'delivery'), { version: shipped.body.version, deliveredAt: now() });
  expect(delivered).toMatchObject({ status: 200, body: { state: 'DELIVERED' } });
  const buyer = await fixture.accounts.login(p.buyer.user.email, fixture.password);
  expect((await call('/orders/' + p.order.id + '/exchanges', p.input, buyer)).status).toBe(201);
  expect(await fixture.db.financialEvent.count({ where: { orderId: p.order.id, type: 'SALE' } })).toBe(1);
  expect(await fixture.db.orderUnit.findUnique({ where: { id: p.row.items[0]!.id } })).toMatchObject({ deliveredAt: fixture.clock.now(), commercialState: 'KEPT' });
});

test('posting expiration releases an accepted substitute and a rejected inspection also releases its hold', async () => {
  for (const failure of ['POSTING_EXPIRED', 'REJECTED'] as const) {
    const p = await setup();
    const offered = await offerSubstitute(p.row, p.offer.id);
    const substitute = offered.substitutes[0]!;
    const accepted = await call('/exchanges/' + p.row.id + '/substitute-offers/' + substitute.id + '/response',
      { version: offered.version, decision: 'ACCEPT' }, p.buyer);
    expect(accepted.status).toBe(200);
    if (failure === 'POSTING_EXPIRED') {
      fixture.advance(7 * day);
      expect(await new Exchanges(fixture.accounts).reconcile()).toBe(1);
    } else {
      expect((await postAndInspect(accepted.body, p.buyer, 'REJECTED')).state).toBe('REJECTED_AWAITING_SHIPMENT');
    }
    expect((await fixture.server.call<CatalogEdition>('/editions/' + p.offer.editionId)).body.available).toBe(true);
    expect(await fixture.db.reservation.findUnique({ where: { substituteId: substitute.id } })).toMatchObject({
      status: failure === 'POSTING_EXPIRED' ? 'EXPIRED' : 'RELEASED'
    });
  }
});
