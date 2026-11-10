import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { CartChange, CartView, CheckoutQuote, CheckoutView, OrderCreationView, OrderDetail, PaymentView } from '@garimpo/contracts';
import { test as base, expect } from '../checkout/fixtures';
import { startHarness } from '../account/harness.mjs';
import { androidTunnel } from './android-relay.mjs';

const test = base.extend<object, { app: Awaited<ReturnType<typeof startHarness>> }>({
  app: [async ({ browserName }, use) => {
    void browserName;
    const app = await startHarness({ realtime: true });
    try { await use(app); } finally { await app.close(); }
  }, { scope: 'worker', timeout: 180000 }]
});

test('prepare and hold the Android acceptance fixture until the operator ends it', async ({ app, scenario }) => {
  const directory = process.env.GARIMPO_ANDROID_ACCEPTANCE_DIR;
  if (process.env.GARIMPO_ANDROID_TUNNEL !== '1' ||
      !directory?.startsWith('/mnt/c/Users/brasi/garimpo-planejamento/test-results/acceptance/android-live-')) {
    throw new Error('Explicit Android test directory and tunnel authorization required.');
  }
  await mkdir(directory, { recursive: true, mode: 0o700 });
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
