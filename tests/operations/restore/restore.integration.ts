import { randomUUID } from 'node:crypto';
import { appendFile, cp, mkdir, mkdtemp, readFile, readdir, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { Client } from 'pg';
import sharp from 'sharp';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { foundation } from '../../accounts/lifecycle/fixtures.ts';
import { Returns } from '../../../apps/api/src/modules/aftersales/returns/service.ts';
import { addEvidence } from '../../../apps/api/src/modules/aftersales/shared/evidence.ts';
import { AutomaticRefunds } from '../../../apps/api/src/modules/refunds/automatic.ts';
import { backupConfig } from '../../../apps/api/src/operations/backup/config.ts';
import { fileDigest } from '../../../apps/api/src/operations/backup/files.ts';
import { tableDigests } from '../../../apps/api/src/operations/backup/manifest.ts';
import { runBackup } from '../../../apps/api/src/operations/backup/service.ts';
import { latestBackup, restoreBackup } from '../../../scripts/restore-validation/restore.ts';

let fixture: Awaited<ReturnType<typeof foundation>>;
let config: ReturnType<typeof backupConfig>;
let root: string;
let backup: Awaited<ReturnType<typeof runBackup>>;
let historicalKey: string;

beforeAll(async () => {
  fixture = await foundation(undefined, '030');
  root = await mkdtemp(resolve(tmpdir(), 'garimpo-restore-test-'));
  config = backupConfig(process.env.TEST_DATABASE_URL!, { mediaRoot: fixture.mediaRoot, backupRoot: resolve(root, 'sets') });
  const photo = await sharp({ create: { width: 3, height: 3, channels: 3, background: 'navy' } }).png().toBuffer();
  const buyer = await fixture.customer();
  const held = await fixture.ready(buyer);
  const order = await fixture.orders.create(buyer.accessToken, held.body, held.key);
  const paid = await fixture.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
  const historical = order.products[0]!.images[0]!;
  historicalKey = historical.url.split('/').at(-1)!;
  await fixture.catalog.upload(fixture.admin.accessToken, 'edition', held.offer.editionId, photo, 'image/png', 'Capa atual sintética');
  await fixture.catalog.deleteImage(fixture.admin.accessToken, historical.id);
  await fixture.logistics.change(fixture.operator.accessToken, order.id, { version: paid.order!.version, status: 'PREPARING', reason: 'Separação sintética' }, randomUUID());
  const item = await fixture.db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
  const returns = new Returns(fixture.accounts, new AutomaticRefunds(fixture.accounts, fixture.gateway));
  const opened = await returns.open(buyer.accessToken, order.id, { reason: 'Devolução sintética', items: [{ orderItemId: item.id, quantity: 1 }] }, randomUUID());
  await addEvidence(returns, buyer.accessToken, false, opened.id, 'image/png', photo);
  backup = await runBackup(config);
});
afterAll(async () => { await fixture?.close(); });

async function sourceDigests() {
  const client = new Client({ connectionString: config.connectionString });
  await client.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const result = await tableDigests(client, config.schema);
    await client.query('COMMIT');
    return result;
  } finally { await client.end(); }
}

test('a real restore preserves database rows, current and historical media, and private evidence without touching the source', async () => {
  const before = await sourceDigests();
  const originalDump = await fileDigest(resolve(backup.directory, 'database.dump'));
  const originalPhoto = await fileDigest(resolve(config.mediaRoot, historicalKey));
  expect(await latestBackup(config)).toBe(backup.directory);
  const result = await restoreBackup(config, backup.directory, resolve(root, 'restores'));
  expect(result).toMatchObject({ status: 'PASS', evidence: 1, imageReferences: 2, files: 2 });
  expect(result.database).toMatch(/^garimpo_restore_[a-f0-9]{32}$/);
  expect(result.durationMs).toBeGreaterThan(0);
  expect(await fileDigest(resolve(result.directory, 'snapshot/media', historicalKey))).toEqual(originalPhoto);
  expect(await fileDigest(resolve(config.mediaRoot, historicalKey))).toEqual(originalPhoto);
  expect(await fileDigest(resolve(backup.directory, 'database.dump'))).toEqual(originalDump);
  expect(await sourceDigests()).toEqual(before);
  expect((await stat(result.directory)).mode & 0o077).toBe(0);
  expect(JSON.parse(await readFile(resolve(result.directory, 'result.json'), 'utf8'))).toMatchObject({ status: 'PASS', database: result.database });
  console.info(JSON.stringify({ tables: result.tables, rows: result.rows, files: result.files, evidence: result.evidence, durationMs: result.durationMs }));
});

test('a corrupt copy or overlapping destination is rejected before creating a restore', async () => {
  await expect(restoreBackup(config, backup.directory, config.backupRoot)).rejects.toThrow('RESTORE_PATHS_NOT_ISOLATED');
  const damagedRoot = resolve(root, 'damaged');
  const targetRoot = resolve(root, 'rejected');
  await mkdir(damagedRoot, { mode: 0o700 });
  await mkdir(targetRoot, { mode: 0o700 });
  const damaged = resolve(damagedRoot, backup.id);
  await cp(backup.directory, damaged, { recursive: true, errorOnExist: true, force: false });
  await appendFile(resolve(damaged, 'database.dump'), 'damaged test fixture');
  await expect(restoreBackup({ ...config, backupRoot: damagedRoot }, damaged, targetRoot)).rejects.toThrow('BACKUP_DUMP_HASH_MISMATCH');
  expect(await readdir(targetRoot)).toEqual([]);
});
