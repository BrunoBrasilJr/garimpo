import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', testMatch: '*.spec.ts', workers: 1, fullyParallel: false,
  // New scenarios include catalog preparation and several real scrypt logins/role switches.
  // This is a bounded workflow budget, not an application response-time requirement.
  timeout: 180000, expect: { timeout: 10000 }, reporter: [['../e2e/account/reporter.ts']],
  outputDir: '../../test-results/reviews/playwright', use: { browserName: 'firefox', ignoreHTTPSErrors: false, trace: 'off', video: 'off' } });
