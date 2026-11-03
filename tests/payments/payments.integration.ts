import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import type { PaymentView } from '@garimpo/contracts';
import type { SessionBundle } from '../../apps/api/src/modules/accounts/service.ts';
import { Payments } from '../../apps/api/src/modules/payments/service.ts';
import { LocalGateway } from '../../apps/api/src/modules/payments/gateway.ts';
import { AutomaticRefunds } from '../../apps/api/src/modules/refunds/automatic.ts';
import { replaceCharge } from '../../apps/api/src/modules/payments/charges.ts';
import { serializable } from '../../apps/api/src/persistence/transaction.ts';
import { expireOrders } from '../../apps/api/src/jobs/order-expiry.ts';
import { expireReservations } from '../../apps/api/src/jobs/reservations.ts';
import { lockOffers } from '../../apps/api/src/modules/inventory/reservations.ts';
import { lockCoupons } from '../../apps/api/src/modules/checkout/lifecycle.ts';
import { AccessMessages } from '../../apps/api/src/modules/messaging/service.ts';
import { MessageProtection } from '../../apps/api/src/modules/messaging/protection.ts';
import { consumeCommerce, deliverCommerce } from '../../apps/api/src/modules/messaging/commerce.ts';
import { foundation, credentials } from './fixtures.ts';
let f: Awaited<ReturnType<typeof foundation>>, buyer: SessionBundle;
beforeAll(async () => { f = await foundation(); });
beforeEach(async () => { await f.freshRoles(); buyer = await f.customer(); });
afterAll(async () => { await f?.close(); });
const card = (ready: Awaited<ReturnType<typeof f.ready>>, scenario: 'APPROVED' | 'PENDING' | 'DECLINED' | 'APPROVED_REFUND_FAIL' = 'APPROVED') => ({ version: ready.body.version, addressId: ready.body.addressId, freightRevision: ready.body.freightRevision, scenario });
async function pending() {
  const ready = await f.ready(buyer), result = await f.payments.card(buyer.accessToken, ready.checkout.id, card(ready, 'PENDING'), randomUUID());
  return { ready, result };
}

test('payment routes enforce TLS, CSRF, origins, roles and account binding before malformed bodies', async () => {
  const bad = Buffer.from('{bad'), headers = { ...credentials(buyer), 'Content-Type': 'application/json' }, path = '/checkouts/' + randomUUID() + '/simulated-card-payments';
  expect((await f.server.call(path, 'POST', bad, headers, true)).status).toBe(403);
  expect((await f.server.call(path, 'POST', bad, { ...headers, 'X-CSRF-Token': '' })).status).toBe(403);
  expect((await f.server.call(path, 'POST', bad, { ...headers, Origin: 'https://other.invalid' })).status).toBe(403);
  expect((await f.server.call(path, 'POST', bad, { ...headers, 'X-Garimpo-Account': randomUUID() })).status).toBe(403);
  expect((await f.server.call(path, 'POST', bad, { ...headers, Authorization: 'Bearer ' + buyer.accessToken })).status).toBe(422);
  expect((await f.server.call(path, 'POST', bad, credentials(f.admin))).status).toBe(403);
  const retry = '/admin/automatic-refunds/' + randomUUID() + '/retry';
  for (const actor of [buyer, f.operator]) expect((await f.server.call(retry, 'POST', bad, { ...credentials(actor), 'Content-Type': 'application/json' })).status).toBe(403);
  expect((await f.server.call(retry, 'POST', bad, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + f.admin.accessToken })).status).toBe(403);
});

test('declined card leaves no order, sale or stock movement and preserves the original checkout deadline', async () => {
  const ready = await f.ready(buyer), result = await f.payments.card(buyer.accessToken, ready.checkout.id, card(ready, 'DECLINED'), randomUUID());
  expect(result).toMatchObject({ result: 'DECLINED', outcome: 'DECLINED', orderId: null, refunds: [] });
  expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0);
  expect((await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } })).expiresAt.toISOString()).toBe(ready.checkout.expiresAt);
  expect(await f.db.stockMovement.count({ where: { offerId: ready.offer.id } })).toBe(0);
  const retry = await f.payments.card(buyer.accessToken, ready.checkout.id, card(ready), randomUUID()); expect(retry.order?.status).toBe('PAID');
});

