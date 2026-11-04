import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import { Customers } from '../../../apps/api/src/modules/accounts/blocking.ts';
import { closeAccount } from '../../../apps/api/src/modules/accounts/closure.ts';
import { requestReactivation, confirmReactivation } from '../../../apps/api/src/modules/accounts/reactivation.ts';
import { requestEmailChange, confirmEmailChange } from '../../../apps/api/src/modules/accounts/email-change.ts';
import { AccessMessages } from '../../../apps/api/src/modules/messaging/service.ts';
import { consumeCommerce, deliverCommerce } from '../../../apps/api/src/modules/messaging/commerce.ts';
import type { RestrictedMessage } from '@garimpo/contracts';
import type { SessionBundle } from '../../../apps/api/src/modules/accounts/service.ts';
import { foundation, credentials } from './fixtures.ts';
let f: Awaited<ReturnType<typeof foundation>>, buyer: SessionBundle, customers: Customers;
beforeAll(async () => { f = await foundation(); customers = new Customers(f.accounts); });
beforeEach(async () => { await f.freshRoles(); buyer = await f.customer(); }); afterAll(async () => { await f?.close(); });
async function link(email: string, type = 'ACCESS.REACTIVATE') {
  const box = await f.messages.mailbox(undefined, { recipient: email, type }); if (!('items' in box)) throw new Error('Expected paginated mailbox.');
  const message = box.items[0] as RestrictedMessage | undefined; if (!message) throw new Error('Expected protected access link.');
  return { message, token: new URLSearchParams(new URL(message.content.link).hash.split('?')[1]).get('token')! };
}
test('operator can only consult limited customers; transport, owner and CSRF guards run before malformed protected input', async () => {
  expect((await f.server.call('/admin/customers', 'GET', undefined, credentials(f.operator))).status).toBe(200);
  const path = '/admin/customers/' + buyer.user.id + '/block', bad = Buffer.from('{bad');
  expect((await f.server.call(path, 'POST', bad, credentials(f.operator))).status).toBe(403);
  expect((await f.server.call(path, 'POST', bad, credentials(buyer))).status).toBe(403);
  expect((await f.server.call(path, 'POST', bad, { ...credentials(f.admin), 'X-CSRF-Token': '' })).status).toBe(403);
  expect((await f.server.call('/me/closure', 'POST', bad, { ...credentials(buyer), 'X-Garimpo-Account': randomUUID() })).status).toBe(403);
  expect((await f.server.call('/me/closure', 'POST', { confirm: true }, credentials(buyer), true)).status).toBe(403);
  const result = await customers.detail(f.operator.accessToken, buyer.user.id); expect(result.email).toBe(buyer.user.email); expect(JSON.stringify(result)).not.toMatch(/passwordHash|refreshHash|credentialHash/);
  await expect(customers.detail(f.operator.accessToken, f.admin.user.id)).rejects.toMatchObject({ status: 404 });
});
test('block cancels checkout and pending orders atomically, preserves paid history and never restores old sessions on unblock', async () => {
  const first = await f.ready(buyer), pending = await f.orders.create(buyer.accessToken, first.body, first.key), second = await f.ready(buyer);
  const card = await f.payments.card(buyer.accessToken, second.checkout.id, { version: second.body.version, addressId: second.address.id, freightRevision: second.body.freightRevision, scenario: 'APPROVED' }, randomUUID());
  const active = await f.ready(buyer), before = await customers.detail(f.admin.accessToken, buyer.user.id), key = randomUUID();
  await customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', { revision: before.revision, reason: 'Bloqueio sintético conferido' }, key);
  expect((await f.db.order.findUniqueOrThrow({ where: { id: pending.id } })).status).toBe('CANCELLED'); expect((await f.db.order.findUniqueOrThrow({ where: { id: card.order!.id } })).status).toBe('PAID');
  expect((await f.db.checkout.findUniqueOrThrow({ where: { id: active.checkout.id } })).status).toBe('CANCELLED');
  expect(await f.db.reservation.count({ where: { checkoutItem: { checkout: { userId: buyer.user.id } }, status: 'ACTIVE' } })).toBe(0);
  expect((await f.db.paymentCharge.findUniqueOrThrow({ where: { id: pending.charges[0]!.id } })).status).toBe('CANCELLED');
  await expect(f.accounts.login(buyer.user.email, f.password)).rejects.toMatchObject({ status: 401 }); await expect(f.accounts.renew(buyer.refreshToken)).rejects.toMatchObject({ status: 401 });
  const blocked = await customers.detail(f.admin.accessToken, buyer.user.id);
  await customers.restrict(f.admin.accessToken, buyer.user.id, 'UNBLOCK', { revision: blocked.revision, reason: 'Desbloqueio sintético' }, randomUUID());
  await expect(f.accounts.authorize(f.db, buyer.accessToken)).rejects.toMatchObject({ status: 401 }); expect(await f.db.orderStatusEvent.count({ where: { orderId: pending.id, toStatus: 'CANCELLED' } })).toBe(1);
});
test('closure revokes all links and sessions, preserves data, and requires fresh registered-email confirmation to reactivate once', async () => {
  const ready = await f.ready(buyer), order = await f.orders.create(buyer.accessToken, ready.body, ready.key);
  await f.messages.issue(f.db, await f.db.user.findUniqueOrThrow({ where: { id: buyer.user.id } }), 'VERIFY');
  expect((await closeAccount(f.accounts, buyer.accessToken, { confirm: true }, randomUUID())).closed).toBe(true);
  expect((await f.db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('CANCELLED');
  expect(await f.db.address.count({ where: { userId: buyer.user.id } })).toBe(1); expect(await f.db.emailToken.count({ where: { userId: buyer.user.id, usedAt: null } })).toBe(0);
  await requestReactivation(f.messages, buyer.user.email); const access = await link(buyer.user.email);
  expect(access.message.content.link).toContain('/#/reactivation?token='); expect(new Date(access.message.content.expiresAt).getTime() - f.clock.now().getTime()).toBe(86400000);
  await confirmReactivation(f.messages, access.token); expect((await f.db.user.findUniqueOrThrow({ where: { id: buyer.user.id } })).closedAt).toBeNull();
  await expect(confirmReactivation(f.messages, access.token)).rejects.toMatchObject({ code: 'INVALID_ACCESS_LINK' });
  await expect(f.accounts.authorize(f.db, buyer.accessToken)).rejects.toMatchObject({ status: 401 }); await expect(f.accounts.renew(buyer.refreshToken)).rejects.toMatchObject({ status: 401 });
});
test('administrative block wins over a retained closed account and invalidates reactivation; unblocking never reopens it', async () => {
  await closeAccount(f.accounts, buyer.accessToken, { confirm: true }, randomUUID()); await requestReactivation(f.messages, buyer.user.email); const access = await link(buyer.user.email);
  const before = await customers.detail(f.admin.accessToken, buyer.user.id);
  await customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', { revision: before.revision, reason: 'Bloqueio após encerramento' }, randomUUID());
  await expect(confirmReactivation(f.messages, access.token)).rejects.toMatchObject({ code: 'INVALID_ACCESS_LINK' });
  const blocked = await customers.detail(f.admin.accessToken, buyer.user.id); await customers.restrict(f.admin.accessToken, buyer.user.id, 'UNBLOCK', { revision: blocked.revision, reason: 'Retirar apenas bloqueio' }, randomUUID());
  expect((await customers.detail(f.operator.accessToken, buyer.user.id)).closedAt).not.toBeNull();
});
test('admin correction keeps the original email until confirmation and stale revisions cannot overwrite later profile data', async () => {
  const before = await customers.detail(f.admin.accessToken, buyer.user.id), email = randomUUID() + '@example.invalid';
  const result = await customers.correct(f.admin.accessToken, buyer.user.id, { revision: before.revision, name: 'Nome corrigido', email }, randomUUID(), f.messages);
  expect(result.email).toBe(buyer.user.email); expect(result.name).toBe('Nome corrigido');
  await expect(customers.correct(f.admin.accessToken, buyer.user.id, { revision: before.revision, name: 'Dados antigos' }, randomUUID(), f.messages)).rejects.toMatchObject({ code: 'CUSTOMER_VERSION_CONFLICT' });
  const access = await link(email, 'ACCESS.CHANGE'); await confirmEmailChange(f.messages, access.token);
  expect((await customers.detail(f.operator.accessToken, buyer.user.id)).email).toBe(email);
});

test('a real payment application and administrative block serialize to a preserved sale or one automatic refund, never both', async () => {
  const ready = await f.ready(buyer), order = await f.orders.create(buyer.accessToken, ready.body, ready.key);
  const attempt = await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'PENDING' }, randomUUID());
  await f.gateway.event(attempt.id, 'APPROVED', randomUUID()); const before = await customers.detail(f.admin.accessToken, buyer.user.id);
  const results = await Promise.allSettled([f.secondPayments.apply(attempt.id), customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', { revision: before.revision, reason: 'Bloqueio concorrente à aplicação financeira' }, randomUUID())]);
  expect(results.every(r => r.status === 'fulfilled')).toBe(true);
  const actual = await f.db.order.findUniqueOrThrow({ where: { id: order.id } }), sales = await f.db.financialEvent.count({ where: { orderId: order.id, type: 'SALE' } }), refunds = await f.db.refund.count({ where: { paymentAttemptId: attempt.id } });
  expect(['PAID', 'CANCELLED']).toContain(actual.status);
  expect(sales).toBe(actual.status === 'PAID' ? 1 : 0); expect(refunds).toBe(actual.status === 'PAID' ? 0 : 1);
  expect((await customers.detail(f.operator.accessToken, buyer.user.id)).blockedAt).not.toBeNull();
  await f.secondPayments.apply(attempt.id); expect(await f.db.refund.count({ where: { paymentAttemptId: attempt.id } })).toBe(refunds); expect(await f.db.financialEvent.count({ where: { orderId: order.id, type: 'SALE' } })).toBe(sales);
});

test('audit failure rolls restriction, sessions, links, reservation, order, event, receipt and message back before retry', async () => {
  const ready = await f.ready(buyer), order = await f.orders.create(buyer.accessToken, ready.body, ready.key), active = await f.ready(buyer);
  const before = await customers.detail(f.admin.accessToken, buyer.user.id), key = randomUUID(), command = { revision: before.revision, reason: 'Auditoria sintética indisponível' };
  await f.control.query(`CREATE FUNCTION fail_lifecycle_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='CUSTOMER.BLOCK' THEN RAISE EXCEPTION 'isolated audit failure'; END IF; RETURN NEW; END $$`);
  await f.control.query('CREATE TRIGGER fail_lifecycle_audit BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION fail_lifecycle_audit()');
  try { await expect(customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', command, key)).rejects.toThrow(); }
  finally { await f.control.query('DROP TRIGGER fail_lifecycle_audit ON "AuditLog"'); await f.control.query('DROP FUNCTION fail_lifecycle_audit()'); }
  expect((await customers.detail(f.admin.accessToken, buyer.user.id)).blockedAt).toBeNull();
  await expect(f.accounts.authorize(f.db, buyer.accessToken)).resolves.toBeDefined();
  expect((await f.db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PENDING'); expect((await f.db.checkout.findUniqueOrThrow({ where: { id: active.checkout.id } })).status).toBe('ACTIVE');
  expect(await f.db.orderStatusEvent.count({ where: { orderId: order.id, toStatus: 'CANCELLED' } })).toBe(0); expect(await f.db.domainEvent.count({ where: { aggregateId: order.id, type: 'ORDER.CANCELLED' } })).toBe(0);
  expect(await f.db.idempotencyRecord.count({ where: { actorScope: f.admin.user.id, operation: 'CUSTOMER.BLOCK', key } })).toBe(0);
  await customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', command, key); expect((await f.db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('CANCELLED');
});

test('reactivation links are superseded, expire at their actual boundary and cannot be replaced by verification tokens', async () => {
  await closeAccount(f.accounts, buyer.accessToken, { confirm: true }, randomUUID());
  await requestReactivation(f.messages, buyer.user.email); const first = await link(buyer.user.email);
  // Keep ordering deterministic when issuance shares the same controlled millisecond.
  f.advance(1); await requestReactivation(f.messages, buyer.user.email); const second = await link(buyer.user.email);
  await expect(confirmReactivation(f.messages, first.token)).rejects.toMatchObject({ code: 'INVALID_ACCESS_LINK' });
  const row = await f.db.user.findUniqueOrThrow({ where: { id: buyer.user.id } }); await f.messages.issue(f.db, row, 'VERIFY');
  const wrong = await link(buyer.user.email, 'ACCESS.VERIFY'); await expect(confirmReactivation(f.messages, wrong.token)).rejects.toMatchObject({ code: 'INVALID_ACCESS_LINK' });
  f.advance(86400000); await expect(confirmReactivation(f.messages, second.token)).rejects.toMatchObject({ code: 'INVALID_ACCESS_LINK' });
  expect((await f.db.user.findUniqueOrThrow({ where: { id: buyer.user.id } })).closedAt).not.toBeNull();
});

test('a live checkout creation racing an administrative block cannot leave any active commitment or hold', async () => {
  const offer = await f.offer(), draft = await f.draft(buyer, offer.id), before = await customers.detail(f.admin.accessToken, buyer.user.id);
  const [reservation, blocked] = await Promise.all([f.server.call('/checkouts', 'POST', draft, { ...credentials(buyer), 'Idempotency-Key': randomUUID() }), customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', { revision: before.revision, reason: 'Bloqueio concorrente à reserva' }, randomUUID())]);
  expect([201, 401, 403]).toContain(reservation.status); expect(blocked.blockedAt).not.toBeNull();
  expect(await f.db.checkout.count({ where: { userId: buyer.user.id, status: 'ACTIVE' } })).toBe(0);
  expect(await f.db.reservation.count({ where: { checkoutItem: { checkout: { userId: buyer.user.id } }, status: 'ACTIVE' } })).toBe(0);
  expect((await f.db.offer.findUniqueOrThrow({ where: { id: offer.id } })).onHand).toBe(20);
});

test('a block committed while a second connection waits for reactivation is revalidated even before token invalidation', async () => {
  await closeAccount(f.accounts, buyer.accessToken, { confirm: true }, randomUUID()); await requestReactivation(f.messages, buyer.user.email); const access = await link(buyer.user.email);
  const other = new AccessMessages(f.secondAccounts, f.messages.protection, 'https://localhost:5173');
  await f.control.query('BEGIN'); await f.control.query('SELECT id FROM "User" WHERE id=$1 FOR UPDATE', [buyer.user.id]);
  const result = confirmReactivation(other, access.token).then(() => ({ code: 'UNEXPECTED_SUCCESS' }), cause => cause); let observed = false;
  try {
    for (let attempt = 0; attempt < 200 && !observed; attempt++) { await f.control.query('SELECT pg_stat_clear_snapshot()'); const waiting = await f.control.query("SELECT count(*)::int AS count FROM pg_stat_activity WHERE application_name='TASK022_B' AND wait_event_type='Lock'"); observed = waiting.rows[0].count > 0; if (!observed) await new Promise(resolve => setTimeout(resolve, 10)); }
    // A committed external block flag isolates the user-state recheck from link invalidation.
    await f.control.query('UPDATE "User" SET "blockedAt"=$2 WHERE id=$1', [buyer.user.id, f.clock.now()]);
  } finally { await f.control.query('COMMIT'); }
  expect(observed).toBe(true); expect(await result).toMatchObject({ code: 'INVALID_ACCESS_LINK' });
  const user = await f.db.user.findUniqueOrThrow({ where: { id: buyer.user.id } }); expect(user.closedAt).not.toBeNull(); expect(user.blockedAt).not.toBeNull();
});

test('repeated restriction reuses its receipt and changed payload or stale revision cannot produce a second effect', async () => {
  const before = await customers.detail(f.admin.accessToken, buyer.user.id), key = randomUUID(), body = { revision: before.revision, reason: 'Teste de recibo idempotente' };
  const first = await customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', body, key), second = await customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', body, key);
  expect(second).toEqual(first); expect(await f.db.auditLog.count({ where: { action: 'CUSTOMER.BLOCK', targetId: buyer.user.id } })).toBe(1);
  await expect(customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', { ...body, reason: 'Outro conteúdo' }, key)).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  await expect(customers.restrict(f.admin.accessToken, buyer.user.id, 'UNBLOCK', body, randomUUID())).rejects.toMatchObject({ code: 'CUSTOMER_VERSION_CONFLICT' });
});

test('public reactivation responds generically for unknown, active, internal and administratively blocked accounts', async () => {
  const replies = [];
  for (const email of [randomUUID() + '@example.invalid', buyer.user.email, f.admin.user.email]) replies.push(await f.server.call('/auth/reactivation', 'POST', { email }, { Origin: 'https://localhost:5173' }));
  await closeAccount(f.accounts, buyer.accessToken, { confirm: true }, randomUUID()); const before = await customers.detail(f.admin.accessToken, buyer.user.id);
  await customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', { revision: before.revision, reason: 'Bloqueio impede reativação pública' }, randomUUID());
  replies.push(await f.server.call('/auth/reactivation', 'POST', { email: buyer.user.email }, { Origin: 'https://localhost:5173' }));
  for (const response of replies) { expect(response.status).toBe(202); expect(response.body).toEqual(replies[0]!.body); }
  expect(await f.db.demoMessage.count({ where: { userId: buyer.user.id, type: 'ACCESS.REACTIVATE' } })).toBe(0);
});

test('restriction releases consumed and reserved coupons together without changing physical stock', async () => {
  async function coupon() {
    const code = 'LIFE' + randomUUID().replaceAll('-', '').slice(0, 16).toUpperCase();
    const result = await f.server.call('/admin/coupons', 'POST', { code, type: 'FIXED', amount: 500, startsAt: f.clock.now().toISOString(), endsAt: new Date(f.clock.now().getTime() + 86400000).toISOString(), totalLimit: 1, perUserLimit: 1 }, credentials(f.admin)); expect(result.status).toBe(201); return code;
  }
  const consumed = await coupon(), reserved = await coupon(), ready = await f.ready(buyer, { couponCode: consumed }), order = await f.orders.create(buyer.accessToken, ready.body, ready.key), active = await f.ready(buyer, { couponCode: reserved });
  const before = await customers.detail(f.admin.accessToken, buyer.user.id); await customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', { revision: before.revision, reason: 'Liberar compromissos sintéticos' }, randomUUID());
  const usages = await f.db.couponUsage.findMany({ where: { userId: buyer.user.id } }); expect(usages).toHaveLength(2); expect(usages.every(u => u.status === 'RELEASED')).toBe(true);
  for (const id of [ready.offer.id, active.offer.id]) expect((await f.db.offer.findUniqueOrThrow({ where: { id } })).onHand).toBe(20);
  expect((await f.db.orderUnit.findMany({ where: { orderItem: { orderId: order.id } } })).every(unit => unit.commercialState === 'CANCELLED')).toBe(true);
  const another = await f.customer(); await expect(f.ready(another, { couponCode: consumed })).resolves.toBeDefined();
});

test('account cancellation produces a protected repeatable message and mailbox failure cannot undo cancelled commitments', async () => {
  const ready = await f.ready(buyer), order = await f.orders.create(buyer.accessToken, ready.body, ready.key); await closeAccount(f.accounts, buyer.accessToken, { confirm: true }, randomUUID());
  for (let i = 0; i < 200; i++) { const result = await consumeCommerce(f.messages); if (result === 'EMPTY') break; expect(result).toBe('PROCESSED'); }
  const message = await f.db.demoMessage.findFirstOrThrow({ where: { type: 'COMMERCE.ORDER.CANCELLED', event: { aggregateId: order.id } } });
  const body = JSON.parse(f.messages.protection.open(message.id, message.restrictedBody)); expect(body.recipient).toBe(buyer.user.email); expect(body.orderId).toBe(order.id); expect(body.link).toContain('/#/orders?id=' + order.id);
  expect(message.restrictedBody).not.toContain(buyer.user.email);
  for (let i = 0; i < 200; i++) { if ((await f.db.demoMessage.findUniqueOrThrow({ where: { id: message.id } })).status === 'FAILED') break; expect(await deliverCommerce(f.messages, () => { throw new Error('isolated delivery failure'); })).toBe('FAILED'); }
  expect((await f.db.demoMessage.findUniqueOrThrow({ where: { id: message.id } })).status).toBe('FAILED'); expect((await f.db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('CANCELLED');
  for (let i = 0; i < 200; i++) { if ((await f.db.demoMessage.findUniqueOrThrow({ where: { id: message.id } })).status === 'DELIVERED') break; expect(await deliverCommerce(f.messages)).toBe('DELIVERED'); }
  expect((await f.db.demoMessage.findUniqueOrThrow({ where: { id: message.id } })).status).toBe('DELIVERED'); expect(await f.db.financialEvent.count({ where: { orderId: order.id } })).toBe(0);
});

test('admin can confirm a corrected email for a blocked closed customer without reactivating access or rescuing old links', async () => {
  const oldPending = randomUUID() + '@example.invalid', first = await customers.detail(f.admin.accessToken, buyer.user.id);
  await customers.correct(f.admin.accessToken, buyer.user.id, { revision: first.revision, email: oldPending }, randomUUID(), f.messages); const old = await link(oldPending, 'ACCESS.CHANGE');
  await closeAccount(f.accounts, buyer.accessToken, { confirm: true }, randomUUID()); const closed = await customers.detail(f.admin.accessToken, buyer.user.id);
  await customers.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', { revision: closed.revision, reason: 'Manter bloqueio durante correção' }, randomUUID());
  await expect(confirmEmailChange(f.messages, old.token)).rejects.toMatchObject({ code: 'INVALID_ACCESS_LINK' });
  const before = await customers.detail(f.admin.accessToken, buyer.user.id), email = randomUUID() + '@example.invalid';
  const queued = await customers.correct(f.admin.accessToken, buyer.user.id, { revision: before.revision, name: 'Correção sem reativar', email }, randomUUID(), f.messages); expect(queued.email).toBe(buyer.user.email);
  const proof = await link(email, 'ACCESS.CHANGE'); await confirmEmailChange(f.messages, proof.token);
  const after = await customers.detail(f.operator.accessToken, buyer.user.id); expect(after.email).toBe(email); expect(after.closedAt).toBe(before.closedAt); expect(after.blockedAt).toBe(before.blockedAt);
  await expect(f.accounts.login(email, f.password)).rejects.toMatchObject({ status: 401 }); await expect(f.accounts.renew(buyer.refreshToken)).rejects.toMatchObject({ status: 401 });
});

test('a self-service email link never becomes an administrative permission when a customer flag changes', async () => {
  const email = randomUUID() + '@example.invalid'; await requestEmailChange(f.messages, buyer.accessToken, email); const proof = await link(email, 'ACCESS.CHANGE');
  // Isolate the availability guard from normal lifecycle token invalidation.
  await f.db.user.update({ where: { id: buyer.user.id }, data: { blockedAt: f.clock.now() } });
  await expect(confirmEmailChange(f.messages, proof.token)).rejects.toMatchObject({ code: 'INVALID_ACCESS_LINK' });
  expect((await f.db.user.findUniqueOrThrow({ where: { id: buyer.user.id } })).emailNormalized).toBe(buyer.user.email);
});
