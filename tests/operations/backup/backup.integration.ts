import { randomUUID, createHash } from 'node:crypto';
import { mkdtemp, readFile, writeFile, readdir, stat, symlink, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { foundation } from '../../accounts/lifecycle/fixtures.ts';
import { Returns } from '../../../apps/api/src/modules/aftersales/returns/service.ts';
import { AutomaticRefunds } from '../../../apps/api/src/modules/refunds/automatic.ts';
import { addEvidence } from '../../../apps/api/src/modules/aftersales/shared/evidence.ts';
import { backupConfig } from '../../../apps/api/src/operations/backup/config.ts';
import { runBackup } from '../../../apps/api/src/operations/backup/service.ts';
import { verifyBackup } from '../../../apps/api/src/operations/backup/verify.ts';
import type { BackupManifest } from '../../../apps/api/src/operations/backup/manifest.ts';
import { mkdir } from 'node:fs/promises';

const value = process.env.TEST_DATABASE_URL!;
let f: Awaited<ReturnType<typeof foundation>>, root: string, media: string, good: string, evidenceId: string;
const id = randomUUID(), key = id + '.png';
const schema = new URL(value).searchParams.get('schema')!;
let bytes: Buffer;
beforeAll(async () => {
  if (!/^task030_[a-f0-9]{32}$/.test(schema)) throw new Error('Separate task030 schema required.');
  f = await foundation(undefined, '030');
  root = await mkdtemp(resolve(tmpdir(), 'garimpo-backup-'));
  media = f.mediaRoot;
  bytes = await sharp({ create: { width: 2, height: 2, channels: 3, background: 'purple' } }).png().toBuffer();
  await writeFile(resolve(media, key), bytes, { mode: 0o600 });
  const buyer = await f.customer(), held = await f.ready(buyer);
  const order = await f.orders.create(buyer.accessToken, held.body, held.key);
  const paid = await f.payments.charge(buyer.accessToken, order.id, { chargeId: order.charges[0]!.id, scenario: 'APPROVED' }, randomUUID());
  await f.logistics.change(f.operator.accessToken, order.id, { version: paid.order!.version, status: 'PREPARING', reason: 'Separação sintética' }, randomUUID());
  const item = await f.db.orderItem.findFirstOrThrow({ where: { orderId: order.id } });
  const returns = new Returns(f.accounts, new AutomaticRefunds(f.accounts, f.gateway));
  const opened = await returns.open(buyer.accessToken, order.id, { reason: 'Devolução sintética', items: [{ orderItemId: item.id, quantity: 1 }] }, randomUUID());
  evidenceId = (await addEvidence(returns, buyer.accessToken, false, opened.id, 'image/png', bytes)).id;
  // An immutable historical image without a live catalog row must also be preserved.
});
afterAll(async () => { await f?.close(); });
const config = () => backupConfig(value, { mediaRoot: media, backupRoot: resolve(root, 'sets') });

test('snapshot dump, historical media and whole-table fingerprints form a private complete set', async () => {
  const result = await runBackup(config());
  good = result.directory;
  const manifest = await verifyBackup(good);
  expect(manifest).toMatchObject({ database: 'garimpo_test', schema });
  expect(manifest.files).toEqual(expect.arrayContaining([expect.objectContaining({ key, byteSize: bytes.length })]));
  expect(manifest.evidence).toEqual([expect.objectContaining({ id: evidenceId, byteSize: bytes.length })]);
  expect(manifest.tables.find(table => table.name === 'BackupRun')?.rows).toBe(1);
  expect(manifest.tables.some(table => table.name === 'OrderUnit')).toBe(true);
  expect((await stat(good)).mode & 0o077).toBe(0);
  expect((await stat(resolve(good, 'database.dump'))).mode & 0o077).toBe(0);
  expect(await f.db.backupRun.findUnique({ where: { id: result.id } })).toMatchObject({ status: 'SUCCEEDED', manifestHash: result.manifestHash });
});

test('a failed pg_dump retains the previous complete set and records an explicit failure', async () => {
  await expect(runBackup({ ...config(), pgBin: '/missing-postgresql-tools' })).rejects.toThrow('POSTGRES_TOOL_FAILED');
  await expect(verifyBackup(good)).resolves.toMatchObject({ version: 1 });
  expect(await f.db.backupRun.count({ where: { status: 'FAILED' } })).toBe(1);
  expect((await readdir(config().backupRoot)).some(name => name.startsWith('.pending-'))).toBe(true);
});

test('tampering and symbolic links are rejected before treating a set as valid', async () => {
  const result = await runBackup(config());
  await writeFile(resolve(result.directory, 'media', key), 'altered');
  await expect(verifyBackup(result.directory)).rejects.toThrow('BACKUP_MEDIA_HASH_MISMATCH');
  const linked = resolve(root, 'linked-set');
  await symlink(good, linked);
  await expect(verifyBackup(linked)).rejects.toThrow('BACKUP_DIRECTORY_INVALID');
  await expect(verifyBackup(good)).resolves.toMatchObject({ version: 1 });
});

test('retention removes only expired valid owned sets after a new successful set exists', async () => {
  const manifestPath = resolve(good, 'manifest.json');
  const old = JSON.parse(await readFile(manifestPath, 'utf8')) as BackupManifest;
  old.createdAt = '2020-01-01T00:00:00.000Z';
  const json = JSON.stringify(old, null, 2);
  await writeFile(manifestPath, json, { mode: 0o600 });
  await writeFile(resolve(good, 'manifest.sha256'), createHash('sha256').update(json).digest('hex') + '\n', { mode: 0o600 });
  const unrecognized = resolve(config().backupRoot, 'notes');
  await mkdir(unrecognized);
  await copyFile(manifestPath, resolve(unrecognized, 'manifest.json'));
  const newest = await runBackup(config());
  await expect(stat(good)).rejects.toMatchObject({ code: 'ENOENT' });
  expect((await stat(unrecognized)).isDirectory()).toBe(true);
  await expect(verifyBackup(newest.directory)).resolves.toMatchObject({ id: newest.id });
});

test('a lost completion record is recovered from the already published verified set', async () => {
  const result = await runBackup(config());
  await f.db.backupRun.update({ where: { id: result.id }, data: { status: 'RUNNING', manifestHash: null, completedAt: null } });
  await runBackup(config());
  expect(await f.db.backupRun.findUnique({ where: { id: result.id } })).toMatchObject({ status: 'SUCCEEDED', manifestHash: result.manifestHash });
});

test('a second database session cannot overlap a running backup', async () => {
  const lockKey = 'garimpo-backup:garimpo_test';
  await f.control.query('SELECT pg_advisory_lock(hashtextextended($1,0))', [lockKey]);
  try { await expect(runBackup(config())).rejects.toThrow('BACKUP_ALREADY_RUNNING'); }
  finally { await f.control.query('SELECT pg_advisory_unlock(hashtextextended($1,0))', [lockKey]); }
});
