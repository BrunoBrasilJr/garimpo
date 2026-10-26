import { realpathSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { crc32, deflateSync } from 'node:zlib';
import { toQR } from 'toqr';

// Local test aid: a plaintext QR for copying, without links or network requests.
const root = realpathSync(resolve('test-results/account-ui'));
const input = realpathSync(process.argv[2] ?? '');
if (!input.startsWith(root + sep) || !input.endsWith(sep + 'manual-message.json')) throw new Error('Use only a local test message.');
const { token } = JSON.parse(readFileSync(input, 'utf8'));
if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('Unexpected test code.');
const matrix = toQR(token), modules = Math.sqrt(matrix.length);
if (!Number.isInteger(modules) || modules < 21 || matrix.slice(0, 7).some(value => value !== matrix[0])) throw new Error('Unexpected QR matrix.');
const scale = 12, quiet = 4, size = (modules + quiet * 2) * scale;
const pixels = Buffer.alloc((size + 1) * size, 255);
for (let y = 0; y < size; y++) {
  pixels[y * (size + 1)] = 0;
  for (let x = 0; x < size; x++) {
    const row = Math.floor(y / scale) - quiet, col = Math.floor(x / scale) - quiet;
    if (row >= 0 && row < modules && col >= 0 && col < modules && matrix[row * modules + col] === matrix[0]) pixels[y * (size + 1) + x + 1] = 0;
  }
}
function chunk(name, body) {
  const type = Buffer.from(name), result = Buffer.alloc(body.length + 12);
  result.writeUInt32BE(body.length); type.copy(result, 4); body.copy(result, 8);
  result.writeUInt32BE(crc32(Buffer.concat([type, body])), body.length + 8); return result;
}
const header = Buffer.alloc(13); header.writeUInt32BE(size); header.writeUInt32BE(size, 4); header[8] = 8;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
const output = resolve(dirname(input), `manual-code-${Date.now()}.png`);
writeFileSync(output, png, { mode: 0o600 });
console.log(JSON.stringify({ output, width: size, height: size, content: 'local single-use test code; not logged', network: 'NONE' }));
