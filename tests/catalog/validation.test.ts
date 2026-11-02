import { randomUUID } from 'node:crypto';
import { expect, test } from 'vitest';
import { GOLDMINE_GRADES } from '@garimpo/contracts';
import { parse, catalogQuery, editionCreate, editionPatch, offerCreate, offerPatch, trackInput } from '../../apps/api/src/modules/catalog/validation.ts';

const genre = randomUUID();
const edition = () => ({ title: 'Disco de teste', artistIds: [randomUUID()], genreIds: [genre], primaryGenreId: genre, format: 'LP' });
test('preserves unknown years and independent complete Goldmine grades', () => {
  const value = parse(editionCreate, { ...edition(), originalYear: 1959, editionYear: null });
  expect(value.originalYear).toBe(1959); expect(value.editionYear).toBeNull();
  expect(GOLDMINE_GRADES).toEqual(['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P']);
  for (const grade of GOLDMINE_GRADES) expect(parse(offerCreate, { kind: 'USED', priceCents: 100, discGrade: grade, sleeveGrade: 'P' })).toMatchObject({ discGrade: grade, sleeveGrade: 'P' });
});
test('enforces primary genre membership, unique artists/tracks and field ownership', () => {
  expect(() => parse(editionCreate, { ...edition(), primaryGenreId: randomUUID() })).toThrow();
  const artist = randomUUID();
  expect(() => parse(editionCreate, { ...edition(), artistIds: [artist, artist] })).toThrow();
  expect(() => parse(editionCreate, { ...edition(), tracks: [{ position: 1, title: 'A' }, { position: 1, title: 'B' }] })).toThrow();
  expect(() => parse(editionPatch, { role: 'ADMIN' })).toThrow();
  expect(() => parse(editionPatch, {})).toThrow();
});
test('uses integer cents, protects individual used stock and excludes metadata stock patches', () => {
  for (const priceCents of [0, -1, 1.5]) expect(() => parse(offerCreate, { kind: 'NEW', priceCents })).toThrow();
  expect(() => parse(offerCreate, { kind: 'USED', priceCents: 100, stockOnHand: 2 })).toThrow();
  expect(() => parse(offerCreate, { kind: 'NEW', priceCents: 100, discGrade: 'M' })).toThrow();
  expect(() => parse(offerPatch, { version: 1, stockOnHand: 30 })).toThrow();
  expect(() => parse(offerPatch, { priceCents: 100 })).toThrow();
});
test('parses false literally and rejects invalid ranges or ambiguous filter arrays', () => {
  expect(parse(catalogQuery, { available: 'false', decade: '1990', minPrice: '100' })).toMatchObject({ available: false, decade: 1990, minPrice: 100, page: 1, pageSize: 20 });
  for (const query of [{ decade: '1991' }, { minPrice: '300', maxPrice: '200' }, { available: '0' }, { q: ['a', 'b'] }, { pageSize: '101' }]) expect(() => parse(catalogQuery, query)).toThrow();
});
test('audio remains optional and only accepts HTTPS URLs without embedded credentials', () => {
  expect(parse(trackInput, { position: 1, title: 'Faixa' })).not.toHaveProperty('audioUrl');
  expect(parse(trackInput, { position: 1, title: 'Faixa', audioUrl: 'https://example.invalid/preview' }).audioUrl).toBe('https://example.invalid/preview');
  for (const audioUrl of ['javascript:alert(1)', 'http://example.invalid/a', 'https://user:password@example.invalid/a']) expect(() => parse(trackInput, { position: 1, title: 'Faixa', audioUrl })).toThrow();
});
