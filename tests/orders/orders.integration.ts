import { beforeAll, beforeEach, afterAll, expect, test } from 'vitest';
import { randomBytes, randomUUID } from 'node:crypto';
import type { OrderDetail, OrderPage } from '@garimpo/contracts';
import type { SessionBundle } from '../../apps/api/src/modules/accounts/service.ts';
import { AccessMessages } from '../../apps/api/src/modules/messaging/service.ts';
import { MessageProtection } from '../../apps/api/src/modules/messaging/protection.ts';
import { consumeCommerce, deliverCommerce } from '../../apps/api/src/modules/messaging/commerce.ts';
import { expireOrders } from '../../apps/api/src/jobs/order-expiry.ts';
import { foundation, credentials } from './fixtures.ts';
let f: Awaited<ReturnType<typeof foundation>>, buyer: SessionBundle;
beforeAll(async () => { f = await foundation(); }); beforeEach(async () => { await f.freshRoles(); buyer = await f.customer(); }); afterAll(async () => { await f?.close(); });
async function purchase(method: 'CARD' | 'PIX' | 'BOLETO' = 'CARD', paid = true) {
  const ready = await f.ready(buyer, { quantity: 2 });
  if (method === 'CARD') { const result = await f.payments.card(buyer.accessToken, ready.checkout.id, { version: ready.body.version, addressId: ready.body.addressId, freightRevision: ready.body.freightRevision, scenario: 'APPROVED' }, randomUUID()); return { ready, order: result.order! }; }
  const order = await f.orders.create(buyer.accessToken, { ...ready.body, method }, ready.key);
  if (paid) { const result = await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID()); return { ready, order: result.order! }; } return { ready, order };
}
const step = async (id: string, status: 'PREPARING' | 'SEPARATED') => { const row = await f.history.detail(f.operator.accessToken, id, undefined, true); return f.logistics.change(f.operator.accessToken, id, { version: row.version, status, reason: 'Etapa sintética conferida' }, randomUUID()); };
async function separated(id: string) { await step(id, 'PREPARING'); return step(id, 'SEPARATED'); }
async function shipped(id: string) { const row = await separated(id); return f.logistics.change(f.operator.accessToken, id, { version: row.version, status: 'SHIPPED', reason: 'Postagem sintética efetiva', trackingCode: 'TEST-' + randomUUID(), postedAt: f.clock.now().toISOString() }, randomUUID()); }

test('history and logistics endpoints enforce transport, roles, origin, CSRF and expected actor before malformed payloads', async () => {
  const bad = Buffer.from('{bad'), id = randomUUID(), path = '/admin/orders/' + id + '/status', headers = { ...credentials(buyer), 'Content-Type': 'application/json' };
  expect((await f.server.call('/me/orders', 'GET', undefined, credentials(buyer), true)).status).toBe(403);
  expect((await f.server.call(path, 'PATCH', bad, headers)).status).toBe(403);
  expect((await f.server.call(path, 'PATCH', bad, { ...credentials(f.operator), 'Content-Type': 'application/json', 'X-CSRF-Token': '' })).status).toBe(403);
  expect((await f.server.call(path, 'PATCH', bad, { ...credentials(f.admin), 'Content-Type': 'application/json', Origin: 'https://other.invalid' })).status).toBe(403);
  expect((await f.server.call(path, 'PATCH', bad, { ...credentials(f.operator), 'Content-Type': 'application/json', 'X-Garimpo-Account': f.admin.user.id })).status).toBe(403);
  expect((await f.server.call('/admin/orders', 'GET', undefined, { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + f.admin.accessToken })).status).toBe(403);
  expect((await f.server.call('/me/orders', 'GET', undefined, credentials(f.operator))).status).toBe(403);
});

