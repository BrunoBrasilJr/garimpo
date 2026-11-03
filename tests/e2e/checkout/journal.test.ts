import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { PurchaseJournal, decodePurchaseJournal, PurchaseJournalError } from '../../../packages/contracts/src/checkout/journal.ts';
import type { PurchaseIntent } from '../../../packages/contracts/src/checkout/journal.ts';
const owner = randomUUID(), other = randomUUID(), checkoutId = randomUUID();
const intent: PurchaseIntent = { kind: 'CARD', key: 'original-key', targetId: checkoutId, body: { version: 2, addressId: randomUUID(), freightRevision: 'a'.repeat(64), scenario: 'PENDING' } };
function storage() { const values = new Map<string, string>(); return { values, get: async (key: string) => values.get(key) ?? null, set: async (key: string, value: string) => { values.set(key, value); } }; }
test('journal survives a new instance with exactly the same immutable command and separates account owners', async () => {
  const memory = storage(), a = new PurchaseJournal(memory, owner); await a.update(v => ({ ...v, pending: intent }));
  expect((await new PurchaseJournal(memory, owner).read()).pending).toEqual(intent); expect((await new PurchaseJournal(memory, other).read()).pending).toBeNull();
  expect(await a.read()).toEqual({ version: 1, owner, pending: intent, orders: [] });
});
test('foreign, oversized or malformed journals and commands containing credentials or amounts are refused', () => {
  const valid = { version: 1, owner, pending: intent, orders: [] };
  for (const raw of ['{broken', 'x'.repeat(20001), JSON.stringify({ ...valid, owner: other }), JSON.stringify({ ...valid, pending: { ...intent, body: { ...intent.body, accessToken: 'do-not-keep' } } }), JSON.stringify({ ...valid, pending: { ...intent, body: { ...intent.body, amountCents: 1 } } })]) expect(() => decodePurchaseJournal(raw, owner)).toThrow(PurchaseJournalError);
});
test('a failed durable write rejects preparation instead of allowing an untracked new payment', async () => {
  const journal = new PurchaseJournal({ get: async () => null, set: async () => { throw new Error('Storage unavailable.'); } }, owner);
  await expect(journal.update(v => ({ ...v, pending: intent }))).rejects.toBeInstanceOf(PurchaseJournalError);
});
test('overlapping mounted instances serialize preparation and cannot replace an unfinished original intent', async () => {
  const memory = storage(), first = new PurchaseJournal(memory, owner), second = new PurchaseJournal(memory, owner), newer = { ...intent, key: 'different-key' };
  const results = await Promise.allSettled([first.update(v => ({ ...v, pending: intent })), second.update(v => { if (v.pending) throw new PurchaseJournalError('Already pending.'); return { ...v, pending: newer }; })]);
  expect(results.map(v => v.status)).toEqual(['fulfilled', 'rejected']); expect((await first.read()).pending).toEqual(intent);
});
test('finishing an older request cannot erase the newer account-scoped intent', async () => {
  const memory = storage(), journal = new PurchaseJournal(memory, owner); await journal.update(v => ({ ...v, pending: { ...intent, key: 'newer-key' } }));
  await journal.update(v => ({ ...v, pending: v.pending?.key === intent.key ? null : v.pending })); expect((await journal.read()).pending?.key).toBe('newer-key');
});
