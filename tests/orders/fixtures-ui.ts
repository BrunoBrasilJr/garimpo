import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';
import { test as base } from '../e2e/checkout/fixtures';
import { startHarness } from '../e2e/account/harness.mjs';
type Harness = Awaited<ReturnType<typeof startHarness>>;
export const test = base.extend<object, { app: Harness }>({
  app: [async ({ browserName }, use) => {
    void browserName;
    const template = readFileSync(new URL('../e2e/catalog-mobile/preview.html', import.meta.url), 'utf8').replace('catalog-mobile-preview.js', 'orders-mobile-preview.js');
    const app = await startHarness({ configureWeb(web) {
      web.get('/orders-mobile-preview.html', (_req, res) => {
        const nonce = randomBytes(24).toString('base64');
        res.set('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'`);
        res.set('Cache-Control', 'no-store'); res.set('Referrer-Policy', 'no-referrer'); res.set('X-Content-Type-Options', 'nosniff');
        res.type('html').send(template.replaceAll('__CSP_NONCE__', nonce));
      });
    } });
    try { await use(app); } finally { await app.close(); }
  }, { scope: 'worker', timeout: 180000 }]
});
export async function signIn(page: Page, app: Harness, email: string, password: string) {
  await page.goto(app.origin + '/#/login');
  const form = page.getByRole('form', { name: 'Bom te ver de novo' });
  await form.getByLabel('E-mail', { exact: true }).fill(email); await form.getByLabel('Senha', { exact: true }).fill(password);
  const signed = page.waitForResponse(r => r.url().endsWith('/auth/login') && r.request().method() === 'POST');
  await form.getByRole('button').click(); if ((await signed).status() !== 200) throw new Error('Synthetic login failed.');
  await page.getByRole('link', { name: 'Minha conta', exact: true }).waitFor();
}
export { expect, reserve, accept, confirm, login } from '../e2e/checkout/fixtures';
