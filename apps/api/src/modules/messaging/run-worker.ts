import { configuredMessages } from './config.ts';
import { consumeRegistration, deliverNext } from './worker.ts';

let messages: ReturnType<typeof configuredMessages>;
try {
  messages = configuredMessages();
  if (!messages) throw new Error('Configure local test mode, database and separate protected keys.');
  let prepared = 0, delivered = 0;
  for (let index = 0; index < 100; index++) {
    const result = await consumeRegistration(messages);
    if (result === 'EMPTY') break;
    if (result === 'FAILED') throw new Error('Access event preparation failed; retained for retry.');
    prepared++;
  }
  for (let index = 0; index < 100; index++) {
    const result = await deliverNext(messages);
    if (result === 'EMPTY') break;
    if (result === 'FAILED') throw new Error('Local delivery failed; retained for retry.');
    delivered++;
  }
  console.info(`Local mailbox worker: ${prepared} event(s) prepared, ${delivered} message(s) delivered. No external mail sent.`);
} catch {
  console.error('Local mailbox worker could not complete. Check protected configuration and retained retry state.'); process.exitCode = 1;
} finally { await messages?.accounts.db.$disconnect(); }