test('first-order email confirmation precedes even capture preparation and another customer cannot target the checkout', async () => {
  const unverified = await f.customer(false), ready = await f.ready(unverified);
  await expect(f.payments.card(unverified.accessToken, ready.checkout.id, card(ready), randomUUID())).rejects.toMatchObject({ code: 'EMAIL_CONFIRMATION_REQUIRED' });
  expect(await f.db.paymentAttempt.count({ where: { checkoutId: ready.checkout.id } })).toBe(0);
  await expect(f.payments.card(buyer.accessToken, ready.checkout.id, card(ready), randomUUID())).rejects.toMatchObject({ status: 404 });
  await f.db.user.update({ where: { id: unverified.user.id }, data: { emailVerifiedAt: f.clock.now() } });
  expect((await f.payments.card(unverified.accessToken, ready.checkout.id, card(ready), randomUUID())).outcome).toBe('PAID');
});

test('approved card atomically creates a paid order, consumes the hold and decrements a unique used copy exactly once', async () => {
  const product = await f.offer('USED'), ready = await f.ready(buyer, { offer: product }), key = randomUUID();
  const response = await f.server.call<PaymentView>('/checkouts/' + ready.checkout.id + '/simulated-card-payments', 'POST', card(ready), { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + buyer.accessToken, 'X-Garimpo-Account': buyer.user.id, 'Idempotency-Key': key });
  expect(response.status).toBe(200); expect(response.headers['set-cookie']).toBeUndefined(); const result = response.body;
  expect(result.order).toMatchObject({ status: 'PAID', method: 'CARD', expiresAt: null, totalCents: 11500, charges: [] });
  expect((await f.db.offer.findUniqueOrThrow({ where: { id: product.id } })).stockOnHand).toBe(0);
  expect((await f.db.reservation.findFirstOrThrow({ where: { offerId: product.id } })).status).toBe('CONSUMED');
  expect(await f.db.financialEvent.findMany({ where: { paymentAttemptId: result.id } })).toMatchObject([{ type: 'SALE', productCents: 10000n, shippingCents: 1500 }]);
  const replay = await f.secondPayments.card(buyer.accessToken, ready.checkout.id, card(ready), key); expect(replay.id).toBe(result.id);
  expect(await f.db.stockMovement.count({ where: { offerId: product.id } })).toBe(1);
  await expect(f.payments.card(buyer.accessToken, ready.checkout.id, card(ready, 'DECLINED'), key)).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
});

for (const method of ['PIX', 'BOLETO'] as const) test(method + ' approval settles only its owned active charge and is replayable without another sale', async () => {
  const ready = await f.ready(buyer), order = await f.orders.create(buyer.accessToken, { ...ready.body, method }, ready.key), input = { chargeId: order.charges[0]!.id, scenario: 'APPROVED' as const }, key = randomUUID();
  const result = await f.payments.charge(buyer.accessToken, order.id, input, key); expect(result.order?.status).toBe('PAID'); expect(result.order?.charges[0]!.status).toBe('PAID');
  expect((await f.secondPayments.charge(buyer.accessToken, order.id, input, key)).id).toBe(result.id);
  expect(await f.db.financialEvent.count({ where: { orderId: order.id, type: 'SALE' } })).toBe(1);
  expect((await f.db.offer.findUniqueOrThrow({ where: { id: ready.offer.id } })).stockOnHand).toBe(19);
  await expect(f.payments.charge((await f.customer()).accessToken, order.id, input, randomUUID())).rejects.toMatchObject({ status: 404 });
});

test('untrusted amounts, approved flags, unknown scenarios and simulated clock fields are rejected', async () => {
  const ready = await f.ready(buyer), path = '/checkouts/' + ready.checkout.id + '/simulated-card-payments';
  for (const extra of [{ amountCents: 1 }, { approved: true }, { now: '2099-01-01' }, { scenario: 'LATE' }]) expect((await f.server.call(path, 'POST', { ...card(ready), ...extra }, { ...credentials(buyer), 'Idempotency-Key': randomUUID() })).status).toBe(422);
  expect(await f.db.paymentAttempt.count({ where: { checkoutId: ready.checkout.id } })).toBe(0);
});

