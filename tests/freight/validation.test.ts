import { expect, test } from 'vitest';
import * as input from '../../apps/api/src/modules/freight/validation.ts';
const base = { region: 'Área sintética de teste', served: true, amountCents: 1500, deliveryDays: 5, ranges: [{ startZip: '01000-000', endZip: '01999999' }] };
test('freight normalizes bounded inclusive ZIP ranges and refuses malformed or reversed data', () => {
  expect(input.parse(input.create, base).ranges[0]!.startZip).toBe('01000000');
  for (const value of ['123', '123456789', 'abcdefgh']) expect(() => input.parse(input.zip, value)).toThrow();
  expect(() => input.parse(input.create, { ...base, ranges: [{ startZip: '02000000', endZip: '01000000' }] })).toThrow();
});
test('served rates need positive integer cents and explicit days; non-served rates have neither fictitious price nor deadline', () => {
  for (const amountCents of [0, -1, 1.5, 2147483648, null]) expect(() => input.parse(input.create, { ...base, amountCents })).toThrow();
  for (const deliveryDays of [-1, 1.5, 3651, null]) expect(() => input.parse(input.create, { ...base, deliveryDays })).toThrow();
  expect(() => input.parse(input.create, { ...base, served: false })).toThrow();
  expect(input.parse(input.create, { ...base, served: false, amountCents: null, deliveryDays: null }).served).toBe(false);
});
test('overlap includes touching endpoints, while contiguous non-overlapping ranges are permitted', () => {
  expect(() => input.parse(input.create, { ...base, ranges: [...base.ranges, { startZip: '01999999', endZip: '02999999' }] })).toThrow();
  expect(input.parse(input.create, { ...base, ranges: [...base.ranges, { startZip: '02000000', endZip: '02999999' }] }).ranges).toHaveLength(2);
  expect(() => input.parse(input.create, { ...base, token: 'unexpected' })).toThrow();
  expect(() => input.parse(input.update, { version: 1 })).toThrow(); expect(() => input.parse(input.update, { version: 0, region: 'Teste' })).toThrow();
});
