import { resolve } from 'node:path';
import type { OrderDetail } from '@garimpo/contracts';
import { test, expect, reserve, accept, confirm, signIn } from './fixtures-ui';

test('operator and admin record actual original fulfillment, customer history preserves snapshots and rejects staff access', async ({ page, app, scenario }) => {
  const checkout = await reserve(page, app, scenario.customer, scenario.data.main); await accept(page); await confirm(page);
  await page.getByRole('button', { name: 'Simular cartão', exact: true }).click();
  await expect(page.getByText(/Pagamento confirmado ·/)).toBeVisible();
  const state = await app.purchaseState(checkout.id), id = state.orders[0]!.id;
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await signIn(page, app, app.credentials.operatorEmail, app.credentials.operatorPassword);
  await page.getByRole('link', { name: 'Pedidos e logística', exact: true }).click();
  await page.getByLabel('E-mail do cliente', { exact: true }).fill(scenario.customer.input.email); await page.getByRole('button', { name: 'Aplicar filtros da equipe', exact: true }).click();
  await page.getByRole('link', { name: 'Administrar pedido ' + id.slice(0, 8), exact: true }).click();
  for (const name of ['Registrar em separação', 'Registrar separado']) { await page.getByRole('button', { name, exact: true }).click(); }
  await expect(page.getByRole('heading', { name: 'Próxima etapa: Enviado', exact: true })).toBeVisible();
  await page.getByLabel('Código de rastreamento original', { exact: true }).fill('SYNTHETIC-ORIGINAL-021');
  const shipped = page.waitForResponse(r => r.url().endsWith('/admin/orders/' + id + '/status') && r.request().method() === 'PATCH');
  await page.getByRole('button', { name: 'Registrar enviado', exact: true }).click(); expect((await shipped).status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Próxima etapa: Entregue', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sair', exact: true }).click(); await signIn(page, app, app.credentials.adminEmail, app.credentials.adminPassword);
  await page.goto(app.origin + '/#/orders-admin?id=' + id);
  const delivered = page.waitForResponse(r => r.url().endsWith('/admin/orders/' + id + '/status') && r.request().method() === 'PATCH');
  await page.getByRole('button', { name: 'Registrar entregue', exact: true }).click(); expect((await delivered).status()).toBe(200);
  await expect(page.getByText('Não há próxima etapa de envio original para o estado atual.', { exact: true })).toBeVisible();
  const detail = (await scenario.buyer.call<OrderDetail>('/me/orders/' + id)).body;
  expect(detail.events.map(e => e.toStatus)).toEqual(['PAID', 'PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED']);
  expect(detail.shipment?.deliveredAt).not.toBeNull(); expect(detail.unitStates.every(u => u.deliveredAt === detail.shipment!.deliveredAt)).toBe(true);
  await page.getByRole('button', { name: 'Sair', exact: true }).click(); await signIn(page, app, scenario.customer.input.email, scenario.customer.input.password);
  await page.goto(app.origin + '/#/orders?id=' + id);
  const region = page.getByRole('region', { name: 'Detalhes do pedido ' + id.slice(0, 8), exact: true });
  await expect(region.getByRole('status')).toContainText('Entregue'); await expect(region.getByRole('region', { name: 'Remessa original', exact: true })).toContainText('SYNTHETIC-ORIGINAL-021');
  await expect(region.getByRole('heading', { name: 'Pedido ' + id.slice(0, 8), exact: true })).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: resolve(app.directory, 'history-web-narrow-enlarged.png'), fullPage: true });
  await page.goto(app.origin + '/#/orders-admin?id=' + id); await expect(page.getByRole('heading', { name: 'Acesso restrito', exact: true })).toBeVisible();
});

