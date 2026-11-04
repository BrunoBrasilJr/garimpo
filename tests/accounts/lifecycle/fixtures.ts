import { randomBytes, randomUUID } from 'node:crypto';
import { AccessMessages } from '../../../apps/api/src/modules/messaging/service.ts';
import { MessageProtection } from '../../../apps/api/src/modules/messaging/protection.ts';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Client } from 'pg';
import sharp from 'sharp';
import type { CartView, CheckoutQuote, CheckoutView, FreightRateView } from '@garimpo/contracts';
import { createDatabase } from '../../../apps/api/src/persistence/client.ts';
import { Accounts } from '../../../apps/api/src/modules/accounts/service.ts';
import type { SessionBundle } from '../../../apps/api/src/modules/accounts/service.ts';
import { firstAdmin, createStaff } from '../../../apps/api/src/modules/accounts/staff/service.ts';
import { Catalog } from '../../../apps/api/src/modules/catalog/service.ts';
import { PublicImageStore } from '../../../apps/api/src/modules/media/store.ts';
import { Freight } from '../../../apps/api/src/modules/freight/service.ts';
import { Carts } from '../../../apps/api/src/modules/cart/service.ts';
import { Orders } from '../../../apps/api/src/modules/orders/service.ts';
import { CheckoutQuotes } from '../../../apps/api/src/modules/checkout/quotes.ts';
import { Payments } from '../../../apps/api/src/modules/payments/service.ts';
import { LocalGateway } from '../../../apps/api/src/modules/payments/gateway.ts';
import type { PaymentGateway } from '../../../apps/api/src/modules/payments/gateway.ts';
import { OrderHistory } from '../../../apps/api/src/modules/orders/history.ts';
import { Logistics } from '../../../apps/api/src/modules/orders/logistics.ts';
import { Pricing } from '../../../apps/api/src/modules/pricing/service.ts';
import { openCatalogServer, web } from '../../catalog/http.ts';
export const credentials = (session: SessionBundle) => web({ cookie: `__Host-garimpo-access=${session.accessToken}; __Host-garimpo-refresh=${session.refreshToken}; __Host-garimpo-csrf=${session.csrfToken}`, csrf: session.csrfToken });
export async function foundation(wrap?: (gateway: LocalGateway) => PaymentGateway) {
  const value = process.env.TEST_DATABASE_URL; if (!value) throw new Error('Separate test database required.');
  const url = new URL(value), schema = url.searchParams.get('schema'); if (url.pathname !== '/garimpo_test' || !/^task022_[a-f0-9]{32}$/.test(schema ?? '')) throw new Error('Only isolated TASK-022 schema accepted.');
  let current = Date.now(), nextZip = 10000000; const clock = { now: () => new Date(current) }, advance = (milliseconds: number) => { current += milliseconds; };
  url.searchParams.set('application_name', 'TASK022_A'); const db = createDatabase(url.href); url.searchParams.set('application_name', 'TASK022_B'); const other = createDatabase(url.href);
  const accounts = new Accounts(db, clock), secondAccounts = new Accounts(other, clock), freight = new Freight(accounts), secondFreight = new Freight(secondAccounts), carts = new Carts(accounts), orders = new Orders(accounts), secondOrders = new Orders(secondAccounts), quotes = new CheckoutQuotes(accounts), pricing = new Pricing(accounts);
  const password = 'Frase sintética comprida para testar frete e pedidos!', adminEmail = randomUUID() + '@example.invalid', operatorEmail = randomUUID() + '@example.invalid';
  await firstAdmin(accounts, { name: 'Admin sintético', email: adminEmail, password }); let admin = await accounts.login(adminEmail, password);
  await createStaff(accounts, admin.accessToken, { name: 'Operador sintético', email: operatorEmail, password, role: 'OPERATOR' }); let operator = await accounts.login(operatorEmail, password);
  const mediaRoot = await mkdtemp(join(tmpdir(), 'garimpo-lifecycle-')), catalog = new Catalog(accounts, new PublicImageStore(mediaRoot));
  const artist = await catalog.changeMetadata(admin.accessToken, 'artist', 'Artista sintético ' + randomUUID()), genre = await catalog.changeMetadata(admin.accessToken, 'genre', 'Gênero sintético ' + randomUUID());
  const png = await sharp({ create: { width: 5, height: 5, channels: 3, background: 'gold' } }).png().toBuffer();
  const gateway = new LocalGateway(db, clock), port = wrap ? wrap(gateway) : gateway, payments = new Payments(accounts, port), secondPayments = new Payments(secondAccounts, new LocalGateway(other, clock));
  const history = new OrderHistory(accounts), logistics = new Logistics(accounts), secondLogistics = new Logistics(secondAccounts);
  const encryptionKey = randomBytes(32).toString('hex'), technicalSecret = randomBytes(32).toString('base64url'); const messages = new AccessMessages(accounts, new MessageProtection(encryptionKey, technicalSecret), 'https://localhost:5173');
  const server = await openCatalogServer({ db, clock, mediaRoot }, undefined, undefined, { gateway: port }, { db, clock, mode: 'local-test', encryptionKey, technicalSecret, webOrigin: 'https://localhost:5173' }); const control = new Client({ connectionString: value }); await control.connect(); await control.query(`SET search_path TO "${schema}"`);
  async function freshRoles() { if (admin.accessExpiresAt <= clock.now()) admin = await accounts.login(adminEmail, password); if (operator.accessExpiresAt <= clock.now()) operator = await accounts.login(operatorEmail, password); }
  async function customer(verified = true) { const email = randomUUID() + '@example.invalid'; const row = await accounts.register({ name: 'Cliente sintético', email, password }); if (verified) await db.user.update({ where: { id: row.id }, data: { emailVerifiedAt: clock.now() } }); return accounts.login(email, password); }
  async function offer(kind: 'NEW' | 'USED' = 'NEW', stock = 20, priceCents = 10000) {
    await freshRoles(); const edition = await catalog.createEdition(admin.accessToken, { title: 'Compra sintética ' + randomUUID(), format: 'LP', artistIds: [artist.id], genreIds: [genre.id], primaryGenreId: genre.id });
    await catalog.upload(admin.accessToken, 'edition', edition.id, png, 'image/png', 'Capa sintética'); await catalog.updateEdition(admin.accessToken, edition.id, { active: true });
    let row = await catalog.createOffer(admin.accessToken, edition.id, kind === 'NEW' ? { kind, stockOnHand: stock, priceCents, active: true } : { kind, stockOnHand: 1, priceCents, discGrade: 'VG+', sleeveGrade: 'NM', particulars: 'Conferência de teste isolado', active: false }, randomUUID());
    if (kind === 'USED') { await catalog.upload(admin.accessToken, 'offer', row.id, png, 'image/png', 'Foto própria sintética'); row = await catalog.updateOffer(admin.accessToken, row.id, { version: row.version, active: true }); }
    return row;
  }
  async function rate(served = true): Promise<FreightRateView & { zip: string }> {
    await freshRoles(); const startZip = String(nextZip).padStart(8, '0'), endZip = String(nextZip + 99999).padStart(8, '0'); nextZip += 100000;
    return { ...await freight.create(admin.accessToken, { region: 'Área sintética ' + startZip, served, amountCents: served ? 1500 : null, deliveryDays: served ? 5 : null, ranges: [{ startZip, endZip }] }), zip: startZip };
  }
  async function address(buyer: SessionBundle, zip: string) {
    const row = await accounts.addresses(buyer.accessToken, 'CREATE', { recipient: 'Titular sintético', zip, region: 'SP', city: 'Cidade de teste', neighborhood: 'Bairro', street: 'Rua de teste', number: '1' }); if (Array.isArray(row)) throw new Error('Expected created address.'); return row;
  }
  async function draft(buyer: SessionBundle, offerId: string, quantity = 1, couponCode?: string) {
    const cart = await carts.read(buyer.accessToken); await carts.change(buyer.accessToken, { type: 'ADD', version: cart.version, offerId, quantity }, randomUUID());
    const current: CartView = await carts.read(buyer.accessToken, couponCode); if (current.pricing.status !== 'READY') throw new Error('Expected priced synthetic cart: ' + current.pricing.code);
    return { version: current.version, pricingRevision: current.pricing.revision, ...(couponCode ? { couponCode } : {}) };
  }
  async function ready(buyer: SessionBundle, extra: { offer?: Awaited<ReturnType<typeof offer>>; rate?: Awaited<ReturnType<typeof rate>>; quantity?: number; couponCode?: string } = {}) {
    const product = extra.offer ?? await offer(), area = extra.rate ?? await rate(), destination = await address(buyer, area.zip), preview = await draft(buyer, product.id, extra.quantity ?? 1, extra.couponCode);
    // No injected count: this exercises actual router composition and the real Order table.
    const reserved = await server.call<CheckoutView>('/checkouts', 'POST', preview, { ...credentials(buyer), 'Idempotency-Key': randomUUID() }); if (reserved.status !== 201) throw new Error('Default reservation failed: ' + reserved.status + ':' + JSON.stringify(reserved.body));
    const quote = await server.call<CheckoutQuote>('/checkout/quote', 'POST', { checkoutId: reserved.body.id, addressId: destination.id }, credentials(buyer)); if (quote.status !== 200) throw new Error('Owned quote failed: ' + quote.status);
    const accepted = await server.call<CheckoutView>('/checkouts/' + reserved.body.id + '/address', 'PATCH', { version: reserved.body.version, addressId: destination.id, freightRevision: quote.body.freightRevision }, credentials(buyer)); if (accepted.status !== 200) throw new Error('Freight acceptance failed: ' + accepted.status);
    return { checkout: accepted.body, quote: quote.body, offer: product, rate: area, address: destination, key: randomUUID(), body: { checkoutId: accepted.body.id, version: accepted.body.version, addressId: destination.id, freightRevision: quote.body.freightRevision, method: 'PIX' as const } };
  }
  return { password, messages, history, logistics, secondLogistics, gateway, payments, secondPayments, db, other, accounts, secondAccounts, freight, secondFreight, carts, orders, secondOrders, quotes, pricing, catalog, clock, advance, server, control, freshRoles, customer, offer, rate, address, draft, ready,
    get admin() { return admin; }, get operator() { return operator; }, async close() { await server.close(); await control.end(); await Promise.all([db.$disconnect(), other.$disconnect()]); } };
}
