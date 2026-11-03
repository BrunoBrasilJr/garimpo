import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', testMatch: '*.spec.ts', workers: 1, fullyParallel: false, timeout: 120000,
  expect: { timeout: 10000 }, reporter: [['../account/reporter.ts']], outputDir: '../../../test-results/freight-admin/playwright',
  use: { browserName: 'firefox', ignoreHTTPSErrors: false, trace: 'off', video: 'off' } });
