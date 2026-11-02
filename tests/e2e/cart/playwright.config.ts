import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', testMatch: '*.spec.ts', workers: 1, fullyParallel: false,
  // Real catalog preparation, role changes and two renderers; workflow budget, not an application SLA.
  timeout: 180000, expect: { timeout: 10000 }, reporter: [['../account/reporter.ts']],
  outputDir: '../../../test-results/cart-ui/playwright', use: { browserName: 'firefox', ignoreHTTPSErrors: false, trace: 'off', video: 'off' } });
