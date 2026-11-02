import { resolve } from 'node:path';
import type { CartView, CheckoutView } from '@garimpo/contracts';
import { test, expect, login, addNew } from './fixtures';
import { forwarded, send, session } from './http';

const key = 'garimpo.guestcart.v1';
test('visitor persists locally, merges adjusted new and unique used items once, and remains usable at narrow enlarged text', async ({ page, app, scenario }) => {
  await addNew(page, app.origin, scenario.data.main, 4);
  await page.getByRole('radio', { name: /Selecionar usado 2 por/ }).check();
  await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click();
  await page.goto(app.origin + '/#/cart'); await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByRole('timer')).toHaveCount(0); await page.reload(); await expect(page.getByRole('article')).toHaveCount(2);
  let merges = 0; page.on('request', request => { if (request.method() === 'POST' && request.url().endsWith('/me/cart/merge')) merges++; });
  await login(page, app.origin, scenario.customer.input.email, scenario.customer.input.password);
  await expect(page.getByRole('region', { name: 'Mescla do carrinho' })).toContainText('mesclado');
  await page.goto(app.origin + '/#/cart'); await expect(page.getByRole('article')).toHaveCount(2);
  await expect(page.getByRole('article').filter({ hasText: 'Novo' })).toContainText('quantidade no carrinho: 3');
  await expect(page.getByRole('article').filter({ hasText: 'Usado' })).toContainText('quantidade no carrinho: 1');
  await page.reload(); await expect(page.getByRole('article')).toHaveCount(2); expect(merges).toBe(1);
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await page.getByRole('button', { name: 'Atualizar carrinho e finalização', exact: true }).focus(); await expect(page.getByRole('button', { name: 'Atualizar carrinho e finalização', exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: resolve(app.directory, 'cart-narrow-enlarged.png'), fullPage: true });
});

test('changed price requires fresh confirmation; web and native renderer recover the same original checkout deadline', async ({ page, app, scenario }) => {
  await login(page, app.origin, scenario.customer.input.email, scenario.customer.input.password); await addNew(page, app.origin, scenario.data.main);
  await page.goto(app.origin + '/#/cart'); const confirm = page.getByRole('checkbox', { name: 'Conferi os itens e os valores atuais' });
  const reserve = page.getByRole('button', { name: 'Reservar conjunto por 15 minutos', exact: true }); await expect(reserve).toBeDisabled(); await confirm.check();
  const admin = await session(app, app.credentials.adminEmail, app.credentials.adminPassword);
  const detail = await admin.call<{ offers: { id: string; version: number; kind: string }[] }>('/admin/editions/' + scenario.data.main);
  const offer = detail.body.offers.find(value => value.kind === 'NEW')!;
  expect((await admin.call('/admin/offers/' + offer.id, 'PATCH', { version: offer.version, priceCents: 14000 })).status).toBe(200);
  const rejected = page.waitForResponse(response => response.url().endsWith('/checkouts') && response.request().method() === 'POST'); await reserve.click();
  expect((await rejected).status()).toBe(409); await expect(confirm).not.toBeChecked(); await expect(reserve).toBeDisabled(); await expect(page.getByRole('article')).toContainText('140,00');
  await confirm.check(); const created = page.waitForResponse(response => response.url().endsWith('/checkouts') && response.request().method() === 'POST'); await reserve.click();
  const resource = await (await created).json() as CheckoutView; expect(resource.status).toBe('ACTIVE');
  const active = page.getByRole('region', { name: 'Finalização em andamento', exact: true }); await expect(active).toHaveAttribute('data-checkout-id', resource.id);
  await page.reload(); await expect(active).toHaveAttribute('data-checkout-id', resource.id); await expect(active.locator('time')).toHaveAttribute('datetime', resource.expiresAt);
  const mobile = await page.context().newPage(); await mobile.goto(app.origin + '/cart-mobile-preview.html');
  await mobile.getByRole('textbox', { name: 'E-mail', exact: true }).fill(scenario.customer.input.email); await mobile.getByLabel('Senha', { exact: true }).fill(scenario.customer.input.password); await mobile.getByRole('button', { name: 'Entrar', exact: true }).click(); await expect(mobile.getByRole('button', { name: 'Sair', exact: true })).toBeVisible();
  const resumed = mobile.waitForResponse(response => response.url().endsWith('/me/checkout') && response.status() === 200); await mobile.getByRole('button', { name: 'Carrinho', exact: true }).click();
  const other = await (await resumed).json() as CheckoutView; expect(other.id).toBe(resource.id); expect(other.expiresAt).toBe(resource.expiresAt); await expect(mobile.getByTestId('active-checkout')).toBeVisible();
  app.advance(16 * 60 * 1000); await page.getByRole('button', { name: 'Atualizar carrinho e finalização', exact: true }).click(); await expect(active).toHaveCount(0); await expect(confirm).not.toBeChecked();
  await mobile.getByRole('button', { name: 'Atualizar carrinho e finalização', exact: true }).click(); await expect(mobile.getByTestId('active-checkout')).toHaveCount(0); await mobile.close();
});

