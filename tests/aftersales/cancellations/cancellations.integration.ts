import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { afterAll, beforeAll, expect, test } from 'vitest';
import type { CancellationResult, RefundView } from '@garimpo/contracts';
import { credentials, foundation } from '../../accounts/lifecycle/fixtures.ts';

let fixture: Awaited<ReturnType<typeof foundation>>;
beforeAll(async () => { fixture = await foundation(undefined, '025'); });
afterAll(async () => { await fixture?.close(); });

async function pending(quantity = 2, couponCode?: string) {
  const buyer = await fixture.customer();
  const held = await fixture.ready(buyer, { quantity, ...(couponCode ? { couponCode } : {}) });
  const order = await fixture.orders.create(buyer.accessToken, held.body, held.key);
  const units = await fixture.db.orderUnit.findMany({ where: { orderItem: { orderId: order.id } }, orderBy: { logicalIndex: 'asc' } });
  return { buyer, order, units, offer: held.offer };
}

test('paid partial cancellation preserves coupon and freight until all remaining units are cancelled', async () => {
  const now = fixture.clock.now();
  const coupon = await fixture.pricing.createCoupon(fixture.admin.accessToken, {
    code: 'C' + randomUUID().slice(0, 8).toUpperCase(), type: 'FIXED', amount: 1000, totalLimit: 1,
    allowPromotional: true, startsAt: new Date(now.getTime() - 1000).toISOString(), endsAt: new Date(now.getTime() + 86400000).toISOString()
  });
  const { buyer, order, units, offer } = await pending(2, coupon.code);
  const paid = await fixture.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
  const path = '/admin/orders/' + order.id + '/unavailable-units';
  const partial = await fixture.server.call<CancellationResult>(path, 'POST', { unitIds: [units[0]!.id], version: paid.order!.version, reason: 'Unidade avariada' },
    { ...credentials(fixture.operator), 'Idempotency-Key': randomUUID() });
  expect(partial).toMatchObject({ status: 200, body: { orderStatus: 'PAID' } });
  expect(await fixture.db.couponUsage.findUnique({ where: { orderId: order.id } })).toMatchObject({ status: 'CONSUMED' });
  expect(await fixture.db.refund.findUnique({ where: { id: partial.body.refundId! } })).toMatchObject({ status: 'SUCCEEDED', productCents: BigInt(units[0]!.netPaidCents), shippingCents: 0 });

  const final = await fixture.server.call<CancellationResult>(path, 'POST', { unitIds: [units[1]!.id], version: partial.body.orderVersion, reason: 'Segunda unidade avariada' },
    { ...credentials(fixture.operator), 'Idempotency-Key': randomUUID() });
  expect(final).toMatchObject({ status: 200, body: { orderStatus: 'CANCELLED' } });
  expect(await fixture.db.couponUsage.findUnique({ where: { orderId: order.id } })).toMatchObject({ status: 'RELEASED' });
  expect(await fixture.db.refund.findUnique({ where: { id: final.body.refundId! } })).toMatchObject({ status: 'SUCCEEDED', productCents: BigInt(units[1]!.netPaidCents), shippingCents: 1500 });
  expect(await fixture.db.offer.findUnique({ where: { id: offer.id } })).toMatchObject({ stockOnHand: offer.stockOnHand - 2 });
});

test('loss reported at the payment deadline cancels the whole order without discarding healthy stock', async () => {
  const { order, units, offer } = await pending();
  fixture.advance(30 * 60000);
  await fixture.freshRoles();
  const result = await fixture.server.call<CancellationResult>('/admin/orders/' + order.id + '/unavailable-units', 'POST',
    { unitIds: [units[0]!.id], version: order.version, reason: 'Avaria no vencimento' }, { ...credentials(fixture.operator), 'Idempotency-Key': randomUUID() });
  expect(result).toMatchObject({ status: 200, body: { orderStatus: 'CANCELLED', replacementChargeId: null, unavailableUnitIds: [units[0]!.id] } });
  expect(result.body.unitIds).toHaveLength(2);
  expect(await fixture.db.offer.findUnique({ where: { id: offer.id } })).toMatchObject({ stockOnHand: offer.stockOnHand - 1 });
  expect(await fixture.db.paymentCharge.findMany({ where: { orderId: order.id } })).toMatchObject([{ status: 'CANCELLED' }]);
});

