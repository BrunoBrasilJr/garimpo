import { mkdtemp, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { expect, test } from 'vitest';
import { PublicImageStore, MAX_IMAGE_BYTES } from '../../apps/api/src/modules/media/store.ts';

const image = () => sharp({ create: { width: 7, height: 9, channels: 3, background: '#debb82' } });
async function store() { return new PublicImageStore(await mkdtemp(join(tmpdir(), 'garimpo-media-'))); }

test.each(['jpeg', 'png', 'webp'] as const)('decodes and publishes normalized %s with immutable key and verified bytes', async format => {
  const target = await store(), bytes = await image().toFormat(format).toBuffer();
  const result = await target.put(bytes, `image/${format}`), saved = await readFile(join(target.root, result.storageKey));
  expect(PublicImageStore.key(result.storageKey)).toBe(true);
  expect(result).toMatchObject({ width: 7, height: 9, byteSize: saved.length, contentHash: createHash('sha256').update(saved).digest('hex') });
  expect((await sharp(saved).metadata()).format).toBe(format);
  const another = await target.put(bytes, `image/${format}`);
  expect(another.storageKey).not.toBe(result.storageKey);
  expect(another.contentHash).toBe(result.contentHash);
});
test('strips private EXIF metadata while preserving a readable image', async () => {
  const target = await store();
  const bytes = await image().jpeg().withExif({ IFD0: { Artist: 'synthetic-private-metadata' } }).toBuffer();
  expect((await sharp(bytes).metadata()).exif).toBeDefined();
  const result = await target.put(bytes, 'image/jpeg');
  const normalized = await readFile(join(target.root, result.storageKey));
  expect((await sharp(normalized).metadata()).exif).toBeUndefined();
  expect(normalized.includes(Buffer.from('synthetic-private-metadata'))).toBe(false);
});
test('rejects unsupported bytes, MIME spoofing, truncated images and oversize before publishing files', async () => {
  const target = await store(), png = await image().png().toBuffer();
  await expect(target.put(Buffer.from('<svg><script>alert(1)</script></svg>'), 'image/png')).rejects.toMatchObject({ status: 415 });
  await expect(target.put(png, 'image/jpeg')).rejects.toMatchObject({ status: 415, code: 'IMAGE_TYPE_MISMATCH' });
  await expect(target.put(png, 'image/svg+xml')).rejects.toMatchObject({ status: 415 });
  await expect(target.put(png.subarray(0, 20), 'image/png')).rejects.toMatchObject({ status: 422 });
  await expect(target.put(Buffer.alloc(MAX_IMAGE_BYTES + 1), 'image/png')).rejects.toMatchObject({ status: 413 });
  expect(await readdir(target.root)).toEqual([]);
});
test('accepts the exact five-million-byte boundary and removes oversized JPEG comments', async () => {
  const target = await store(), jpeg = await image().jpeg().toBuffer();
  const comments: Buffer[] = [];
  let remaining = MAX_IMAGE_BYTES - jpeg.length;
  while (remaining) {
    let length = Math.min(65537, remaining);
    if (remaining - length > 0 && remaining - length < 4) length -= 4;
    const comment = Buffer.alloc(length, 65); comment[0] = 255; comment[1] = 254; comment.writeUInt16BE(length - 2, 2);
    comments.push(comment); remaining -= length;
  }
  const padded = Buffer.concat([jpeg.subarray(0, 2), ...comments, jpeg.subarray(2)]);
  expect(padded.length).toBe(MAX_IMAGE_BYTES);
  const result = await target.put(padded, 'image/jpeg');
  expect(result.byteSize).toBeLessThan(10000);
});
test('bounds dimensions and decoded pixels using valid compressed images', async () => {
  const target = await store();
  const wide = await sharp({ create: { width: 10001, height: 1, channels: 3, background: 'white' } }).png().toBuffer();
  await expect(target.put(wide, 'image/png')).rejects.toMatchObject({ status: 422 });
  const large = await sharp({ create: { width: 8001, height: 5000, channels: 3, background: 'white' } }).png().toBuffer();
  expect(large.length).toBeLessThan(MAX_IMAGE_BYTES);
  expect((await sharp(large).metadata()).width).toBe(8001);
  await expect(target.put(large, 'image/png')).rejects.toMatchObject({ status: 422 });
  expect(await readdir(target.root)).toEqual([]);
});
test.each(['../server.key', 'not-a-key.png', '/etc/passwd', '12345678-0000-0000-0000-123456789012.svg', '12345678-0000-0000-0000-123456789012.jpg/../private'])('rejects unsafe storage key %s', key => {
  expect(PublicImageStore.key(key)).toBe(false);
});
