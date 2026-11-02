import { createDatabase } from '../persistence/client.ts';
import { expireReservations } from './reservations.ts';
const value = process.env.DATABASE_URL;
if (!value) throw new Error('DATABASE_URL is required for the reservation expiry job.');
const db = createDatabase(value);
try { console.info(JSON.stringify({ expiredCheckouts: await expireReservations(db) })); } finally { await db.$disconnect(); }
