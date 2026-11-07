import { resolve } from 'node:path';
import { homedir } from 'node:os';

export interface BackupConfig {
  connectionString: string;
  schema: string;
  database: string;
  mediaRoot: string;
  backupRoot: string;
  pgBin: string;
  retentionDays: number;
}
export function backupConfig(value: string, options: Partial<Pick<BackupConfig, 'mediaRoot' | 'backupRoot' | 'pgBin' | 'retentionDays'>> = {}): BackupConfig {
  const url = new URL(value), schema = url.searchParams.get('schema') ?? 'public';
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['127.0.0.1', 'localhost'].includes(url.hostname)
    || !/^garimpo_(dev|test)$/.test(url.pathname.slice(1)) || !/^(public|task\d{3}_[a-f0-9]{32})$/.test(schema)) {
    throw new Error('BACKUP_CONFIGURATION_INVALID');
  }
  const retentionDays = options.retentionDays ?? 30;
  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) throw new Error('BACKUP_RETENTION_INVALID');
  const mediaRoot = resolve(options.mediaRoot ?? resolve(homedir(), '.local/share/garimpo/media/public-products'));
  const backupRoot = resolve(options.backupRoot ?? resolve(homedir(), '.local/share/garimpo/backups'));
  if (backupRoot === mediaRoot || backupRoot.startsWith(mediaRoot + '/') || mediaRoot.startsWith(backupRoot + '/')) throw new Error('BACKUP_ROOTS_OVERLAP');
  url.searchParams.delete('schema'); url.searchParams.delete('application_name');
  return { connectionString: url.href, schema, database: url.pathname.slice(1), mediaRoot, backupRoot,
    pgBin: options.pgBin ?? '/usr/lib/postgresql/17/bin', retentionDays };
}
export function postgresEnvironment(connectionString: string) {
  const url = new URL(connectionString);
  return { PATH: process.env.PATH, LANG: 'C.UTF-8', HOME: process.env.HOME, PGHOST: url.hostname, PGPORT: url.port || '5432', PGDATABASE: url.pathname.slice(1),
    PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGCONNECT_TIMEOUT: '15' };
}
export function identifier(value: string) { return '"' + value.replaceAll('"', '""') + '"'; }
