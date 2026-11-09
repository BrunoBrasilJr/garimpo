import { createHash, randomUUID } from 'node:crypto';
import { constants } from 'node:fs';
import { chmod, copyFile, lstat, mkdir, readdir, realpath, writeFile } from 'node:fs/promises';
import { homedir, userInfo } from 'node:os';
import { dirname, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { Client } from 'pg';
import { backupConfig, identifier, postgresEnvironment } from '../../apps/api/src/operations/backup/config.ts';
import type { BackupConfig } from '../../apps/api/src/operations/backup/config.ts';
import { postgresCommand, privateRoot } from '../../apps/api/src/operations/backup/files.ts';
import { tableDigests } from '../../apps/api/src/operations/backup/manifest.ts';
import type { BackupManifest } from '../../apps/api/src/operations/backup/manifest.ts';
import { readManifest, verifyBackup } from '../../apps/api/src/operations/backup/verify.ts';

const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/;
const mediaPrefix = '/api/v1/media/products/';
const overlaps = (left: string, right: string) => left === right || left.startsWith(right + '/') || right.startsWith(left + '/');

async function requirePrivateDirectory(path: string) {
  const stat = await lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || stat.mode & 0o077 || await realpath(path) !== path) {
    throw new Error('RESTORE_SOURCE_NOT_PRIVATE');
  }
}

export async function latestBackup(config: BackupConfig) {
  await requirePrivateDirectory(config.backupRoot);
  const candidates: { directory: string; createdAt: string }[] = [];
  for (const entry of await readdir(config.backupRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !uuid.test(entry.name)) continue;
    const directory = resolve(config.backupRoot, entry.name);
    const manifest = await readManifest(directory).catch(() => undefined);
    if (manifest?.id === entry.name && manifest.database === config.database && manifest.schema === config.schema) {
      candidates.push({ directory, createdAt: manifest.createdAt });
    }
  }
  candidates.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  if (!candidates[0]) throw new Error('RESTORE_NO_BACKUP');
  return candidates[0].directory;
}

async function copyPrivateFile(source: string, destination: string) {
  const stat = await lstat(source);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.mode & 0o077) throw new Error('RESTORE_SOURCE_FILE_INVALID');
  await copyFile(source, destination, constants.COPYFILE_EXCL);
  await chmod(destination, 0o600);
}

async function compareReferences(client: Client, manifest: BackupManifest) {
  const schema = identifier(manifest.schema);
  const declared = new Map(manifest.images.map(image => [image.id, image]));
  const seen = new Set<string>();
  function checkImage(id: string, key: string, sha256: string, byteSize: number) {
    const image = declared.get(id);
    if (!image || image.key !== key || image.sha256 !== sha256 || image.byteSize !== byteSize) {
      throw new Error('RESTORE_IMAGE_REFERENCE_MISMATCH');
    }
    seen.add(id);
  }
  const images = await client.query<{ id: string; storageKey: string; contentHash: string; byteSize: number }>(
    `SELECT id, "storageKey", "contentHash", "byteSize" FROM ${schema}."ProductImage"`
  );
  for (const image of images.rows) checkImage(image.id, image.storageKey, image.contentHash, image.byteSize);
  const historical = await client.query<{ image: { id: string; url: string; contentHash: string; byteSize: number } }>(
    `SELECT image FROM ${schema}."OrderItem" i
      CROSS JOIN LATERAL jsonb_array_elements(coalesce(i."productSnapshot"->'images','[]')) AS images(image)
     UNION ALL SELECT image FROM ${schema}."Checkout" c
      CROSS JOIN LATERAL jsonb_array_elements(coalesce(c."quoteSnapshot"->'products','[]')) AS products(product)
      CROSS JOIN LATERAL jsonb_array_elements(coalesce(product->'images','[]')) AS images(image)`
  );
  for (const { image } of historical.rows) {
    if (!image?.url?.startsWith(mediaPrefix)) throw new Error('RESTORE_IMAGE_REFERENCE_MISMATCH');
    checkImage(image.id, image.url.slice(mediaPrefix.length), image.contentHash, image.byteSize);
  }
  if (seen.size !== manifest.images.length) throw new Error('RESTORE_IMAGE_REFERENCE_MISMATCH');

  const evidence = new Map(manifest.evidence.map(row => [row.id, row]));
  let previous = '00000000-0000-0000-0000-000000000000';
  for (;;) {
    const batch = await client.query<{ id: string; content: Buffer }>(
      `SELECT id, content FROM ${schema}."Evidence" WHERE id > $1 ORDER BY id LIMIT 10`, [previous]
    );
    for (const row of batch.rows) {
      const expected = evidence.get(row.id);
      const sha256 = createHash('sha256').update(row.content).digest('hex');
      if (!expected || expected.sha256 !== sha256 || expected.byteSize !== row.content.length) {
        throw new Error('RESTORE_EVIDENCE_MISMATCH');
      }
      evidence.delete(row.id);
    }
    if (batch.rows.length < 10) break;
    previous = batch.rows.at(-1)!.id;
  }
  if (evidence.size) throw new Error('RESTORE_EVIDENCE_MISMATCH');
}

