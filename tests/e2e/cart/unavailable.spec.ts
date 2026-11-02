import { test as base, expect } from '../account/fixtures';
import { startHarness } from '../account/harness.mjs';
import { unavailablePendingOrders } from '../../../apps/api/src/modules/checkout/pending-orders.ts';
import { seedCatalog } from '../catalog-web/seed';
import { login, addNew } from './fixtures';
const test = base.extend<object, { app: Awaited<ReturnType<typeof startHarness>> }>({ app: [async ({ browserName }, use) => {
  void browserName; const app = await startHarness({ pendingOrders: unavailablePendingOrders }); try { await use(app); } finally { await app.close(); }
}, { scope: 'worker', timeout: 180000 }] });
test('an unavailable pending-order dependency still denies reservation after real order integration', async ({ page, app }) => {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword), customer = await app.customer();
  await login(page, app.origin, customer.input.email, customer.input.password); await addNew(page, app.origin, data.main); await page.goto(app.origin + '/#/cart');
  await page.getByRole('checkbox', { name: 'Conferi os itens e os valores atuais' }).check();
  const rejected = page.waitForResponse(response => response.url().endsWith('/checkouts') && response.request().method() === 'POST'); await page.getByRole('button', { name: 'Reservar conjunto por 15 minutos', exact: true }).click();
  expect((await rejected).status()).toBe(503); expect((await (await rejected).json()).code).toBe('PENDING_ORDERS_UNAVAILABLE');
  await expect(page.getByRole('region', { name: 'Finalização em andamento', exact: true })).toHaveCount(0); await expect(page.getByRole('alert')).toBeVisible();
});
