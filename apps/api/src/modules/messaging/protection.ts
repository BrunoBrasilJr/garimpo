import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { tokenHash, sameHash } from '../accounts/credentials.ts';

/** Local test mailbox only. Keys are supplied separately from the database and commercial sessions. */
export class MessageProtection {
  private readonly key: Buffer;
  private readonly accessHash: string;
  constructor(encryptionKey: string, technicalSecret: string) {
    if (!/^[a-f0-9]{64}$/.test(encryptionKey) || !/^[\w-]{43}$/.test(technicalSecret)) throw new Error('Configure separate message encryption and technical access keys.');
    this.key = Buffer.from(encryptionKey, 'hex');
    if (this.key.equals(Buffer.alloc(32))) throw new Error('Message encryption key cannot be zero.');
    this.accessHash = tokenHash('technical-mailbox', technicalSecret);
  }
  permits(value: string) { return /^[\w-]{43}$/.test(value) && sameHash(this.accessHash, tokenHash('technical-mailbox', value)); }
  seal(id: string, body: string) {
    const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', this.key, iv);
    cipher.setAAD(Buffer.from(id));
    const ciphertext = Buffer.concat([cipher.update(body, 'utf8'), cipher.final()]);
    return ['v1', iv.toString('hex'), cipher.getAuthTag().toString('hex'), ciphertext.toString('hex')].join('.');
  }
  open(id: string, sealed: string) {
    const [version, iv, tag, ciphertext, extra] = sealed.split('.');
    if (version !== 'v1' || extra !== undefined || !iv || !tag || !ciphertext || !/^[a-f0-9]{24}$/.test(iv) || !/^[a-f0-9]{32}$/.test(tag) || !/^(?:[a-f0-9]{2})+$/.test(ciphertext)) throw new Error('Invalid protected message.');
    const decipher = createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'hex'));
    decipher.setAAD(Buffer.from(id)); decipher.setAuthTag(Buffer.from(tag, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'hex')), decipher.final()]).toString('utf8');
  }
}
