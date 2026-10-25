import { createServer as createHttpsServer } from 'node:https';
import { createServer as createHttpServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createApp } from './app.ts';

const app = createApp();
const port = Number(process.env['PORT'] ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer from 1 to 65535.');
}
const cert = process.env['TLS_CERT_PATH'];
const key = process.env['TLS_KEY_PATH'];
if (Boolean(cert) !== Boolean(key)) {
  throw new Error('Configure both TLS_CERT_PATH and TLS_KEY_PATH.');
}
// Plain HTTP is limited to the internal loopback health probe, never client auth.
const host = cert ? (process.env['HOST'] ?? '127.0.0.1') : '127.0.0.1';
const server = cert && key
  ? createHttpsServer({ cert: readFileSync(cert), key: readFileSync(key) }, app)
  : createHttpServer(app);
server.listen(port, host, () => {
  console.info(`Garimpo bootstrap: ${cert ? 'https' : 'http'}://${host}:${port}/health`);
});
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
