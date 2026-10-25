import { randomUUID } from 'node:crypto';
import { fork } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { createDatabase } from '../../apps/api/src/persistence/client';
import type { Database, Prisma } from '../../apps/api/src/persistence/client';
import { serializable } from '../../apps/api/src/persistence/transaction';
import { idempotent } from '../../apps/api/src/core/idempotency';
import { appendAudit } from '../../apps/api/src/core/audit';
import { enqueue, processNext } from '../../apps/api/src/core/outbox';

let db: Database;
let other: Database;
const clock = { now: () => new Date('2026-10-25T18:00:00Z') };
const run = randomUUID();
const scope = (name: string) => `test:${run}:${name}`;
const userData = (name: string) => ({
  name, emailNormalized: `${randomUUID()}@example.invalid`, passwordHash: 'TEST_ONLY_NOT_A_CREDENTIAL',
  context: 'CUSTOMER' as const, role: 'USER' as const
});

beforeAll(async () => {
  const url = process.env.TEST_DATABASE_URL;
  if (!url || new URL(url).pathname !== '/garimpo_test' || !['127.0.0.1', 'localhost'].includes(new URL(url).hostname)) {
    throw new Error('Tests require TEST_DATABASE_URL pointing to loopback/garimpo_test. No fallback to development.');
  }
  db = createDatabase(url);
  other = createDatabase(url);
  await Promise.all([db.$connect(), other.$connect()]);
});
afterAll(async () => { await Promise.all([db?.$disconnect(), other?.$disconnect()]); });

