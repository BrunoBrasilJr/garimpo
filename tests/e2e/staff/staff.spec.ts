import { randomUUID } from 'node:crypto';
import { test, expect } from '../account/fixtures';
test('OPERATOR has no management navigation and a direct staff route remains restricted', async ({ page, app }) => {
  const form = page.getByRole('form', { name: 'Bom te ver de novo' });
  await form.getByLabel('E-mail', { exact: true }).fill(app.credentials.operatorEmail); await form.getByLabel('Senha', { exact: true }).fill(app.credentials.operatorPassword); await form.getByRole('button').click();
  await expect(page.getByRole('heading', { name: 'Sua conta interna' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Equipe', exact: true })).toHaveCount(0);
  await page.goto(app.origin + '/#/staff'); await expect(page.getByRole('heading', { name: 'Acesso restrito' })).toBeVisible();
  await expect(page.getByRole('form', { name: 'Adicionar pessoa à equipe' })).toHaveCount(0);
});
test('ADMIN creates and manages staff while last administrator protection is shown from the real backend', async ({ page, app }) => {
  const login = page.getByRole('form', { name: 'Bom te ver de novo' });
  await login.getByLabel('E-mail', { exact: true }).fill(app.credentials.adminEmail); await login.getByLabel('Senha', { exact: true }).fill(app.credentials.adminPassword); await login.getByRole('button').click();
  await page.getByRole('link', { name: 'Equipe', exact: true }).click();
  const create = page.getByRole('form', { name: 'Adicionar pessoa à equipe', exact: true });
  await create.getByLabel('Nome completo').fill('Equipe nova'); await create.getByLabel('E-mail', { exact: true }).fill(`${randomUUID()}@example.invalid`); await create.getByLabel('Senha inicial').fill('Outra frase longa para a equipe!'); await create.getByLabel('Papel', { exact: true }).selectOption('OPERATOR'); await create.getByRole('button').click();
  const edit = page.getByRole('form', { name: 'Editar Equipe nova', exact: true }); await edit.getByLabel('Nome completo').fill('Equipe atualizada'); await edit.getByLabel('Papel', { exact: true }).selectOption('ADMIN'); await edit.getByRole('button').click();
  const updated = page.getByRole('form', { name: 'Editar Equipe atualizada', exact: true }); await updated.getByLabel('Papel', { exact: true }).selectOption('OPERATOR');
  await Promise.all([page.waitForResponse(response => response.url().includes('/api/v1/admin/staff/') && response.request().method() === 'PATCH' && response.status() === 200), updated.getByRole('button').click()]);
  await expect(updated.getByLabel('Papel', { exact: true })).toHaveValue('OPERATOR');
  const access = page.getByRole('form', { name: 'Alterar acesso de Equipe atualizada', exact: true });
  await access.getByLabel('Motivo da alteração').fill('Conferência de bloqueio'); await access.getByLabel('Ação', { exact: true }).selectOption('block'); await access.getByRole('button').click();
  await expect(page.getByRole('article', { name: 'Conta de Equipe atualizada', exact: true }).getByText(/Bloqueada/)).toBeVisible();
  await access.getByLabel('Motivo da alteração').fill('Conferência de desbloqueio'); await access.getByLabel('Ação', { exact: true }).selectOption('unblock'); await access.getByRole('button').click();
  await expect(page.getByRole('article', { name: 'Conta de Equipe atualizada', exact: true }).getByText(/Ativa/)).toBeVisible();
  const onlyAdmin = page.getByRole('form', { name: 'Alterar acesso de Admin de teste', exact: true });
  await onlyAdmin.getByLabel('Motivo da alteração').fill('Teste de proteção'); await onlyAdmin.getByLabel('Ação', { exact: true }).selectOption('deactivate'); await onlyAdmin.getByRole('button').click();
  await expect(onlyAdmin.getByRole('alert')).toContainText('administrador ativo');
});
