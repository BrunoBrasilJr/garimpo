import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect } from '../checkout/fixtures';

test('Windows Chrome and Edge exercise the same isolated HTTPS purchase and role guards', async ({ app, scenario }) => {
  const directory = process.env.GARIMPO_WINDOWS_ACCEPTANCE_DIR;
  if (!directory || !directory.startsWith('/mnt/c/Users/brasi/garimpo-planejamento/test-results/acceptance/')) throw new Error('Explicit private Windows bridge directory required.');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await writeFile(resolve(directory, 'bridge.json'), JSON.stringify({ origin: app.origin,
    ca: (await readFile(app.caPath)).toString('base64'), customer: scenario.customer.input,
    edition: scenario.data.main, title: scenario.data.mainTitle, credentials: app.credentials,
    day: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.now() + 2 * 86400000))
  }), { mode: 0o600 });
  await expect.poll(async () => {
    try { return JSON.parse(await readFile(resolve(directory, 'result.json'), 'utf8')) as { status: string }; }
    catch { return null; }
  }, { timeout: 300000, intervals: [500] }).toMatchObject({ status: 'PASS' });
});
