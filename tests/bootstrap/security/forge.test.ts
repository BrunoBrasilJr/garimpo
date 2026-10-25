import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

const require = createRequire(import.meta.url);
const forge = require('node-forge');
// Disposable test key. Production signing and user credentials never use this fixture.
const keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 65537 });
const message = 'garimpo-signature-regression-fixture';
const digest = forge.md.sha256.create().update(message).digest().getBytes();

function rawSignature(includeNull: boolean, extraChild: boolean) {
  const asn1 = forge.asn1;
  const children = [asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OID, false, asn1.oidToDer(forge.oids.sha256).getBytes())];
  if (includeNull) children.push(asn1.create(asn1.Class.UNIVERSAL, asn1.Type.NULL, false, ''));
  if (extraChild) children.push(asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, 'extra-child'));
  const info = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, [
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SEQUENCE, true, children),
    asn1.create(asn1.Class.UNIVERSAL, asn1.Type.OCTETSTRING, false, digest)
  ]);
  return keys.privateKey.sign(asn1.toDer(info).getBytes(), 'NONE');
}

function accepts(signature: string, digestToVerify = digest): boolean {
  try {
    return keys.publicKey.verify(digestToVerify, signature);
  } catch {
    return false;
  }
}

test.each([true, false])('rejects an extra nested DigestAlgorithm child (NULL=%s)', includeNull => {
  expect(accepts(rawSignature(includeNull, true))).toBe(false);
});

test.each([true, false])('preserves a legitimate DigestInfo (NULL=%s)', includeNull => {
  expect(accepts(rawSignature(includeNull, false))).toBe(true);
});

test('rejects altered digest and malformed signature', () => {
  expect(accepts(rawSignature(true, false), 'different-digest')).toBe(false);
  expect(accepts('malformed')).toBe(false);
});

test('installed dependency has the exact approved patch bytes', () => {
  const manifest = JSON.parse(readFileSync(new URL('../../../patches/node-forge+1.4.0.json', import.meta.url), 'utf8'));
  const source = readFileSync(require.resolve('node-forge/lib/rsa'));
  expect(createHash('sha256').update(source).digest('hex')).toBe(manifest.patchedSha256);
});