export async function restoreBackup(config: BackupConfig, source: string, destinationRoot = resolve(homedir(), '.local/share/garimpo/restores')) {
  if (process.platform !== 'linux') throw new Error('RESTORE_REQUIRES_LINUX');
  const root = resolve(destinationRoot);
  const directory = resolve(source);
  const env = postgresEnvironment(config.connectionString);
  const guarded = backupConfig(config.connectionString);
  if (guarded.database !== config.database || env.PGUSER !== config.database || env.PGPORT !== '55432') {
    throw new Error('RESTORE_CLUSTER_NOT_ALLOWED');
  }
  if (dirname(directory) !== config.backupRoot || overlaps(root, config.backupRoot) || overlaps(root, config.mediaRoot)) {
    throw new Error('RESTORE_PATHS_NOT_ISOLATED');
  }
  await requirePrivateDirectory(config.backupRoot);
  await requirePrivateDirectory(directory);
  await requirePrivateDirectory(resolve(directory, 'media'));
  const manifest = await verifyBackup(directory);
  if (resolve(config.backupRoot, manifest.id) !== directory || manifest.database !== config.database || manifest.schema !== config.schema) {
    throw new Error('RESTORE_BACKUP_MISMATCH');
  }

  const started = performance.now();
  const runId = randomUUID();
  const database = 'garimpo_restore_' + runId.replaceAll('-', '');
  const restoredDirectory = resolve(root, runId);
  await privateRoot(root);
  await mkdir(restoredDirectory, { mode: 0o700 });
  const reportPath = resolve(restoredDirectory, 'result.json');
  try {
    const staged = resolve(restoredDirectory, 'snapshot');
    await mkdir(staged, { mode: 0o700 });
    await mkdir(resolve(staged, 'media'), { mode: 0o700 });
    for (const file of ['database.dump', 'manifest.json', 'manifest.sha256', ...manifest.files.map(file => 'media/' + file.key)]) {
      await copyPrivateFile(resolve(directory, file), resolve(staged, file));
    }
    const copied = await verifyBackup(staged);
    if (JSON.stringify(copied) !== JSON.stringify(manifest)) throw new Error('RESTORE_BACKUP_CHANGED');

    const administration = new Client({ host: resolve(homedir(), '.local/share/garimpo/postgres17'), port: Number(env.PGPORT),
      user: userInfo().username, database: 'postgres', connectionTimeoutMillis: 15000 });
    await administration.connect();
    try {
      // CREATE without IF NOT EXISTS fails if this freshly generated name is occupied.
      await administration.query(`CREATE DATABASE ${identifier(database)} OWNER ${identifier(env.PGUSER)} TEMPLATE template0`);
      await administration.query(`REVOKE CONNECT, TEMPORARY ON DATABASE ${identifier(database)} FROM PUBLIC`);
    } finally { await administration.end(); }

    const target = new URL(config.connectionString);
    target.pathname = '/' + database;
    const client = new Client({ connectionString: target.href, connectionTimeoutMillis: 15000 });
    await client.connect();
    try {
      const identity = await client.query<{ name: string }>('SELECT current_database() AS name');
      if (identity.rows[0]?.name !== database) throw new Error('RESTORE_WRONG_TARGET');
      // TASK-030 archives explicitly create the selected schema. The public
      // schema here is the empty one from template0 in this newly created DB.
      if (manifest.schema === 'public') await client.query('DROP SCHEMA public');
      await postgresCommand(resolve(config.pgBin, 'pg_restore'), [
        '--no-owner', '--no-privileges', '--exit-on-error', '--single-transaction', '--dbname', database, resolve(staged, 'database.dump')
      ], postgresEnvironment(target.href));
      await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
      const tables = await tableDigests(client, manifest.schema);
      if (JSON.stringify(tables) !== JSON.stringify(manifest.tables)) throw new Error('RESTORE_TABLE_DIGEST_MISMATCH');
      await compareReferences(client, manifest);
      await client.query('COMMIT');
    } finally { await client.end(); }

    const result = { status: 'PASS', runId, database, backupId: manifest.id, schema: manifest.schema,
      tables: manifest.tables.length, rows: manifest.tables.reduce((total, table) => total + table.rows, 0),
      files: manifest.files.length, imageReferences: manifest.images.length, evidence: manifest.evidence.length,
      durationMs: Math.round(performance.now() - started) };
    await writeFile(reportPath, JSON.stringify(result, null, 2), { mode: 0o600, flag: 'wx', flush: true });
    return { ...result, directory: restoredDirectory };
  } catch (error) {
    await writeFile(reportPath, JSON.stringify({ status: 'FAIL', runId, database, backupId: manifest.id,
      durationMs: Math.round(performance.now() - started) }), { mode: 0o600, flag: 'wx' }).catch(() => {});
    throw error;
  }
}