test('PENDING does not renew the checkout, blocks a second capture, and can be resolved locally after service restart', async () => {
  const { ready, result } = await pending(); expect(result).toMatchObject({ result: 'PENDING', orderId: null, outcome: null });
  await expect(f.payments.card(buyer.accessToken, ready.checkout.id, card(ready), randomUUID())).rejects.toMatchObject({ code: 'PAYMENT_PENDING' });
  await new LocalGateway(f.other, f.clock).event(result.id, 'APPROVED', randomUUID()); await f.secondPayments.apply(result.id);
  expect((await f.payments.own(buyer.accessToken, result.id)).order?.status).toBe('PAID');
  expect((await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } })).expiresAt.toISOString()).toBe(ready.checkout.expiresAt);
});

test('approval exactly at the original card deadline refunds without creating an order even when stock is available', async () => {
  const { ready, result } = await pending(); f.advance(Date.parse(ready.checkout.expiresAt) - f.clock.now().getTime());
  await f.gateway.event(result.id, 'APPROVED', randomUUID()); await f.secondPayments.apply(result.id);
  const view = await f.payments.view(result.id); expect(view).toMatchObject({ outcome: 'REFUND_REQUIRED', orderId: null, refunds: [{ status: 'SUCCEEDED', productCents: 10000, shippingCents: 1500 }] });
  expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0); expect(await f.db.financialEvent.findMany({ where: { paymentAttemptId: result.id } })).toMatchObject([{ type: 'LATE_REFUND' }]);
  expect((await f.db.offer.findUniqueOrThrow({ where: { id: ready.offer.id } })).stockOnHand).toBe(20);
  expect((await f.db.checkout.findUniqueOrThrow({ where: { id: ready.checkout.id } })).status).toBe('EXPIRED');
});

test('an early receipt applied only after restart past expiry cannot reacquire released stock', async () => {
  const { result } = await pending(); await f.gateway.event(result.id, 'APPROVED', randomUUID()); f.advance(16 * 60000); await expireReservations(f.db, f.clock); await f.secondPayments.apply(result.id);
  expect((await f.payments.view(result.id)).order).toBeNull(); expect((await f.payments.view(result.id)).refunds[0]!.status).toBe('SUCCEEDED');
  expect(await f.db.financialEvent.count({ where: { paymentAttemptId: result.id, type: 'SALE' } })).toBe(0);
});

test('switching from pending card to Pix invalidates the old card context and refunds it without settling the Pix order', async () => {
  const { ready, result } = await pending(), order = await f.orders.create(buyer.accessToken, ready.body, ready.key);
  await f.gateway.event(result.id, 'APPROVED', randomUUID()); await f.payments.apply(result.id);
  expect((await f.payments.view(result.id)).refunds[0]!.status).toBe('SUCCEEDED'); expect((await f.db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PENDING');
  expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(1);
});

test('changed owned address while card is pending produces refund rather than charging an unaccepted delivery snapshot', async () => {
  const { ready, result } = await pending(); await f.accounts.addresses(buyer.accessToken, 'UPDATE', { number: '9' }, ready.address.id);
  await f.gateway.event(result.id, 'APPROVED', randomUUID()); await f.payments.apply(result.id); expect((await f.payments.view(result.id)).outcome).toBe('REFUND_REQUIRED'); expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0);
});

for (const method of ['PIX', 'BOLETO'] as const) test(method + ' expiry releases every hold and coupon once; late receipt refunds and never revives the order', async () => {
  const code = 'EXP' + randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase();
  await f.pricing.createCoupon(f.admin.accessToken, { code, type: 'FIXED', amount: 100, startsAt: f.clock.now().toISOString(), endsAt: new Date(f.clock.now().getTime() + 7 * 86400000).toISOString(), totalLimit: 1, perUserLimit: 1, allowPromotional: true });
  const ready = await f.ready(buyer, { couponCode: code }), order = await f.orders.create(buyer.accessToken, { ...ready.body, method }, ready.key), attempt = await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'PENDING' }, randomUUID());
  f.advance(Date.parse(order.expiresAt!) - f.clock.now().getTime()); expect(await expireOrders(f.db, f.clock)).toBeGreaterThanOrEqual(1); expect(await expireOrders(f.db, f.clock)).toBe(0);
  await f.gateway.event(attempt.id, 'APPROVED', randomUUID()); await f.payments.apply(attempt.id); const result = await f.payments.view(attempt.id);
  expect(result.order?.status).toBe('CANCELLED'); expect(result.refunds[0]).toMatchObject({ status: 'SUCCEEDED', productCents: 9900, shippingCents: 1500 });
  expect((await f.db.couponUsage.findUniqueOrThrow({ where: { orderId: order.id } })).status).toBe('RELEASED');
  expect(await f.db.financialEvent.count({ where: { orderId: order.id, type: 'SALE' } })).toBe(0); expect(await f.db.stockMovement.count({ where: { offerId: ready.offer.id } })).toBe(0);
});

