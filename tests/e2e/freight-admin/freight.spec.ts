import type { Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { test, expect } from '../account/fixtures';
async function login(page: Page, origin: string, email: string, password: string) {
  await page.goto(origin + '/#/login'); const form = page.getByRole('form', { name: 'Bom te ver de novo' }); await form.getByLabel('E-mail', { exact: true }).fill(email); await form.getByLabel('Senha', { exact: true }).fill(password);
  const signed = page.waitForResponse(response => response.url() === origin + '/api/v1/auth/login' && response.request().method() === 'POST'); await form.getByRole('button').click(); expect((await signed).status()).toBe(200); await expect(page.getByRole('link', { name: 'Minha conta', exact: true })).toBeVisible();
}
async function fill(page: Page, region: string, start = '10000-000', end = '10999-999') {
  const form = page.getByRole('form', { name: 'Configurar frete' }); await form.getByLabel('Nome da região', { exact: true }).fill(region); await form.getByLabel('Valor do frete em reais', { exact: true }).fill('15,50'); await form.getByLabel('Prazo estimado em dias', { exact: true }).fill('7'); await form.getByLabel('CEP inicial da faixa 1', { exact: true }).fill(start); await form.getByLabel('CEP final da faixa 1', { exact: true }).fill(end); return form;
}
test('ADMIN manages inclusive coverage, multiple ranges, non-served regions and overlap errors with narrow enlarged keyboard layout', async ({ page, app }) => {
  await login(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword); await page.getByRole('link', { name: 'Frete', exact: true }).click();
  const region = 'Área sintética ' + randomUUID(), form = await fill(page, region); await form.getByRole('button', { name: 'Salvar configuração', exact: true }).click(); const row = page.getByRole('article', { name: region, exact: true }); await expect(row).toContainText('R$ 15,50'); await expect(row).toContainText('10000-000 até 10999-999');
  await row.getByRole('button', { name: 'Editar frete de ' + region, exact: true }).click(); await form.getByRole('button', { name: 'Adicionar faixa de CEP', exact: true }).click(); await form.getByLabel('CEP inicial da faixa 2', { exact: true }).fill('11000-000'); await form.getByLabel('CEP final da faixa 2', { exact: true }).fill('11999-999'); await form.getByRole('button', { name: 'Salvar configuração', exact: true }).click(); await expect(row).toContainText('versão 2'); await expect(row).toContainText('11000-000 até 11999-999');
  await row.getByRole('button', { name: 'Editar frete de ' + region, exact: true }).click(); await form.getByRole('checkbox', { name: 'Esta região é atendida', exact: true }).uncheck(); await expect(form.getByLabel('Valor do frete em reais')).toBeDisabled(); await form.getByRole('button', { name: 'Salvar configuração', exact: true }).click(); await expect(row).toContainText('Região não atendida'); await expect(row).toContainText('versão 3');
  await fill(page, 'Sobreposição sintética', '10500-000', '10500-999'); await form.getByRole('button', { name: 'Salvar configuração', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('já está abrangida'); await expect(row).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await form.getByLabel('Nome da região').focus(); await expect(form.getByLabel('Nome da região')).toBeFocused(); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: resolve(app.directory, 'freight-narrow-enlarged.png'), fullPage: true });
});

test('two open editors surface a stale version and require explicit review of the current server values', async ({ page, app }) => {
  await login(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword); await page.getByRole('link', { name: 'Frete', exact: true }).click(); const region = 'Edição concorrente ' + randomUUID(), form = await fill(page, region, '20000-000', '20999-999'); await form.getByRole('button', { name: 'Salvar configuração', exact: true }).click(); const row = page.getByRole('article', { name: region, exact: true }); await expect(row).toBeVisible();
  const other = await page.context().newPage(); await other.goto(app.origin + '/#/freight-admin'); const otherRow = other.getByRole('article', { name: region, exact: true }), otherForm = other.getByRole('form', { name: 'Configurar frete' }); await otherRow.getByRole('button', { name: 'Editar frete de ' + region, exact: true }).click();
  await row.getByRole('button', { name: 'Editar frete de ' + region, exact: true }).click(); await form.getByLabel('Valor do frete em reais').fill('20,00'); await form.getByRole('button', { name: 'Salvar configuração', exact: true }).click(); await expect(row).toContainText('R$ 20,00');
  await otherForm.getByLabel('Valor do frete em reais').fill('30,00'); await otherForm.getByRole('button', { name: 'Salvar configuração', exact: true }).click(); await expect(other.getByRole('alert')).toContainText('configuração de frete mudou');
  await other.getByRole('button', { name: 'Atualizar lista de frete', exact: true }).click(); await expect(otherRow).toContainText('versão 2'); await otherRow.getByRole('button', { name: 'Editar frete de ' + region, exact: true }).click(); await expect(otherForm.getByLabel('Valor do frete em reais')).toHaveValue('20,00'); await otherForm.getByLabel('Valor do frete em reais').fill('30,00'); await otherForm.getByRole('button', { name: 'Salvar configuração', exact: true }).click(); await expect(otherRow).toContainText('versão 3'); await other.close();
});

test('OPERATOR and customer have no freight management navigation and cannot bypass the direct route or protected API', async ({ page, app }) => {
  const customer = await app.customer();
  for (const account of [{ email: app.credentials.operatorEmail, password: app.credentials.operatorPassword }, customer.input]) {
    await login(page, app.origin, account.email, account.password); await expect(page.getByRole('link', { name: 'Frete', exact: true })).toHaveCount(0); await page.goto(app.origin + '/#/freight-admin'); await expect(page.getByText('Somente administradores podem configurar frete e cobertura.', { exact: true })).toBeVisible();
    const status = await page.evaluate(async () => { const csrf = document.cookie.split('; ').find(item => item.startsWith('__Host-garimpo-csrf='))!.split('=')[1]!; return (await fetch('/api/v1/admin/freight-rates', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, body: '{broken' })).status; }); expect(status).toBe(403);
    await page.getByRole('button', { name: 'Sair', exact: true }).click(); await expect(page.getByRole('form', { name: 'Bom te ver de novo' })).toBeVisible();
  }
});