test('lost successful merge response replays original durable command without doubling quantity', async ({ page, app, scenario }) => {
  await addNew(page, app.origin, scenario.data.main, 2); let first = true, original = '', originalKey = '', attempts = 0;
  await page.route('**/api/v1/me/cart/merge', async route => {
    attempts++; const request = route.request();
    if (first) { first = false; original = request.postData()!; originalKey = request.headers()['idempotency-key']!;
      const result = await send(app, '/me/cart/merge', 'POST', original, forwarded(await request.allHeaders())); expect(result.status).toBe(200); await route.abort('failed');
    } else { expect(request.postData()).toBe(original); expect(request.headers()['idempotency-key']).toBe(originalKey); await route.continue(); }
  });
  await login(page, app.origin, scenario.customer.input.email, scenario.customer.input.password); await expect(page.getByRole('button', { name: 'Tentar mesclar carrinho', exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).pending.length, key)).toBe(1);
  await page.getByRole('button', { name: 'Tentar mesclar carrinho', exact: true }).click(); await expect(page.getByRole('region', { name: 'Mescla do carrinho' })).toContainText('mesclado');
  await page.goto(app.origin + '/#/cart'); await expect(page.getByRole('article')).toContainText('quantidade no carrinho: 2'); expect(attempts).toBe(2);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).items.length, key)).toBe(0);
});

test('account change during merge cannot apply an old intent under the new cookie session', async ({ page, app, scenario }) => {
  await addNew(page, app.origin, scenario.data.main); const buyerB = await app.customer();
  let release!: () => void, reached!: () => void; const held = new Promise<void>(resolve => { release = resolve; }), arrived = new Promise<void>(resolve => { reached = resolve; }); let first = true;
  await page.route('**/api/v1/me/cart/merge', async route => {
    if (!first) { await route.continue(); return; } first = false;
    const headers = forwarded(await route.request().allHeaders()), body = route.request().postData()!; reached(); await held;
    const old = await send(app, '/me/cart/merge', 'POST', body, headers); expect(old.status).toBe(401);
    await route.fulfill({ status: old.status, contentType: 'application/json', body: old.raw });
  });
  await login(page, app.origin, scenario.customer.input.email, scenario.customer.input.password); await arrived;
  const other = await page.context().newPage(); await other.route('**/api/v1/me/cart/merge', route => route.abort('failed'));
  await other.goto(app.origin + '/#/profile'); await other.getByRole('button', { name: 'Sair', exact: true }).click();
  await login(other, app.origin, buyerB.input.email, buyerB.input.password);
  const rejected = page.waitForResponse(response => response.url().endsWith('/me/cart/merge') && response.status() === 403); release();
  expect((await (await rejected).json()).code).toBe('ACCOUNT_CONTEXT_CHANGED');
  const independent = await session(app, buyerB.input.email, buyerB.input.password); expect((await independent.call<CartView>('/me/cart')).body.items).toEqual([]);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).pending.length, key)).toBe(1); await other.close();
});

