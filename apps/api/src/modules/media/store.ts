import { createHash, randomUUID } from 'node:crypto';
import { mkdir, open, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { CatalogError } from '../catalog/errors.ts';

export const MAX_IMAGE_BYTES = 5_000_000;
export const MAX_IMAGE_PIXELS = 40_000_000;
const mimeTypes = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as const;
export interface StoredImage {
  storageKey: string; contentHash: string; mimeType: string; byteSize: number; width: number; height: number;
}
export class PublicImageStore {
  readonly root: string;
  constructor(root = resolve(homedir(), '.local/share/garimpo/media/public-products')) { this.root = resolve(root); }

  static key(value: string): boolean { return /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}\.(jpg|png|webp)$/.test(value); }

  async put(input: Buffer, suppliedMime: string): Promise<StoredImage> {
    if (!input.length) throw new CatalogError(422, 'INVALID_IMAGE', 'Envie uma imagem válida.');
    if (input.length > MAX_IMAGE_BYTES) throw new CatalogError(413, 'IMAGE_TOO_LARGE', 'A imagem deve ter no máximo 5 MB.');
    if (!Object.values(mimeTypes).includes(suppliedMime as typeof mimeTypes[keyof typeof mimeTypes])) {
      throw new CatalogError(415, 'INVALID_IMAGE_TYPE', 'Use uma imagem JPEG, PNG ou WebP.');
    }
    const detected = input.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) ? 'image/jpeg'
      : input.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? 'image/png'
        : input.toString('ascii', 0, 4) === 'RIFF' && input.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : null;
    if (!detected) throw new CatalogError(415, 'INVALID_IMAGE_TYPE', 'O arquivo não contém uma imagem JPEG, PNG ou WebP.');
    if (detected !== suppliedMime) throw new CatalogError(415, 'IMAGE_TYPE_MISMATCH', 'O conteúdo da imagem não corresponde ao tipo informado.');
    try {
      const options = { limitInputPixels: MAX_IMAGE_PIXELS, failOn: 'error' as const, sequentialRead: true };
      const image = sharp(input, options), meta = await image.metadata();
      if (!meta.format || !(meta.format in mimeTypes)) throw new CatalogError(415, 'INVALID_IMAGE_TYPE', 'Use uma imagem JPEG, PNG ou WebP.');
      const format = meta.format as keyof typeof mimeTypes;
      if (mimeTypes[format] !== suppliedMime) throw new CatalogError(415, 'IMAGE_TYPE_MISMATCH', 'O conteúdo da imagem não corresponde ao tipo informado.');
      if (!meta.width || !meta.height || meta.width > 10000 || meta.height > 10000 || meta.width * meta.height > MAX_IMAGE_PIXELS) {
        throw new CatalogError(422, 'IMAGE_DIMENSIONS', 'Reduza as dimensões da imagem e tente novamente.');
      }
      // Fully decode and re-encode; never publish input bytes, metadata or a client filename.
      const { data, info } = await image.rotate().toFormat(format).toBuffer({ resolveWithObject: true });
      if (data.length > MAX_IMAGE_BYTES) throw new CatalogError(413, 'IMAGE_TOO_LARGE', 'A imagem processada deve ter no máximo 5 MB.');
      const storageKey = `${randomUUID()}.${format === 'jpeg' ? 'jpg' : format}`;
      await mkdir(this.root, { recursive: true, mode: 0o700 });
      await writeFile(resolve(this.root, storageKey), data, { flag: 'wx', mode: 0o600, flush: true });
      const directory = await open(this.root, 'r');
      try { await directory.sync(); } finally { await directory.close(); }
      return { storageKey, contentHash: createHash('sha256').update(data).digest('hex'), mimeType: mimeTypes[format],
        byteSize: data.length, width: info.width, height: info.height };
    } catch (error) {
      if (error instanceof CatalogError) throw error;
      // Filesystem failures must not be reported as a successful/invalid upload.
      if (error && typeof error === 'object' && 'code' in error) throw error;
      throw new CatalogError(422, 'INVALID_IMAGE', 'Não foi possível ler esta imagem. Use um arquivo íntegro.');
    }
  }
}
