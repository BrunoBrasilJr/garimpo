import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: '.', testMatch: 'windows-bridge.spec.ts', workers: 1, timeout: 360000,
  reporter: [['../account/reporter.ts']], outputDir: '../../../test-results/acceptance/windows-playwright',
  use: { browserName: 'firefox', ignoreHTTPSErrors: false, trace: 'off', video: 'off' } });