test('a fresh native client finds and pays a boleto created on the web without local purchase references', async ({ page, app, scenario }) => {
  const checkout = await reserve(page, app, scenario.customer, scenario.data.main); await accept(page);
  await page.getByRole('radio', { name: 'Boleto', exact: true }).check(); await confirm(page);
  await page.getByRole('button', { name: 'Criar pedido com boleto', exact: true }).click();
  await expect(page.getByText('Aguardando pagamento', { exact: true })).toBeVisible();
  const initial = await app.purchaseState(checkout.id), id = initial.orders[0]!.id, deadline = initial.orders[0]!.expiresAt!.toISOString();
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await page.goto(app.origin + '/orders-mobile-preview.html');
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill(scenario.customer.input.email); await page.getByRole('textbox', { name: 'Senha', exact: true }).fill(scenario.customer.input.password);
  const requested = page.waitForRequest(r => r.url().includes('/me/orders?') && r.headers()['x-garimpo-client'] === 'mobile');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click(); const request = await requested;
  expect(request.headers()['cookie']).toBeUndefined(); expect(request.headers()['authorization']).toMatch(/^Bearer /);
  await page.getByRole('button', { name: 'Abrir pedido ' + id.slice(0, 8), exact: true }).click();
  const history = page.getByTestId('history-order-' + id); await expect(history).toContainText('Aguardando pagamento'); await expect(history).toContainText('Rua da música');
  await page.getByRole('button', { name: 'Consultar e simular pagamentos', exact: true }).click();
  const order = page.getByTestId('purchase-order-' + id); await expect(order).toContainText('Aguardando pagamento');
  await order.getByRole('button', { name: 'Executar simulação deste pagamento', exact: true }).click(); await expect(order).toContainText('Cobrança paga');
  await page.getByRole('button', { name: 'Meus pedidos', exact: true }).click(); await page.getByRole('button', { name: 'Abrir pedido ' + id.slice(0, 8), exact: true }).click(); await expect(history).toContainText('Pago');
  const final = await app.purchaseState(checkout.id); expect(final.orders).toHaveLength(1); expect(final.orders[0]!.expiresAt!.toISOString()).toBe(deadline); expect(final.events.filter(e => e.type === 'SALE')).toHaveLength(1);
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { for (const e of document.querySelectorAll<HTMLElement>('[dir="auto"]')) { const size = parseFloat(getComputedStyle(e).fontSize); e.style.setProperty('font-size', size * 2 + 'px', 'important'); e.style.setProperty('line-height', '1.5', 'important'); } });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true); await history.scrollIntoViewIfNeeded(); await page.screenshot({ path: resolve(app.directory, 'history-rnw-narrow-enlarged.png'), fullPage: true });
});

test('two staff editors detect stale versions and refresh before advancing; foreign order detail stays private', async ({ page, app, scenario }) => {
  const checkout = await reserve(page, app, scenario.customer, scenario.data.main); await accept(page); await confirm(page); await page.getByRole('button', { name: 'Simular cartão', exact: true }).click(); await expect(page.getByText(/Pagamento confirmado ·/)).toBeVisible();
  const id = (await app.purchaseState(checkout.id)).orders[0]!.id;
  await page.getByRole('button', { name: 'Sair', exact: true }).click(); await signIn(page, app, app.credentials.operatorEmail, app.credentials.operatorPassword);
  await page.goto(app.origin + '/#/orders-admin?id=' + id); await expect(page.getByRole('button', { name: 'Registrar em separação', exact: true })).toBeEnabled();
  const second = await page.context().newPage();
  try {
    await second.goto(app.origin + '/#/orders-admin?id=' + id); await second.getByRole('button', { name: 'Registrar em separação', exact: true }).click(); await expect(second.getByRole('button', { name: 'Registrar separado', exact: true })).toBeVisible();
    const conflict = page.waitForResponse(r => r.url().endsWith('/status') && r.request().method() === 'PATCH');
    await page.getByRole('button', { name: 'Registrar em separação', exact: true }).click(); expect((await conflict).status()).toBe(409); await expect(page.getByRole('alert')).toBeVisible();
    await page.getByRole('button', { name: 'Conferir pedido atualizado', exact: true }).click(); await expect(page.getByRole('button', { name: 'Registrar separado', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Registrar separado', exact: true }).click(); await expect(page.getByRole('heading', { name: 'Próxima etapa: Enviado', exact: true })).toBeVisible();
  } finally { await second.close(); }
  expect((await scenario.buyer.call<OrderDetail>('/me/orders/' + id)).body.events.map(e => e.toStatus)).toEqual(['PAID', 'PREPARING', 'SEPARATED']);
  const other = await app.customer(); await page.getByRole('button', { name: 'Sair', exact: true }).click(); await signIn(page, app, other.input.email, other.input.password);
  await page.goto(app.origin + '/#/orders?id=' + id); await expect(page.getByRole('alert')).toContainText('Pedido não encontrado nesta conta.'); await expect(page.getByText('Rua da música', { exact: false })).toHaveCount(0);
});