test('own list/detail scope, strict filters and pagination do not expose another customer, provider intent or credentials', async () => {
  const { order } = await purchase(), other = await f.customer();
  const own = await f.server.call<OrderPage>('/me/orders?pageSize=1', 'GET', undefined, credentials(buyer)); expect(own.status).toBe(200); expect(own.body.total).toBe(1); expect(own.body.items[0]!.id).toBe(order.id); expect(own.body.items[0]!.customer).toBeUndefined();
  expect((await f.server.call('/me/orders/' + order.id, 'GET', undefined, credentials(other))).status).toBe(404); expect((await f.server.call('/me/orders?customerEmail=someone@example.invalid', 'GET', undefined, credentials(buyer))).status).toBe(422);
  const detail = await f.server.call<OrderDetail>('/me/orders/' + order.id, 'GET', undefined, credentials(buyer)); expect(detail.status).toBe(200); expect(detail.body.customer).toBeUndefined(); expect(detail.raw.toString()).not.toMatch(/passwordHash|credentialHash|eventKey|requestHash|freightRevision|refreshToken/); expect(detail.body.payments.items).toHaveLength(1);
  const staff = await f.history.detail(f.operator.accessToken, order.id, undefined, true); expect(staff.customer?.id).toBe(buyer.user.id);
});

for (const method of ['CARD', 'PIX', 'BOLETO'] as const) test(method + ' records actual creation/payment dates and immutable events with the original snapshots', async () => {
  const { ready, order } = await purchase(method), detail = await f.history.detail(buyer.accessToken, order.id);
  expect(detail.products).toEqual(order.products); expect(detail.events.map(e => e.toStatus)).toEqual(method === 'CARD' ? ['PAID'] : ['PENDING', 'PAID']); expect(detail.paidAt).not.toBeNull(); expect(detail.shipment).toBeNull();
  await f.catalog.updateEdition(f.admin.accessToken, ready.offer.editionId, { title: 'Título posterior' }); await f.accounts.addresses(buyer.accessToken, 'UPDATE', { street: 'Rua posterior' }, ready.address.id);
  const frozen = await f.history.detail(buyer.accessToken, order.id); expect(frozen.products).toEqual(detail.products); expect(frozen.address).toEqual(detail.address); expect(frozen.totalCents).toBe(order.totalCents);
  const event = await f.db.orderStatusEvent.findFirstOrThrow({ where: { orderId: order.id } }); await expect(f.db.orderStatusEvent.update({ where: { id: event.id }, data: { reason: 'Reescrever história' } })).rejects.toThrow(); await expect(f.db.orderStatusEvent.delete({ where: { id: event.id } })).rejects.toThrow();
});

test('pending orders cannot skip payment and invalid jumps/rewinds do not mutate money, history or shipment', async () => {
  const { order } = await purchase('PIX', false);
  await expect(f.logistics.change(f.admin.accessToken, order.id, { version: order.version, status: 'PREPARING', reason: 'Tentativa sem pagamento' }, randomUUID())).rejects.toMatchObject({ code: 'ORDER_STAGE_CONFLICT' });
  const paid = await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
  await expect(f.logistics.change(f.operator.accessToken, order.id, { version: paid.order!.version, status: 'SHIPPED', reason: 'Salto inválido de etapa', trackingCode: 'TEST', postedAt: f.clock.now().toISOString() }, randomUUID())).rejects.toMatchObject({ code: 'ORDER_STAGE_CONFLICT' });
  const preparing = await step(order.id, 'PREPARING'); await expect(f.logistics.change(f.operator.accessToken, order.id, { version: preparing.version, status: 'PREPARING', reason: 'Repetição com nova chave' }, randomUUID())).rejects.toMatchObject({ code: 'ORDER_STAGE_CONFLICT' });
  expect(await f.db.shipment.count({ where: { orderId: order.id } })).toBe(0); expect(await f.db.financialEvent.count({ where: { orderId: order.id, type: 'SALE' } })).toBe(1);
});

