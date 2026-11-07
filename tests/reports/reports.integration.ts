import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, expect, test } from 'vitest';
import type { CancellationResult, RankingReport, SalesReport } from '@garimpo/contracts';
import { credentials, foundation } from '../accounts/lifecycle/fixtures.ts';
import { Returns } from '../../apps/api/src/modules/aftersales/returns/service.ts';
import { AutomaticRefunds } from '../../apps/api/src/modules/refunds/automatic.ts';
import { Exchanges } from '../../apps/api/src/modules/aftersales/exchanges/service.ts';

let f: Awaited<ReturnType<typeof foundation>>;
const september = '/admin/reports/sales?from=2026-09-01&to=2026-09-30';
beforeAll(async () => { f = await foundation(undefined, '029', Date.parse('2026-09-15T12:00:00Z')); });
afterAll(async () => { await f?.close(); });
async function paid(quantity = 1, couponCode?: string) {
  const buyer = await f.customer();
  const held = await f.ready(buyer, { quantity, ...(couponCode ? { couponCode } : {}) });
  const order = await f.orders.create(buyer.accessToken, held.body, held.key);
  await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
  return { buyer, order, held };
}
const report = () => f.server.call<SalesReport>(september, 'GET', undefined, credentials(f.admin));

test('September sale, October refund and historical asOf retain their separate meanings', async () => {
  const purchase = await paid(2);
  const before = await report();
  expect(before).toMatchObject({ status: 200, body: { financial: { saleProductsCents: 20000, refundedProductsCents: 0 }, cohort: { paidOrders: 1, retainedOrders: 1, retainedUnits: 2, averageTicketCents: 20000 } } });
  const asOf = before.body.asOf;
  f.advance(Date.parse('2026-10-05T12:00:00Z') - f.clock.now().getTime());
  await f.freshRoles();
  const buyer = await f.accounts.login(purchase.buyer.user.email, f.password);
  const cancellation = await f.server.call<CancellationResult>('/orders/' + purchase.order.id + '/cancellations', 'POST',
    { reason: 'Desistência sintética em outubro' }, { ...credentials(buyer), 'Idempotency-Key': randomUUID() });
  expect(cancellation.status).toBe(201);
  expect((await report()).body).toMatchObject({ financial: { saleProductsCents: 20000, refundedProductsCents: 0 }, cohort: { retainedOrders: 0, retainedUnits: 0, averageTicketCents: null } });
  expect((await f.server.call<SalesReport>(september + '&asOf=' + encodeURIComponent(asOf), 'GET', undefined, credentials(f.admin))).body.cohort.retainedUnits).toBe(2);
  const october = await f.server.call<SalesReport>('/admin/reports/sales?from=2026-10-01&to=2026-10-31', 'GET', undefined, credentials(f.admin));
  expect(october.body.financial).toMatchObject({ saleProductsCents: 0, refundedProductsCents: 20000, netProductsCents: -20000, refundedShippingCents: 1500 });
});

test('free retained units count and the frozen primary genre prevents duplication after catalog edits', async () => {
  const coupon = await f.pricing.createCoupon(f.admin.accessToken, { code: 'FREE' + randomUUID().slice(0, 8).toUpperCase(),
    type: 'PERCENT', amount: 10000, allowPromotional: true, startsAt: new Date(f.clock.now().getTime() - 1000).toISOString(), endsAt: '2027-01-01T00:00:00.000Z' });
  const purchase = await paid(1, coupon.code);
  const result = await f.server.call<SalesReport>('/admin/reports/sales?from=2026-10-01&to=2026-10-31', 'GET', undefined, credentials(f.admin));
  expect(result.body.cohort).toMatchObject({ paidOrders: 1, retainedOrders: 1, retainedUnits: 1, averageTicketCents: 0 });
  const frozen = purchase.order.products[0]!;
  await f.catalog.changeMetadata(f.admin.accessToken, 'genre', 'Nome alterado depois da venda', frozen.primaryGenreId);
  const ranking = await f.server.call<RankingReport>('/admin/reports/genres?from=2026-10-01&to=2026-10-31', 'GET', undefined, credentials(f.admin));
  expect(ranking.body.items).toEqual([{ id: frozen.primaryGenreId, name: frozen.primaryGenre, units: 1, productCents: 0 }]);
  const products = await f.server.call<RankingReport>('/admin/reports/products?from=2026-10-01&to=2026-10-31', 'GET', undefined, credentials(f.admin));
  expect(products.body.items).toMatchObject([{ id: purchase.held.offer.editionId, units: 1, productCents: 0 }]);
});

test('technical late payment refunds do not count as new sales', async () => {
  const buyer = await f.customer(), held = await f.ready(buyer);
  const order = await f.orders.create(buyer.accessToken, held.body, held.key);
  const pending = await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'PENDING' }, randomUUID());
  f.advance(31 * 60000);
  await f.gateway.event(pending.id, 'APPROVED');
  await f.payments.apply(pending.id);
  await f.freshRoles();
  const result = await f.server.call<SalesReport>('/admin/reports/sales?from=2026-10-01&to=2026-10-31', 'GET', undefined, credentials(f.admin));
  expect(result.body.financial).toMatchObject({ saleProductsCents: 0, technicalRefundCents: 11500 });
  expect(result.body.cohort.paidOrders).toBe(1);
});

