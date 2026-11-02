import { expect, test } from 'vitest';
import { adjustedStock, lowStock } from '../../apps/api/src/modules/inventory/rules.ts';
import { requireKnown, unavailableCommercialBindings } from '../../apps/api/src/modules/catalog/lifecycle.ts';
test('new balances enforce integer, nonnegative and PostgreSQL bounds', () => {
  expect(adjustedStock('NEW', 3, -3)).toBe(0);
  for (const delta of [0, 0.5, NaN, Infinity, 2147483648, -2147483648]) expect(() => adjustedStock('NEW', 2, delta)).toThrow();
  expect(() => adjustedStock('NEW', 2, -3)).toThrow(); expect(() => adjustedStock('NEW', 2147483647, 1)).toThrow();
});
test('used copies remain individual through every adjustment', () => {
  expect(adjustedStock('USED', 0, 1)).toBe(1); expect(adjustedStock('USED', 1, -1)).toBe(0);
  expect(() => adjustedStock('USED', 1, 1)).toThrow(); expect(() => adjustedStock('USED', 0, -1)).toThrow();
});
test('unknown availability is not silently converted to zero or a false all-clear', () => {
  expect(lowStock(null, 5, 2)).toBeNull(); expect(lowStock(null, 2, 2)).toBe(true);
  expect(lowStock(3, 5, 2)).toBe(false); expect(lowStock(2, 5, 2)).toBe(true);
});
test('unavailable, incomplete, inherited and contradictory snapshots fail closed', () => {
  expect(() => requireKnown({ status: 'UNAVAILABLE' }, [])).toThrow();
  for (const offers of [{}, { x: { reservedQuantity: 2, protectedQuantity: 1 } }, { x: { reservedQuantity: -1, protectedQuantity: 0 } }, Object.create({ x: { reservedQuantity: 0, protectedQuantity: 0 } })]) {
    expect(() => requireKnown({ status: 'KNOWN', hasHistory: false, offers }, ['x'])).toThrow();
  }
  expect(Object.isFrozen(unavailableCommercialBindings)).toBe(true);
});
