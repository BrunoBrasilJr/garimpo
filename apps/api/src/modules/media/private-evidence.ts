import sharp from 'sharp';
import { CartError } from '../cart/errors.ts';
import { MAX_IMAGE_BYTES, MAX_IMAGE_PIXELS } from './store.ts';

const formats = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' } as const;
export async function prepareEvidence(content: unknown, mediaType: string) {
  if (!Object.values(formats).some(value => value === mediaType)) throw new CartError(415, 'INVALID_EVIDENCE_TYPE', 'Use JPEG, PNG ou WebP.');
  if (!Buffer.isBuffer(content) || !content.length) throw new CartError(422, 'INVALID_EVIDENCE', 'Envie uma imagem válida.');
  if (content.length > MAX_IMAGE_BYTES) throw new CartError(413, 'EVIDENCE_TOO_LARGE', 'A imagem deve ter no máximo 5 MB.');
  try {
    const image = sharp(content, { limitInputPixels: MAX_IMAGE_PIXELS, failOn: 'error' });
    const { format } = await image.metadata();
    if (!format || formats[format as keyof typeof formats] !== mediaType) throw new CartError(415, 'INVALID_EVIDENCE_TYPE', 'O arquivo não corresponde ao tipo indicado.');
    const clean = await image.rotate().toFormat(format).toBuffer();
    if (clean.length > MAX_IMAGE_BYTES) throw new CartError(413, 'EVIDENCE_TOO_LARGE', 'A imagem processada deve ter no máximo 5 MB.');
    return Uint8Array.from(clean);
  } catch (error) {
    if (error instanceof CartError) throw error;
    throw new CartError(422, 'INVALID_EVIDENCE', 'Não foi possível ler a imagem.');
  }
}