test('blocked customers cannot initiate payment, but technical receipts still produce the necessary automatic refund', async () => {
  const { ready, result } = await pending(); await f.db.user.update({ where: { id: buyer.user.id }, data: { blockedAt: f.clock.now() } });
  await expect(f.payments.card(buyer.accessToken, ready.checkout.id, card(ready), randomUUID())).rejects.toMatchObject({ code: 'ACCOUNT_UNAVAILABLE' });
  await f.gateway.event(result.id, 'APPROVED', randomUUID()); await f.payments.apply(result.id); expect((await f.payments.view(result.id)).refunds[0]!.status).toBe('SUCCEEDED');
  await expect(f.payments.own(buyer.accessToken, result.id)).rejects.toMatchObject({ code: 'ACCOUNT_UNAVAILABLE' });
});

test('a superseded charge refunds its entire captured allocation while the replacement keeps the original deadline', async () => {
  const ready = await f.ready(buyer, { quantity: 2 }), order = await f.orders.create(buyer.accessToken, ready.body, ready.key), old = order.charges[0]!, pending = await f.payments.charge(buyer.accessToken, order.id, { chargeId: old.id, scenario: 'PENDING' }, randomUUID());
  const replacement = await serializable(f.db, async tx => {
    await tx.$queryRaw`UPDATE "User" SET "updatedAt"="updatedAt" WHERE id=${buyer.user.id}::uuid RETURNING id`;
    await lockOffers(tx, [ready.offer.id]); await lockCoupons(tx, []);
    const unit = order.units[0]!; await tx.orderUnit.update({ where: { id: unit.id }, data: { commercialState: 'CANCELLED' } });
    await tx.reservation.updateMany({ where: { orderItem: { orderId: order.id } }, data: { quantity: 1 } });
    return replaceCharge(tx, order.id, old.id, 10000n, 1500, f.clock);
  });
  expect(replacement?.expiresAt.toISOString()).toBe(old.expiresAt);
  await f.gateway.event(pending.id, 'APPROVED', randomUUID()); await f.payments.apply(pending.id); const late = await f.payments.view(pending.id);
  expect(late.refunds[0]).toMatchObject({ status: 'SUCCEEDED', productCents: 20000, shippingCents: 1500 }); expect(late.order?.status).toBe('PENDING');
  const paid = await f.payments.charge(buyer.accessToken, order.id, { chargeId: replacement!.id, scenario: 'APPROVED' }, randomUUID()); expect(paid.order?.status).toBe('PAID'); expect(paid.amountCents).toBe(11500);
  expect((await f.db.offer.findUniqueOrThrow({ where: { id: ready.offer.id } })).stockOnHand).toBe(19);
});

test('failed automatic refunds remain visible; only ADMIN/system can retry, and repeated success does not credit twice', async () => {
  const ready = await f.ready(buyer); let failCapture = true;
  const gateway = { capture: async (id: string) => { if (failCapture) { failCapture = false; throw new Error('Lost response before local capture.'); } await f.gateway.capture(id); }, refund: (id: string) => f.gateway.refund(id) };
  const payments = new Payments(f.accounts, gateway), key = randomUUID(); await expect(payments.card(buyer.accessToken, ready.checkout.id, card(ready, 'APPROVED_REFUND_FAIL'), key)).rejects.toThrow();
  f.advance(16 * 60000); buyer = await f.accounts.renew(buyer.refreshToken, buyer.csrfToken); const view = await payments.card(buyer.accessToken, ready.checkout.id, card(ready, 'APPROVED_REFUND_FAIL'), key);
  const refund = view.refunds[0]!; expect(refund.status).toBe('FAILED'); expect(refund.attempts).toHaveLength(1); expect(view.orderId).toBeNull();
  const visible = await f.server.call<PaymentView>('/me/payment-attempts/' + view.id, 'GET', undefined, credentials(buyer)); expect(visible.status).toBe(200); expect(visible.body.refunds[0]!.status).toBe('FAILED');
  await f.freshRoles(); const path = '/admin/automatic-refunds/' + refund.id + '/retry', retryKey = randomUUID();
  for (const actor of [buyer, f.operator]) expect((await f.server.call(path, 'POST', { scenario: 'SUCCEEDED' }, { ...credentials(actor), 'Idempotency-Key': retryKey })).status).toBe(403);
  expect((await f.server.call(path, 'POST', { scenario: 'SUCCEEDED' }, { ...credentials(f.admin), 'Idempotency-Key': retryKey })).status).toBe(200);
  expect((await f.server.call(path, 'POST', { scenario: 'SUCCEEDED' }, { ...credentials(f.admin), 'Idempotency-Key': retryKey })).status).toBe(200);
  expect(await f.db.financialEvent.count({ where: { refundId: refund.id } })).toBe(1); expect(await f.db.refundAttempt.count({ where: { refundId: refund.id } })).toBe(2);
});

