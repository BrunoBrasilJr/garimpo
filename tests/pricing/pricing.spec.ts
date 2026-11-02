import type { Page } from '@playwright/test';
import { test as base, expect } from '../e2e/account/fixtures';
import { seedCatalog } from '../e2e/catalog-web/seed';

const test = base.extend<{ data: Awaited<ReturnType<typeof seedCatalog>> }>({
  data: [async ({ page, app }, use) => { await use(await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword)); }, { timeout: 180000 }]
});
async function login(page: Page, email: string, password: string) {
  const form = page.getByRole('form', { name: 'Bom te ver de novo' });
  await form.getByLabel('E-mail', { exact: true }).fill(email); await form.getByLabel('Senha', { exact: true }).fill(password); await form.getByRole('button').click();
  await page.getByRole('link', { name: 'Minha conta', exact: true }).waitFor();
}
test('ADMIN creates and edits a targeted coupon, preserves its code and enlarged form, customer has no access', async ({ page, app, data }) => {
  await login(page, app.credentials.adminEmail, app.credentials.adminPassword); await page.getByRole('link', { name: 'Descontos', exact: true }).click();
  const code = 'UI' + data.main.replaceAll('-', '').slice(0, 12).toUpperCase(), form = page.getByRole('form', { name: 'Configurar cupom' });
  await form.getByLabel('Código do cupom').fill(code.toLowerCase()); await form.getByLabel('Desconto em percentual').fill('12,50');
  await form.getByLabel('Mínimo elegível em reais').fill('50,00'); await form.getByLabel('Limite total de utilizações').fill('10'); await form.getByLabel('Limite por cliente').fill('2');
  await form.getByLabel('Permitir itens que já estejam em promoção').check(); await form.getByLabel('Tipo de alvo').selectOption('EDITION'); await form.getByLabel('Buscar alvo').fill(data.mainTitle);
  await form.getByLabel('Selecionar alvo').selectOption({ label: data.mainTitle }); await form.getByRole('button', { name: 'Adicionar alvo', exact: true }).click();
  await form.getByRole('button', { name: 'Salvar cadastro', exact: true }).click();
  const row = page.getByRole('article').filter({ has: page.getByRole('heading', { name: code, exact: true }) });
  await expect(row).toContainText('12,50%'); await expect(row).toContainText('Limite total: 10'); await expect(row).toContainText('utilizações: indisponíveis'); await expect(row).toContainText(data.mainTitle);
  await row.getByRole('button', { name: 'Editar cupom ' + code, exact: true }).click(); await expect(form.getByLabel('Código do cupom')).toBeDisabled();
  await form.getByLabel('Tipo de desconto').selectOption('FIXED'); await form.getByLabel('Desconto em reais').fill('20,00'); await form.getByLabel('Cadastro ativo').uncheck();
  await form.getByRole('button', { name: 'Salvar cadastro', exact: true }).click(); await expect(row).toContainText('versão 2'); await expect(row).toContainText('Inativo');
  await page.reload(); await expect(row).toContainText('R$ 20,00');
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await form.getByLabel('Código do cupom').focus(); await expect(form.getByLabel('Código do cupom')).toBeFocused();
  await page.getByRole('button', { name: 'Sair', exact: true }).click(); const customer = await app.customer(); await login(page, customer.input.email, customer.input.password);
  await expect(page.getByRole('link', { name: 'Descontos', exact: true })).toHaveCount(0);
  await page.goto(app.origin + '/#/pricing-admin'); await expect(page.getByRole('form', { name: 'Configurar cupom' })).toHaveCount(0);
});
test('ADMIN promotions use human offer selection and public search displays the lowest overlapping price', async ({ page, app, data }) => {
  await login(page, app.credentials.adminEmail, app.credentials.adminPassword); await page.getByRole('link', { name: 'Descontos', exact: true }).click(); await page.getByRole('button', { name: 'Promoções', exact: true }).click();
  const form = page.getByRole('form', { name: 'Configurar promoção' });
  for (const [suffix, type, amount] of [['metade', 'PERCENT', '50,00'], ['oitenta', 'FIXED', '80,00']]) {
    const name = data.marker + ' ' + suffix;
    await form.getByLabel('Nome da promoção').fill(name); await form.getByLabel('Tipo de desconto').selectOption(type!);
    await form.getByLabel(type === 'PERCENT' ? 'Desconto em percentual' : 'Desconto em reais').fill(amount!);
    await form.getByLabel('Buscar alvo').fill(data.mainTitle);
    const option = form.getByLabel('Selecionar alvo').getByRole('option').filter({ hasText: data.mainTitle + ' · novo · ref.' }); await expect(option).toHaveCount(1);
    await form.getByLabel('Selecionar alvo').selectOption(await option.getAttribute('value') as string); await form.getByRole('button', { name: 'Adicionar alvo', exact: true }).click();
    await form.getByRole('button', { name: 'Salvar cadastro', exact: true }).click(); await expect(page.getByRole('article').filter({ has: page.getByRole('heading', { name, exact: true }) })).toContainText('versão 1');
    // The new-campaign form retains its values after creation; explicitly clear its selected target.
    await form.getByRole('button', { name: /^Remover alvo / }).click();
  }
  await page.getByRole('button', { name: 'Sair', exact: true }).click(); await page.goto(app.origin + '/#/catalog?q=' + encodeURIComponent(data.marker) + '&minPrice=4900&maxPrice=5000&available=true');
  await expect(page.getByRole('heading', { name: '1 edição encontrada', exact: true })).toBeVisible(); await expect(page.getByRole('article', { name: data.mainTitle, exact: true })).toContainText('R$ 49,90');
  await page.getByRole('link', { name: data.mainTitle, exact: true }).click(); await expect(page.getByRole('region', { name: 'Ofertas novas', exact: true })).toContainText('R$ 49,90');
});
