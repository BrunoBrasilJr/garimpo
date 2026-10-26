import { firefox } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { startHarness } from './harness.mjs';
import { startWifiTunnel } from './wifi-tunnel.mjs';

const app = await startHarness();
const profile = resolve(app.directory, 'manual-firefox'); mkdirSync(profile, { recursive: true, mode: 0o700 });
execFileSync('certutil', ['-N', '--empty-password', '-d', 'sql:' + profile], { stdio: 'ignore' });
execFileSync('certutil', ['-A', '-n', 'Garimpo isolated test CA', '-t', 'C,,', '-i', app.caPath, '-d', 'sql:' + profile], { stdio: 'ignore' });
let context, tunnel;
const terminal = createInterface({ input: process.stdin, output: process.stdout });
const stopped = new AbortController();
const stop = () => stopped.abort();
process.once('SIGINT', stop); process.once('SIGTERM', stop);
const limit = setTimeout(() => { console.log('Limite de 45 minutos atingido; encerrando o ambiente de teste.'); stop(); }, 45 * 60000);
try {
  if (process.argv.includes('--wifi')) {
    tunnel = await startWifiTunnel(app);
    console.log('HTTPS Android pronto: ' + tunnel.origin);
    console.log('Use somente dados inventados. Túnel público temporário; encerre com q ou Ctrl+C.');
  } else {
    context = await firefox.launchPersistentContext(profile, { headless: false, ignoreHTTPSErrors: false,
      locale: 'pt-BR', firefoxUserPrefs: { 'security.enterprise_roots.enabled': false } });
    await (await context.newPage()).goto(app.origin);
    console.log('Navegador de teste aberto. API/banco reais; dados exclusivamente sintéticos.');
  }
  console.log('Origem: ' + app.origin + '\nEvidências e contas internas de teste: ' + app.directory);
  console.log('A CA é confiável apenas neste perfil Firefox. Nenhuma alteração de confiança global.');
  for (;;) {
    const action = (await terminal.question('Mensagem local [m], avançar 16min de teste [t], encerrar [q]: ', { signal: stopped.signal })).trim();
    if (action === 'q') break;
    if (action === 't') { app.advance(16 * 60000); console.log('Relógio isolado avançado. O relógio do sistema não mudou.'); continue; }
    if (action !== 'm') continue;
    const recipient = (await terminal.question('E-mail sintético usado no formulário: ', { signal: stopped.signal })).trim();
    const purpose = (await terminal.question('Propósito VERIFY, RESET ou CHANGE: ', { signal: stopped.signal })).trim().toUpperCase();
    if (!['VERIFY', 'RESET', 'CHANGE'].includes(purpose)) { console.log('Propósito inválido.'); continue; }
    try {
      const message = await app.message(recipient, 'ACCESS.' + purpose);
      const path = resolve(app.directory, 'manual-message.json');
      writeFileSync(path, JSON.stringify(message, null, 2), { mode: 0o600 });
      console.log('Link/código sensível disponível somente no arquivo local: ' + path);
    } catch { console.log('Mensagem não disponível. Confira e-mail, propósito e solicitação no formulário.'); }
  }
} catch (cause) { if (!stopped.signal.aborted) throw cause; }
finally {
  clearTimeout(limit); process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop);
  terminal.close(); await tunnel?.close(); await context?.close(); await app.close();
}
