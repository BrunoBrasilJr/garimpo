import { expect, test } from 'vitest';
import { catalogParams, filterPrice } from '../../../apps/web/src/features/catalog/api';

test('localized search prices preserve exact cents and reject ambiguous or overflowing amounts', () => {
  expect(filterPrice('129,90')).toBe('12990'); expect(filterPrice('0,01')).toBe('1'); expect(filterPrice('80.5')).toBe('8050');
  for (const value of ['1.299,90', '-1', 'NaN', 'Infinity', '1,999', '21474836,48']) expect(() => filterPrice(value)).toThrow();
});
test('public search URLs cannot forward private fragment tokens or arbitrary request parameters', () => {
  const params = catalogParams('q=VG%2B&token=synthetic-private-token&from=secret&role=ADMIN&maxPrice=7500&page=2');
  expect(params.get('q')).toBe('VG+'); expect(params.get('maxPrice')).toBe('7500'); expect(params.get('page')).toBe('2');
  expect([...params.keys()].sort()).toEqual(['maxPrice', 'page', 'q']);
});