test('ADMIN/OPERATOR complete only the valid original flow; effective delivery marks every kept unit and sends no intermediate notifications', async () => {
  const { order } = await purchase(), row = await shipped(order.id); expect(row.status).toBe('SHIPPED'); expect(row.shipment?.kind).toBe('ORIGINAL');
  const shippedAt = row.shipment!.postedAt; f.advance(86400000); await f.freshRoles(); buyer = await f.accounts.renew(buyer.refreshToken, buyer.csrfToken);
  const deliveredAt = f.clock.now().toISOString(), done = await f.logistics.change(f.admin.accessToken, order.id, { version: row.version, status: 'DELIVERED', reason: 'Entrega sintética comprovada', deliveredAt }, randomUUID());
  expect(done.status).toBe('DELIVERED'); expect(done.shipment).toMatchObject({ postedAt: shippedAt, deliveredAt }); expect(done.events.map(e => e.toStatus)).toEqual(['PAID', 'PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED']);
  const units = await f.db.orderUnit.findMany({ where: { orderItem: { orderId: order.id } } }); expect(units.every(u => u.deliveredAt?.toISOString() === deliveredAt)).toBe(true);
  expect(await f.db.domainEvent.count({ where: { aggregateId: order.id, type: { in: ['ORDER.PREPARING', 'ORDER.SEPARATED'] } } })).toBe(0); expect(await f.db.domainEvent.count({ where: { aggregateId: order.id, type: { in: ['ORDER.SHIPPED', 'ORDER.DELIVERED'] } } })).toBe(2);
  expect((await f.history.detail(buyer.accessToken, order.id)).shipment?.deliveredAt).toBe(deliveredAt);
});

test('future/preceding shipment dates and premature delivery are rejected without inventing facts', async () => {
  const { order } = await purchase(), row = await separated(order.id), common = { version: row.version, status: 'SHIPPED' as const, reason: 'Data inválida sintética', trackingCode: 'TEST-DATES' };
  for (const date of [new Date(f.clock.now().getTime() + 1), new Date(Date.parse(row.paidAt!) - 1)]) await expect(f.logistics.change(f.operator.accessToken, order.id, { ...common, postedAt: date.toISOString() }, randomUUID())).rejects.toMatchObject({ code: 'INVALID_SHIPMENT_DATE' });
  const sent = await f.logistics.change(f.operator.accessToken, order.id, { ...common, postedAt: f.clock.now().toISOString() }, randomUUID());
  for (const date of [new Date(f.clock.now().getTime() + 1), new Date(Date.parse(sent.shipment!.postedAt) - 1)]) await expect(f.logistics.change(f.operator.accessToken, order.id, { version: sent.version, status: 'DELIVERED', reason: 'Data de entrega inválida', deliveredAt: date.toISOString() }, randomUUID())).rejects.toMatchObject({ code: 'INVALID_DELIVERY_DATE' });
  expect((await f.history.detail(f.admin.accessToken, order.id, undefined, true)).shipment!.deliveredAt).toBeNull();
});

test('replayed shipping key preserves exactly one original shipment/event and refuses a changed tracking payload', async () => {
  const { order } = await purchase(), row = await separated(order.id), key = randomUUID(), body = { version: row.version, status: 'SHIPPED' as const, reason: 'Postagem com replay', trackingCode: 'TEST-ONE', postedAt: f.clock.now().toISOString() };
  const one = await f.logistics.change(f.operator.accessToken, order.id, body, key), two = await f.secondLogistics.change(f.operator.accessToken, order.id, body, key); expect(two.shipment?.id).toBe(one.shipment?.id);
  expect(await f.db.shipment.count({ where: { orderId: order.id } })).toBe(1); expect(await f.db.orderStatusEvent.count({ where: { orderId: order.id, toStatus: 'SHIPPED' } })).toBe(1);
  await expect(f.logistics.change(f.operator.accessToken, order.id, { ...body, trackingCode: 'CHANGED' }, key)).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  await expect(f.db.shipment.create({ data: { orderId: order.id, trackingCode: 'SECOND', postedAt: f.clock.now(), createdById: f.admin.user.id, createdAt: f.clock.now() } })).rejects.toThrow();
  await expect(f.db.shipment.update({ where: { id: one.shipment!.id }, data: { trackingCode: 'REWRITTEN' } })).rejects.toThrow();
});

