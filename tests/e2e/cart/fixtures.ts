import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { test as base, expect } from '../account/fixtures';
import { startHarness } from '../account/harness.mjs';
import { seedCatalog } from '../catalog-web/seed';
type Harness = Awaited<ReturnType<typeof startHarness>>;
const configured = base.extend<object, { app: Harness }>({
  app: [async ({ browserName }, use) => {
    void browserName;
    const template = readFileSync(new URL('../catalog-mobile/preview.html', import.meta.url), 'utf8').replace('catalog-mobile-preview.js', 'cart-mobile-preview.js');
    // Only this known pending-count seam is staged. Prices, cart/checkout/holds and all HTTP/auth use real code/DB.
    const app = await startHarness({ pendingOrders: { async inspect() { return { status: 'KNOWN', count: 0 }; } }, configureWeb(web) {
      web.get('/cart-mobile-preview.html', (_req, res) => {
        const nonce = randomBytes(24).toString('base64');
        res.set('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; media-src 'self' https:; base-uri 'none'; frame-ancestors 'none'`);
        res.set('Cache-Control', 'no-store'); res.set('Referrer-Policy', 'no-referrer'); res.set('X-Content-Type-Options', 'nosniff'); res.type('html').send(template.replaceAll('__CSP_NONCE__', nonce));
      });
    } });
    try { await use(app); } finally { await app.close(); }
  }, { scope: 'worker', timeout: 180000 }]
});
export const test = configured.extend<{ scenario: { data: Awaited<ReturnType<typeof seedCatalog>>; customer: Awaited<ReturnType<Harness['customer']>> } }>({
  scenario: [async ({ page, app }, use) => { await use({ data: await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword), customer: await app.customer() }); }, { timeout: 180000 }]
});
export async function login(page: Page, origin: string, email: string, password: string) {
  await page.goto(origin + '/#/login'); const form = page.getByRole('form', { name: 'Bom te ver de novo' });
  await form.getByLabel('E-mail', { exact: true }).fill(email); await form.getByLabel('Senha', { exact: true }).fill(password); await form.getByRole('button').click();
  await expect(page.getByRole('link', { name: 'Minha conta', exact: true })).toBeVisible();
}
export async function addNew(page: Page, origin: string, editionId: string, count = 1) {
  await page.goto(origin + '/#/edition?id=' + editionId); await page.getByRole('radio', { name: /Selecionar oferta nova 1 por/ }).check();
  await page.getByLabel('Quantidade para adicionar', { exact: true }).fill(String(count)); await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click();
  await expect(page.getByText('Adicionado ao carrinho. Adicionar não reserva estoque.', { exact: true })).toBeVisible();
}
export { expect };
