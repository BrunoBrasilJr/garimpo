import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, expect, test } from 'vitest';
import { Customers } from '../../../apps/api/src/modules/accounts/blocking.ts';
import { closeAccount } from '../../../apps/api/src/modules/accounts/closure.ts';
import { requestReactivation, confirmReactivation } from '../../../apps/api/src/modules/accounts/reactivation.ts';
import { confirmEmailChange } from '../../../apps/api/src/modules/accounts/email-change.ts';
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
