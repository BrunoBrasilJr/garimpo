import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { validateAuditReport } from './audit-policy.mjs';
import { verifyToolchain } from './toolchain-integrity.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const result = spawnSync('npm', ['audit', '--json', '--audit-level=low'], { cwd: root, encoding: 'utf8' });
mkdirSync(resolve(root, 'test-results/bootstrap'), { recursive: true });
writeFileSync(resolve(root, 'test-results/bootstrap/audit-patched.json'), result.stdout ?? '');
if (result.error || ![0, 1].includes(result.status)) throw new Error('Audit unavailable; security validation remains blocked.');
const report = JSON.parse(result.stdout);
verifyToolchain();
const findings = validateAuditReport(report);
if (result.status === 1 && findings === 0) throw new Error('Failed audit with no findings; evidence is incomplete.');
if (result.status === 0 && findings !== 0) throw new Error('Audit reported findings without the expected failure at the low threshold.');

console.info(`npm audit exit code: ${result.status}; metadata findings: ${JSON.stringify(report.metadata.vulnerabilities)}.`);
if (result.status === 1) {
  console.info('npm audit: FAIL remains in the original report. Only the reviewed deepmerge advisory has matching patched bytes; node-forge must use its corrected upstream release.');
} else {
  console.info('npm audit: PASS.');
}
console.info('Audit classification checked; acceptance still requires prototype/signature/schema regressions and affected build/runtime checks.');