test('partial loss replaces a pending charge without extending its deadline and old approval is returned', async () => {
  const { buyer, order, units, offer } = await pending();
  const old = order.charges[0]!;
  const prior = await fixture.payments.charge(buyer.accessToken, order.id, { chargeId: old.id, scenario: 'PENDING' }, randomUUID());
  const key = randomUUID(), path = '/admin/orders/' + order.id + '/unavailable-units';
  const body = { unitIds: [units[0]!.id], reason: 'Avaria em uma unidade', version: order.version };
  const headers = { ...credentials(fixture.operator), 'Idempotency-Key': key };
  const result = await fixture.server.call<CancellationResult>(path, 'POST', body, headers);
  expect(result).toMatchObject({ status: 200, body: { orderStatus: 'PENDING', unitIds: body.unitIds, refundId: null } });
  expect((await fixture.server.call(path, 'POST', body, headers)).body).toEqual(result.body);
  expect((await fixture.server.call(path, 'POST', { ...body, reason: 'Dados diferentes' }, headers)).status).toBe(409);
  const replacement = await fixture.db.paymentCharge.findUniqueOrThrow({ where: { id: result.body.replacementChargeId! } });
  expect(replacement).toMatchObject({ supersedesId: old.id, productCents: 10000n, shippingCents: 1500, expiresAt: new Date(old.expiresAt) });
  expect(await fixture.db.offer.findUnique({ where: { id: offer.id } })).toMatchObject({ stockOnHand: offer.stockOnHand - 1 });
  await fixture.gateway.event(prior.id, 'APPROVED');
  await fixture.payments.apply(prior.id);
  expect(await fixture.db.order.findUnique({ where: { id: order.id } })).toMatchObject({ status: 'PENDING' });
  expect(await fixture.db.refund.findFirst({ where: { paymentAttemptId: prior.id } })).toMatchObject({ status: 'SUCCEEDED', productCents: 20000n, shippingCents: 1500 });
  const paid = await fixture.payments.charge(buyer.accessToken, order.id, { chargeId: replacement.id, scenario: 'APPROVED' }, randomUUID());
  expect(paid.order?.status).toBe('PAID');
  expect(await fixture.db.offer.findUnique({ where: { id: offer.id } })).toMatchObject({ stockOnHand: offer.stockOnHand - 2 });
});

