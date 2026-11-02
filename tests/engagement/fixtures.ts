import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test as base, expect } from '../e2e/account/fixtures';
import { startHarness } from '../e2e/account/harness.mjs';
export const test = base.extend<object, { app: Awaited<ReturnType<typeof startHarness>> }>({
  app: [async ({ browserName }, use) => {
    void browserName;
    const template = readFileSync(new URL('../e2e/catalog-mobile/preview.html', import.meta.url), 'utf8').replace('catalog-mobile-preview.js', 'engagement-mobile-preview.js');
    const app = await startHarness({ configureWeb(web) {
      web.get('/engagement-mobile-preview.html', (_req, res) => {
        const nonce = randomBytes(24).toString('base64');
        res.set('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; media-src 'self' https:; base-uri 'none'; frame-ancestors 'none'`);
        res.set('Cache-Control', 'no-store'); res.set('Referrer-Policy', 'no-referrer'); res.set('X-Content-Type-Options', 'nosniff'); res.type('html').send(template.replaceAll('__CSP_NONCE__', nonce));
      });
    } });
    try { await use(app); } finally { await app.close(); }
  }, { scope: 'worker', timeout: 180000 }]
});
export { expect };
