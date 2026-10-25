import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validateAuditReport } from './audit-policy.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const result = spawnSync('npm', ['audit', '--json', '--audit-level=high'], { cwd: root, encoding: 'utf8' });
mkdirSync(resolve(root, 'test-results/bootstrap'), { recursive: true });
writeFileSync(resolve(root, 'test-results/bootstrap/audit-patched.json'), result.stdout ?? '');
if (result.error || ![0, 1].includes(result.status)) throw new Error('Audit unavailable; security validation remains blocked.');
const report = JSON.parse(result.stdout);
const findings = validateAuditReport(report);
if (result.status === 1 && findings === 0) throw new Error('Failed audit with no findings; evidence is incomplete.');

const manifest = JSON.parse(readFileSync(resolve(root, 'patches/node-forge+1.4.0.json'), 'utf8'));
const source = readFileSync(resolve(root, 'node_modules/node-forge/lib/rsa.js'));
if (createHash('sha256').update(source).digest('hex') !== manifest.patchedSha256) {
  throw new Error('Approved patched bytes not present; advisory cannot be classified as mitigated.');
}

console.info(`npm audit exit code: ${result.status}; metadata findings: ${JSON.stringify(report.metadata.vulnerabilities)}.`);
if (result.status === 1) {
  console.info('npm audit: FAIL remains in the original report. Only the explicitly approved node-forge version advisory has matching patched bytes.');
} else {
  console.info('npm audit: PASS.');
}
console.info('Audit classification checked; acceptance still requires signature/schema regression tests, affected build checks and responsible manual tests.');
