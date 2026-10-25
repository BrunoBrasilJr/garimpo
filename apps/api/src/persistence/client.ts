import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client.ts';

export function createDatabase(connectionString: string) {
  if (!connectionString) throw new Error('DATABASE_URL is required.');
  const schema = new URL(connectionString).searchParams.get('schema') ?? 'public';
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema)) throw new Error('Invalid database schema.');
  return new PrismaClient({ adapter: new PrismaPg({
    connectionString, max: 8, options: `-c search_path=${schema}`
  }, { schema }) });
}

export type Database = ReturnType<typeof createDatabase>;
export type { Prisma } from './generated/client.ts';
