import { expect, test, vi } from 'vitest';
import { MobileCatalogClient, cents } from '../../../apps/mobile/src/features/catalog/client';

test('mobile public catalog accepts only exact HTTPS origins without embedded credentials or paths', () => {
  for (const origin of ['http://localhost', 'https://user:secret@localhost', 'https://localhost/path', 'https://localhost?token=secret', 'https://localhost:99999', 'https://localhost/']) expect(() => new MobileCatalogClient(origin)).toThrow();
  expect(new MobileCatalogClient('https://localhost:8443').origin).toBe('https://localhost:8443');
});
test('public mobile reads never carry session credentials and discard unrelated query fields', async () => {
  const requests: { path: string; options: RequestInit | undefined }[] = [];
  const client = new MobileCatalogClient('https://localhost:8443', async (input, options) => { requests.push({ path: String(input), options }); return Response.json({ items: [] }); });
  const signal = new AbortController().signal;
  await client.list(new URLSearchParams('q=vinil&token=private&role=ADMIN&page=2'), signal); await client.filters(signal); await client.detail('synthetic-id', signal);
  expect(requests[0]!.path).toBe('https://localhost:8443/api/v1/editions?q=vinil&page=2');
  for (const request of requests) { expect(request.options?.credentials).toBe('omit'); expect(request.options?.headers).toEqual({ Accept: 'application/json', 'X-Garimpo-Client': 'mobile' }); }
});
test('public images cannot resolve private, external or local-file paths; missing detail never aliases the list', async () => {
  const client = new MobileCatalogClient('https://localhost:8443', async () => { throw new Error('No request should occur.'); });
  for (const path of ['/demo/messages/secret', 'file:///private', 'https://evil.invalid/a.png', '/api/v1/media/products/../private.png']) expect(client.image(path)).toBeUndefined();
  expect(client.image('/api/v1/media/products/12345678-1234-1234-1234-123456789abc.png')).toBe('https://localhost:8443/api/v1/media/products/12345678-1234-1234-1234-123456789abc.png');
  await expect(client.detail('', new AbortController().signal)).rejects.toMatchObject({ status: 404 });
});
test('localized price filtering preserves cents and rejects fraction/overflow ambiguity', () => {
  expect(cents('129,90')).toBe('12990'); expect(cents('0.01')).toBe('1');
  for (const value of ['1.299,90', '-1', '1,999', '21474836,48', 'NaN']) expect(() => cents(value)).toThrow();
});
test('default browser transport preserves the fetch global receiver', async () => {
  vi.stubGlobal('fetch', async function(this: unknown) { expect(this).toBe(globalThis); return Response.json({ items: [] }); });
  try { await new MobileCatalogClient('https://localhost:8443').filters(new AbortController().signal); }
  finally { vi.unstubAllGlobals(); }
});
