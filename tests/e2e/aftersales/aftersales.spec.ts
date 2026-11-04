import { randomUUID } from 'node:crypto';
import type { Page } from '@playwright/test';
import type { CustomerRecord, ExchangeView, OrderDetail } from '@garimpo/contracts';
import sharp from 'sharp';
import { test, expect, reserve, accept, confirm, signIn } from '../../orders/fixtures-ui';
import { send, session } from '../cart/http';
import type { startHarness } from '../account/harness.mjs';

type Harness = Awaited<ReturnType<typeof startHarness>>;
type Scenario = {
  customer: Awaited<ReturnType<Harness['customer']>>;
  data: { main: string };
  offer: { id: string };
  buyer: Awaited<ReturnType<typeof session>>;
  admin: Awaited<ReturnType<typeof session>>;
};

async function adminCommand<T>(app: Harness, path: string, method: 'POST' | 'PATCH', body: unknown) {
  const login = await send(app, '/auth/login', 'POST', JSON.stringify({ email: app.credentials.adminEmail, password: app.credentials.adminPassword }));
  expect(login.status).toBe(200);
  return send<T>(app, path, method, JSON.stringify(body), { Cookie: login.cookie, 'X-CSRF-Token': login.csrf, 'Idempotency-Key': randomUUID() });
}

async function purchase(page: Page, app: Harness, scenario: Scenario, delivered = true) {
  const checkout = await reserve(page, app, scenario.customer, scenario.data.main);
  await accept(page);
  await confirm(page);
  await page.getByRole('button', { name: 'Simular cartão', exact: true }).click();
  await expect(page.getByText(/Pagamento confirmado ·/)).toBeVisible();
  const id = (await app.purchaseState(checkout.id)).orders[0]!.id;
  let detail = (await scenario.buyer.call<OrderDetail>('/me/orders/' + id)).body;
  if (!delivered) return detail;
  for (const status of ['PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED'] as const) {
    const body = { version: detail.version, status, reason: 'Logística sintética conferida' };
    const command = status === 'SHIPPED' ? { ...body, trackingCode: 'AFTERSALE-ORIGINAL', postedAt: detail.serverTime }
      : status === 'DELIVERED' ? { ...body, deliveredAt: detail.serverTime } : body;
    const result = await adminCommand<OrderDetail>(app, '/admin/orders/' + id + '/status', 'PATCH', command);
    expect(result.status).toBe(200);
    detail = result.body;
  }
  return detail;
}
const support = (page: Page) => page.getByRole('region', { name: 'Pós-venda', exact: true });
async function openSupport(page: Page, app: Harness, orderId: string, internal = false) {
  await page.goto(app.origin + (internal ? '/#/orders-admin?id=' : '/#/orders?id=') + orderId);
  await page.getByRole('button', { name: 'Abrir pós-venda', exact: true }).click();
  await expect(support(page).getByRole('heading', { name: 'Atendimentos registrados', exact: true })).toBeVisible();
}
const local = (iso: string) => iso.slice(0, 23);
const loginAs = async (page: Page, app: Harness, email: string, password: string) => {
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await signIn(page, app, email, password);
};
const png = () => sharp({ create: { width: 3, height: 3, channels: 3, background: 'green' } }).png().toBuffer();

