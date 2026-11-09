import { backupConfig } from '../../apps/api/src/operations/backup/config.ts';
import { latestBackup, restoreBackup } from './restore.ts';

try {
  if (process.argv.length !== 2 || !process.env.DATABASE_URL) throw new Error('RESTORE_CONFIGURATION_REQUIRED');
  const config = backupConfig(process.env.DATABASE_URL, {
    ...(process.env.GARIMPO_BACKUP_ROOT ? { backupRoot: process.env.GARIMPO_BACKUP_ROOT } : {}),
    ...(process.env.GARIMPO_MEDIA_ROOT ? { mediaRoot: process.env.GARIMPO_MEDIA_ROOT } : {})
  });
  if (config.database !== 'garimpo_dev' || config.schema !== 'public') throw new Error('RESTORE_LOCAL_PROFILE_REQUIRED');
  const result = await restoreBackup(config, await latestBackup(config));
  console.info(JSON.stringify(result));
} catch (error) {
  const code = error instanceof Error && /^[A-Z_]{5,80}$/.test(error.message) ? error.message : 'RESTORE_VALIDATION_FAILED';
  console.error(code);
  process.exitCode = 1;
}
