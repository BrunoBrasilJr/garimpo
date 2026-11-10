import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.', testMatch: 'android-live.spec.ts', workers: 1, timeout: 50 * 60000,
  grep: process.env.GARIMPO_ANDROID_RECHECK === '1' ? /loopback Android/ : /operator ends it/,
  reporter: [['../account/reporter.ts']], outputDir: '../../../test-results/acceptance/android-playwright',
  use: { browserName: 'firefox', ignoreHTTPSErrors: false, trace: 'off', video: 'off' }
});
