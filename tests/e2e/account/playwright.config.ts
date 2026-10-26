import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '..', testMatch: ['**/account/*.spec.ts', '**/staff/*.spec.ts'], workers: 1, fullyParallel: false,
  timeout: 60000, expect: { timeout: 10000 }, reporter: [['./reporter.ts']],
  outputDir: '../../../test-results/account-ui/playwright', use: { browserName: 'firefox', ignoreHTTPSErrors: false, trace: 'off', video: 'off' }
});
