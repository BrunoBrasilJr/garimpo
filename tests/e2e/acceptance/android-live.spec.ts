import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { request } from 'node:https';
import { resolve } from 'node:path';
import type { AftersalesOverview, CartChange, CartView, CheckoutQuote, CheckoutView, ExchangeView, OrderCreationView, OrderDetail, PaymentView, ReturnView } from '@garimpo/contracts';
import sharp from 'sharp';
import { MobileAccountClient } from '../../../apps/mobile/src/features/account/client';
import { test as base, expect } from '../checkout/fixtures';
import { startHarness } from '../account/harness.mjs';
import { androidRelay, androidTunnel } from './android-relay.mjs';

const test = base.extend<object, { app: Awaited<ReturnType<typeof startHarness>> }>({
  app: [async ({ browserName }, use) => {
    void browserName;
    const app = await startHarness({ realtime: true });
    try { await use(app); } finally { await app.close(); }
  }, { scope: 'worker', timeout: 180000 }]
});

const delivered = test.extend<{ orders: string[] }>({
  orders: async ({ scenario }, use) => {
    // Keep one additional new copy for the buyer and another for a substitute.
    const stock = await scenario.admin.call('/admin/offers/' + scenario.offer.id + '/stock-adjustments', 'POST',
      { delta: 2, reason: 'Estoque sintético para a conferência Android' }, randomUUID());
    expect(stock.status).toBe(201);
    const orders: string[] = [];
    const buyer = scenario.buyer, addressId = scenario.address.id;
    for (let index = 0; index < 2; index++) {
      const cart = await buyer.call<CartView>('/me/cart');
      expect(cart.status).toBe(200);
      const added = await buyer.call<CartChange>('/me/cart/items', 'POST',
        { version: cart.body.version, offerId: scenario.offer.id, quantity: 1 }, randomUUID());
      expect(added.status).toBe(201);
      const { version, pricing } = added.body.cart;
      if (pricing.status !== 'READY') throw new Error('Android fixture cart is unpriced.');
      const reserved = await buyer.call<CheckoutView>('/checkouts', 'POST',
        { version, pricingRevision: pricing.revision }, randomUUID());
      expect(reserved.status).toBe(201);
      const checkoutId = reserved.body.id;
      const quote = await buyer.call<CheckoutQuote>('/checkout/quote', 'POST', { checkoutId, addressId });
      expect(quote.status).toBe(200);
      const freightRevision = quote.body.freightRevision;
      const accepted = await buyer.call<CheckoutView>('/checkouts/' + checkoutId + '/address', 'PATCH',
        { version: reserved.body.version, addressId, freightRevision });
      expect(accepted.status).toBe(200);
      const order = await buyer.call<OrderCreationView>('/orders', 'POST',
        { checkoutId, version: accepted.body.version, addressId, freightRevision, method: 'PIX' }, randomUUID());
      expect(order.status).toBe(201);
      const id = order.body.id;
      const paid = await buyer.call<PaymentView>('/orders/' + id + '/simulated-payments', 'POST',
        { chargeId: order.body.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
      expect(paid.status).toBe(200);
      expect(paid.body.order?.status).toBe('PAID');
      let detail = (await buyer.call<OrderDetail>('/me/orders/' + id)).body;
      for (const status of ['PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED'] as const) {
        const change = { version: detail.version, status, reason: 'Logística sintética Android' };
        const data = status === 'SHIPPED' ? { ...change, trackingCode: 'ANDROID-' + index, postedAt: detail.serverTime }
          : status === 'DELIVERED' ? { ...change, deliveredAt: detail.serverTime } : change;
        const updated = await scenario.admin.call<OrderDetail>('/admin/orders/' + id + '/status', 'PATCH', data, randomUUID());
        expect(updated.status).toBe(200);
        detail = updated.body;
      }
      orders.push(id);
    }
    await use(orders);
  }
});

delivered('prepare and hold the Android acceptance fixture until the operator ends it', async ({ app, scenario, orders }) => {
  const directory = process.env.GARIMPO_ANDROID_ACCEPTANCE_DIR;
  if (process.env.GARIMPO_ANDROID_TUNNEL !== '1' ||
      !directory?.startsWith('/mnt/c/Users/brasi/garimpo-planejamento/test-results/acceptance/android-live-')) {
    throw new Error('Explicit Android test directory and tunnel authorization required.');
  }
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const tunnel = await androidTunnel(app, directory);
  try {
    await writeFile(resolve(directory, 'android-ready.json'), JSON.stringify({
      origin: tunnel.origin, customer: scenario.customer.input, orders, offerId: scenario.offer.id,
      edition: scenario.data.mainTitle, search: 'Canção do convidado'
    }, null, 2), { mode: 0o600, flag: 'wx' });
    await writeFile(resolve(directory, 'local-fixture.json'), JSON.stringify({ directory: app.directory, origin: app.origin }),
      { mode: 0o600, flag: 'wx' });
    await expect.poll(async () => readFile(resolve(directory, 'stop.txt'), 'utf8').catch(() => ''),
      { timeout: 45 * 60000, intervals: [2000] }).toMatch(/^stop/);
  } finally { await tunnel.close(); }
});

delivered('loopback Android client persists private evidence, refund status and substitute acceptance', async ({ app, scenario, orders }) => {
  const relay = await androidRelay(app);
  try {
    const ca = await readFile(app.caPath);
    const transport: typeof fetch = (input, init) => new Promise((resolveResponse, reject) => {
      const headers = Object.fromEntries(new Headers(init?.headers));
      const call = request(String(input), { method: init?.method, headers, ca, rejectUnauthorized: true }, response => {
        const chunks: Buffer[] = [];
        response.on('data', bytes => chunks.push(Buffer.from(bytes)));
        response.on('error', reject);
        response.on('end', () => resolveResponse(new Response(
          response.statusCode === 204 ? null : new Uint8Array(Buffer.concat(chunks)), { status: response.statusCode ?? 502 }
        )));
      });
      call.on('error', reject);
      const body = init?.body;
      call.end(body instanceof ArrayBuffer ? Buffer.from(body) : typeof body === 'string' ? body : undefined);
    });
    const client = new MobileAccountClient(relay.origin, {
      get: async () => null, set: async () => {}, clear: async () => {}
    }, transport);
    const customer = await client.login(scenario.customer.input.email, scenario.customer.input.password);
    const context = { accountId: customer.id };
    const items = async (id: string) => {
      const overview = await client.request<AftersalesOverview>('/orders/' + id + '/aftersales');
      return [{ orderItemId: overview.groups[0]!.orderItemId, quantity: 1 }];
    };
    const reason = 'Atendimento sintético de conferência';
    const first = orders[0]!, second = orders[1]!;
    const returned = await client.request<ReturnView>('/orders/' + first + '/returns', 'POST',
      { reason, items: await items(first) }, true, { ...context, idempotencyKey: randomUUID() });
    const evidence = '/aftersales/' + returned.id + '/evidence';
    const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: 'gold' } }).png().toBuffer();
    const image = await client.request<ReturnView['evidence'][number]>(evidence, 'POST', new Uint8Array(png).buffer, true,
      { ...context, mediaType: 'image/png' });
    const file = await client.request<Blob>(evidence + '/' + image.id, 'GET', undefined, true, { ...context, responseBlob: true });
    expect(file.size).toBeGreaterThan(0);
    const returns = '/admin/returns/' + returned.id;
    const approved = await scenario.admin.call<ReturnView>(returns + '/decision', 'POST',
      { version: returned.version, reason, decision: 'APPROVE' });
    expect(approved.status).toBe(200);
    const postedAt = approved.body.approvedAt;
    const posted = await scenario.admin.call<ReturnView>('/returns/' + returned.id + '/posting', 'POST', {
      version: approved.body.version, postedAt, trackingCode: 'ANDROID-RECHECK',
      interaction: { channel: 'EMAIL', reference: reason, occurredAt: postedAt }
    });
    expect(posted.status).toBe(200);
    const unit = posted.body.items[0]!.id;
    const checked = await scenario.admin.call<ReturnView>(returns + '/receipt', 'POST', {
      version: posted.body.version, reason, receivedAt: postedAt, units: [{ id: unit, result: 'FIT' }], evidenceIds: [image.id]
    });
    expect(checked.status).toBe(200);
    const refund = await scenario.admin.call<ReturnView>(returns + '/refund-authorization', 'POST',
      { version: checked.body.version, reason, unitIds: [unit], scenario: 'FAILED' }, randomUUID());
    expect(refund.status).toBe(200);
    const savedReturn = await client.request<ReturnView>('/me/returns/' + returned.id);
    expect(savedReturn.evidence.map(row => row.id)).toContain(image.id);
    expect(savedReturn.refund?.status).toBe('FAILED');

    const exchanged = await client.request<ExchangeView>('/orders/' + second + '/exchanges', 'POST',
      { reason, items: await items(second) }, true, { ...context, idempotencyKey: randomUUID() });
    const exchanges = '/admin/exchanges/' + exchanged.id;
    const decision = await scenario.admin.call<ExchangeView>(exchanges + '/decision', 'POST',
      { version: exchanged.version, decision: 'APPROVE', reason });
    expect(decision.status).toBe(200);
    const offered = await scenario.admin.call<ExchangeView>(exchanges + '/substitute-offers', 'POST',
      { version: decision.body.version, offerId: scenario.offer.id, equivalenceReason: reason });
    expect(offered.status).toBe(200);
    const offer = offered.body.substitutes[0]!;
    await client.request('/exchanges/' + exchanged.id + '/substitute-offers/' + offer.id + '/response', 'POST',
      { version: offered.body.version, decision: 'ACCEPT' }, true, context);
    const savedExchange = await client.request<ExchangeView>('/me/exchanges/' + exchanged.id);
    expect(savedExchange.substitutes[0]?.state).toBe('ACCEPTED');
  } finally { await relay.close(); }
});
