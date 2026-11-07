import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { afterAll, beforeAll, expect, test } from 'vitest';
import type { ReturnView } from '@garimpo/contracts';
import { credentials, foundation } from '../../accounts/lifecycle/fixtures.ts';
import { consumeCommerce } from '../../../apps/api/src/modules/messaging/commerce.ts';

let fixture: Awaited<ReturnType<typeof foundation>>;
beforeAll(async () => { fixture = await foundation(undefined, '026'); });
afterAll(async () => { await fixture?.close(); });

async function purchase(quantity: number, delivered = true) {
  await fixture.freshRoles();
  const buyer = await fixture.customer();
  const held = await fixture.ready(buyer, { quantity });
  const order = await fixture.orders.create(buyer.accessToken, held.body, held.key);
  const paid = await fixture.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
  let version = paid.order!.version;
  for (const status of ['PREPARING', ...(delivered ? ['SEPARATED', 'SHIPPED', 'DELIVERED'] as const : [])] as const) {
    const at = fixture.clock.now().toISOString();
    const command = { version, reason: 'Logística de devolução', status };
    const next = status === 'SHIPPED' ? { ...command, status, postedAt: at, trackingCode: 'RETURN-ORIGINAL' }
      : status === 'DELIVERED' ? { ...command, status, deliveredAt: at } : { ...command, status };
    version = (await fixture.logistics.change(fixture.admin.accessToken, order.id, next, randomUUID())).version;
  }
  const item = await fixture.db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
  return { buyer, order, item, offer: held.offer };
}

function call(path: string, data: unknown, actor: Parameters<typeof credentials>[0], key = randomUUID()) {
  return fixture.server.call<ReturnView>(path, 'POST', data, { ...credentials(actor), 'Idempotency-Key': key });
}
async function open(p: Awaited<ReturnType<typeof purchase>>, quantity: number) {
  const created = await call('/orders/' + p.order.id + '/returns', {
    reason: 'Devolução de compra', items: [{ orderItemId: p.item.id, quantity }]
  }, p.buyer);
  expect(created.status).toBe(201);
  return created.body;
}
async function decision(row: ReturnView) {
  const approved = await call('/admin/returns/' + row.id + '/decision', {
    version: row.version, decision: 'APPROVE', reason: 'Solicitação conferida'
  }, fixture.operator);
  expect(approved.status).toBe(200);
  return approved.body;
}
async function inspect(p: Awaited<ReturnType<typeof purchase>>, row: ReturnView, result: 'FIT' | 'UNFIT' | 'REJECTED') {
  const at = fixture.clock.now().toISOString();
  const posted = await call('/returns/' + row.id + '/posting', { version: row.version, trackingCode: 'RETURN-TEST', postedAt: at }, p.buyer);
  expect(posted.status).toBe(200);
  const inspected = await call('/admin/returns/' + row.id + '/receipt', {
    version: posted.body.version, reason: 'Inspeção concluída', receivedAt: at, units: row.items.map(unit => ({ id: unit.id, result }))
  }, fixture.operator);
  expect(inspected.status).toBe(200);
  return inspected.body;
}
const authorization = (row: ReturnView) => ({
  version: row.version, reason: 'Estorno conferido', unitIds: row.items.map(unit => unit.id)
});

test('successive approved returns reimburse freight once and hide the review only on the final unit', async () => {
  const p = await purchase(3);
  const review = await fixture.server.call<{ id: string }>('/editions/' + p.offer.editionId + '/reviews', 'POST',
    { orderId: p.order.id, rating: 5, comment: 'Compra sintética entregue' }, credentials(p.buyer));
  expect(review.status).toBe(201);
  const first = await inspect(p, await decision(await open(p, 1)), 'FIT');
  const firstPath = '/admin/returns/' + first.id + '/refund-authorization';
  expect((await call(firstPath, authorization(first), fixture.operator)).status).toBe(403);
  const paidFirst = await call(firstPath, authorization(first), fixture.admin);
  expect(paidFirst).toMatchObject({ status: 200, body: { refund: { productCents: 10000, shippingCents: 0, status: 'SUCCEEDED' } } });
  expect(await fixture.db.review.findUnique({ where: { id: review.body.id } })).toMatchObject({ visibility: 'PUBLIC' });
  const second = await inspect(p, await decision(await open(p, 2)), 'UNFIT');
  const secondPath = '/admin/returns/' + second.id + '/refund-authorization';
  const key = randomUUID();
  const paidSecond = await call(secondPath, authorization(second), fixture.admin, key);
  expect(paidSecond).toMatchObject({ status: 200, body: { refund: { productCents: 20000, shippingCents: 1500, status: 'SUCCEEDED' } } });
  expect((await call(secondPath, authorization(second), fixture.admin, key)).body.refund).toEqual(paidSecond.body.refund);
  expect(await fixture.db.review.findUnique({ where: { id: review.body.id } })).toMatchObject({ visibility: 'HIDDEN' });
  expect(await fixture.db.offer.findUnique({ where: { id: p.offer.id } })).toMatchObject({ stockOnHand: p.offer.stockOnHand - 2 });
  expect(await fixture.db.refund.count({ where: { orderId: p.order.id, shippingCents: { gt: 0 } } })).toBe(1);
});

test('before shipment no physical return is required and a failed refund remains visible', async () => {
  const p = await purchase(1, false);
  const row = await decision(await open(p, 1));
  expect(row.state).toBe('AWAITING_REFUND');
  const completed = await call('/admin/returns/' + row.id + '/refund-authorization',
    { ...authorization(row), scenario: 'FAILED' }, fixture.admin);
  expect(completed).toMatchObject({ status: 200, body: { state: 'COMPLETED', shipments: [], refund: { status: 'FAILED', shippingCents: 1500 } } });
  expect(await fixture.db.offer.findUnique({ where: { id: p.offer.id } })).toMatchObject({ stockOnHand: p.offer.stockOnHand });
});