test('native shared components persist guest cart in AsyncStorage, merge on bearer login and reserve only after confirmation', async ({ page, app, scenario }) => {
  await page.goto(app.origin + '/cart-mobile-preview.html?id=' + scenario.data.main);
  await page.getByRole('radio', { name: /Selecionar oferta nova 1 por/ }).click(); await page.getByRole('button', { name: 'Adicionar ao carrinho', exact: true }).click();
  await expect(page.getByText('Adicionado ao carrinho. Adicionar não reserva estoque.', { exact: true })).toBeVisible(); await page.reload();
  await page.getByRole('button', { name: 'Carrinho', exact: true }).click(); await expect(page.getByRole('heading', { name: scenario.data.mainTitle, exact: true })).toBeVisible(); await expect(page.getByRole('timer')).toHaveCount(0);
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill(scenario.customer.input.email); await page.getByLabel('Senha', { exact: true }).fill(scenario.customer.input.password); await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.getByText(/Carrinho deste aparelho mesclado à sua conta/)).toBeVisible();
  const reserve = page.getByRole('button', { name: 'Reservar conjunto por 15 minutos', exact: true }); await expect(reserve).toBeDisabled(); await page.getByRole('checkbox', { name: 'Conferi os itens e os valores atuais', exact: true }).click();
  await reserve.click(); await expect(page.getByTestId('active-checkout')).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: resolve(app.directory, 'native-cart-narrow.png'), fullPage: true });
});

test('coupon replacement cancels the original hold, requires confirmation again and cart edits remain authoritative', async ({ page, app, scenario }) => {
  const admin = await session(app, app.credentials.adminEmail, app.credentials.adminPassword), suffix = scenario.data.main.replaceAll('-', '').slice(0, 12).toUpperCase();
  const codes = ['A' + suffix, 'B' + suffix];
  for (const [index, code] of codes.entries()) expect((await admin.call('/admin/coupons', 'POST', { code, type: 'FIXED', amount: (index + 1) * 1000, startsAt: '2020-01-01T00:00:00Z', endsAt: '2100-01-01T00:00:00Z', active: true })).status).toBe(201);
  await login(page, app.origin, scenario.customer.input.email, scenario.customer.input.password); await addNew(page, app.origin, scenario.data.main); await page.goto(app.origin + '/#/cart');
  const confirm = page.getByRole('checkbox', { name: 'Conferi os itens e os valores atuais' }), reserve = page.getByRole('button', { name: 'Reservar conjunto por 15 minutos', exact: true });
  await page.getByLabel('Código do cupom', { exact: true }).fill(codes[0]!); await page.getByRole('button', { name: 'Conferir cupom', exact: true }).click(); await expect(page.getByText(/desconto do cupom: R\$\s*10,00/)).toBeVisible();
  await confirm.check(); await reserve.click(); const active = page.getByRole('region', { name: 'Finalização em andamento', exact: true }); await expect(active).toBeVisible(); const original = await active.getAttribute('data-checkout-id');
  app.advance(2 * 60 * 1000); await page.getByLabel('Código do cupom', { exact: true }).fill(codes[1]!); await page.getByRole('button', { name: 'Conferir cupom', exact: true }).click();
  await expect(active).toHaveCount(0); await expect(page.getByText(/desconto do cupom: R\$\s*20,00/)).toBeVisible(); await expect(confirm).not.toBeChecked(); await expect(reserve).toBeDisabled();
  await confirm.check(); await reserve.click(); await expect(active).toBeVisible(); expect(await active.getAttribute('data-checkout-id')).not.toBe(original);
  await page.getByLabel('Quantidade de ' + scenario.data.mainTitle, { exact: true }).fill('2'); await page.getByRole('button', { name: 'Atualizar quantidade', exact: true }).click();
  await expect(active).toHaveCount(0); await expect(page.getByRole('article')).toContainText('quantidade no carrinho: 2'); await expect(confirm).not.toBeChecked();
  await page.getByRole('button', { name: 'Esvaziar carrinho da conta', exact: true }).click(); await expect(page.getByText('Seu carrinho está vazio.', { exact: true })).toBeVisible();
});
