import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { GuestCartStore, GuestDataError, decodeGuest } from '../../../packages/contracts/src/cart/guest';
const offer = randomUUID(), edition = randomUUID(), cartA = randomUUID(), cartB = randomUUID();
function fixture() {
  let raw: string | null = null, fail = false;
  const storage = { get: async () => raw, set: async (value: string) => { if (fail) throw new Error('isolated storage failure'); raw = value; } };
  return { store: new GuestCartStore(storage), storage, raw: () => raw, fail: (value: boolean) => { fail = value; }, corrupt: (value: string) => { raw = value; } };
}
test('visitor format refuses corrupted, oversized and credential-bearing data without silently deleting it', async () => {
  const f = fixture();
  for (const value of ['broken-json', '{"schema":1,"token":"not-a-token"}', 'x'.repeat(256 * 1024 + 1)]) { f.corrupt(value); await expect(f.store.read()).rejects.toBeInstanceOf(GuestDataError); expect(f.raw()).toBe(value); }
  expect(decodeGuest(null).items).toEqual([]);
});
test('serialized visitor changes keep concurrent additions while bounds and unique used items remain explicit', async () => {
  const f = fixture(); await Promise.all(Array.from({ length: 40 }, () => f.store.add(offer, edition, 1)));
  expect((await f.store.read()).items[0]!.units).toHaveLength(40);
  const used = randomUUID(); await f.store.add(used, edition, 1, true); await f.store.add(used, edition, 1, true); expect((await f.store.read()).items.find(line => line.offerId === used)!.units).toHaveLength(1);
  await expect(f.store.add(randomUUID(), edition, 1000)).rejects.toBeInstanceOf(GuestDataError); expect((await f.store.read()).items[0]!.units).toHaveLength(40);
});
test('persisted merge intent survives restart with its original body, version and key even after account cart revision changes', async () => {
  const f = fixture(); await f.store.add(offer, edition, 2); const intent = await f.store.beginMerge(cartA, 7), restarted = new GuestCartStore(f.storage);
  expect(await restarted.beginMerge(cartA, 99)).toEqual(intent); expect(intent.version).toBe(7); expect(intent.lines[0]!.units).toHaveLength(2);
  await restarted.acknowledge(intent.key); expect((await f.store.read()).items).toEqual([]); expect((await f.store.read()).pending).toEqual([]);
});
test('late acknowledgement consumes only sent units and preserves later additions instead of clearing the whole visitor cart', async () => {
  const f = fixture(); await f.store.add(offer, edition, 2); const intent = await f.store.beginMerge(cartA, 1);
  await f.store.add(offer, edition, 3); await f.store.add(randomUUID(), edition, 1); await f.store.acknowledge(intent.key);
  const state = await f.store.read(); expect(state.items.find(line => line.offerId === offer)!.units).toEqual([2, 3, 4]); expect(state.items).toHaveLength(2);
  const raw = f.raw(); await f.store.acknowledge(intent.key); expect(f.raw()).toBe(raw);
});
test('pending outcome from another account cannot be automatically transferred, while genuinely new units stay eligible', async () => {
  const f = fixture(); await f.store.add(offer, edition, 1); const first = await f.store.beginMerge(cartA, 1);
  await expect(f.store.beginMerge(cartB, 1)).rejects.toBeInstanceOf(GuestDataError);
  await f.store.add(offer, edition, 2); const second = await f.store.beginMerge(cartB, 1); expect(second.lines[0]!.units).toEqual([1, 2]);
  await f.store.add(offer, edition, 3); await f.store.acknowledge(second.key); await f.store.acknowledge(first.key); expect((await f.store.read()).items[0]!.units).toEqual([3, 4, 5]);
});
test('removing and re-adding local quantity never reuses unit tags that an old response could consume', async () => {
  const f = fixture(); await f.store.add(offer, edition, 2); const original = await f.store.read(), intent = await f.store.beginMerge(cartA, 1);
  await f.store.quantity(original.items[0]!.entryId, 1); await f.store.add(offer, edition, 2); await f.store.acknowledge(intent.key);
  expect((await f.store.read()).items[0]!.units).toEqual([2, 3]);
});
test('failed local persistence prevents a new unrepeatable intent and failed acknowledgement retains the successful request for safe replay', async () => {
  const f = fixture(); await f.store.add(offer, edition, 1); f.fail(true); await expect(f.store.beginMerge(cartA, 1)).rejects.toBeInstanceOf(GuestDataError);
  expect((await f.store.read()).pending).toEqual([]); f.fail(false); const intent = await f.store.beginMerge(cartA, 1); f.fail(true); await expect(f.store.acknowledge(intent.key)).rejects.toBeInstanceOf(GuestDataError);
  f.fail(false); expect(await new GuestCartStore(f.storage).beginMerge(cartA, 2)).toEqual(intent); await f.store.acknowledge(intent.key); expect((await f.store.read()).items).toEqual([]);
});
test('corrupt unit lists and duplicated intents are rejected, and explicit reset recovers without inventing server state', async () => {
  const f = fixture(); await f.store.add(offer, edition, 1); const state = await f.store.read(); state.items[0]!.units = [0, 0]; f.corrupt(JSON.stringify(state)); await expect(f.store.read()).rejects.toBeInstanceOf(GuestDataError);
  await f.store.reset(); await f.store.add(offer, edition, 1); const intent = await f.store.beginMerge(cartA, 1), duplicated = await f.store.read(); duplicated.pending.push(intent); f.corrupt(JSON.stringify(duplicated)); await expect(f.store.read()).rejects.toBeInstanceOf(GuestDataError);
  await f.store.reset(); const empty = await f.store.read(); expect(empty.items).toEqual([]); expect(empty.pending).toEqual([]); expect(empty.schema).toBe(1);
});
