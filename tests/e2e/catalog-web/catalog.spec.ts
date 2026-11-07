import { test, expect } from '../account/fixtures';
import { seedCatalog } from './seed';
import { audioProvider } from './audio';

test('visitor search includes track artists; combined filters use one offer and edition decade', async ({ page, app }) => {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword);
  await page.goto(app.origin + '/#/catalog');
  const form = page.getByRole('form', { name: 'Buscar e filtrar discos', exact: true });
  await form.getByLabel('Título, artista ou faixa').fill(data.trackArtist); await form.getByRole('button', { name: 'Buscar discos', exact: true }).click();
  await expect(page.getByRole('heading', { name: '1 edição encontrada', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: data.mainTitle, exact: true })).toBeVisible();
  await form.getByText('Combinar filtros', { exact: true }).click();
  await form.getByLabel('Artista da edição ou da faixa').selectOption({ label: data.trackArtist }); await form.getByLabel('Gênero', { exact: true }).selectOption({ label: data.genre });
  await form.getByLabel('Década desta edição').selectOption('2020'); await form.getByLabel('Preço mínimo em reais').fill('70,00'); await form.getByLabel('Preço máximo em reais').fill('80,00');
  await form.getByLabel('Conservação do disco usado').selectOption('VG+'); await form.getByLabel('Conservação da capa usada').selectOption('NM'); await form.getByLabel('Disponibilidade', { exact: true }).selectOption('true');
  await form.getByRole('button', { name: 'Buscar discos', exact: true }).click();
  await expect(page.getByRole('article', { name: data.mainTitle, exact: true })).toContainText('a partir de R$ 75,00');
  await expect(page.getByRole('heading', { name: '1 edição encontrada', exact: true })).toBeVisible();
  await form.getByText('Combinar filtros', { exact: true }).click(); await form.getByLabel('Preço mínimo em reais').fill(''); await form.getByLabel('Preço máximo em reais').fill('30,00');
  await form.getByRole('button', { name: 'Buscar discos', exact: true }).click();
  await expect(page.getByText('Nenhum disco encontrado com estes filtros. Tente outra combinação.', { exact: true })).toBeVisible();
  await page.goto(app.origin + '/#/catalog?q=' + encodeURIComponent(data.marker) + '&decade=1970');
  await expect(page.getByRole('heading', { name: '1 edição encontrada', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: data.marker + ' original', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: data.mainTitle, exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: data.marker + ' ano desconhecido', exact: true })).toHaveCount(0);
});

test('edition groups new and individual used offers, unknown metadata and optional failed audio remain usable', async ({ page, app }) => {
  const provider = await audioProvider(app.directory);
  try {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword, provider.url);
  await page.goto(app.origin + '/#/edition?id=' + data.main);
  await expect(page.getByRole('heading', { name: data.mainTitle, exact: true })).toBeFocused();
  await expect(page.getByRole('region', { name: 'Ofertas novas', exact: true })).toContainText('R$ 129,90');
  const sold = page.getByRole('article', { name: 'Exemplar usado 1', exact: true }), used = page.getByRole('article', { name: 'Exemplar usado 2', exact: true });
  await expect(sold.getByRole('radio')).toBeDisabled(); await expect(sold).toContainText('Esgotado');
  await expect(used).toContainText('VG+'); await expect(used).toContainText('NM'); await expect(used).toContainText('Marcas próprias na capa; disco conferido.');
  await expect(used.getByRole('img', { name: 'Foto própria do usado', exact: true })).toBeVisible();
  await used.getByRole('radio').check(); await expect(page.getByRole('status').filter({ hasText: 'Usado selecionado' })).toContainText('Esta seleção não reserva estoque.');
  await expect(page.locator('audio')).toHaveCount(1);
  await page.getByLabel('Prévia de Canção do convidado', { exact: true }).evaluate(node => (node as unknown as { load: () => void }).load());
  await expect.poll(() => page.locator('audio').evaluate(node => (node as unknown as { duration: number }).duration)).toBe(1);
  provider.fail(); await page.locator('audio').evaluate(node => (node as unknown as { load: () => void }).load());
  await expect(page.getByText('Não foi possível reproduzir esta prévia. Os dados da edição continuam disponíveis.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Exemplares usados', exact: true })).toBeVisible();
  await page.goto(app.origin + '/#/edition?id=' + data.unknown);
  await expect(page.locator('dt').filter({ hasText: /^Ano desta edição$/ }).locator('+ dd')).toHaveText('Não informado');
  await expect(page.locator('dt').filter({ hasText: /^Ano original$/ }).locator('+ dd')).toHaveText('1975');
  await expect(page.locator('audio')).toHaveCount(0);
  await page.goto(app.origin + '/#/edition?id=' + data.draft); await expect(page.getByRole('heading', { name: 'Edição indisponível', exact: true })).toBeVisible();
  await page.goto(app.origin + '/#/edition'); await expect(page.getByRole('alert')).toContainText('Esta edição não está disponível.');
  } finally { await provider.close(); }
});

test('customer can browse publicly without forwarding credentials; pagination, history, keyboard and enlarged layout work', async ({ page, app }) => {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword), customer = await app.customer();
  const login = page.getByRole('form', { name: 'Bom te ver de novo' });
  await login.getByLabel('E-mail', { exact: true }).fill(customer.input.email); await login.getByLabel('Senha', { exact: true }).fill(customer.input.password); await login.getByRole('button').click();
  await page.getByRole('link', { name: 'Minha conta', exact: true }).waitFor();
  const request = page.waitForRequest(value => new URL(value.url()).pathname === '/api/v1/editions');
  await page.getByRole('link', { name: 'Explorar discos', exact: true }).click(); expect(Boolean((await (await request).allHeaders()).cookie)).toBe(false);
  await page.goto(app.origin + '/#/catalog?q=' + encodeURIComponent(data.marker) + '&pageSize=1');
  await expect(page.getByText('Página 1 de 3', { exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Próxima página', exact: true }).click();
  await expect(page.getByText('Página 2 de 3', { exact: true })).toBeVisible();
  const selected = page.getByRole('article').getByRole('link'); await selected.click();
  await page.getByRole('link', { name: 'Voltar aos resultados', exact: true }).click(); await expect(page.getByText('Página 2 de 3', { exact: true })).toBeVisible();
  await expect(page.getByRole('form', { name: 'Buscar e filtrar discos' }).getByLabel('Título, artista ou faixa')).toHaveValue(data.marker);
  await page.getByRole('button', { name: 'Página anterior', exact: true }).click(); await expect(page.getByText('Página 1 de 3', { exact: true })).toBeVisible();
  await page.goBack(); await expect(page.getByText('Página 2 de 3', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'Pular para o conteúdo', exact: true }).focus(); await page.keyboard.press('Enter'); await expect(page.locator('#account-main')).toBeFocused();
  await page.goto(app.origin + '/#/edition?id=' + data.main);
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect(page.getByRole('heading', { name: data.mainTitle, exact: true })).toBeVisible();
  const labels = await page.locator('.shop-metadata dt').evaluateAll(elements => elements.map(element => {
    const range = document.createRange(); range.selectNodeContents(element);
    return { lines: range.getClientRects().length, words: element.textContent!.trim().split(/\s+/).length };
  }));
  expect(labels.length).toBeGreaterThan(0);
  for (const label of labels) expect(label.lines).toBeLessThanOrEqual(label.words);
});
