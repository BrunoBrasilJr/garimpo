import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const manifests = ['node-forge+1.4.2.json', 'deepmerge+4.3.1.json'];
const hash = value => createHash('sha256').update(value).digest('hex');

function reviewedFiles() {
  return manifests.flatMap(name => {
    const manifest = JSON.parse(readFileSync(resolve(root, 'patches', name), 'utf8'));
    const packagePath = resolve(root, 'node_modules', manifest.package);
    const installed = JSON.parse(readFileSync(resolve(packagePath, 'package.json'), 'utf8'));
    if (installed.version !== manifest.version) throw new Error(`Unexpected ${manifest.package} version; review the toolchain before proceeding.`);
    return (manifest.files ?? [manifest]).map(review => ({ manifest: { ...manifest, ...review }, file: resolve(packagePath, review.file) }));
  });
}

export function verifyToolchain() {
  for (const { manifest, file } of reviewedFiles()) {
    if (hash(readFileSync(file)) !== manifest.patchedSha256) throw new Error(`Reviewed ${manifest.package} bytes are missing or changed.`);
  }
}

export function applyReviewedToolchain() {
  for (const { manifest, file } of reviewedFiles()) {
    const original = readFileSync(file, 'utf8');
    const actual = hash(original);
    if (actual === manifest.patchedSha256) {
      console.info(`Verified ${manifest.package} ${manifest.version}: reviewed bytes match.`);
      continue;
    }
    if (actual !== manifest.originalSha256 || !manifest.replacements?.length) throw new Error(`Unexpected ${manifest.package} bytes; refusing to patch or bypass verification.`);
    let corrected = original;
    for (const { before, after } of manifest.replacements) {
      if (!before || corrected.split(before).length !== 2) throw new Error('Reviewed patch must match exactly once.');
      corrected = corrected.replace(before, after);
    }
    if (hash(corrected) !== manifest.patchedSha256) throw new Error('Reviewed patched hash mismatch.');
    writeFileSync(file, corrected);
    console.info(`Applied ${manifest.package} ${manifest.version}: exact source and patched hashes verified.`);
  }
  verifyToolchain();
}