test('rejected merchandise is shipped back and never restocked', async () => {
  const p = await purchase(1);
  const row = await inspect(p, await decision(await open(p, 1)), 'REJECTED');
  expect(row.state).toBe('REJECTED_AWAITING_SHIPMENT');
  const sent = await call('/admin/aftersales/' + row.id + '/rejected-shipment', {
    version: row.version, trackingCode: 'RETURN-REJECTED', postedAt: fixture.clock.now().toISOString()
  }, fixture.operator);
  expect(sent).toMatchObject({ status: 200, body: { state: 'REJECTED_IN_TRANSIT' } });
  const delivered = await call('/admin/aftersales/' + row.id + '/rejected-delivery', {
    version: sent.body.version, deliveredAt: fixture.clock.now().toISOString()
  }, fixture.operator);
  expect(delivered).toMatchObject({ status: 200, body: { state: 'REJECTED_DELIVERED', refund: null } });
  expect(await fixture.db.offer.findUnique({ where: { id: p.offer.id } })).toMatchObject({ stockOnHand: p.offer.stockOnHand - 1 });
});

test('evidence requires case ownership and enforces separate five-image limits', async () => {
  const p = await purchase(1);
  const row = await open(p, 1);
  const path = '/aftersales/' + row.id + '/evidence';
  const image = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'red' } }).png().toBuffer();
  const post = (actor: typeof p.buyer, bytes = image, mime = 'image/png') =>
    fixture.server.call<{ id: string; source: string }>(path, 'POST', bytes, { ...credentials(actor), 'Content-Type': mime });
  const outsider = await fixture.customer();
  expect((await post(outsider)).status).toBe(404);
  expect((await post(p.buyer, image, 'image/jpeg')).status).toBe(415);
  const stored = await post(p.buyer);
  expect(stored).toMatchObject({ status: 201, body: { source: 'CUSTOMER' } });
  for (let i = 0; i < 4; i++) expect((await post(p.buyer)).status).toBe(201);
  expect((await post(p.buyer)).status).toBe(409);
  for (let i = 0; i < 5; i++) expect((await post(fixture.operator)).status).toBe(201);
  expect((await post(fixture.operator)).status).toBe(409);
  expect((await fixture.server.call(path + '/' + stored.body.id, 'GET', undefined, credentials(outsider))).status).toBe(404);
  const downloaded = await fixture.server.call(path + '/' + stored.body.id, 'GET', undefined, credentials(p.buyer));
  expect(downloaded.status).toBe(200);
  expect(downloaded.headers['cache-control']).toContain('no-store');
});

test('an active return excludes another request for the same unit and expiry needs an audited ADMIN exception', async () => {
  const p = await purchase(1);
  const path = '/orders/' + p.order.id + '/returns';
  const data = { reason: 'Devolução no prazo', items: [{ orderItemId: p.item.id, quantity: 1 }] };
  const results = await Promise.all([call(path, data, p.buyer), call(path, data, p.buyer)]);
  expect(results.map(result => result.status).sort()).toEqual([201, 409]);
  const approved = await decision(results.find(result => result.status === 201)!.body);
  fixture.advance(7 * 86400000);
  await fixture.freshRoles();
  const expired = await fixture.server.call<ReturnView>('/admin/returns/' + approved.id, 'GET', undefined, credentials(fixture.operator));
  expect(expired).toMatchObject({ status: 200, body: { state: 'EXPIRED' } });
  const exception = '/admin/aftersales/' + approved.id + '/posting-extension';
  const proposed = { version: expired.body.version, reason: 'Exceção de postagem registrada', dueAt: new Date(fixture.clock.now().getTime() + 86400000).toISOString() };
  expect((await call(exception, proposed, fixture.operator)).status).toBe(403);
  expect((await call(exception, proposed, fixture.admin)).body.state).toBe('AWAITING_POSTING');
  expect(await fixture.db.auditLog.count({ where: { targetId: approved.id, action: 'RETURN.EXTENSION' } })).toBe(1);
});

test('customer notices preserve the original posting decision and omit intermediate processing', async () => {
  const p = await purchase(1), opened = await open(p, 1), approved = await decision(opened);
  const events = await fixture.db.domainEvent.findMany({ where: { aggregateId: opened.id, type: 'RETURN.UPDATED' }, orderBy: { createdAt: 'asc' } });
  expect(events).toHaveLength(2);
  await inspect(p, approved, 'FIT');
  expect(await fixture.db.domainEvent.count({ where: { aggregateId: opened.id, type: 'RETURN.UPDATED' } })).toBe(2);
  for (;;) {
    const result = await consumeCommerce(fixture.messages);
    if (result === 'EMPTY') break;
    expect(result).toBe('PROCESSED');
  }
  const messages = await fixture.db.demoMessage.findMany({ where: { eventId: { in: events.map(event => event.id) } } });
  const bodies = messages.map(message => JSON.parse(fixture.messages.protection.open(message.id, message.restrictedBody)) as { title: string; caseInfo: { state: string; deadline: string | null } });
  expect(bodies).toContainEqual(expect.objectContaining({
    title: 'Devolução aprovada; postagem necessária',
    caseInfo: expect.objectContaining({ state: 'AWAITING_POSTING', deadline: approved.postingDueAt })
  }));
});
