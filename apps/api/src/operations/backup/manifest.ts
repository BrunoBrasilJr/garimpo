import { createHash } from 'node:crypto';
import type { Client } from 'pg';
import { identifier } from './config.ts';

export interface BackupManifest {
  version: 1;
  id: string;
  database: string;
  schema: string;
  createdAt: string;
  dump: { sha256: string; byteSize: number };
  files: { key: string; sha256: string; byteSize: number }[];
  images: { id: string; key: string; sha256: string; byteSize: number }[];
  evidence: { id: string; sha256: string; byteSize: number }[];
  tables: { name: string; rows: number; sha256: string }[];
}
/** Cursor and digest use the same repeatable-read snapshot as pg_dump. No row contents enter logs. */
export async function tableDigests(client: Client, schema: string) {
  const result = await client.query<{ tablename: string }>('SELECT tablename FROM pg_tables WHERE schemaname=$1 ORDER BY tablename', [schema]);
  const tables: BackupManifest['tables'] = [];
  for (const { tablename } of result.rows) {
    const hash = createHash('sha256');
    let count = 0;
    await client.query('DECLARE backup_rows NO SCROLL CURSOR FOR SELECT row_to_json(t)::text AS data FROM '
      + identifier(schema) + '.' + identifier(tablename) + ' t ORDER BY row_to_json(t)::text');
    try {
      for (;;) {
        const batch = await client.query<{ data: string }>('FETCH FORWARD 50 FROM backup_rows');
        for (const row of batch.rows) { hash.update(row.data); hash.update('\n'); count++; }
        if (batch.rows.length < 50) break;
      }
    } finally { await client.query('CLOSE backup_rows'); }
    tables.push({ name: tablename, rows: count, sha256: hash.digest('hex') });
  }
  return tables;
}