test('PostgreSQL 17 preserves the eight-table foundation migration as the schema evolves', async () => {
  const version = await db.$queryRaw<{ server_version: string }[]>`SHOW server_version`;
  expect(version[0]?.server_version).toMatch(/^17\./);
  const tables = await db.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables WHERE schemaname = current_schema() ORDER BY tablename`;
  expect(tables.map(row => row.tablename)).toEqual(expect.arrayContaining([
    'AuditLog', 'DemoMessage', 'DomainEvent', 'EmailToken', 'IdempotencyRecord', 'PasswordReset', 'Session', 'User', '_prisma_migrations'
  ]));
  const initial = readFileSync(new URL('../../apps/api/prisma/migrations/202610250001_foundation/migration.sql', import.meta.url), 'utf8');
  expect([...initial.matchAll(/CREATE TABLE "(\w+)"/g)].map(match => match[1]).sort()).toEqual([
    'AuditLog', 'DemoMessage', 'DomainEvent', 'EmailToken', 'IdempotencyRecord', 'PasswordReset', 'Session', 'User'
  ]);
});

test('rollback removes user, audit, event and idempotency together; retry succeeds', async () => {
  const command = { actorScope: scope('rollback'), operation: 'FOUNDATION', key: 'one', payload: { x: 1 } };
  const target = randomUUID();
  await expect(idempotent(db, command, async tx => {
    await tx.user.create({ data: { ...userData('rollback'), id: target } });
    await appendAudit(tx, { actorId: target, action: 'TEST.CREATE', targetType: 'USER', targetId: target, result: 'SUCCESS', reason: 'TEST', changes: {} }, clock);
    await enqueue(tx, { type: 'TEST', aggregateId: target, payload: {} }, clock);
    throw new Error('injected failure');
  }, clock)).rejects.toThrow('injected failure');
  expect(await db.user.count({ where: { id: target } })).toBe(0);
  expect(await db.auditLog.count({ where: { targetId: target } })).toBe(0);
  expect(await db.domainEvent.count({ where: { aggregateId: target } })).toBe(0);
  expect(await db.idempotencyRecord.count({ where: { actorScope: command.actorScope } })).toBe(0);
  const result = await idempotent(db, command, async tx => (await tx.user.create({ data: userData('retry') })).id, clock);
  expect(result.replayed).toBe(false);
});

test('concurrent independent clients with same key create one effect; canonical replay and divergent payload conflict', async () => {
  const command = { actorScope: scope('concurrent'), operation: 'FOUNDATION', key: 'one', payload: { b: 2, a: 1 } };
  let effects = 0;
  const effect = async (tx: Prisma.TransactionClient) => {
    effects++;
    return (await tx.user.create({ data: userData(scope('effect')) })).id;
  };
  const results = await Promise.all([idempotent(db, command, effect, clock), idempotent(other, command, effect, clock)]);
  expect(effects).toBe(1);
  expect(new Set(results.map(result => result.resultRef)).size).toBe(1);
  expect(results.filter(result => result.replayed)).toHaveLength(1);
  expect(await db.user.count({ where: { name: scope('effect') } })).toBe(1);
  const replay = await idempotent(db, { ...command, payload: { a: 1, b: 2 } }, effect, clock);
  expect(replay.replayed).toBe(true);
  await expect(idempotent(db, { ...command, payload: { a: 3, b: 2 } }, effect, clock)).rejects.toMatchObject({ code: 'IDEMPOTENCY_CONFLICT' });
  expect(effects).toBe(1);
  expect((await idempotent(db, { ...command, actorScope: scope('another-actor') }, effect, clock)).replayed).toBe(false);
});

test('real serialization conflict retries complete transactions without lost updates', async () => {
  const user = await db.user.create({ data: userData('0') });
  let arrived = 0;
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  const pids: number[] = [];
  const increment = (client: Database) => {
    let attempt = 0;
    return serializable(client, async tx => {
      attempt++;
      const pid = await tx.$queryRaw<{ pid: number }[]>`SELECT pg_backend_pid() AS pid`;
      if (attempt === 1) pids.push(pid[0]!.pid);
      const current = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
      if (attempt === 1) {
        arrived++;
        if (arrived === 2) release();
        await barrier;
      }
      await tx.user.update({ where: { id: user.id }, data: { name: String(Number(current.name) + 1) } });
      return attempt;
    });
  };
  const attempts = await Promise.all([increment(db), increment(other)]);
  expect(new Set(pids).size).toBe(2);
  expect(attempts.sort()).toEqual([1, 2]);
  expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).name).toBe('2');
});

test('database enforces context/role, foreign keys and token hashes', async () => {
  await expect(db.user.create({ data: { ...userData('invalid'), role: 'ADMIN' } })).rejects.toThrow();
  await expect(db.passwordReset.create({ data: { userId: randomUUID(), tokenHash: 'a'.repeat(64), expiresAt: clock.now() } })).rejects.toThrow();
  const user = await db.user.create({ data: userData('tokens') });
  await expect(db.passwordReset.create({ data: { userId: user.id, tokenHash: 'plaintext', expiresAt: clock.now() } })).rejects.toThrow();
  const tokenHash = randomUUID().replaceAll('-', '').repeat(2);
  await db.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt: clock.now() } });
  await expect(db.passwordReset.create({ data: { userId: user.id, tokenHash, expiresAt: clock.now() } })).rejects.toThrow();
});

test('audit persists sanitized data and rejects update, delete and truncate', async () => {
  const row = await db.$transaction(tx => appendAudit(tx, {
    action: 'TEST.UPDATE', targetType: 'USER', targetId: run, result: 'SUCCESS', reason: 'TEST',
    changes: { passwordHash: 'secret-marker', nested: { token: 'secret-marker', role: 'USER' } }
  }, clock));
  expect(row.createdAt).toEqual(clock.now());
  expect(JSON.stringify(row.redactedChanges)).not.toContain('secret-marker');
  await expect(db.auditLog.update({ where: { id: row.id }, data: { reason: 'EDITED' } })).rejects.toThrow();
  await expect(db.auditLog.delete({ where: { id: row.id } })).rejects.toThrow();
  await expect(db.$executeRawUnsafe('TRUNCATE "AuditLog"')).rejects.toThrow();
});

test('outbox failure preserves event and attempt but rolls back consumer effect; restart recovers once', async () => {
  const event = await db.$transaction(tx => enqueue(tx, { type: 'TEST', aggregateId: scope('outbox'), payload: {} }, clock));
  const delivery = async (tx: Prisma.TransactionClient, row: { id: string }) => {
    await tx.demoMessage.upsert({
      where: { dedupKey: row.id }, update: {},
      create: { eventId: row.id, type: 'TEST', restrictedBody: 'TEST_ONLY', dedupKey: row.id, status: 'DELIVERED', deliveredAt: clock.now(), attempts: 1 }
    });
  };
  expect(await processNext(db, async (tx, row) => { await delivery(tx, row); throw new Error('secret-marker'); }, clock)).toBe('FAILED');
  expect(await db.demoMessage.count({ where: { dedupKey: event.id } })).toBe(0);
  expect(await db.domainEvent.findUniqueOrThrow({ where: { id: event.id } })).toMatchObject({ attempts: 1, processedAt: null, lastErrorCode: 'PROCESSING_FAILED' });
  await db.$disconnect();
  db = createDatabase(process.env.TEST_DATABASE_URL!);
  expect(await processNext(db, delivery, clock)).toBe('PROCESSED');
  expect(await processNext(db, delivery, clock)).toBe('EMPTY');
  expect(await db.domainEvent.findUniqueOrThrow({ where: { id: event.id } })).toMatchObject({ attempts: 2, processedAt: clock.now(), lastErrorCode: null });
  expect(await db.demoMessage.count({ where: { dedupKey: event.id } })).toBe(1);
});

test('two outbox workers lock distinct events and never deliver an event twice', async () => {
  const events = await db.$transaction(async tx => Promise.all([1, 2].map(n => enqueue(tx, { type: 'TEST', aggregateId: scope(`workers-${n}`), payload: {} }, clock))));
  let arrived = 0;
  let release!: () => void;
  const barrier = new Promise<void>(resolve => { release = resolve; });
  const handle = async (tx: Prisma.TransactionClient, event: { id: string }) => {
    arrived++;
    if (arrived === 2) release();
    await barrier;
    await tx.demoMessage.create({ data: { eventId: event.id, type: 'TEST', restrictedBody: 'TEST_ONLY', dedupKey: event.id, status: 'DELIVERED', deliveredAt: clock.now() } });
  };
  expect(await Promise.all([processNext(db, handle, clock), processNext(other, handle, clock)])).toEqual(['PROCESSED', 'PROCESSED']);
  expect(await db.demoMessage.count({ where: { eventId: { in: events.map(event => event.id) } } })).toBe(2);
});

test('killing a separate consumer process rolls back its incomplete effect and allows recovery', async () => {
  const event = await db.$transaction(tx => enqueue(tx, { type: 'TEST', aggregateId: scope('crash'), payload: {} }, clock));
  const child = fork(new URL('./outbox-crash-worker.mjs', import.meta.url), [], {
    execArgv: ['--experimental-strip-types'], stdio: ['ignore', 'ignore', 'inherit', 'ipc']
  });
  try {
    const message = await new Promise<unknown>((resolve, reject) => {
      const deadline = setTimeout(() => reject(new Error('Consumer failed to reach the pre-commit barrier.')), 12000);
      child.once('message', value => { clearTimeout(deadline); resolve(value); });
      child.once('error', error => { clearTimeout(deadline); reject(error); });
      child.once('exit', () => { clearTimeout(deadline); reject(new Error('Consumer exited before pre-commit barrier.')); });
    });
    expect(message).toEqual({ eventId: event.id });
    const exited = new Promise<void>(resolve => { child.once('exit', () => resolve()); });
    child.kill('SIGKILL');
    await exited;
    // Querying through another connection observes the rollback after connection loss.
    expect(await other.demoMessage.count({ where: { dedupKey: event.id } })).toBe(0);
    expect(await processNext(other, async (tx, row) => {
      await tx.demoMessage.create({ data: { eventId: row.id, type: 'TEST', restrictedBody: 'TEST_ONLY', dedupKey: row.id, status: 'DELIVERED', deliveredAt: clock.now() } });
    }, clock)).toBe('PROCESSED');
    expect(await db.demoMessage.count({ where: { dedupKey: event.id } })).toBe(1);
    expect((await db.domainEvent.findUniqueOrThrow({ where: { id: event.id } })).processedAt).toEqual(clock.now());
  } finally {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  }
});