test('blocked or closed purchasing accounts cannot read history while staff can still fulfil their paid orders', async () => {
  const { order } = await purchase(); await f.db.user.update({ where: { id: buyer.user.id }, data: { blockedAt: f.clock.now(), closedAt: f.clock.now() } });
  await expect(f.history.detail(buyer.accessToken, order.id)).rejects.toMatchObject({ code: 'ACCOUNT_UNAVAILABLE' }); expect((await step(order.id, 'PREPARING')).status).toBe('PREPARING');
});

test('expiry records cancellation history once and retains pending/failed refund information in owned detail', async () => {
  const { order } = await purchase('PIX', false), pending = await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'PENDING' }, randomUUID()); f.advance(31 * 60000); await expireOrders(f.db, f.clock); await f.gateway.event(pending.id, 'APPROVED', randomUUID()); await f.payments.apply(pending.id); buyer = await f.accounts.renew(buyer.refreshToken, buyer.csrfToken);
  const detail = await f.history.detail(buyer.accessToken, order.id); expect(detail.events.map(e => e.toStatus)).toEqual(['PENDING', 'CANCELLED']); expect(detail.refunds.items[0]!.status).toBe('SUCCEEDED'); expect(detail.payments.items[0]!.outcome).toBe('REFUND_REQUIRED');
  await expireOrders(f.db, f.clock); expect(await f.db.orderStatusEvent.count({ where: { orderId: order.id, toStatus: 'CANCELLED' } })).toBe(1);
});

async function waiting(expected: number) { for (let i = 0; i < 250; i++) { await f.control.query('SELECT pg_stat_clear_snapshot()'); const r = await f.control.query("SELECT count(DISTINCT application_name)::int AS n FROM pg_stat_activity WHERE application_name IN ('TASK021_A','TASK021_B') AND state='active' AND wait_event_type='Lock'"); if (r.rows[0].n === expected) return true; await new Promise(resolve => setTimeout(resolve, 20)); } return false; }
test('two real database sessions updating the same revision have one transition winner and no duplicate shipment', async () => {
  const { order } = await purchase(), row = await separated(order.id), body = { version: row.version, status: 'SHIPPED' as const, reason: 'Postagem disputada', trackingCode: 'TEST-RACE', postedAt: f.clock.now().toISOString() };
  await f.control.query('BEGIN'); await f.control.query('SELECT id FROM "User" WHERE id=$1 FOR UPDATE', [buyer.user.id]); const results = Promise.allSettled([f.logistics.change(f.admin.accessToken, order.id, body, randomUUID()), f.secondLogistics.change(f.operator.accessToken, order.id, body, randomUUID())]); let observed: boolean;
  try { observed = await waiting(2); } finally { await f.control.query('ROLLBACK'); }
  expect(observed).toBe(true); const done = await results; expect(done.filter(r => r.status === 'fulfilled')).toHaveLength(1); expect(done.find(r => r.status === 'rejected')).toMatchObject({ reason: { code: 'ORDER_VERSION_CONFLICT' } }); expect(await f.db.shipment.count({ where: { orderId: order.id } })).toBe(1);
});

