import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, mkdir, realpath, open } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

export async function privateRoot(path: string) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  const stat = await lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || stat.mode & 0o077 || process.getuid && stat.uid !== process.getuid()) throw new Error('BACKUP_ROOT_NOT_PRIVATE');
  if (await realpath(path) !== resolve(path)) throw new Error('BACKUP_ROOT_SYMLINK');
}
export async function fileDigest(path: string) {
  const stat = await lstat(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('BACKUP_FILE_INVALID');
  const hash = createHash('sha256');
  let byteSize = 0;
  for await (const chunk of createReadStream(path)) { hash.update(chunk); byteSize += chunk.length; }
  return { sha256: hash.digest('hex'), byteSize };
}
export async function syncFile(path: string) {
  const handle = await open(path, 'r');
  try { await handle.sync(); } finally { await handle.close(); }
}
export function postgresCommand(binary: string, args: string[], env: NodeJS.ProcessEnv) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(binary, args, { env, stdio: ['ignore', 'ignore', 'ignore'], windowsHide: true });
    child.once('error', () => reject(new Error('POSTGRES_TOOL_FAILED')));
    child.once('exit', code => code === 0 ? resolve() : reject(new Error('POSTGRES_TOOL_FAILED')));
  });
}
