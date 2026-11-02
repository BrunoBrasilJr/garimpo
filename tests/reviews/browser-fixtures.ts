import { randomBytes, randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test as base, expect } from '../e2e/account/fixtures';
import { startHarness } from '../e2e/account/harness.mjs';
import { PurchaseFixture } from './fixtures';
import { seedCatalog } from '../e2e/catalog-web/seed';
type Harness = Awaited<ReturnType<typeof startHarness>>;
const configured = base.extend<object, { purchases: PurchaseFixture; app: Harness }>({
  purchases: [async ({ browserName }, use) => { void browserName; await use(new PurchaseFixture()); }, { scope: 'worker' }],
  app: [async ({ purchases }, use) => {
    const template = readFileSync(new URL('../e2e/catalog-mobile/preview.html', import.meta.url), 'utf8').replace('catalog-mobile-preview.js', 'reviews-mobile-preview.js');
    const app = await startHarness({ reviewPurchases: purchases, configureWeb(web) {
      web.get('/reviews-mobile-preview.html', (_req, res) => {
        const nonce = randomBytes(24).toString('base64');
        res.set('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; media-src 'self' https:; base-uri 'none'; frame-ancestors 'none'`);
        res.set('Cache-Control', 'no-store'); res.set('Referrer-Policy', 'no-referrer'); res.set('X-Content-Type-Options', 'nosniff'); res.type('html').send(template.replaceAll('__CSP_NONCE__', nonce));
      });
    } });
    try { await use(app); } finally { await app.close(); }
  }, { scope: 'worker', timeout: 180000 }]
});
type Scenario = { data: Awaited<ReturnType<typeof seedCatalog>>; customer: Awaited<ReturnType<Harness['customer']>>; orderId: string };
export const test = configured.extend<{ scenario: Scenario }>({
  scenario: [async ({ page, app, purchases }, use) => {
    const started = Date.now(), data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword), customer = await app.customer(), orderId = randomUUID();
    purchases.set({ userId: customer.user.id, editionId: data.main, orderId });
    writeFileSync(resolve(app.directory, 'review-preparation-' + orderId + '.json'), JSON.stringify({ preparationMs: Date.now() - started }), { mode: 0o600 });
    await use({ data, customer, orderId });
  }, { timeout: 180000 }]
});
export { expect };
