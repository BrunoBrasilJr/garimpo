import { createDatabase } from '../../persistence/client.ts';
import type { Database } from '../../persistence/client.ts';
import { Accounts } from '../accounts/service.ts';
import { Payments } from './service.ts';
import { LocalGateway } from './gateway.ts';
import { AutomaticRefunds } from '../refunds/automatic.ts';
import { expireOrders } from '../../jobs/order-expiry.ts';
import { id, key, parse } from './validation.ts';
let db: Database | undefined;
try {
  const value = process.env.DATABASE_URL; if (!value || process.env.NODE_ENV === 'production') throw new Error('Local simulator only.');
  const url = new URL(value); if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['127.0.0.1', 'localhost'].includes(url.hostname) || !url.pathname.slice(1)) throw new Error('Local database configuration required.');
  const [command, target, result, eventKey, extra] = process.argv.slice(2); if (extra) throw new Error('Unexpected arguments.');
  db = createDatabase(value); const accounts = new Accounts(db), gateway = new LocalGateway(db, accounts.clock), payments = new Payments(accounts, gateway);
  if (command === 'payment-event' && target && (result === 'APPROVED' || result === 'DECLINED') && eventKey) { const attemptId = parse(id, target); await gateway.event(attemptId, result, parse(key, eventKey)); await payments.apply(attemptId); }
  else if (command === 'resume' && target && !result && !eventKey) { const attemptId = parse(id, target); await gateway.capture(attemptId); await payments.apply(attemptId); }
  else if (command === 'refund-retry' && target && (result === 'SUCCEEDED' || result === 'FAILED') && eventKey) await new AutomaticRefunds(accounts, gateway).run(parse(id, target), parse(key, eventKey), result);
  else if (command === 'expire' && !target && !result && !eventKey) console.info(JSON.stringify({ expiredOrders: await expireOrders(db) }));
  else throw new Error('Invalid local simulator command.');
  console.info('Local simulator command completed. No real charge or external refund.');
} catch { console.error('Local simulator could not complete. Check command, protected configuration and retained retry state.'); process.exitCode = 1; }
finally { try { await db?.$disconnect(); } catch { console.error('Local simulator could not close its database connection.'); process.exitCode = 1; } }