test('paid cancellation restores stock and keeps a failed refund visible until ADMIN retries it', async () => {
  const { buyer, order, offer } = await pending();
  await fixture.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED_REFUND_FAIL' }, randomUUID());
  const path = '/orders/' + order.id + '/cancellations', body = { reason: 'Desistência de compra' };
  const stranger = await fixture.customer();
  expect((await fixture.server.call(path, 'POST', body, { ...credentials(stranger), 'Idempotency-Key': randomUUID() })).status).toBe(404);
  const headers = { ...credentials(buyer), 'Idempotency-Key': randomUUID() };
  const result = await fixture.server.call<CancellationResult>(path, 'POST', body, headers);
  expect(result).toMatchObject({ status: 201, body: { orderStatus: 'CANCELLED' } });
  expect((await fixture.server.call(path, 'POST', body, headers)).body).toEqual(result.body);
  expect(await fixture.db.offer.findUnique({ where: { id: offer.id } })).toMatchObject({ stockOnHand: offer.stockOnHand });
  expect(await fixture.db.refund.findUnique({ where: { id: result.body.refundId! } })).toMatchObject({ status: 'FAILED', productCents: 20000n, shippingCents: 1500 });
  const retryPath = '/admin/refunds/' + result.body.refundId + '/retry', retryBody = { reason: 'Nova tentativa após conferência' };
  expect((await fixture.server.call(retryPath, 'POST', retryBody, { ...credentials(fixture.operator), 'Idempotency-Key': randomUUID() })).status).toBe(403);
  const retry = { ...credentials(fixture.admin), 'Idempotency-Key': randomUUID() };
  const completed = await fixture.server.call<RefundView>(retryPath, 'POST', retryBody, retry);
  expect(completed).toMatchObject({ status: 200, body: { status: 'SUCCEEDED' } });
  expect(completed.body.attempts).toHaveLength(2);
  expect((await fixture.server.call(retryPath, 'POST', retryBody, retry)).body).toEqual(completed.body);
  expect((await fixture.server.call(retryPath, 'POST', { reason: 'Outro motivo' }, retry)).status).toBe(409);
  expect(await fixture.db.financialEvent.count({ where: { orderId: order.id, type: 'REFUND' } })).toBe(1);
});

test('cancellation and capture compete without duplicating stock or refunds', async () => {
  const { buyer, order, offer } = await pending(1);
  await fixture.control.query('BEGIN');
  await fixture.control.query('SELECT id FROM "User" WHERE id=$1 FOR UPDATE', [buyer.user.id]);
  const requests = Promise.all([
    fixture.server.call('/orders/' + order.id + '/cancellations', 'POST', { reason: 'Desistência concorrente' },
      { ...credentials(buyer), 'Idempotency-Key': randomUUID() }),
    fixture.secondPayments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID())
      .catch((error: unknown) => { expect(error).toMatchObject({ status: 409 }); })
  ]);
  let contended = false;
  try {
    for (let attempt = 0; attempt < 150; attempt++) {
      await fixture.control.query('SELECT pg_stat_clear_snapshot()');
      const result = await fixture.control.query(
        "SELECT count(DISTINCT application_name)::int AS total FROM pg_stat_activity WHERE application_name IN ('TASK025_A', 'TASK025_B') AND wait_event_type='Lock'"
      );
      if (result.rows[0].total === 2) { contended = true; break; }
      await delay(20);
    }
  } finally {
    await fixture.control.query('ROLLBACK');
  }
  const [cancel] = await requests;
  expect(contended).toBe(true);
  expect(cancel.status).toBe(201);
  expect(await fixture.db.order.findUnique({ where: { id: order.id } })).toMatchObject({ status: 'CANCELLED' });
  expect(await fixture.db.offer.findUnique({ where: { id: offer.id } })).toMatchObject({ stockOnHand: offer.stockOnHand });
  const [attempts, refunds] = await Promise.all([
    fixture.db.paymentAttempt.count({ where: { orderId: order.id, result: 'APPROVED' } }),
    fixture.db.refund.count({ where: { orderId: order.id, status: 'SUCCEEDED' } })
  ]);
  expect(refunds).toBe(attempts);
  expect(refunds).toBeLessThanOrEqual(1);
});

test('the customer is directed to returns after preparation has started', async () => {
  const { buyer, order } = await pending(1);
  const paid = await fixture.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
  await fixture.logistics.change(fixture.admin.accessToken, order.id, { status: 'PREPARING', reason: 'Separação iniciada', version: paid.order!.version }, randomUUID());
  const result = await fixture.server.call('/orders/' + order.id + '/cancellations', 'POST', { reason: 'Desistência na separação' },
    { ...credentials(buyer), 'Idempotency-Key': randomUUID() });
  expect(result).toMatchObject({ status: 409, body: { code: 'RETURN_REQUIRED' } });
  expect(await fixture.db.cancellationRequest.count({ where: { orderId: order.id } })).toBe(0);
});
