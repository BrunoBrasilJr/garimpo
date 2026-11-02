import { test, expect } from './fixtures';
import { seedCatalog } from '../e2e/catalog-web/seed';

test('customer web controls keep wishes and alerts independent, handle duplicates, cancellation and enlarged narrow layout', async ({ page, app }) => {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword), customer = await app.customer();
  const login = page.getByRole('form', { name: 'Bom te ver de novo' }); await login.getByLabel('E-mail', { exact: true }).fill(customer.input.email); await login.getByLabel('Senha', { exact: true }).fill(customer.input.password); await login.getByRole('button').click();
  await page.getByRole('link', { name: 'Minha conta', exact: true }).waitFor(); await page.goto(app.origin + '/#/edition?id=' + data.main);
  const actions = page.getByRole('region', { name: 'Guardar edição e acompanhar disponibilidade', exact: true });
  await page.getByRole('button', { name: 'Salvar nos desejos', exact: true }).click(); await expect(actions.getByRole('status')).toContainText('Edição salva');
  await page.getByRole('link', { name: 'Meus desejos e alertas', exact: true }).click(); await expect(page.getByText('Nenhum alerta nesta página.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Ver edição', exact: true }).click(); await page.getByLabel('Condição do alerta', { exact: true }).selectOption('USED');
  await page.getByRole('button', { name: 'Avisar quando voltar', exact: true }).click(); await expect(actions.getByRole('status')).toContainText('Alerta ativado');
  await page.getByRole('button', { name: 'Avisar quando voltar', exact: true }).click(); await expect(actions.getByRole('status')).toContainText('já tem um alerta ativo');
  await page.getByRole('link', { name: 'Meus desejos e alertas', exact: true }).click(); await expect(page.getByText('Usado · Ativo', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remover desejo de ' + data.mainTitle, exact: true }).click(); await expect(page.getByText('Nenhuma edição salva nesta página.', { exact: true })).toBeVisible();
  await expect(page.getByText('Usado · Ativo', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar alerta de ' + data.mainTitle, exact: true }).click(); await expect(page.getByText('Usado · Cancelado', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('shared native customer controls use real bearer authentication to save, subscribe, list, cancel and remove', async ({ page, app }) => {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword), customer = await app.customer();
  await page.goto(app.origin + '/engagement-mobile-preview.html?id=' + data.main);
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill(customer.input.email); await page.getByRole('textbox', { name: 'Senha', exact: true }).fill(customer.input.password); await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByRole('button', { name: 'Salvar nos desejos', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('Edição salva');
  await page.getByRole('button', { name: 'Avisar quando voltar', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('Alerta ativado');
  await page.getByRole('button', { name: 'Meus desejos e alertas', exact: true }).click(); await expect(page.getByText('Novo ou usado · Ativo', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remover desejo de ' + data.mainTitle, exact: true }).click(); await expect(page.getByText('Nenhuma edição salva nesta página.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar alerta de ' + data.mainTitle, exact: true }).click(); await expect(page.getByText('Novo ou usado · Cancelado', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
