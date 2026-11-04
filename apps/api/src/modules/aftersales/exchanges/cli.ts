import { createDatabase } from '../../../persistence/client.ts';
import type { Database } from '../../../persistence/client.ts';
import { Accounts } from '../../accounts/service.ts';
import { Exchanges } from './service.ts';

let db: Database | undefined;
try {
  const value = process.env.DATABASE_URL;
  if (!value || process.env.NODE_ENV === 'production' || process.argv.length !== 2) throw new Error('Local configuration required.');
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost', '127.0.0.1'].includes(url.hostname) || !url.pathname.slice(1)) throw new Error('Local database required.');
  db = createDatabase(value);
  console.info(JSON.stringify({ reconciledExchanges: await new Exchanges(new Accounts(db)).reconcile() }));
} catch {
  console.error('Não foi possível reconciliar as trocas. Confira a configuração e o estado persistido.');
  process.exitCode = 1;
} finally {
  await db?.$disconnect();
}