test('customer activity is owner-scoped, paginated and includes pending attempts without orders', async () => {
  const { result } = await pending(), other = await f.customer();
  expect((await f.server.call('/me/payment-attempts/' + result.id, 'GET', undefined, credentials(other))).status).toBe(404);
  const page = await f.server.call<{ items: PaymentView[]; total: number }>('/me/payment-attempts?pageSize=1', 'GET', undefined, credentials(buyer)); expect(page.body.total).toBe(1); expect(page.body.items[0]!.id).toBe(result.id);
  expect((await f.server.call('/me/payment-attempts?pageSize=10000', 'GET', undefined, credentials(buyer))).status).toBe(422);
});

async function waiting(expected: number) {
  for (let index = 0; index < 250; index++) { await f.control.query('SELECT pg_stat_clear_snapshot()'); const result = await f.control.query("SELECT count(DISTINCT application_name)::int AS n FROM pg_stat_activity WHERE application_name IN ('TASK019_A','TASK019_B') AND state='active' AND wait_event_type='Lock'"); if (result.rows[0].n === expected) return true; await new Promise(resolve => setTimeout(resolve, 20)); } return false;
}
test('two independent sessions applying one receipt wait on the customer and commit one sale and movement', async () => {
  const { ready, result } = await pending(); await f.gateway.event(result.id, 'APPROVED', randomUUID());
  await f.control.query('BEGIN'); await f.control.query('SELECT id FROM "User" WHERE id=$1 FOR UPDATE', [buyer.user.id]); const running = Promise.allSettled([f.payments.apply(result.id), f.secondPayments.apply(result.id)]); let observed: boolean;
  try { observed = await waiting(2); } finally { await f.control.query('ROLLBACK'); }
  expect(observed).toBe(true); expect((await running).every(value => value.status === 'fulfilled')).toBe(true);
  expect(await f.db.financialEvent.count({ where: { paymentAttemptId: result.id, type: 'SALE' } })).toBe(1); expect(await f.db.stockMovement.count({ where: { offerId: ready.offer.id } })).toBe(1);
});

test('expiry and approval contend on two real sessions; reaching the boundary while locked cannot commit a sale', async () => {
  const ready = await f.ready(buyer), order = await f.orders.create(buyer.accessToken, ready.body, ready.key), attempt = await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'PENDING' }, randomUUID());
  await f.gateway.event(attempt.id, 'APPROVED', randomUUID()); await f.control.query('BEGIN'); await f.control.query('SELECT id FROM "User" WHERE id=$1 FOR UPDATE', [buyer.user.id]);
  const applying = f.payments.apply(attempt.id); let seen: boolean;
  try { seen = await waiting(1); f.advance(Date.parse(order.expiresAt!) - f.clock.now().getTime()); const expiring = expireOrders(f.other, f.clock); expect(await waiting(2)).toBe(true); await f.control.query('ROLLBACK'); await Promise.all([applying, expiring]); }
  finally { await f.control.query('ROLLBACK'); }
  expect(seen).toBe(true); expect((await f.payments.view(attempt.id)).order?.status).toBe('CANCELLED'); expect(await f.db.financialEvent.count({ where: { orderId: order.id, type: 'SALE' } })).toBe(0);
});