test('customer evidence, operator email posting for blocked account and admin refund failure are visible end to end', async ({ page, app, scenario }) => {
  const order = await purchase(page, app, scenario);
  await openSupport(page, app, order.id);
  const panel = support(page);
  await panel.getByLabel(/^Quantidade de /).fill('1');
  await panel.getByLabel('Motivo da solicitação', { exact: true }).fill('Solicitação sintética de devolução');
  await panel.getByRole('button', { name: 'Solicitar devolução', exact: true }).click();
  await expect(panel.getByRole('region', { name: 'Detalhes do atendimento' })).toContainText('Em análise');
  await panel.getByLabel('Selecionar evidência', { exact: true }).setInputFiles({ name: 'evidencia.png', mimeType: 'image/png', buffer: await png() });
  await panel.getByRole('button', { name: 'Enviar evidência', exact: true }).click();
  await panel.getByRole('button', { name: /^Ver evidência 1/ }).click();
  await expect(panel.getByRole('img', { name: 'Evidência privada selecionada' })).toBeVisible();

  const record = (await scenario.admin.call<CustomerRecord>('/admin/customers/' + scenario.customer.user.id)).body;
  const blocked = await adminCommand(app, '/admin/customers/' + scenario.customer.user.id + '/block', 'POST',
    { revision: record.revision, reason: 'Bloqueio sintético para verificar atendimento externo' });
  expect(blocked.status).toBe(200);
  await page.goto('about:blank');
  await signIn(page, app, app.credentials.operatorEmail, app.credentials.operatorPassword);
  await openSupport(page, app, order.id, true);
  await panel.getByRole('button', { name: /^Devolução .*Em análise/ }).click();
  await panel.getByLabel('Operação do atendimento').selectOption('approve');
  await panel.getByLabel('Justificativa da operação').fill('Solicitação conferida pela equipe');
  await panel.getByRole('button', { name: 'Aprovar solicitação', exact: true }).click();
  await expect(panel.getByText('Aguardando postagem', { exact: true })).toBeVisible();
  const actual = (await scenario.admin.call<OrderDetail>('/admin/orders/' + order.id)).body.serverTime;
  await panel.getByLabel('Operação do atendimento').selectOption('posting');
  await panel.getByLabel('Código de rastreamento', { exact: true }).fill('AFTERSALE-RETURN');
  await panel.getByLabel('Data e hora efetivas', { exact: true }).fill(local(actual));
  await panel.getByLabel('Referência do contato por e-mail').fill('Protocolo sintético do contato externo');
  await panel.getByLabel('Data e hora do contato por e-mail').fill(local(actual));
  await panel.getByRole('button', { name: 'Registrar postagem informada por e-mail', exact: true }).click();
  await expect(panel.getByText('Retorno em trânsito', { exact: true })).toBeVisible();
  await panel.getByLabel('Operação do atendimento').selectOption('receipt');
  await panel.getByLabel('Justificativa da operação').fill('Unidade recebida e conferida');
  await panel.getByLabel('Data e hora efetivas', { exact: true }).fill(local(actual));
  await panel.getByLabel(/^Inspeção da unidade /).selectOption('FIT');
  await panel.getByRole('button', { name: 'Registrar inspeção', exact: true }).click();
  await expect(panel.getByText('Aguardando autorização do estorno', { exact: true })).toBeVisible();
  await expect(panel.getByRole('option', { name: 'Autorizar estorno', exact: true })).toHaveCount(0);

  await loginAs(page, app, app.credentials.adminEmail, app.credentials.adminPassword);
  await openSupport(page, app, order.id, true);
  await panel.getByRole('button', { name: /^Devolução .*Aguardando autorização/ }).click();
  await panel.getByLabel('Operação do atendimento').selectOption('refund');
  await panel.getByLabel('Justificativa da operação').fill('Estorno acadêmico autorizado');
  await panel.getByLabel('Resultado no simulador').selectOption('FAILED');
  await panel.getByRole('button', { name: 'Autorizar estorno', exact: true }).click();
  await expect(panel.getByRole('heading', { name: 'Estorno com falha', exact: true })).toBeVisible();
  const restricted = (await scenario.admin.call<CustomerRecord>('/admin/customers/' + scenario.customer.user.id)).body;
  expect((await adminCommand(app, '/admin/customers/' + scenario.customer.user.id + '/unblock', 'POST',
    { revision: restricted.revision, reason: 'Atendimento sintético concluído' })).status).toBe(200);
  await loginAs(page, app, scenario.customer.input.email, scenario.customer.input.password);
  await openSupport(page, app, order.id);
  await panel.getByRole('button', { name: /^Devolução .*Devolução concluída/ }).click();
  await expect(panel.getByRole('heading', { name: 'Estorno com falha', exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('native renderer opens a durable exchange, uploads evidence and accepts the reserved substitute', async ({ page, app, scenario }) => {
  const order = await purchase(page, app, scenario);
  await page.getByRole('button', { name: 'Sair', exact: true }).click();
  await page.goto(app.origin + '/orders-mobile-preview.html');
  await page.getByRole('textbox', { name: 'E-mail', exact: true }).fill(scenario.customer.input.email);
  await page.getByRole('textbox', { name: 'Senha', exact: true }).fill(scenario.customer.input.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await page.getByRole('button', { name: 'Abrir pedido ' + order.id.slice(0, 8), exact: true }).click();
  await page.getByRole('button', { name: 'Abrir pós-venda', exact: true }).click();
  await page.getByRole('button', { name: 'Tipo de solicitação: Devolução', exact: true }).click();
  await page.getByRole('radio', { name: 'Troca', exact: true }).click();
  await page.getByRole('textbox', { name: /^Quantidade de / }).fill('1');
  await page.getByRole('textbox', { name: 'Motivo da solicitação', exact: true }).fill('Condição divergente em teste');
  const created = page.waitForResponse(response => response.url().endsWith('/exchanges') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Solicitar troca', exact: true }).click();
  const response = await created;
  expect(response.status()).toBe(201);
  const row = await response.json() as ExchangeView;
  expect(response.request().headers()['authorization']).toMatch(/^Bearer /);
  expect(response.request().headers()['cookie']).toBeUndefined();

  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Selecionar e enviar evidência', exact: true }).click();
  await (await chooser).setFiles({ name: 'troca.png', mimeType: 'image/png', buffer: await png() });
  await expect(page.getByRole('button', { name: 'Ver evidência 1', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ver evidência 1', exact: true }).click();
  await expect(page.getByLabel('Evidência privada selecionada', { exact: true })).toBeVisible();
  const operator = await session(app, app.credentials.operatorEmail, app.credentials.operatorPassword);
  const approved = await operator.call<ExchangeView>('/admin/exchanges/' + row.id + '/decision', 'POST',
    { version: row.version, decision: 'APPROVE', reason: 'Troca sintética conferida' });
  expect(approved.status).toBe(200);
  const offered = await operator.call<ExchangeView>('/admin/exchanges/' + row.id + '/substitute-offers', 'POST',
    { version: approved.body.version, offerId: scenario.offer.id, equivalenceReason: 'Mesma edição para teste' });
  expect(offered.status).toBe(200);
  await page.getByRole('button', { name: 'Atualizar atendimentos', exact: true }).click();
  await page.getByRole('button', { name: 'Aceitar substituto', exact: true }).click();
  await expect(page.getByText(/Mesma edição para teste · Aceita/)).toBeVisible();
});

test('buyer cancellation through the order panel closes the order and displays the refund', async ({ page, app, scenario }) => {
  const order = await purchase(page, app, scenario, false);
  await openSupport(page, app, order.id);
  await support(page).getByLabel('Motivo da solicitação', { exact: true }).fill('Desistência sintética antes da separação');
  await support(page).getByRole('button', { name: 'Confirmar cancelamento do pedido', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Detalhes do pedido ' + order.id.slice(0, 8) })).toContainText('Cancelado');
  expect((await scenario.buyer.call<OrderDetail>('/me/orders/' + order.id)).body.refunds.items[0]?.status).toBe('SUCCEEDED');
});
