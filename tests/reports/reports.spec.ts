import { test, expect, reserve, accept, confirm, signIn } from '../orders/fixtures-ui';

test('ADMIN sees a paid cohort with its frozen values and OPERATOR cannot open the report', async ({ page, app, scenario }) => {
  const checkout = await reserve(page, app, scenario.customer, scenario.data.main);
  await accept(page); await confirm(page);
  await page.getByRole('button', { name: 'Simular cartão', exact: true }).click();
  await expect(page.getByText(/Pagamento confirmado ·/)).toBeVisible();
  const order = (await app.purchaseState(checkout.id)).orders[0]!;
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(order.paidAt!);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await signIn(page, app, app.credentials.adminEmail, app.credentials.adminPassword);
  await page.getByRole('link', { name: 'Relatórios', exact: true }).click();
  await page.getByLabel('Data inicial (São Paulo)', { exact: true }).fill(day);
  await page.getByLabel('Data final (São Paulo)', { exact: true }).fill(day);
  await page.getByRole('button', { name: 'Consultar relatórios', exact: true }).click();
  const ticket = page.getByRole('region', { name: 'Ticket médio', exact: true });
  await expect(ticket).toContainText('1 pedidos mantidos');
  await expect(ticket).toContainText('1 unidades');
  await expect(page.getByRole('region', { name: 'Gêneros mais vendidos', exact: true })).toContainText('1 unidades mantidas');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await signIn(page, app, app.credentials.operatorEmail, app.credentials.operatorPassword);
  await expect(page.getByRole('link', { name: 'Relatórios', exact: true })).toHaveCount(0);
  await page.goto(app.origin + '/#/reports');
  await expect(page.getByRole('heading', { name: 'Acesso restrito', exact: true })).toBeVisible();
});