test('a staff deactivation committed during lock waiting is revalidated instead of publishing a stale authorized transition', async () => {
  const { order } = await purchase(); await f.control.query('BEGIN'); await f.control.query('SELECT id FROM "User" WHERE id=$1 FOR UPDATE', [f.operator.user.id]); const result = f.logistics.change(f.operator.accessToken, order.id, { version: order.version, status: 'PREPARING', reason: 'Operador desativado em disputa' }, randomUUID()).catch(e => e); let observed: boolean;
  try { observed = await waiting(1); await f.control.query('UPDATE "User" SET "inactiveAt"=$2 WHERE id=$1', [f.operator.user.id, f.clock.now()]); } finally { await f.control.query('COMMIT'); }
  try { expect(observed).toBe(true); expect(await result).toMatchObject({ code: 'ACCOUNT_UNAVAILABLE' }); expect((await f.db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PAID'); }
  finally { await f.db.user.update({ where: { id: f.operator.user.id }, data: { inactiveAt: null } }); }
});

test('required audit failure rolls shipment, order version, history, receipt and notification back together', async () => {
  const { order } = await purchase(), row = await separated(order.id), key = randomUUID(), body = { version: row.version, status: 'SHIPPED' as const, reason: 'Falha sintética de auditoria', trackingCode: 'TEST-ROLLBACK', postedAt: f.clock.now().toISOString() };
  await f.control.query(`CREATE FUNCTION fail_order_logistics_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='ORDER.STATUS_CHANGED' THEN RAISE EXCEPTION 'isolated audit failure'; END IF; RETURN NEW; END $$`); await f.control.query('CREATE TRIGGER fail_order_logistics_audit BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION fail_order_logistics_audit()');
  try { await expect(f.logistics.change(f.admin.accessToken, order.id, body, key)).rejects.toThrow(); } finally { await f.control.query('DROP TRIGGER fail_order_logistics_audit ON "AuditLog"'); await f.control.query('DROP FUNCTION fail_order_logistics_audit()'); }
  expect((await f.db.order.findUniqueOrThrow({ where: { id: order.id } })).version).toBe(row.version); expect(await f.db.shipment.count({ where: { orderId: order.id } })).toBe(0); expect(await f.db.domainEvent.count({ where: { aggregateId: order.id, type: 'ORDER.SHIPPED' } })).toBe(0); expect(await f.db.idempotencyRecord.count({ where: { actorScope: f.admin.user.id, operation: 'ORDER.LOGISTICS', key } })).toBe(0);
  expect((await f.logistics.change(f.admin.accessToken, order.id, body, key)).status).toBe('SHIPPED');
});

test('shipping and delivery messages use protected actual facts and retry delivery without rolling back logistics', async () => {
  const { order } = await purchase(), sent = await shipped(order.id), done = await f.logistics.change(f.admin.accessToken, order.id, { version: sent.version, status: 'DELIVERED', reason: 'Entrega para teste de mensagem', deliveredAt: f.clock.now().toISOString() }, randomUUID());
  const protection = new MessageProtection(randomBytes(32).toString('hex'), randomBytes(32).toString('base64url')), messages = new AccessMessages(f.accounts, protection, 'https://localhost:5173');
  for (let i = 0; i < 300; i++) { const r = await consumeCommerce(messages); if (r === 'EMPTY') break; expect(r).toBe('PROCESSED'); }
  const event = await f.db.domainEvent.findFirstOrThrow({ where: { type: 'ORDER.DELIVERED', aggregateId: order.id } }), message = await f.db.demoMessage.findFirstOrThrow({ where: { eventId: event.id } });
  const content = JSON.parse(protection.open(message.id, message.restrictedBody)); expect(content.shipment).toMatchObject({ trackingCode: done.shipment!.trackingCode, deliveredAt: done.shipment!.deliveredAt }); expect(content.link).toBe('https://localhost:5173/#/orders?id=' + order.id); expect(message.restrictedBody).not.toContain(done.shipment!.trackingCode);
  await f.db.demoMessage.updateMany({ where: { type: { startsWith: 'COMMERCE.' } }, data: { status: 'DELIVERED' } }); await f.db.demoMessage.update({ where: { id: message.id }, data: { status: 'PENDING' } });
  expect(await deliverCommerce(messages, () => { throw new Error('Local delivery failure.'); })).toBe('FAILED'); expect((await f.history.detail(f.admin.accessToken, order.id, undefined, true)).status).toBe('DELIVERED'); expect(await deliverCommerce(messages)).toBe('DELIVERED'); expect(await f.db.demoMessage.count({ where: { eventId: event.id } })).toBe(1);
});

test('customer bearer reads actual owned history across a fresh client without exposing staff-only customer metadata', async () => {
  const { order } = await purchase('BOLETO', false), headers = { 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + buyer.accessToken, 'X-Garimpo-Account': buyer.user.id };
  const list = await f.server.call<OrderPage>('/me/orders?status=PENDING', 'GET', undefined, headers), detail = await f.server.call<OrderDetail>('/me/orders/' + order.id, 'GET', undefined, headers); expect(list.body.items.some(o => o.id === order.id)).toBe(true); expect(detail.body.status).toBe('PENDING'); expect(detail.body.customer).toBeUndefined(); expect(detail.headers['set-cookie']).toBeUndefined();
});
