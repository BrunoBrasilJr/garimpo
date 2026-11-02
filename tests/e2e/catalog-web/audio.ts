import { createServer } from 'node:https';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Independent synthetic provider. No audio upload/storage endpoint exists in the application. */
export async function audioProvider(directory: string) {
  const samples = 8000, wav = Buffer.alloc(44 + samples * 2);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(8000, 24); wav.writeUInt32LE(16000, 28);
  wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
  for (let sample = 0; sample < samples; sample++) wav.writeInt16LE(Math.round(1000 * Math.sin(2 * Math.PI * 440 * sample / 8000)), 44 + sample * 2);
  let failed = false;
  const server = createServer({ key: readFileSync(resolve(directory, 'server.key')), cert: readFileSync(resolve(directory, 'server.pem')) }, (_request, response) => {
    response.setHeader('Cache-Control', 'no-store'); response.setHeader('Content-Type', 'audio/wav');
    if (failed) { response.writeHead(503); response.end(); return; }
    response.setHeader('Content-Length', wav.length); response.end(wav);
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('Expected isolated TCP provider.');
  return { url: `https://127.0.0.1:${address.port}/preview.wav`, fail() { failed = true; },
    async close() { await new Promise<void>((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); }); } };
}
