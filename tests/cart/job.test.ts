import { expect, test } from 'vitest';
import { spawnSync } from 'node:child_process';
test('actual expiry CLI rejects missing/malformed configuration without logging a secret-bearing URL or raw stack', () => {
  const marker = 'CONFIDENTIAL_EXPIRY_CONFIGURATION';
  for (const value of ['', 'not-a-valid-url-' + marker, 'unsupported:' + marker]) {
    const result = spawnSync(process.execPath, ['--experimental-strip-types', 'apps/api/src/jobs/reservations-cli.ts'], { env: { ...process.env, DATABASE_URL: value }, encoding: 'utf8' });
    expect(result.status).toBe(1); expect(result.stdout).toBe(''); expect(result.stderr).toContain('Reservation expiry job could not complete.');
    expect(result.stderr).not.toContain(marker); expect(result.stderr).not.toContain('Invalid URL'); expect(result.stderr).not.toContain('node:internal');
  }
});
