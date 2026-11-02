import { test, expect } from './fixtures';
import { seedCatalog } from '../catalog-web/seed';
import { audioProvider } from '../catalog-web/audio';

test('shared mobile components search track artists and combine edition, condition and price filters', async ({ page, app }) => {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword);
  await page.goto(app.origin + '/catalog-mobile-preview.html');
  await expect(page.getByRole('heading', { name: 'Explore os discos', exact: true })).toHaveCSS('color', 'rgb(23, 60, 50)');
  await page.getByRole('textbox', { name: 'Título, artista ou faixa', exact: true }).fill(data.trackArtist); await page.getByRole('button', { name: 'Buscar discos', exact: true }).click();
  await expect(page.getByRole('heading', { name: '1 edição encontrada', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Combinar filtros', exact: true }).click();
  const choose = async (label: string, option: string) => {
    await page.getByRole('button', { name: new RegExp('^' + label + ':') }).click();
    const dialog = page.getByRole('dialog').filter({ has: page.getByRole('heading', { name: label, exact: true }) });
    await dialog.getByRole('radio', { name: option, exact: true }).click(); await expect(dialog).toBeHidden();
  };
  await choose('Artista da edição ou da faixa', data.trackArtist); await choose('Gênero', data.genre); await choose('Década desta edição', '2020–2029');
  await page.getByRole('textbox', { name: 'Preço mínimo em reais', exact: true }).fill('70,00'); await page.getByRole('textbox', { name: 'Preço máximo em reais', exact: true }).fill('80,00');
  await choose('Conservação do disco usado', 'VG+'); await choose('Conservação da capa usada', 'NM'); await choose('Disponibilidade', 'Disponíveis');
  await page.getByRole('button', { name: 'Buscar discos', exact: true }).click();
  await expect(page.getByText(/a partir de R\$\s*75,00/)).toBeVisible(); await expect(page.getByRole('heading', { name: data.mainTitle, exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Combinar filtros', exact: true }).click();
  await page.getByRole('textbox', { name: 'Preço mínimo em reais', exact: true }).fill(''); await page.getByRole('textbox', { name: 'Preço máximo em reais', exact: true }).fill('30,00');
  await page.getByRole('button', { name: 'Buscar discos', exact: true }).click();
  await expect(page.getByText('Nenhum disco encontrado com estes filtros. Tente outra combinação.', { exact: true })).toBeVisible();
  await page.goto(app.origin + '/catalog-mobile-preview.html?query=' + encodeURIComponent('q=' + data.marker + '&decade=1970'));
  await expect(page.getByRole('heading', { name: '1 edição encontrada', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: data.marker + ' original', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: data.mainTitle, exact: true })).toHaveCount(0);
});

test('shared mobile detail renders individual used copies, optional streaming and resource failure without blocking data', async ({ page, app }) => {
  const provider = await audioProvider(app.directory);
  try {
    const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword, provider.url);
    await page.goto(app.origin + '/catalog-mobile-preview.html?query=' + encodeURIComponent('q=' + data.trackArtist));
    await page.getByRole('button', { name: 'Ver edição ' + data.mainTitle, exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Ofertas novas', exact: true })).toBeVisible(); await expect(page.getByRole('heading', { name: 'Exemplares usados', exact: true })).toBeVisible();
    await expect(page.getByText('Conservação do disco: VG+', { exact: true })).toBeVisible(); await expect(page.getByText('Conservação da capa: NM', { exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: /Selecionar usado 1 por/ })).toBeDisabled(); await page.getByRole('radio', { name: /Selecionar usado 2 por/ }).click();
    await expect(page.getByText(/Esta seleção não reserva estoque/)).toBeVisible();
    await page.getByRole('button', { name: 'Abrir prévia de Canção do convidado', exact: true }).click();
    await expect(page.getByText('Pronta para ouvir', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Fechar prévia', exact: true }).click(); provider.fail();
    await page.getByRole('button', { name: 'Abrir prévia de Canção do convidado', exact: true }).click();
    await expect(page.getByText('Não foi possível reproduzir esta prévia. O catálogo continua disponível.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Fechar prévia', exact: true }).click(); await page.getByRole('button', { name: 'Voltar aos resultados', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Título, artista ou faixa', exact: true })).toHaveValue(data.trackArtist);
    await page.goto(app.origin + '/catalog-mobile-preview.html?query=' + encodeURIComponent('q=' + data.marker + ' ano desconhecido'));
    await page.getByRole('button', { name: 'Ver edição ' + data.marker + ' ano desconhecido', exact: true }).click();
    await expect(page.getByText('Ano desta edição: Não informado', { exact: true })).toBeVisible(); await expect(page.getByText('Ano original: 1975', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Abrir prévia/ })).toHaveCount(0);
  } finally { await provider.close(); }
});

test('shared mobile pagination and semantics survive narrow layout with simulated large text', async ({ page, app }) => {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword);
  await page.goto(app.origin + '/catalog-mobile-preview.html?query=' + encodeURIComponent('q=' + data.marker + '&pageSize=1'));
  await expect(page.getByText('Página 1 de 3', { exact: true })).toBeVisible(); await expect(page.getByRole('button', { name: 'Página anterior', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Próxima página', exact: true }).click(); await expect(page.getByText('Página 2 de 3', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^Ver edição / }).click(); await page.getByRole('button', { name: 'Voltar aos resultados', exact: true }).click(); await expect(page.getByText('Página 2 de 3', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const values = Array.from(document.querySelectorAll<HTMLElement>('[dir="auto"]')).map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize), line: parseFloat(getComputedStyle(element).lineHeight) }));
    for (const { element, size, line } of values) { if (size > 0) element.style.fontSize = size * 2 + 'px'; if (line > 0) element.style.lineHeight = line * 2 + 'px'; }
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button', { name: 'Próxima página', exact: true })).toBeVisible();
});
