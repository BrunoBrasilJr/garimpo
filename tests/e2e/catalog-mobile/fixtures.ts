import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test as base, expect } from '../account/fixtures';
import { startHarness } from '../account/harness.mjs';

export const test = base.extend<object, { app: Awaited<ReturnType<typeof startHarness>> }>({
  app: [async ({ browserName }, use) => {
    void browserName;
    const template = readFileSync(new URL('./preview.html', import.meta.url), 'utf8');
    const app = await startHarness({ configureWeb(web) {
      web.get('/catalog-mobile-preview.html', (_request, response) => {
        const nonce = randomBytes(24).toString('base64');
        response.set('Content-Security-Policy', `default-src 'self'; script-src 'self'; style-src 'self' 'nonce-${nonce}'; connect-src 'self'; img-src 'self' data:; media-src 'self' https:; base-uri 'none'; frame-ancestors 'none'`);
        response.set('Cache-Control', 'no-store'); response.set('Referrer-Policy', 'no-referrer'); response.set('X-Content-Type-Options', 'nosniff');
        response.type('html').send(template.replaceAll('__CSP_NONCE__', nonce));
      });
    } });
    try { await use(app); } finally { await app.close(); }
  }, { scope: 'worker', timeout: 180000 }]
});
export { expect };
