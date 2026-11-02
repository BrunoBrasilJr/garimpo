import { expect, test } from 'vitest';
import { validateAuditReport } from './audit-policy.mjs';

const known = () => ({
  metadata: { vulnerabilities: { total: 2 } },
  vulnerabilities: {
    'deepmerge': { via: [{ name: 'deepmerge', url: 'https://github.com/advisories/GHSA-gcqx-w48m-w2h4' }] },
    '@expo/config': { via: ['deepmerge'] }
  }
});

test('accepts a complete report with no findings without claiming an exception', () => {
  expect(validateAuditReport({ metadata: { vulnerabilities: { total: 0 } }, vulnerabilities: {} })).toBe(0);
});

test('recognizes only the explicitly reviewed advisory chain', () => {
  expect(validateAuditReport(known())).toBe(2);
});
test('rejects a new advisory even on the same dependency', () => {
  const report = known();
  report.vulnerabilities['deepmerge'].via[0]!.url = 'https://github.com/advisories/another-advisory';
  expect(() => validateAuditReport(report)).toThrow('New or unmitigated');
});
test('rejects an unresolved different package', () => {
  expect(() => validateAuditReport({ metadata: { vulnerabilities: { total: 1 } }, vulnerabilities: { zod: { via: ['deepmerge'] } } })).toThrow('New or unmitigated');
});
test('rejects incomplete and inconsistent audit evidence', () => {
  expect(() => validateAuditReport({})).toThrow('Incomplete');
  const report = known();
  report.metadata.vulnerabilities.total = 0;
  expect(() => validateAuditReport(report)).toThrow('inconsistent');
});
test('rejects circular dependency evidence without an advisory origin', () => {
  expect(() => validateAuditReport({ metadata: { vulnerabilities: { total: 2 } }, vulnerabilities: { deepmerge: { via: ['@expo/config'] }, '@expo/config': { via: ['deepmerge'] } } })).toThrow('New or unmitigated');
});

test('rejects the former node-forge exception now that an upstream fix is required', () => {
  expect(() => validateAuditReport({ metadata: { vulnerabilities: { total: 1 } }, vulnerabilities: { 'node-forge': { via: [{ name: 'node-forge', url: 'https://github.com/advisories/GHSA-86w9-cpqp-85rv' }] } } })).toThrow('New or unmitigated');
});
