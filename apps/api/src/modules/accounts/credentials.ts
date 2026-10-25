import { randomBytes, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import { AccountError } from './errors.ts';

export const passwordParameters = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 } as const;
let active = 0;
const waiting: (() => void)[] = [];
async function derive(password: string, salt: Buffer): Promise<Buffer> {
  if (active >= 2) {
    if (waiting.length >= 16) throw new AccountError(429, 'AUTH_CAPACITY');
    await new Promise<void>(resolve => { waiting.push(resolve); });
  } else active++;
  try {
    return await new Promise<Buffer>((resolve, reject) => {
      scrypt(password, salt, 64, passwordParameters, (error, key) => error ? reject(error) : resolve(key));
    });
  } finally {
    const next = waiting.shift();
    if (next) next(); else active--;
  }
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$1$131072$8$1$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, encoded?: string): Promise<boolean> {
  const match = /^scrypt\$1\$131072\$8\$1\$([0-9a-f]{32})\$([0-9a-f]{128})$/.exec(encoded ?? '');
  // Unknown accounts and malformed hashes still perform the same approved KDF.
  const actual = await derive(password, match ? Buffer.from(match[1]!, 'hex') : Buffer.alloc(16));
  const equal = timingSafeEqual(actual, match ? Buffer.from(match[2]!, 'hex') : Buffer.alloc(64));
  return Boolean(match) && equal;
}

export const secret = () => randomBytes(32).toString('base64url');
export const tokenHash = (purpose: string, value: string) => createHash('sha256').update(purpose + '\0' + value).digest('hex');
export function sameHash(left: string, right: string): boolean {
  return /^[0-9a-f]{64}$/.test(left) && /^[0-9a-f]{64}$/.test(right) && timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}