test('a partial return adjusts its original cohort and keeps the free order in the denominator', async () => {
  const p = await paid(2);
  const order = await f.db.order.findUniqueOrThrow({ where: { id: p.order.id } });
  await f.logistics.change(f.operator.accessToken, order.id, { version: order.version, status: 'PREPARING', reason: 'Separação de teste' }, randomUUID());
  const item = await f.db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
  const service = new Returns(f.accounts, new AutomaticRefunds(f.accounts, f.gateway));
  const opened = await service.open(p.buyer.accessToken, order.id, { reason: 'Devolução parcial antes de envio', items: [{ orderItemId: item.id, quantity: 1 }] }, randomUUID());
  const approved = await service.change(f.operator.accessToken, opened.id, { type: 'decision', data: { version: opened.version, decision: 'APPROVE', reason: 'Conferência de teste' } }, true);
  await service.change(f.admin.accessToken, opened.id, { type: 'authorization', data: { version: approved.version, reason: 'Estorno parcial autorizado', unitIds: approved.items.map(unit => unit.id) } }, true, randomUUID());
  const result = await f.server.call<SalesReport>('/admin/reports/sales?from=2026-10-01&to=2026-10-31', 'GET', undefined, credentials(f.admin));
  expect(result.body.cohort).toMatchObject({ paidOrders: 2, retainedOrders: 2, retainedUnits: 2, retainedProductsCents: 10000, averageTicketCents: 5000 });
  expect(result.body.financial).toMatchObject({ saleProductsCents: 20000, refundedProductsCents: 30000 });
});

test('shipping a replacement does not add a sale or count a second edition unit', async () => {
  const p = await paid();
  let order = await f.db.order.findUniqueOrThrow({ where: { id: p.order.id } });
  for (const status of ['PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED'] as const) {
    const at = f.clock.now().toISOString(), base = { version: order.version, reason: 'Entrega sintética para troca' };
    const command = status === 'SHIPPED' ? { ...base, status, trackingCode: 'REPORT-ORIGINAL', postedAt: at }
      : status === 'DELIVERED' ? { ...base, status, deliveredAt: at } : { ...base, status };
    await f.logistics.change(f.admin.accessToken, order.id, command, randomUUID());
    order = await f.db.order.findUniqueOrThrow({ where: { id: order.id } });
  }
  const item = await f.db.orderItem.findFirstOrThrow({ where: { orderId: order.id } }), exchanges = new Exchanges(f.accounts);
  const opened = await exchanges.open(p.buyer.accessToken, order.id, { reason: 'Condição divergente', items: [{ orderItemId: item.id, quantity: 1 }] }, randomUUID());
  const approved = await exchanges.change(f.operator.accessToken, opened.id, { type: 'decision', data: { version: opened.version, decision: 'APPROVE', reason: 'Troca conferida' } }, true);
  const posted = await exchanges.change(p.buyer.accessToken, opened.id, { type: 'posting', data: { version: approved.version, trackingCode: 'REPORT-RETURN', postedAt: f.clock.now() } }, false);
  const inspected = await exchanges.change(f.operator.accessToken, opened.id, { type: 'receipt', data: { version: posted.version, reason: 'Original conferido', receivedAt: f.clock.now(), units: [{ id: opened.items[0]!.id, result: 'FIT' }], evidenceIds: [] } }, true);
  const offered = await exchanges.change(f.operator.accessToken, opened.id, { type: 'offer', data: { version: inspected.version, offerId: p.held.offer.id, equivalenceReason: 'Mesma edição' } }, true);
  const accepted = await exchanges.change(p.buyer.accessToken, opened.id, { type: 'response', substituteId: offered.substitutes[0]!.id, data: { version: offered.version, decision: 'ACCEPT' } }, false);
  const sent = await exchanges.change(f.operator.accessToken, opened.id, { type: 'shipment', data: { version: accepted.version, trackingCode: 'REPORT-REPLACEMENT', postedAt: f.clock.now() } }, true);
  await exchanges.change(f.operator.accessToken, opened.id, { type: 'delivery', data: { version: sent.version, deliveredAt: f.clock.now() } }, true);
  const result = await f.server.call<RankingReport>('/admin/reports/products?from=2026-10-01&to=2026-10-31', 'GET', undefined, credentials(f.admin));
  expect(result.body.items.find(row => row.id === p.held.offer.editionId)).toMatchObject({ units: 1, productCents: 10000 });
  expect(await f.db.financialEvent.count({ where: { orderId: order.id, type: 'SALE' } })).toBe(1);
});

test('ADMIN web authorization runs before filter parsing, and private totals require HTTPS', async () => {
  const buyer = await f.customer();
  for (const actor of [f.operator, buyer]) expect((await f.server.call('/admin/reports/sales?from=invalid', 'GET', undefined, credentials(actor))).status).toBe(403);
  expect((await f.server.call(september, 'GET', undefined, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + f.admin.accessToken })).status).toBe(403);
  expect((await f.server.call(september, 'GET', undefined, credentials(f.admin), true)).status).toBe(403);
  expect((await f.server.call('/admin/reports/sales?from=2026-02-30&to=2026-03-01', 'GET', undefined, credentials(f.admin))).status).toBe(422);
  expect((await f.server.call(september + '&asOf=2099-01-01T00:00:00Z', 'GET', undefined, credentials(f.admin))).status).toBe(422);
  const empty = await f.server.call<SalesReport>('/admin/reports/sales?from=2020-01-01&to=2020-01-01', 'GET', undefined, credentials(f.admin));
  expect(empty.body.cohort.averageTicketCents).toBeNull();
  expect(empty.headers['cache-control']).toContain('no-store');
});
