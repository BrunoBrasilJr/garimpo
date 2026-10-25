import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(root, 'patches/node-forge+1.4.0.json'), 'utf8'));
const packagePath = resolve(root, 'node_modules/node-forge');
const installed = JSON.parse(readFileSync(resolve(packagePath, 'package.json'), 'utf8'));
if (installed.version !== manifest.version) {
  throw new Error(`Expected node-forge ${manifest.version}; review patch before changing dependency.`);
}
const file = resolve(packagePath, manifest.file);
const original = readFileSync(file, 'utf8');
const sha256 = value => createHash('sha256').update(value).digest('hex');
const actualHash = sha256(original);
if (actualHash === manifest.patchedSha256) {
  console.info(`Verified ${manifest.advisory}: patched bytes match manifest.`);
} else {
  if (actualHash !== manifest.originalSha256) {
    throw new Error('Unexpected node-forge bytes; refusing to apply or bypass security patch.');
  }
  const patch = readFileSync(resolve(root, 'patches/node-forge+1.4.0.patch'), 'utf8').split('\n');
  const before = patch.filter(line => line.startsWith('-') && !line.startsWith('---')).map(line => line.slice(1)).join('\n');
  const after = patch.filter(line => line.startsWith('+') && !line.startsWith('+++')).map(line => line.slice(1)).join('\n');
  if (!before || original.split(before).length !== 2) throw new Error('Patch must match exactly once.');
  const corrected = original.replace(before, after);
  if (sha256(corrected) !== manifest.patchedSha256) throw new Error('Patched hash mismatch.');
  writeFileSync(file, corrected);
  console.info(`Applied ${manifest.advisory}: exact source and patched hashes verified.`);
}
