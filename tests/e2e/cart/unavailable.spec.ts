import { test, expect } from '../account/fixtures';
import { seedCatalog } from '../catalog-web/seed';
import { login, addNew } from './fixtures';
test('production default denies reservation when pending-order count cannot be established', async ({ page, app }) => {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword), customer = await app.customer();
  await login(page, app.origin, customer.email, customer.password); await addNew(page, app.origin, data.main); await page.goto(app.origin + '/#/cart');
  await page.getByRole('checkbox', { name: 'Conferi os itens e os valores atuais' }).check();
  const rejected = page.waitForResponse(response => response.url().endsWith('/checkouts') && response.request().method() === 'POST'); await page.getByRole('button', { name: 'Reservar conjunto por 15 minutos', exact: true }).click();
  expect((await rejected).status()).toBe(503); expect((await (await rejected).json()).error.code).toBe('PENDING_ORDERS_UNAVAILABLE');
  await expect(page.getByRole('region', { name: 'Finalização em andamento', exact: true })).toHaveCount(0); await expect(page.getByRole('alert')).toBeVisible();
});
