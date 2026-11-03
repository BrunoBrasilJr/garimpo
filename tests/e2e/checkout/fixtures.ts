import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import type { CatalogEdition, CheckoutView, FreightRateView } from '@garimpo/contracts';
import { test as base, expect } from '../account/fixtures';
import { startHarness } from '../account/harness.mjs';
import { seedCatalog } from '../catalog-web/seed';
import { session } from '../cart/http';
type Harness = Awaited<ReturnType<typeof startHarness>>;
let nextZip = 10000000;
const configured = base.extend<object, { app: Harness }>({
  app: [async ({ browserName }, use) => {
    void browserName; const template = readFileSync(new URL('../catalog-mobile/preview.html', import.meta.url), 'utf8').replace('catalog-mobile-preview.js', 'purchase-mobile-preview.js');
    const app = await startHarness({ configureWeb(web) { web.get('/purchase-mobile-preview.html', (_req, res) => { const nonce = randomBytes(24).toString('base64'); res.set('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; media-src 'self' https:; base-uri 'none'; frame-ancestors 'none'`); res.set('Cache-Control', 'no-store'); res.set('Referrer-Policy', 'no-referrer'); res.set('X-Content-Type-Options', 'nosniff'); res.type('html').send(template.replaceAll('__CSP_NONCE__', nonce)); }); } });
    try { await use(app); } finally { await app.close(); }
  }, { scope: 'worker', timeout: 180000 }]
});
export const test = configured.extend<{ scenario: Awaited<ReturnType<typeof seed>> }>({ scenario: [async ({ page, app }, use) => { await use(await seed(page, app)); }, { timeout: 180000 }] });
async function seed(page: Page, app: Harness) {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword), customer = await app.customer();
  const admin = await session(app, app.credentials.adminEmail, app.credentials.adminPassword), startZip = String(nextZip); nextZip += 1000;
  const response = await admin.call<FreightRateView>('/admin/freight-rates', 'POST', { region: 'Área de teste ' + randomUUID(), served: true, amountCents: 1500, deliveryDays: 5, ranges: [{ startZip, endZip: String(Number(startZip) + 999) }] }); expect(response.status).toBe(201); const rate = response.body;
  const buyer = await session(app, customer.input.email, customer.input.password), address = await buyer.call<{ id: string }>('/me/addresses', 'POST', { recipient: 'Titular da compra', zip: rate.ranges[0]!.startZip, region: 'SP', city: 'Cidade sintética', neighborhood: 'Bairro', street: 'Rua da música', number: '7' }); expect(address.status).toBe(201);
  const missing = await buyer.call<{ id: string }>('/me/addresses', 'POST', { recipient: 'Endereço sem cobertura', zip: '99999999', region: 'SP', city: 'Cidade sintética', neighborhood: 'Bairro', street: 'Rua sem cobertura', number: '9' }); expect(missing.status).toBe(201);
  const verification = await app.message(customer.input.email, 'ACCESS.VERIFY'); expect((await buyer.call('/auth/email-verification/confirm', 'POST', { token: verification.token })).status).toBe(200);
  const detail = await admin.call<CatalogEdition>('/admin/editions/' + data.main), offer = detail.body.offers.find(o => o.kind === 'NEW')!;
  return { data, customer, admin, buyer, rate, address: address.body, missing: missing.body, offer };
}
export async function login(page: Page, app: Harness, customer: Awaited<ReturnType<Harness['customer']>>) {
  await page.goto(app.origin + '/#/login'); const form = page.getByRole('form', { name: 'Bom te ver de novo' }); await form.getByLabel('E-mail', { exact: true }).fill(customer.input.email); await form.getByLabel('Senha', { exact: true }).fill(customer.input.password);
  const signed = page.waitForResponse(r => r.url().endsWith('/auth/login') && r.request().method() === 'POST'); await form.getByRole('button').click(); expect((await signed).status()).toBe(200); await expect(page.getByRole('link', { name: 'Minha conta', exact: true })).toBeVisible();
}
export async function reserve(page: Page, app: Harness, customer: Awaited<ReturnType<Harness['customer']>>, editionId: string, coupon?: string) {
  await login(page, app, customer); await page.goto(app.origin + '/#/edition?id=' + editionId); await page.getByRole('radio', { name: /Selecionar oferta nova 1 por/ }).check(); await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click(); await expect(page.getByText('Adicionado ao carrinho. Adicionar não reserva estoque.', { exact: true })).toBeVisible();
  await page.goto(app.origin + '/#/cart'); if (coupon) { await page.getByLabel('Código do cupom', { exact: true }).fill(coupon); await page.getByRole('button', { name: 'Conferir cupom', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'validade' })).toBeVisible(); }
  await page.getByRole('checkbox', { name: 'Conferi os itens e os valores atuais', exact: true }).check(); const created = page.waitForResponse(r => r.url().endsWith('/checkouts') && r.request().method() === 'POST'); await page.getByRole('button', { name: 'Reservar conjunto por 15 minutos', exact: true }).click(); expect((await created).status()).toBe(201); const checkout = await (await created).json() as CheckoutView;
  await page.getByRole('link', { name: 'Escolher endereço e pagamento', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Finalizar compra', exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Atualizar finalização e pagamentos', exact: true })).toBeEnabled(); return checkout;
}
export async function accept(page: Page) {
  await page.getByRole('radio', { name: /Titular da compra ·/ }).check(); await page.getByRole('button', { name: 'Cotar frete deste endereço', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Confira o frete', exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Aceitar endereço e frete cotados', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Endereço e frete aceitos', exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Atualizar finalização e pagamentos', exact: true })).toBeEnabled();
}
export const confirm = (page: Page) => page.getByRole('checkbox', { name: 'Conferi o endereço aceito, frete, produtos e método de pagamento', exact: true }).check();
export { expect };
