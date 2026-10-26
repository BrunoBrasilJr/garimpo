/// <reference lib="dom" />
import { randomUUID } from 'node:crypto';
import { firefox } from '@playwright/test';
import { test, expect } from './fixtures';
const password = 'Uma frase longa de teste para vinil!';
test('HTTPS fails without the isolated CA rather than bypassing certificate validation', async ({ app }) => {
  const browser = await firefox.launch({ headless: true });
  try {
    const context = await browser.newContext({ ignoreHTTPSErrors: false });
    const page = await context.newPage();
    await expect(page.goto(app.origin)).rejects.toThrow(/SEC_ERROR|certificate|SSL|issuer/i);
  } finally { await browser.close(); }
});
test('customer registers, confirms email, manages profile/address, restores cookies and logs out', async ({ page, app }) => {
  const email = `${randomUUID()}@example.invalid`;
  await page.getByRole('link', { name: 'Criar conta', exact: true }).click();
  const register = page.getByRole('form', { name: 'Crie sua conta', exact: true });
  await register.getByLabel('Nome completo').fill('Titular UI'); await register.getByLabel('E-mail', { exact: true }).fill(email); await register.getByLabel('Senha', { exact: true }).fill(password); await register.getByRole('button').click();
  await expect(page.getByRole('heading', { name: 'Bom te ver de novo' })).toBeVisible();
  const login = page.getByRole('form', { name: 'Bom te ver de novo' });
  await login.getByLabel('E-mail', { exact: true }).fill(email); await login.getByLabel('Senha', { exact: true }).fill(password); await login.getByRole('button', { name: 'Entrar' }).click();
  await expect(page.getByRole('heading', { name: 'Seu perfil', exact: true })).toBeVisible();
  const message = await app.message(email, 'ACCESS.VERIFY');
  await page.goto(app.origin + '/#/email-verification');
  const confirm = page.getByRole('form', { name: 'Confirmar e-mail', exact: true });
  await confirm.getByLabel('Código do link').fill(message.token); await confirm.getByRole('button').click();
  await expect(page.getByText('E-mail confirmado', { exact: true }).last()).toBeVisible();
  const profile = page.getByRole('form', { name: 'Como podemos chamar você?' });
  await profile.getByLabel('Nome completo').fill('Sulco de teste'); await profile.getByRole('button').click();
  await expect(profile.getByLabel('Nome completo')).toHaveValue('Sulco de teste');
  const address = page.getByRole('form', { name: 'Novo endereço', exact: true });
  for (const [label, value] of [['Destinatário', 'Titular UI'], ['CEP (8 números)', '01001000'], ['UF (2 letras)', 'SP'], ['Cidade', 'São Paulo'], ['Bairro', 'Sé'], ['Rua', 'Praça de teste'], ['Número', '10']]) await address.getByLabel(label!, { exact: true }).fill(value!);
  await address.getByRole('button', { name: 'Adicionar endereço' }).click();
  await page.getByRole('button', { name: 'Editar endereço de Titular UI' }).click();
  const edit = page.getByRole('form', { name: 'Editar endereço', exact: true });
  await edit.getByLabel('Número', { exact: true }).fill('20'); await edit.getByRole('button').click();
  await expect(page.getByText(/Praça de teste, 20/)).toBeVisible();
  await page.getByRole('button', { name: 'Excluir endereço de Titular UI' }).click(); await page.getByRole('button', { name: 'Confirmar exclusão', exact: true }).click();
  await expect(page.getByText('Nenhum endereço cadastrado.')).toBeVisible();
  await page.reload(); await expect(page.getByLabel('Nome completo', { exact: true })).toHaveValue('Sulco de teste');
  const beforeRenewal = (await page.context().cookies()).find(item => item.name === '__Host-garimpo-refresh')?.value;
  app.advance(16 * 60000);
  await profile.getByLabel('Nome completo').fill('Sulco renovado');
  await Promise.all([
    page.waitForResponse(response => response.url() === app.origin + '/api/v1/me' && response.request().method() === 'PATCH' && response.status() === 200),
    profile.getByRole('button').click()
  ]);
  await expect(profile.getByLabel('Nome completo')).toHaveValue('Sulco renovado');
  expect((await page.context().cookies()).find(item => item.name === '__Host-garimpo-refresh')?.value).not.toBe(beforeRenewal);
  const cookies = await page.context().cookies();
  for (const name of ['__Host-garimpo-access', '__Host-garimpo-refresh']) expect(cookies.find(item => item.name === name)).toMatchObject({ secure: true, httpOnly: true, sameSite: 'Lax' });
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  await page.getByRole('button', { name: 'Sair', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Bom te ver de novo' })).toBeVisible();
  expect((await page.context().cookies()).filter(item => item.name.startsWith('__Host-garimpo-'))).toHaveLength(0);
});

test('browser recovery and email change complete through the real API and protected local messages', async ({ page, app }) => {
  const created = await app.customer();
  await page.getByRole('link', { name: 'Esqueci minha senha' }).click();
  const reset = page.getByRole('form', { name: 'Recuperar acesso', exact: true });
  await reset.getByLabel('E-mail', { exact: true }).fill(created.input.email);
  await Promise.all([page.waitForResponse(response => response.url() === app.origin + '/api/v1/auth/password-reset' && response.status() === 202), reset.getByRole('button').click()]);
  const message = await app.message(created.input.email, 'ACCESS.RESET');
  const define = page.getByRole('form', { name: 'Definir nova senha', exact: true });
  await define.getByLabel('Código do link').fill(message.token); await define.getByLabel('Nova senha').fill(password); await define.getByRole('button').click();
  const login = page.getByRole('form', { name: 'Bom te ver de novo' });
  await login.getByLabel('E-mail', { exact: true }).fill(created.input.email); await login.getByLabel('Senha', { exact: true }).fill(password); await login.getByRole('button').click();
  const destination = `${randomUUID()}@example.invalid`;
  const change = page.getByRole('form', { name: 'Alterar e-mail', exact: true });
  await change.getByLabel('Novo e-mail').fill(destination);
  await Promise.all([page.waitForResponse(response => response.url() === app.origin + '/api/v1/me/email-change' && response.status() === 202), change.getByRole('button').click()]);
  await expect(page.getByText(created.input.email, { exact: true })).toBeVisible();
  const changed = await app.message(destination, 'ACCESS.CHANGE');
  await page.goto(app.origin + '/#/email-change');
  const confirm = page.getByRole('form', { name: 'Confirmar novo e-mail', exact: true });
  await confirm.getByLabel('Código do link').fill(changed.token); await confirm.getByRole('button').click();
  await expect(page.getByText(destination, { exact: true })).toBeVisible();
});

test('invalid link has accessible error; fragment is scrubbed, keyboard navigation and enlarged narrow layout remain usable', async ({ page, app }) => {
  await page.goto(app.origin + '/#/email-verification?token=' + 'x'.repeat(43));
  await expect(page).toHaveURL(app.origin + '/#/email-verification');
  const confirm = page.getByRole('form', { name: 'Confirmar e-mail', exact: true });
  await confirm.getByRole('button').click();
  await expect(confirm.getByRole('alert')).toContainText('inválido'); await expect(confirm.getByRole('alert')).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Pular para o conteúdo' }).focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#account-main')).toBeFocused();
});
