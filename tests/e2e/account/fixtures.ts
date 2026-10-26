import { test as base, expect, firefox } from '@playwright/test';
import type { Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { startHarness } from './harness.mjs';

type Harness = Awaited<ReturnType<typeof startHarness>>;
export const test = base.extend<{ page: Page }, { app: Harness }>({
  app: [async ({ browserName }, use) => { void browserName; const app = await startHarness(); try { await use(app); } finally { await app.close(); } }, { scope: 'worker', timeout: 180000 }],
  page: async ({ app }, use, info) => {
    app.advance(2 * 86400000);
    const profile = resolve(app.directory, 'browser-' + randomUUID()); mkdirSync(profile, { recursive: true, mode: 0o700 });
    execFileSync('certutil', ['-N', '--empty-password', '-d', 'sql:' + profile], { stdio: 'ignore' });
    execFileSync('certutil', ['-A', '-n', 'Garimpo isolated test CA', '-t', 'C,,', '-i', app.caPath, '-d', 'sql:' + profile], { stdio: 'ignore' });
    const context = await firefox.launchPersistentContext(profile, { headless: process.env.ACCOUNT_UI_HEADED !== '1', ignoreHTTPSErrors: false,
      viewport: { width: 1280, height: 900 }, locale: 'pt-BR', firefoxUserPrefs: { 'security.enterprise_roots.enabled': false } });
    const page = await context.newPage(), errors: string[] = [];
    page.on('pageerror', error => errors.push(error.name));
    try {
      await page.goto(app.origin); await use(page);
      expect(errors).toEqual([]);
    } finally {
      try { if (!page.isClosed()) await page.screenshot({ path: resolve(app.directory, info.title.replace(/[^a-z0-9]/gi, '-') + '.png'), fullPage: true }); }
      finally { await context.close(); }
    }
  }
});
export { expect };
