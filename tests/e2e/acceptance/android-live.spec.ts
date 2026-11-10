import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { OrderDetail } from '@garimpo/contracts';
import { test as base, expect, reserve, accept, confirm } from '../checkout/fixtures';
import { startHarness } from '../account/harness.mjs';
import { androidTunnel } from './android-relay.mjs';

const test = base.extend<object, { app: Awaited<ReturnType<typeof startHarness>> }>({
  app: [async ({ browserName }, use) => {
    void browserName;
    const app = await startHarness({ realtime: true });
    try { await use(app); } finally { await app.close(); }
  }, { scope: 'worker', timeout: 180000 }]
});

test('prepare and hold the Android acceptance fixture until the operator ends it', async ({ app, page, scenario }) => {
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
  for (let index = 0; index < 2; index++) {
    const checkout = await reserve(page, app, scenario.customer, scenario.data.main);
    await accept(page);
    await confirm(page);
    await page.getByRole('button', { name: 'Simular cartão', exact: true }).click();
    await expect(page.getByText(/Pagamento confirmado ·/)).toBeVisible();
    const id = (await app.purchaseState(checkout.id)).orders[0]!.id;
    let detail = (await scenario.buyer.call<OrderDetail>('/me/orders/' + id)).body;
    for (const status of ['PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED'] as const) {
      const change = { version: detail.version, status, reason: 'Logística sintética Android' };
      const data = status === 'SHIPPED' ? { ...change, trackingCode: 'ANDROID-' + index, postedAt: detail.serverTime }
        : status === 'DELIVERED' ? { ...change, deliveredAt: detail.serverTime } : change;
      const updated = await scenario.admin.call<OrderDetail>('/admin/orders/' + id + '/status', 'PATCH', data, randomUUID());
      expect(updated.status).toBe(200);
      detail = updated.body;
    }
    orders.push(id);
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
  }
  const tunnel = await androidTunnel(app, directory);
  try {
    await writeFile(resolve(directory, 'android-ready.json'), JSON.stringify({
      origin: tunnel.origin, customer: scenario.customer.input, orders, offerId: scenario.offer.id,
      edition: scenario.data.mainTitle, search: 'Canção do convidado'
    }, null, 2), { mode: 0o600, flag: 'wx' });
    await writeFile(resolve(directory, 'local-fixture.txt'), app.directory, { mode: 0o600, flag: 'wx' });
    await expect.poll(async () => readFile(resolve(directory, 'stop.txt'), 'utf8').catch(() => ''),
      { timeout: 45 * 60000, intervals: [2000] }).toMatch(/^stop/);
  } finally { await tunnel.close(); }
});