test('gateway waits occur after intent commit and outside customer locks, allowing expiry before the provider responds', async () => {
  const ready = await f.ready(buyer); let release!: () => void, reached!: () => void;
  const reachedPromise = new Promise<void>(resolve => { reached = resolve; }), barrier = new Promise<void>(resolve => { release = resolve; });
  const payments = new Payments(f.accounts, { capture: async id => { reached(); await barrier; await f.gateway.capture(id); }, refund: id => f.gateway.refund(id) });
  const running = payments.card(buyer.accessToken, ready.checkout.id, card(ready), randomUUID()).catch(error => error); await reachedPromise;
  try { expect(await f.other.paymentAttempt.count({ where: { checkoutId: ready.checkout.id } })).toBe(1); f.advance(16 * 60000); expect(await expireReservations(f.other, f.clock)).toBeGreaterThanOrEqual(1); }
  finally { release(); }
  await running; const result = await f.db.paymentAttempt.findFirstOrThrow({ where: { checkoutId: ready.checkout.id } }); expect(result.outcome).toBe('REFUND_REQUIRED'); expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0);
});

test('application audit failure rolls back order, stock and sale while retaining the provider receipt for a safe retry', async () => {
  const { ready, result } = await pending(); await f.gateway.event(result.id, 'APPROVED', randomUUID());
  await f.control.query(`CREATE FUNCTION fail_payment_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='PAYMENT.PAID' THEN RAISE EXCEPTION 'isolated failure'; END IF; RETURN NEW; END $$`); await f.control.query('CREATE TRIGGER fail_payment_audit BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION fail_payment_audit()');
  try { await expect(f.payments.apply(result.id)).rejects.toThrow(); } finally { await f.control.query('DROP TRIGGER fail_payment_audit ON "AuditLog"'); await f.control.query('DROP FUNCTION fail_payment_audit()'); }
  expect(await f.db.order.count({ where: { checkoutId: ready.checkout.id } })).toBe(0); expect((await f.db.paymentAttempt.findUniqueOrThrow({ where: { id: result.id } })).result).toBe('APPROVED'); expect(await f.db.stockMovement.count({ where: { offerId: ready.offer.id } })).toBe(0);
  await f.secondPayments.apply(result.id); expect((await f.payments.view(result.id)).outcome).toBe('PAID');
});

test('lost refund response resumes the original successful provider attempt rather than issuing another credit', async () => {
  const { result } = await pending(); f.advance(16 * 60000); await f.gateway.event(result.id, 'APPROVED', randomUUID()); let fail = true;
  const payments = new Payments(f.accounts, { capture: id => f.gateway.capture(id), refund: async id => { await f.gateway.refund(id); if (fail) { fail = false; throw new Error('Lost refund response.'); } } });
  await expect(payments.apply(result.id)).rejects.toThrow(); const refund = await f.db.refund.findFirstOrThrow({ where: { paymentAttemptId: result.id } }); expect(refund.status).toBe('PENDING');
  await f.secondPayments.apply(result.id); expect(await f.db.refundAttempt.count({ where: { refundId: refund.id } })).toBe(1); expect(await f.db.financialEvent.count({ where: { refundId: refund.id } })).toBe(1);
});

test('two independent refund retries reuse one durable unfinished attempt and commit one refund event', async () => {
  const { result } = await pending(); f.advance(16 * 60000); await f.gateway.event(result.id, 'APPROVED', randomUUID());
  await expect(new Payments(f.accounts, { capture: id => f.gateway.capture(id), refund: async () => { throw new Error('Provider unavailable before receipt.'); } }).apply(result.id)).rejects.toThrow();
  const refund = await f.db.refund.findFirstOrThrow({ where: { paymentAttemptId: result.id } });
  await f.control.query('BEGIN'); await f.control.query('SELECT id FROM "User" WHERE id=$1 FOR UPDATE', [buyer.user.id]);
  const results = Promise.allSettled([new AutomaticRefunds(f.accounts, f.gateway).run(refund.id, 'worker-a'), new AutomaticRefunds(f.secondAccounts, new LocalGateway(f.other, f.clock)).run(refund.id, 'worker-b')]); let observed: boolean;
  try { observed = await waiting(2); } finally { await f.control.query('ROLLBACK'); }
  expect(observed).toBe(true); expect((await results).every(value => value.status === 'fulfilled')).toBe(true);
  expect(await f.db.refundAttempt.count({ where: { refundId: refund.id } })).toBe(1); expect(await f.db.financialEvent.count({ where: { refundId: refund.id } })).toBe(1);
});

