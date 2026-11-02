import type { Page } from '@playwright/test';
import { test, expect } from './browser-fixtures';

async function login(page: Page, origin: string, email: string, password: string) {
  await page.goto(origin + '/#/login'); const form = page.getByRole('form', { name: 'Bom te ver de novo' });
  await form.getByLabel('E-mail', { exact: true }).fill(email); await form.getByLabel('Senha', { exact: true }).fill(password); await form.getByRole('button').click();
  await page.getByRole('link', { name: 'Minha conta', exact: true }).waitFor();
}
async function logout(page: Page, origin: string) { await page.goto(origin + '/#/profile'); await page.getByRole('button', { name: 'Sair', exact: true }).click(); await page.getByRole('form', { name: 'Bom te ver de novo' }).waitFor(); }
const preview = (origin: string, editionId: string, orderId: string) => origin + '/review-preview/web-preview.html?id=' + editionId + '&orderId=' + orderId;

test('web composer publishes and edits verified-purchase reviews while public reads omit credentials and render comments as text', async ({ page, app, scenario }) => {
  const { data, customer, orderId } = scenario;
  await login(page, app.origin, customer.input.email, customer.input.password); await page.goto(preview(app.origin, data.main, orderId));
  const comment = '<img src=x onerror="window.__reviewUnsafe=true"> disco conforme anunciado';
  const published = page.getByRole('article').filter({ has: page.getByRole('heading', { name: /^Titular · \d de 5$/ }) });
  const create = page.getByRole('form', { name: 'Avaliar esta compra', exact: true }); await create.getByLabel('Nota', { exact: true }).selectOption('5'); await create.getByLabel('Comentário', { exact: true }).fill(comment); await create.getByRole('button', { name: 'Publicar avaliação', exact: true }).click();
  await expect(published.getByText(comment, { exact: true })).toBeVisible(); expect(await page.locator('img[src="x"]').count()).toBe(0);
  expect(await page.evaluate(() => '__reviewUnsafe' in window)).toBe(false);
  const edit = page.getByRole('form', { name: 'Editar sua avaliação', exact: true }); await edit.getByLabel('Nota', { exact: true }).selectOption('4'); await edit.getByLabel('Comentário', { exact: true }).fill('Revisão pública imediata do cliente.'); await edit.getByRole('button', { name: 'Salvar avaliação', exact: true }).click();
  await expect(published.getByText('Revisão pública imediata do cliente.', { exact: true })).toBeVisible();
  const publicRequest = page.waitForRequest(req => new URL(req.url()).pathname === '/api/v1/editions/' + data.main + '/reviews');
  await page.getByRole('button', { name: 'Atualizar avaliações', exact: true }).click(); expect(Boolean((await (await publicRequest).allHeaders()).cookie)).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('OPERATOR hides, author editing stays hidden, and only explicit current-revision release republishes with full history', async ({ page, app, scenario }) => {
  const { data, customer, orderId } = scenario;
  await login(page, app.origin, customer.input.email, customer.input.password); await page.goto(preview(app.origin, data.main, orderId));
  const create = page.getByRole('form', { name: 'Avaliar esta compra', exact: true }); await create.getByLabel('Comentário', { exact: true }).fill('Conteúdo original para conferência.'); await create.getByRole('button', { name: 'Publicar avaliação', exact: true }).click(); await page.getByRole('form', { name: 'Editar sua avaliação', exact: true }).waitFor();
  await logout(page, app.origin); await login(page, app.origin, app.credentials.operatorEmail, app.credentials.operatorPassword); await page.getByRole('link', { name: 'Avaliações', exact: true }).click();
  const card = page.getByRole('article').filter({ has: page.getByRole('heading', { name: data.mainTitle, exact: true }) });
  await card.getByLabel('Motivo', { exact: true }).fill('Conferir o comentário com a compra.'); await card.getByRole('button', { name: 'Ocultar avaliação', exact: true }).click(); await expect(card.getByText('Oculta', { exact: true })).toBeVisible();
  await logout(page, app.origin); await login(page, app.origin, customer.input.email, customer.input.password); await page.goto(preview(app.origin, data.main, orderId));
  const edit = page.getByRole('form', { name: 'Editar sua avaliação', exact: true }); await expect(edit.getByText(/Editar mantém o conteúdo oculto/)).toBeVisible(); await edit.getByLabel('Comentário', { exact: true }).fill('Conteúdo corrigido, ainda oculto.'); await edit.getByRole('button', { name: 'Salvar avaliação', exact: true }).click();
  await expect(page.getByText('Oculta, aguardando análise', { exact: true })).toBeVisible(); await expect(page.getByText('Esta edição ainda não tem avaliações publicadas.', { exact: true })).toBeVisible();
  await logout(page, app.origin); await login(page, app.origin, app.credentials.operatorEmail, app.credentials.operatorPassword); await page.getByRole('link', { name: 'Avaliações', exact: true }).click();
  await card.getByLabel('Motivo', { exact: true }).fill('Revisão atual aprovada após análise.'); await card.getByRole('button', { name: 'Liberar revisão atual', exact: true }).click(); await expect(card.getByText('Publicada', { exact: true })).toBeVisible();
  await card.getByRole('button', { name: 'Ver histórico de ' + data.mainTitle, exact: true }).click(); await expect(card.getByRole('listitem')).toHaveCount(4);
  await page.goto(app.origin + '/#/edition?id=' + data.main); await expect(page.getByText('Conteúdo corrigido, ainda oculto.', { exact: true })).toBeVisible();
});

test('shared native forms publish and edit with bearer credentials even while an independent staff web cookie exists', async ({ page, app, scenario }) => {
  const { data, customer, orderId } = scenario;
  await page.goto(app.origin + '/reviews-mobile-preview.html?id=' + data.main + '&orderId=' + orderId);
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill(customer.input.email); await page.getByRole('textbox', { name: 'Senha', exact: true }).fill(customer.input.password); await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText('Esta edição ainda não tem avaliações publicadas.', { exact: true })).toBeVisible();
  await page.getByRole('heading', { name: 'Avaliar esta compra', exact: true }).waitFor();
  await page.getByRole('button', { name: /^Nota:/ }).click(); const dialog = page.getByRole('dialog'); await expect(dialog.getByRole('radio', { name: 'Todos', exact: true })).toHaveCount(0); await dialog.getByRole('radio', { name: '3 estrelas', exact: true }).click(); await expect(dialog).toBeHidden();
  await page.getByRole('textbox', { name: 'Comentário', exact: true }).fill('Avaliação pelo componente nativo compartilhado.'); await page.getByRole('button', { name: 'Publicar avaliação', exact: true }).click(); await page.getByRole('button', { name: 'Salvar avaliação', exact: true }).waitFor();
  const status = await page.evaluate(async ({ email, password, editionId }) => {
    const login = await fetch('/api/v1/auth/login', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!login.ok) return login.status; const session = await login.json();
    const list = await fetch('/api/v1/admin/reviews?editionId=' + editionId, { credentials: 'include' }); const rows = await list.json(); const row = rows.items[0];
    const hidden = await fetch('/api/v1/admin/reviews/' + row.id + '/hide', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': session.csrfToken }, body: JSON.stringify({ revision: row.version, reason: 'Conferência pelo fluxo web separado.' }) }); return hidden.status;
  }, { email: app.credentials.operatorEmail, password: app.credentials.operatorPassword, editionId: data.main });
  expect(status).toBe(200); await page.getByRole('button', { name: 'Atualizar avaliações', exact: true }).click(); await expect(page.getByText('Oculta pela equipe', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Comentário', exact: true }).fill('Edição nativa permanece oculta para análise.'); await page.getByRole('button', { name: 'Salvar avaliação', exact: true }).click();
  await expect(page.getByText('Oculta, aguardando análise', { exact: true })).toBeVisible(); await expect(page.getByText('Esta edição ainda não tem avaliações publicadas.', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
