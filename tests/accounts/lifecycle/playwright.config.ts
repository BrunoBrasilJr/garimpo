import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', testMatch: '*.spec.ts', workers: 1, fullyParallel: false, timeout: 180000, expect: { timeout: 10000 }, reporter: [['../../e2e/account/reporter.ts']], outputDir: '../../../test-results/accounts-lifecycle/playwright', use: { browserName: 'firefox', ignoreHTTPSErrors: false, trace: 'off', video: 'off' } });
