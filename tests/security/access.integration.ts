import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { afterAll, beforeAll, expect, test } from 'vitest';
import type { ReturnView } from '@garimpo/contracts';
import { credentials, foundation } from '../accounts/lifecycle/fixtures.ts';
import { Customers } from '../../apps/api/src/modules/accounts/blocking.ts';
import { enqueue } from '../../apps/api/src/core/outbox.ts';
import { serializable } from '../../apps/api/src/persistence/transaction.ts';
import { consumeCommerce } from '../../apps/api/src/modules/messaging/commerce.ts';

let f: Awaited<ReturnType<typeof foundation>>;
let buyer: Awaited<ReturnType<Awaited<ReturnType<typeof foundation>>['customer']>>;
let outsider: typeof buyer;
let orderId: string, returnId: string, evidenceId: string;
beforeAll(async () => {
  f = await foundation(undefined, '030');
  buyer = await f.customer(); outsider = await f.customer();
  const held = await f.ready(buyer);
  const order = await f.orders.create(buyer.accessToken, held.body, held.key); orderId = order.id;
  const paid = await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
  await f.logistics.change(f.operator.accessToken, order.id, { version: paid.order!.version, status: 'PREPARING', reason: 'Preparação da revisão' }, randomUUID());
  const item = await f.db.orderItem.findFirstOrThrow({ where: { orderId } });
  const opened = await f.server.call<ReturnView>('/orders/' + orderId + '/returns', 'POST',
    { reason: 'Revisão de acesso ao atendimento', items: [{ orderItemId: item.id, quantity: 1 }] },
    { ...credentials(buyer), 'Idempotency-Key': randomUUID() });
  expect(opened.status).toBe(201); returnId = opened.body.id;
  const bytes = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'navy' } }).png().toBuffer();
  const image = await f.server.call<{ id: string }>('/aftersales/' + returnId + '/evidence', 'POST', bytes,
    { ...credentials(buyer), 'Content-Type': 'image/png' });
  expect(image.status).toBe(201); evidenceId = image.body.id;
});
afterAll(async () => { await f?.close(); });

test('ADMIN-only interfaces refuse OPERATOR and CUSTOMER before malformed data is read', async () => {
  for (const actor of [f.operator, buyer]) {
    for (const path of [
      '/admin/returns/' + returnId + '/refund-authorization',
      '/admin/aftersales/' + returnId + '/posting-extension',
      '/admin/aftersales/' + returnId + '/inspection-exception',
      '/admin/refunds/' + randomUUID() + '/retry'
    ]) {
      const reply = await f.server.call(path, 'POST', Buffer.from('{bad'), { ...credentials(actor), 'Content-Type': 'application/json' });
      expect(reply.status).toBe(403);
      expect(reply.body).not.toHaveProperty('stack');
    }
    expect((await f.server.call('/admin/reports/sales?from=invalid', 'GET', undefined, credentials(actor))).status).toBe(403);
  }
});

test('foreign order, case and evidence remain private with matching not-found responses', async () => {
  for (const path of ['/me/orders/' + orderId, '/me/returns/' + returnId,
    '/orders/' + orderId + '/aftersales', '/aftersales/' + returnId + '/evidence/' + evidenceId]) {
    const reply = await f.server.call(path, 'GET', undefined, credentials(outsider));
    expect(reply.status).toBe(404);
    expect(JSON.stringify(reply.body)).not.toContain(buyer.user.email);
    expect(JSON.stringify(reply.body)).not.toContain(buyer.user.id);
  }
  const own = await f.server.call('/aftersales/' + returnId + '/evidence/' + evidenceId, 'GET', undefined, credentials(buyer));
  expect(own.status).toBe(200);
  expect(own.headers['cache-control']).toContain('no-store');
  expect(own.headers['x-content-type-options']).toBe('nosniff');
});

test('HTTPS, Origin, CSRF, account identity and unambiguous credentials are enforced', async () => {
  const path = '/admin/returns/' + returnId + '/decision';
  const body = { version: 1, decision: 'APPROVE', reason: 'Revisão de transporte' };
  const valid = credentials(f.operator);
  expect((await f.server.call(path, 'POST', body, valid, true)).status).toBe(403);
  expect((await f.server.call(path, 'POST', body, { ...valid, Origin: 'https://outsider.invalid' })).status).toBe(403);
  expect((await f.server.call(path, 'POST', body, { ...valid, 'X-CSRF-Token': 'invalid' })).status).toBe(403);
  expect((await f.server.call(path, 'POST', body, { ...valid, 'X-Garimpo-Account': buyer.user.id })).status).toBe(403);
  expect((await f.server.call(path, 'POST', body, { ...valid, 'X-Garimpo-Client': 'mobile', Authorization: 'Bearer ' + f.operator.accessToken })).status).toBe(422);
});

test('audit records exclude raw credentials and public order views exclude password and session hashes', async () => {
  const audit = JSON.stringify(await f.db.auditLog.findMany({}));
  for (const value of [buyer.accessToken, buyer.refreshToken, buyer.csrfToken, f.password, f.admin.accessToken, f.admin.refreshToken]) expect(audit).not.toContain(value);
  const detail = await f.server.call('/me/orders/' + orderId, 'GET', undefined, credentials(buyer));
  expect(detail.status).toBe(200);
  expect(JSON.stringify(detail.body)).not.toMatch(/passwordHash|credentialHash|csrfHash|refreshHash|technicalSecret/);
});

test('an outbox event cannot impersonate a nonexistent after-sales case', async () => {
  for (;;) { const result = await consumeCommerce(f.messages); if (result === 'EMPTY') break; expect(result).toBe('PROCESSED'); }
  const event = await serializable(f.db, tx => enqueue(tx, {
    type: 'RETURN.UPDATED', aggregateId: randomUUID(), payload: { orderId, userId: buyer.user.id }
  }, f.clock));
  expect(await consumeCommerce(f.messages)).toBe('FAILED');
  expect(await f.db.domainEvent.findUnique({ where: { id: event.id } })).toMatchObject({ processedAt: null, lastErrorCode: 'COMMERCE_PREPARATION_FAILED' });
  expect(await f.db.demoMessage.count({ where: { eventId: event.id } })).toBe(0);
});

test('blocking revokes old case and evidence access while paid processing stays available to staff', async () => {
  const service = new Customers(f.accounts);
  const record = await service.detail(f.admin.accessToken, buyer.user.id);
  await service.restrict(f.admin.accessToken, buyer.user.id, 'BLOCK', { revision: record.revision, reason: 'Bloqueio na revisão de segurança' }, randomUUID());
  for (const path of ['/me/orders/' + orderId, '/me/returns/' + returnId, '/aftersales/' + returnId + '/evidence/' + evidenceId]) {
    expect((await f.server.call(path, 'GET', undefined, credentials(buyer))).status).toBe(401);
  }
  expect((await f.server.call('/admin/returns/' + returnId, 'GET', undefined, credentials(f.operator))).status).toBe(200);
  expect(await f.db.order.findUnique({ where: { id: orderId } })).toMatchObject({ status: 'PREPARING' });
});
