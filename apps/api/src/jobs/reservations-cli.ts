import { createDatabase } from '../persistence/client.ts';
import type { Database } from '../persistence/client.ts';
import { expireReservations } from './reservations.ts';
let db: Database | undefined;
try {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error('Configuration unavailable.');
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || url.pathname.length < 2) throw new Error('Invalid database configuration.');
  db = createDatabase(value);
  console.info(JSON.stringify({ expiredCheckouts: await expireReservations(db) }));
} catch {
  console.error('Reservation expiry job could not complete. Check protected configuration and retained state.'); process.exitCode = 1;
} finally {
  try { await db?.$disconnect(); } catch { console.error('Reservation expiry job could not close its database connection.'); process.exitCode = 1; }
}
