import { readFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import { fileDigest } from './files.ts';
import type { BackupManifest } from './manifest.ts';

const sha256 = z.string().regex(/^[a-f0-9]{64}$/);
const size = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const uuid = z.string().uuid();
export const imageKey = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\.(jpg|png|webp)$/;
const descriptor = { sha256, byteSize: size };
const manifestShape = z.object({
  version: z.literal(1), id: uuid, database: z.enum(['garimpo_dev', 'garimpo_test']),
  schema: z.string().regex(/^(public|task\d{3}_[a-f0-9]{32})$/), createdAt: z.string().datetime(),
  dump: z.object(descriptor).strict(),
  files: z.array(z.object({ key: z.string().regex(imageKey), ...descriptor }).strict()),
  images: z.array(z.object({ id: uuid, key: z.string().regex(imageKey), ...descriptor }).strict()),
  evidence: z.array(z.object({ id: uuid, ...descriptor }).strict()),
  tables: z.array(z.object({ name: z.string().min(1).max(63), rows: size, sha256 }).strict())
}).strict();
export async function readManifest(directory: string): Promise<BackupManifest> {
  const root = await lstat(directory);
  if (!root.isDirectory() || root.isSymbolicLink()) throw new Error('BACKUP_DIRECTORY_INVALID');
  const file = resolve(directory, 'manifest.json');
  const stat = await lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 50_000_000) throw new Error('BACKUP_MANIFEST_INVALID');
  const bytes = await readFile(file);
  const hashPath = resolve(directory, 'manifest.sha256'), hashStat = await lstat(hashPath);
  if (!hashStat.isFile() || hashStat.isSymbolicLink() || hashStat.size > 100) throw new Error('BACKUP_MANIFEST_INVALID');
  const expected = (await readFile(hashPath, 'utf8')).trim();
  if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('BACKUP_MANIFEST_HASH_MISMATCH');
  const result = manifestShape.safeParse(JSON.parse(bytes.toString('utf8')));
  if (!result.success || new Set(result.data.files.map(file => file.key)).size !== result.data.files.length
    || new Set(result.data.tables.map(table => table.name)).size !== result.data.tables.length) throw new Error('BACKUP_MANIFEST_INVALID');
  return result.data;
}
export async function verifyBackup(directory: string) {
  const manifest = await readManifest(directory);
  const dump = await fileDigest(resolve(directory, 'database.dump'));
  if (dump.sha256 !== manifest.dump.sha256 || dump.byteSize !== manifest.dump.byteSize) throw new Error('BACKUP_DUMP_HASH_MISMATCH');
  for (const file of manifest.files) {
    const actual = await fileDigest(resolve(directory, 'media', file.key));
    if (actual.sha256 !== file.sha256 || actual.byteSize !== file.byteSize) throw new Error('BACKUP_MEDIA_HASH_MISMATCH');
  }
  for (const image of manifest.images) {
    const file = manifest.files.find(file => file.key === image.key);
    if (!file || file.sha256 !== image.sha256 || file.byteSize !== image.byteSize) throw new Error('BACKUP_REFERENCE_MISMATCH');
  }
  return manifest;
}
