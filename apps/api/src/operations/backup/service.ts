import { randomUUID, createHash } from 'node:crypto';
import { chmod, copyFile, mkdir, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Client } from 'pg';
import type { BackupConfig } from './config.ts';
import { identifier, postgresEnvironment } from './config.ts';
import { fileDigest, postgresCommand, privateRoot, syncFile } from './files.ts';
import { tableDigests } from './manifest.ts';
import type { BackupManifest } from './manifest.ts';
import { imageKey, readManifest, verifyBackup } from './verify.ts';

export async function runBackup(config: BackupConfig) {
  if (process.platform !== 'linux') throw new Error('BACKUP_REQUIRES_LINUX');
  await privateRoot(config.backupRoot);
  const client = new Client({ connectionString: config.connectionString, application_name: 'GARIMPO_BACKUP', connectionTimeoutMillis: 15000 });
  const recorder = new Client({ connectionString: config.connectionString, application_name: 'GARIMPO_BACKUP_RECORD', connectionTimeoutMillis: 15000 });
  const table = identifier(config.schema) + '."BackupRun"';
  const id = randomUUID(), now = new Date(), staging = resolve(config.backupRoot, '.pending-' + id), destination = resolve(config.backupRoot, id);
  let recorded = false, transaction = false;
  try {
    await client.connect();
    const lock = await client.query<{ locked: boolean }>('SELECT pg_try_advisory_lock(hashtextextended($1,0)) AS locked', ['garimpo-backup:' + config.database]);
    if (!lock.rows[0]?.locked) throw new Error('BACKUP_ALREADY_RUNNING');
    await recorder.connect();
    await recorder.query('INSERT INTO ' + table + ' (id,status,"createdAt") VALUES ($1,$2,$3)', [id, 'RUNNING', now]);
    recorded = true;
    const unfinished = await recorder.query<{ id: string }>('SELECT id FROM ' + table + ' WHERE status=$1 AND id<>$2', ['RUNNING', id]);
    for (const previous of unfinished.rows) {
      let hash: string | null = null;
      try {
        const directory = resolve(config.backupRoot, previous.id), recovered = await verifyBackup(directory);
        if (recovered.id === previous.id && recovered.database === config.database && recovered.schema === config.schema) {
          hash = (await fileDigest(resolve(directory, 'manifest.json'))).sha256;
        }
      } catch { /* An incomplete set is retained, with an explicit interrupted result. */ }
      await recorder.query('UPDATE ' + table + ' SET status=$1,"completedAt"=$2,"manifestHash"=$3,"errorCode"=$4 WHERE id=$5',
        [hash ? 'SUCCEEDED' : 'FAILED', now, hash, hash ? null : 'PROCESS_INTERRUPTED', previous.id]);
    }
    await mkdir(staging, { mode: 0o700 });
    await mkdir(resolve(staging, 'media'), { mode: 0o700 });
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY'); transaction = true;
    await client.query("SET LOCAL statement_timeout='10min'");
    const snapshot = await client.query<{ snapshot: string }>('SELECT pg_export_snapshot() AS snapshot');
    const dumpPath = resolve(staging, 'database.dump');
    await postgresCommand(resolve(config.pgBin, 'pg_dump'), ['--format=custom', '--no-owner', '--no-privileges',
      '--lock-wait-timeout=15000', '--strict-names', '--schema=' + config.schema, '--snapshot=' + snapshot.rows[0]!.snapshot, '--file=' + dumpPath],
    postgresEnvironment(config.connectionString));
    await chmod(dumpPath, 0o600);
    const images = await client.query<{ id: string; storageKey: string; contentHash: string; byteSize: number }>(
      'SELECT id,"storageKey","contentHash","byteSize" FROM ' + identifier(config.schema) + '."ProductImage" ORDER BY id');
    const keys = await readdir(config.mediaRoot).catch((error: NodeJS.ErrnoException) => { if (error.code === 'ENOENT') return []; throw error; });
    const files: BackupManifest['files'] = [];
    // Preserve immutable historical image bytes too, including files retained after a catalog edit.
    for (const key of keys.sort()) {
      if (!imageKey.test(key)) throw new Error('BACKUP_MEDIA_KEY_INVALID');
      const source = resolve(config.mediaRoot, key), target = resolve(staging, 'media', key);
      await fileDigest(source);
      await copyFile(source, target);
      await chmod(target, 0o600);
      files.push({ key, ...await fileDigest(target) });
      await syncFile(target);
    }
    const evidence: BackupManifest['evidence'] = [];
    let previous = '00000000-0000-0000-0000-000000000000';
    for (;;) {
      const batch = await client.query<{ id: string; content: Buffer }>(
        'SELECT id,content FROM ' + identifier(config.schema) + '."Evidence" WHERE id>$1 ORDER BY id LIMIT 10', [previous]);
      for (const row of batch.rows) evidence.push({ id: row.id, sha256: createHash('sha256').update(row.content).digest('hex'), byteSize: row.content.length });
      if (batch.rows.length < 10) break;
      previous = batch.rows.at(-1)!.id;
    }
    const manifest: BackupManifest = {
      version: 1, id, database: config.database, schema: config.schema, createdAt: now.toISOString(), dump: await fileDigest(dumpPath),
      files, images: images.rows.map(row => ({ id: row.id, key: row.storageKey, sha256: row.contentHash, byteSize: row.byteSize })),
      evidence, tables: await tableDigests(client, config.schema)
    };
    await client.query('COMMIT'); transaction = false;
    const bytes = JSON.stringify(manifest, null, 2), manifestHash = createHash('sha256').update(bytes).digest('hex');
    await writeFile(resolve(staging, 'manifest.json'), bytes, { mode: 0o600, flag: 'wx', flush: true });
    await writeFile(resolve(staging, 'manifest.sha256'), manifestHash + '\n', { mode: 0o600, flag: 'wx', flush: true });
    await verifyBackup(staging);
    await syncFile(dumpPath); await syncFile(resolve(staging, 'media')); await syncFile(staging);
    await rename(staging, destination);
    await syncFile(config.backupRoot);
    await recorder.query('UPDATE ' + table + ' SET status=$1,"completedAt"=$2,"manifestHash"=$3 WHERE id=$4', ['SUCCEEDED', new Date(), manifestHash, id]);
    let retention = 'APPLIED';
    try { await retainBackups(config, id, now); } catch { retention = 'PENDING'; }
    return { id, directory: destination, manifestHash, retention };
  } catch (error) {
    if (transaction) await client.query('ROLLBACK').catch(() => {});
    if (recorded) await recorder.query('UPDATE ' + table + ' SET status=$1,"completedAt"=$2,"errorCode"=$3 WHERE id=$4 AND status=$5',
      ['FAILED', new Date(), 'BACKUP_INCOMPLETE', id, 'RUNNING']).catch(() => {});
    throw error;
  } finally { await Promise.allSettled([client.end(), recorder.end()]); }
}

async function retainBackups(config: BackupConfig, keep: string, now: Date) {
  for (const name of await readdir(config.backupRoot)) {
    if (name === keep || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(name)) continue;
    const directory = resolve(config.backupRoot, name);
    try {
      const manifest = await readManifest(directory);
      if (manifest.id !== name || manifest.database !== config.database || manifest.schema !== config.schema
        || Date.parse(manifest.createdAt) >= now.getTime() - config.retentionDays * 86400000) continue;
      // A completed new set already exists. Only owned, valid and expired sets are removed.
      await verifyBackup(directory);
      await rm(directory, { recursive: true });
    } catch { /* Retain unrecognized or damaged sets for inspection. */ }
  }
}
