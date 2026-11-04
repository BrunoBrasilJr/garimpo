import { randomUUID } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { Client } from 'pg';
import { expect, test } from 'vitest';

test('actual migration preserves legacy purchases and backfills only dates supported by stored facts', async () => {
  const value = process.env.TEST_DATABASE_URL;
  if (!value) throw new Error('A separate test database is required.');
  const url = new URL(value);
  if (url.pathname !== '/garimpo_test' || !['localhost', '127.0.0.1'].includes(url.hostname) || !/^task021_[a-f0-9]{32}$/.test(url.searchParams.get('schema') ?? '')) throw new Error('Only an isolated TASK-021 test database is accepted.');
  const schema = 'task021_legacy_' + randomUUID().replaceAll('-', ''), client = new Client({ connectionString: value });
  const migrations = new URL('../../apps/api/prisma/migrations/', import.meta.url), current = '202611030001_original_logistics';
  await client.connect();
  try {
    await client.query(`CREATE SCHEMA "${schema}"`);
    await client.query(`SET search_path TO "${schema}"`);
    for (const entry of (await readdir(migrations, { withFileTypes: true })).filter(e => e.isDirectory() && e.name < current).sort((a, b) => a.name.localeCompare(b.name))) await client.query(await readFile(new URL(entry.name + '/migration.sql', migrations), 'utf8'));
    const user = randomUUID(), cart = randomUUID(), created = new Date('2026-10-29T12:00:00.123Z'), paid = new Date('2026-10-29T12:05:00.123Z'), expired = new Date('2026-10-29T12:30:00.123Z');
    await client.query('INSERT INTO "User"(id,name,"emailNormalized","passwordHash",context,role,"updatedAt") VALUES($1,$2,$3,$4,\'CUSTOMER\',\'USER\',$5)', [user, 'Legacy synthetic buyer', randomUUID() + '@example.invalid', 'synthetic non-login fixture', created]);
    await client.query('INSERT INTO "Cart"(id,"userId","updatedAt") VALUES($1,$2,$3)', [cart, user, created]);
    const ids: string[] = [];
    // Minimal legacy SQL rows exercise migration facts, not the purchase-creation service.
    for (const [status, version, paidAt] of [['PENDING', 1, null], ['PAID', 2, paid], ['CANCELLED', 2, null]] as const) {
      const checkout = randomUUID(), order = randomUUID(); ids.push(order);
      await client.query('INSERT INTO "Checkout"(id,"userId","cartId","cartVersion",status,"requestKey","requestHash","pricingRevision","quoteSnapshot","createdAt","expiresAt","closedAt") VALUES($1,$2,$3,1,\'CONVERTED\',$4,$5,$5,$6,$7,$8,$7)', [checkout, user, cart, randomUUID(), 'a'.repeat(64), { legacy: true }, created, new Date(created.getTime() + 900000)]);
      await client.query('INSERT INTO "Order"(id,"userId","checkoutId",status,method,version,snapshot,"addressSnapshot","freightSnapshot","subtotalCents","discountCents","shippingCents","totalCents","createdAt","expiresAt","paidAt") VALUES($1,$2,$3,$4,\'PIX\',$5,$6,$6,$6,10000,500,1500,11000,$7,$8,$9)', [order, user, checkout, status, version, { legacy: true }, created, expired, paidAt]);
      if (status === 'CANCELLED') await client.query('INSERT INTO "AuditLog"(id,action,"targetType","targetId",result,reason,"redactedChanges","correlationId","createdAt") VALUES($1,\'ORDER.EXPIRED\',\'ORDER\',$2,\'SUCCESS\',\'PAYMENT_DEADLINE\',\'{}\',$3,$4)', [randomUUID(), order, randomUUID(), expired]);
    }
    const before = (await client.query('SELECT * FROM "Order" ORDER BY id')).rows;
    await client.query(await readFile(new URL(current + '/migration.sql', migrations), 'utf8'));
    expect((await client.query('SELECT * FROM "Order" ORDER BY id')).rows).toEqual(before);
    const events = (await client.query('SELECT * FROM "OrderStatusEvent" ORDER BY "orderId",version')).rows;
    expect(events).toHaveLength(5);
    for (const id of ids) expect(events.find(e => e.orderId === id && e.version === 1)).toMatchObject({ toStatus: 'PENDING', occurredAt: created, actorId: null, actorRole: null });
    expect(events.find(e => e.orderId === ids[1] && e.version === 2)).toMatchObject({ fromStatus: 'PENDING', toStatus: 'PAID', occurredAt: paid });
    expect(events.find(e => e.orderId === ids[2] && e.version === 2)).toMatchObject({ fromStatus: 'PENDING', toStatus: 'CANCELLED', occurredAt: expired });
    expect((await client.query('SELECT count(*)::int AS count FROM "Shipment"')).rows[0].count).toBe(0);
    console.info('Retained legacy migration evidence schema: ' + schema);
  } finally { await client.end(); }
});
