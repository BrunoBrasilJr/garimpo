import { randomBytes } from 'node:crypto';
import { expect, test } from 'vitest';
import { MessageProtection } from '../../apps/api/src/modules/messaging/protection';
test('mailbox uses separate credentials and authenticated randomized encryption bound to message identity', () => {
  const key = randomBytes(32).toString('hex'), access = randomBytes(32).toString('base64url');
  const protection = new MessageProtection(key, access), text = 'sensitive synthetic link';
  const sealed = protection.seal('message-a', text);
  expect(sealed).not.toContain(text); expect(protection.seal('message-a', text)).not.toBe(sealed);
  expect(protection.open('message-a', sealed)).toBe(text);
  expect(() => protection.open('message-b', sealed)).toThrow();
  expect(() => protection.open('message-a', sealed.slice(0, -2) + (sealed.endsWith('00') ? '01' : '00'))).toThrow();
  expect(() => new MessageProtection(randomBytes(32).toString('hex'), access).open('message-a', sealed)).toThrow();
  expect(protection.permits(access)).toBe(true); expect(protection.permits(key)).toBe(false); expect(protection.permits('')).toBe(false);
  expect(() => new MessageProtection('0'.repeat(64), access)).toThrow();
});
