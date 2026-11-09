import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, expect } from '@playwright/test';

const [directory, mode] = process.argv.slice(2);
if (!directory || !['probe', 'run'].includes(mode)) throw new Error('Explicit bridge directory and mode required.');
const input = JSON.parse(await readFile(resolve(directory, 'bridge.json'), 'utf8'));
if (!/^https:\/\/localhost:\d{1,5}$/.test(input.origin)) throw new Error('Only isolated localhost origin accepted.');
const linux = process.platform === 'linux';
const browsers = linux ? [
  ['Chrome', process.env.GARIMPO_LINUX_CHROME],
  ['Edge', process.env.GARIMPO_LINUX_EDGE]
] : [
  ['Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'],
  ['Edge', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe']
];
if (browsers.some(([, executable]) => !executable)) throw new Error('Both browser executables are required.');

async function isolatedBrowserEnvironment(home) {
  const nss = resolve(home, '.local/share/pki/nssdb');
  await mkdir(nss, { recursive: true, mode: 0o700 });
  const certutil = args => execFileSync('certutil', [...args, '-d', 'sql:' + nss], { stdio: 'ignore' });
  certutil(['-N', '--empty-password']);
  if (mode === 'run') {
    const certificate = resolve(home, 'ca.pem');
    await writeFile(certificate, Buffer.from(input.ca, 'base64'), { mode: 0o600 });
    certutil(['-A', '-n', 'Garimpo isolated test CA', '-t', 'C,,', '-i', certificate]);
  }
  return { ...process.env, HOME: home, XDG_DATA_HOME: resolve(home, '.local/share'), XDG_CONFIG_HOME: resolve(home, '.config'), XDG_CACHE_HOME: resolve(home, '.cache') };
}

const results = [];
for (const [name, executablePath] of browsers) {
  let browser, home, page, step = 'launch';
  try {
    home = linux ? await mkdtemp(resolve(directory, 'browser-home-')) : undefined;
    const env = home ? await isolatedBrowserEnvironment(home) : undefined;
    browser = await chromium.launch({ executablePath, headless: true, env });
    const context = await browser.newContext({ ignoreHTTPSErrors: false, locale: 'pt-BR', viewport: { width: 1280, height: 900 } });
    page = await context.newPage();
    if (mode === 'probe') {
      let rejected = false;
      try { await page.goto(input.origin); } catch (error) { rejected = /ERR_CERT_AUTHORITY_INVALID/.test(error.message); }
      if (!rejected) throw new Error('Untrusted CA must be rejected.');
      results.push({ browser: name, version: browser.version(), status: 'UNTRUSTED_CA_REJECTED' });
      continue;
    }
    const login = async (email, password) => {
      await page.goto(input.origin + '/#/login');
      const form = page.getByRole('form', { name: 'Bom te ver de novo' });
      await form.getByLabel('E-mail', { exact: true }).fill(email); await form.getByLabel('Senha', { exact: true }).fill(password);
      await form.getByRole('button', { name: 'Entrar', exact: true }).click();
      await expect(page.getByRole('link', { name: 'Minha conta', exact: true })).toBeVisible();
    };
    step = 'customer login'; await login(input.customer.email, input.customer.password);
    step = 'catalog and cart'; await page.goto(input.origin + '/#/edition?id=' + input.edition);
    await page.getByRole('radio', { name: /Selecionar oferta nova 1 por/ }).check();
    await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click();
    await expect(page.getByText('Adicionado ao carrinho. Adicionar não reserva estoque.', { exact: true })).toBeVisible();
    await page.goto(input.origin + '/#/cart');
    await page.getByRole('checkbox', { name: 'Conferi os itens e os valores atuais', exact: true }).check();
    await page.getByRole('button', { name: 'Reservar conjunto por 15 minutos', exact: true }).click();
    step = 'freight and payment'; await page.getByRole('link', { name: 'Escolher endereço e pagamento', exact: true }).click();
    await page.getByRole('radio', { name: /Titular da compra ·/ }).check();
    await page.getByRole('button', { name: 'Cotar frete deste endereço', exact: true }).click();
    await page.getByRole('button', { name: 'Aceitar endereço e frete cotados', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Endereço e frete aceitos', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Atualizar finalização e pagamentos', exact: true })).toBeEnabled();
    await page.getByRole('checkbox', { name: 'Conferi o endereço aceito, frete, produtos e método de pagamento', exact: true }).check();
    await page.getByRole('button', { name: 'Simular cartão', exact: true }).click();
    await expect(page.getByText(/Pagamento confirmado ·/)).toBeVisible();
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    step = 'admin reports'; await login(input.credentials.adminEmail, input.credentials.adminPassword);
    await page.getByRole('link', { name: 'Relatórios', exact: true }).click();
    await page.getByLabel('Data inicial (São Paulo)', { exact: true }).fill(input.day);
    await page.getByLabel('Data final (São Paulo)', { exact: true }).fill(input.day);
    await page.getByRole('button', { name: 'Consultar relatórios', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Ticket médio', exact: true })).toContainText('pedidos mantidos');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: resolve(directory, name.toLowerCase() + '-reports-200.png'), fullPage: true });
    await page.getByRole('button', { name: 'Sair', exact: true }).click();
    step = 'operator boundary'; await login(input.credentials.operatorEmail, input.credentials.operatorPassword);
    await expect(page.getByRole('link', { name: 'Relatórios', exact: true })).toHaveCount(0);
    results.push({ browser: name, version: browser.version(), status: 'PASS', purchase: 'PAID', reports: 'ADMIN_ONLY', largeText: 'PASS' });
  } catch (error) {
    await writeFile(resolve(directory, 'failure.json'), JSON.stringify({ browser: name, step, error: error.name }));
    if (page) await page.screenshot({ path: resolve(directory, name.toLowerCase() + '-failure.png'), fullPage: true }).catch(() => {});
    console.error(name + ': FAILED at ' + step); process.exitCode = 1; break;
  } finally {
    await browser?.close();
    if (home) await rm(home, { recursive: true, force: true });
  }
}
await writeFile(resolve(directory, mode === 'probe' ? 'probe.json' : 'result.json'), JSON.stringify({ status: process.exitCode ? 'FAIL' : 'PASS', results }, null, 2));
