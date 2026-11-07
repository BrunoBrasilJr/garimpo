import { backupConfig } from './config.ts';
import { runBackup } from './service.ts';
import { verifyBackup } from './verify.ts';

try {
  const [command, target, extra] = process.argv.slice(2);
  if (extra) throw new Error('Invalid backup arguments.');
  if (command === 'verify' && target) {
    const manifest = await verifyBackup(target);
    console.info(JSON.stringify({ id: manifest.id, status: 'VERIFIED', files: manifest.files.length, evidence: manifest.evidence.length }));
  } else if (command === 'daily' && !target && process.env.DATABASE_URL) {
    const config = backupConfig(process.env.DATABASE_URL, {
      ...(process.env.GARIMPO_MEDIA_ROOT ? { mediaRoot: process.env.GARIMPO_MEDIA_ROOT } : {}),
      ...(process.env.GARIMPO_BACKUP_ROOT ? { backupRoot: process.env.GARIMPO_BACKUP_ROOT } : {})
    });
    console.info(JSON.stringify({ ...await runBackup(config), status: 'SUCCEEDED' }));
  } else throw new Error('Invalid backup command.');
} catch {
  console.error('BACKUP_FAILED: confira a configuração privada e os registros de execução.');
  process.exitCode = 1;
}