test('coupon capacity excludes a pending order that expired even when its expiry worker has not run', async () => {
  const code = 'LAG' + randomUUID().replaceAll('-', '').slice(0, 10).toUpperCase();
  await f.pricing.createCoupon(f.admin.accessToken, { code, type: 'FIXED', amount: 1, startsAt: f.clock.now().toISOString(), endsAt: new Date(f.clock.now().getTime() + 7 * 86400000).toISOString(), totalLimit: 1 });
  const ready = await f.ready(buyer, { couponCode: code }), order = await f.orders.create(buyer.accessToken, ready.body, ready.key);
  f.advance(Date.parse(order.expiresAt!) - f.clock.now().getTime()); await f.freshRoles(); const other = await f.customer(), next = await f.ready(other, { couponCode: code }); expect(next.checkout.status).toBe('ACTIVE');
  expect((await f.db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PENDING');
  expect((await f.db.couponUsage.findUniqueOrThrow({ where: { orderId: order.id } })).status).toBe('CONSUMED');
});

test('terminal receipts and immutable financial events cannot be rewritten, and event identities cannot target another attempt', async () => {
  const { ready, result } = await pending(), event = randomUUID(); await f.gateway.event(result.id, 'APPROVED', event); await f.payments.apply(result.id);
  await expect(f.gateway.event(result.id, 'DECLINED', randomUUID())).rejects.toThrow(); await f.gateway.event(result.id, 'APPROVED', event);
  await expect(f.db.paymentAttempt.update({ where: { id: result.id }, data: { amountCents: 1n } })).rejects.toThrow();
  const financial = await f.db.financialEvent.findFirstOrThrow({ where: { paymentAttemptId: result.id } }); await expect(f.db.financialEvent.update({ where: { id: financial.id }, data: { shippingCents: 0 } })).rejects.toThrow();
  const other = await f.customer(), draft = await f.ready(other, { offer: ready.offer }), second = await f.payments.card(other.accessToken, draft.checkout.id, card(draft, 'PENDING'), randomUUID());
  await expect(f.gateway.event(second.id, 'APPROVED', event)).rejects.toThrow(); expect((await f.db.paymentAttempt.findUniqueOrThrow({ where: { id: second.id } })).result).toBe('PENDING');
});

test('commercial message preparation/delivery is protected, retryable and independent from committed payment', async () => {
  const ready = await f.ready(buyer), payment = await f.payments.card(buyer.accessToken, ready.checkout.id, card(ready), randomUUID());
  const protection = new MessageProtection(randomBytes(32).toString('hex'), randomBytes(32).toString('base64url')), messages = new AccessMessages(f.accounts, protection, 'https://localhost:5173');
  for (let index = 0; index < 300; index++) { const result = await consumeCommerce(messages); if (result === 'EMPTY') break; expect(result).toBe('PROCESSED'); }
  const event = await f.db.domainEvent.findFirstOrThrow({ where: { aggregateId: payment.id, type: 'PAYMENT.PAID' } }), before = await f.db.demoMessage.findFirstOrThrow({ where: { eventId: event.id } });
  expect(before.restrictedBody).not.toContain(buyer.user.id); expect(JSON.parse(protection.open(before.id, before.restrictedBody))).toMatchObject({ purpose: 'PAYMENT.PAID', userId: buyer.user.id });
  await f.db.demoMessage.updateMany({ where: { type: { startsWith: 'COMMERCE.' } }, data: { status: 'DELIVERED' } }); await f.db.demoMessage.update({ where: { id: before.id }, data: { status: 'PENDING' } });
  expect(await deliverCommerce(messages, () => { throw new Error('Local delivery unavailable.'); })).toBe('FAILED'); expect((await f.payments.view(payment.id)).outcome).toBe('PAID'); expect(await deliverCommerce(messages)).toBe('DELIVERED'); expect(await deliverCommerce(messages)).toBe('EMPTY');
  expect(await f.db.demoMessage.count({ where: { eventId: event.id } })).toBe(1);
});

test('source and built CLI reject missing or malformed protected database configuration without printing it', async () => {
  for (const entry of ['apps/api/src/modules/payments/cli.ts', 'apps/api/dist/modules/payments/cli.js']) {
    const run = spawnSync(process.execPath, [entry, 'expire'], { env: { ...process.env, DATABASE_URL: 'postgres://secret-user:do-not-print@/broken' }, encoding: 'utf8' });
    expect(run.status).toBe(1); expect(run.stdout + run.stderr).not.toContain('do-not-print'); expect(run.stderr).toContain('Local simulator could not complete');
  }
});
