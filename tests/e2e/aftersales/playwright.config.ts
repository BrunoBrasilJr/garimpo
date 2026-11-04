import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.', testMatch: '*.spec.ts', workers: 1, fullyParallel: false, timeout: 180000, expect: { timeout: 10000 },
  reporter: [['../account/reporter.ts']], outputDir: '../../../test-results/aftersales/playwright',
  use: { browserName: 'firefox', timezoneId: 'UTC', ignoreHTTPSErrors: false, trace: 'off', video: 'off' }
});
