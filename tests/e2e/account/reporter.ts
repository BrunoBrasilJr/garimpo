import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
const redact = (value: string) => value.replace(/[A-Za-z0-9_-]{32,}/g, '[REDACTED]');
export default class RedactedReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    console.info(`${result.status}: ${test.title}`);
    for (const error of result.errors) console.error(redact(error.message ?? 'Browser test failed.'));
  }
  onEnd(result: FullResult) { console.info(`Browser suite: ${result.status}`); }
}
