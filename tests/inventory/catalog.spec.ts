import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { test, expect } from '../e2e/account/fixtures';

test('operator administers metadata, edition, tracks, publication, offers and stock through the real secure UI', async ({ page, app }) => {
  const login = page.getByRole('form', { name: 'Bom te ver de novo' });
  await login.getByLabel('E-mail', { exact: true }).fill(app.credentials.operatorEmail); await login.getByLabel('Senha', { exact: true }).fill(app.credentials.operatorPassword); await login.getByRole('button').click();
  await page.getByRole('link', { name: 'Catálogo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo e estoque', exact: true })).toBeFocused();
  await page.getByText('Artistas, gêneros e gravadoras', { exact: true }).click();
  const artist = 'Artista ' + randomUUID(), genre = 'Gênero ' + randomUUID(), title = 'Edição ' + randomUUID();
  for (const [group, name] of [['Artistas', artist], ['Gêneros', genre]]) {
    const form = page.getByRole('form', { name: 'Cadastrar em ' + group });
    await form.getByLabel('Nome', { exact: true }).fill(name!);
    await Promise.all([page.waitForResponse(response => response.url().includes('catalog-metadata') && response.request().method() === 'POST' && response.status() === 201), form.getByRole('button').click()]);
    await expect(page.getByText(name!, { exact: true }).first()).toBeVisible();
  }
  await page.getByText('Criar edição', { exact: true }).click();
  const create = page.getByRole('form', { name: 'Nova edição', exact: true });
  await create.getByLabel('Título da edição').fill(title); await create.getByLabel('Artistas da edição').selectOption({ label: artist });
  await create.getByLabel('Gêneros da edição').selectOption({ label: genre }); await create.getByLabel('Gênero principal').selectOption({ label: genre });
  await create.getByLabel('Ano desta edição').fill('1997'); await create.getByRole('button', { name: 'Adicionar faixa', exact: true }).click();
  await create.getByLabel('Nome da faixa', { exact: true }).fill('Faixa de conferência'); await create.getByLabel('Duração em segundos').fill('180');
  await create.getByRole('button', { name: 'Criar rascunho' }).click();
  await expect(page.getByRole('heading', { name: title + ' · Inativa ou rascunho', exact: true })).toBeVisible();
  const png = await sharp({ create: { width: 20, height: 20, channels: 3, background: 'orange' } }).png().toBuffer();
  const photo = page.getByRole('form', { name: 'Enviar foto', exact: true });
  await photo.getByLabel('Imagem JPEG, PNG ou WebP de até 5 MB').setInputFiles({ name: 'capa.png', mimeType: 'image/png', buffer: png });
  await photo.getByLabel('Descrição da foto').fill('Capa da edição de teste'); await photo.getByRole('button', { name: 'Enviar foto', exact: true }).click();
  await expect(page.getByRole('img', { name: 'Capa da edição de teste' })).toBeVisible();
  await page.getByRole('form', { name: 'Publicar edição', exact: true }).getByRole('button').click();
  await expect(page.getByRole('heading', { name: title + ' · Publicada', exact: true })).toBeVisible();
  const newOffer = page.getByRole('form', { name: 'Criar oferta', exact: true });
  await newOffer.getByLabel('Preço em reais').fill('129,90'); await newOffer.getByLabel('Quantidade física inicial').fill('2'); await newOffer.getByRole('button').click();
  await expect(page.getByRole('heading', { name: /Oferta 1 · Novos/ })).toBeVisible();
  await page.getByRole('form', { name: 'Ativar oferta 1', exact: true }).getByRole('button').click();
  await expect(page.getByRole('heading', { name: /Oferta 1 · Novos.*Ativa/ })).toBeVisible();
  const adjustment = page.getByRole('form', { name: 'Ajustar quantidade física', exact: true });
  await adjustment.getByLabel('Variação da quantidade').fill('3'); await adjustment.getByLabel('Motivo do ajuste').fill('Entrada conferida no painel'); await adjustment.getByRole('button').click();
  await expect(page.getByText('Físico: 5 · reservado: Não conferido · disponível: Não conferido', { exact: true })).toBeVisible();
  await expect(page.getByText(/Entrada conferida no painel/).last()).toBeVisible();
  await adjustment.getByLabel('Variação da quantidade').fill('-1'); await adjustment.getByLabel('Motivo do ajuste').fill('Avaria a conferir'); await adjustment.getByRole('button').click();
  await expect(adjustment.getByRole('alert')).toContainText('redução ou exclusão está protegida');
  await expect(adjustment.getByRole('alert')).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const publicReply = await page.request.get(app.origin + '/api/v1/editions');
  expect(publicReply.status()).toBe(200); const publicData = await publicReply.json();
  expect(publicData.items.find((item: { title: string }) => item.title === title)).toMatchObject({ editionYear: 1997, tracks: [{ title: 'Faixa de conferência' }], offers: [{ priceCents: 12990, stockOnHand: 5 }] });
});

test('customer navigation and direct catalog administration remain restricted', async ({ page, app }) => {
  const customer = await app.customer(), login = page.getByRole('form', { name: 'Bom te ver de novo' });
  await login.getByLabel('E-mail', { exact: true }).fill(customer.input.email); await login.getByLabel('Senha', { exact: true }).fill(customer.input.password); await login.getByRole('button').click();
  await expect(page.getByRole('link', { name: 'Minha conta', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Catálogo', exact: true })).toHaveCount(0);
  await page.goto(app.origin + '/#/catalog-admin'); await expect(page.getByRole('heading', { name: 'Acesso restrito', exact: true })).toBeVisible();
  await expect(page.getByRole('form', { name: 'Nova edição', exact: true })).toHaveCount(0);
});
