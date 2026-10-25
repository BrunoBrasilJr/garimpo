import { createDatabase } from '../../apps/api/src/persistence/client.ts';
import { processNext } from '../../apps/api/src/core/outbox.ts';

const db = createDatabase(process.env.TEST_DATABASE_URL);
await processNext(db, async (tx, event) => {
  await tx.demoMessage.create({ data: {
    eventId: event.id, type: 'TEST', restrictedBody: 'TEST_ONLY', dedupKey: event.id, status: 'DELIVERED'
  } });
  process.send?.({ eventId: event.id });
  // Test-only barrier: parent kills this process before the transaction commits.
  await new Promise(() => {});
});
await db.$disconnect();
