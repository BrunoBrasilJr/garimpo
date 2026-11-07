import { randomUUID, createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { performance } from 'node:perf_hooks';
import { cpus, release, totalmem } from 'node:os';
import { execFileSync } from 'node:child_process';
import { afterAll, beforeAll, expect, test } from 'vitest';
import type { CheckoutView, CheckoutQuote, OrderCreationView, PaymentView, SalesReport } from '@garimpo/contracts';
import { credentials, foundation } from '../accounts/lifecycle/fixtures.ts';

type Metric = 'search' | 'reservation' | 'quote' | 'order' | 'payment' | 'reports';
interface Profile { id: string; editions: number; tracksPerEdition: number; customers: number; concurrency: number;
  baselinePaidOrders: number; iterationsPerCustomer: number; samplesPerOperation: number; unexpectedErrorsAllowed: number; p95Milliseconds: Record<Metric, number> }
const profileBytes = readFileSync(new URL('./profile.json', import.meta.url));
const profile = JSON.parse(profileBytes.toString()) as Profile;
let f: Awaited<ReturnType<typeof foundation>>;
let offers: string[];
let actors: { buyer: Awaited<ReturnType<typeof f.customer>>; addressId: string; offerId: string }[];
const samples: { operation: Metric; milliseconds: number; status: number }[] = [];
beforeAll(async () => {
  f = await foundation(undefined, '030');
  const original = await f.offer('NEW', 500);
  const edition = await f.db.edition.findUniqueOrThrow({ where: { id: original.editionId }, include: { artists: true, images: true } });
  const image = edition.images[0]!, bytes = await readFile(join(f.mediaRoot, image.storageKey));
  const rows = Array.from({ length: profile.editions - 1 }, (_, index) => ({ editionId: randomUUID(), offerId: randomUUID(), imageId: randomUUID(), stock: index < profile.customers - 1 ? 500 : 20 }));
  await f.db.$transaction(async tx => {
    await tx.edition.createMany({ data: rows.map((row, index) => ({ id: row.editionId, title: 'Carga acadêmica ' + String(index).padStart(4, '0'), format: 'LP',
      primaryGenreId: edition.primaryGenreId, editionYear: 1970 + index % 55, active: true })) });
    await tx.editionArtist.createMany({ data: rows.map(row => ({ editionId: row.editionId, artistId: edition.artists[0]!.artistId })) });
    await tx.editionGenre.createMany({ data: rows.map(row => ({ editionId: row.editionId, genreId: edition.primaryGenreId })) });
  });
  await f.db.offer.createMany({ data: rows.map(row => ({ id: row.offerId, editionId: row.editionId, kind: 'NEW', priceCents: 10000, stockOnHand: row.stock, active: true })) });
  await f.db.stockMovement.createMany({ data: rows.map(row => ({ offerId: row.offerId, deltaOnHand: row.stock, balanceBefore: 0, balanceAfter: row.stock,
    offerVersion: 1, reason: 'Massa sintética do perfil de carga', originKey: 'PERFORMANCE_SEED:' + row.offerId, actorId: f.admin.user.id })) });
  await f.db.productImage.createMany({ data: rows.map(row => ({ id: row.imageId, editionId: row.editionId, storageKey: row.imageId + extname(image.storageKey),
    description: 'Capa sintética da carga', position: image.position, contentHash: image.contentHash, mimeType: image.mimeType, byteSize: image.byteSize, width: image.width, height: image.height })) });
  for (let offset = 0; offset < rows.length; offset += 50) await Promise.all(rows.slice(offset, offset + 50).map(row => writeFile(join(f.mediaRoot, row.imageId + extname(image.storageKey)), bytes, { mode: 0o600 })));
  const editionIds = [edition.id, ...rows.map(row => row.editionId)];
  const tracks = editionIds.flatMap(editionId => Array.from({ length: profile.tracksPerEdition }, (_, index) => ({ id: randomUUID(), editionId, position: index + 1, title: 'Faixa de carga ' + index, durationSeconds: 180 })));
  await f.db.track.createMany({ data: tracks });
  await f.db.trackArtist.createMany({ data: tracks.map(track => ({ trackId: track.id, artistId: edition.artists[0]!.artistId })) });
  offers = [original.id, ...rows.map(row => row.offerId)];
  actors = [];
  const area = await f.rate();
  for (let index = 0; index < profile.customers; index++) {
    const buyer = await f.customer(), address = await f.address(buyer, area.zip);
    actors.push({ buyer, addressId: address.id, offerId: offers[index]! });
  }
  expect(await f.db.edition.count({ where: { active: true } })).toBe(profile.editions);
  expect(await f.db.track.count()).toBe(profile.editions * profile.tracksPerEdition);
});
afterAll(async () => { await f?.close(); });

async function request<T>(operation: Metric, expected: number, measured: boolean, work: () => Promise<{ status: number; body: T }>): Promise<T> {
  const start = performance.now();
  const reply = await work();
  if (measured) samples.push({ operation, status: reply.status, milliseconds: performance.now() - start });
  if (reply.status !== expected) {
    const body = reply.body as { code?: unknown } | null;
    const code = body && typeof body.code === 'string' ? body.code : 'NO_CODE';
    throw new Error('Unexpected ' + operation + ' HTTP status ' + reply.status + ' (' + code + ')');
  }
  return reply.body;
}
async function cycle(actor: typeof actors[number], measured: boolean) {
  const search = await request('search', 200, measured, () => f.server.call<{ total: number }>('/editions?q=carga&pageSize=20'));
  expect(search.total).toBe(profile.editions);
  const headers = credentials(actor.buyer), draft = await f.draft(actor.buyer, actor.offerId);
  const reserved = await request('reservation', 201, measured, () => f.server.call<CheckoutView>('/checkouts', 'POST', draft, { ...headers, 'Idempotency-Key': randomUUID() }));
  const quote = await request('quote', 200, measured, () => f.server.call<CheckoutQuote>('/checkout/quote', 'POST', { checkoutId: reserved.id, addressId: actor.addressId }, headers));
  const accepted = await f.server.call<CheckoutView>('/checkouts/' + reserved.id + '/address', 'PATCH', { version: reserved.version, addressId: actor.addressId, freightRevision: quote.freightRevision }, headers);
  expect(accepted.status).toBe(200);
  const order = await request('order', 201, measured, () => f.server.call<OrderCreationView>('/orders', 'POST', {
    checkoutId: reserved.id, version: accepted.body.version, addressId: actor.addressId, freightRevision: quote.freightRevision, method: 'PIX'
  }, { ...headers, 'Idempotency-Key': randomUUID() }));
  const payment = await request('payment', 200, measured, () => f.server.call<PaymentView>('/orders/' + order.id + '/simulated-payments', 'POST', {
    chargeId: order.charges[0]!.id, scenario: 'APPROVED'
  }, { ...headers, 'Idempotency-Key': randomUUID() }));
  expect(payment.order?.status).toBe('PAID');
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(f.clock.now());
  const report = await request('reports', 200, measured, () => f.server.call<SalesReport>('/admin/reports/sales?from=' + day + '&to=' + day, 'GET', undefined, credentials(f.admin)));
  if (measured) expect(report.cohort.paidOrders).toBeGreaterThanOrEqual(profile.baselinePaidOrders);
}

test('frozen local workload meets its predeclared p95 and preserves all sales and stock', async () => {
  expect(profile.customers).toBe(profile.concurrency);
  expect(profile.baselinePaidOrders % profile.customers).toBe(0);
  // Establish the declared 100-order baseline first. Only the measured phase
  // applies the frozen ten-client concurrency; no retries hide measured errors.
  for (const actor of actors) for (let index = 0; index < profile.baselinePaidOrders / profile.customers; index++) await cycle(actor, false);
  expect(await f.db.order.count({ where: { status: 'PAID' } })).toBe(profile.baselinePaidOrders);
  for (const table of ['Edition', 'EditionArtist', 'EditionGenre', 'Track', 'TrackArtist', 'Offer', 'ProductImage', 'Order', 'OrderItem', 'OrderUnit', 'FinancialEvent', 'Checkout', 'CheckoutItem', 'Reservation', 'PaymentAttempt', 'PaymentCharge', 'User', 'Session']) await f.db.$executeRawUnsafe('ANALYZE "' + table + '"');
  const started = performance.now();
  const runs = await Promise.allSettled(actors.map(async actor => { for (let index = 0; index < profile.iterationsPerCustomer; index++) await cycle(actor, true); }));
  const failedRun = runs.find(result => result.status === 'rejected');
  const failure: unknown = failedRun?.status === 'rejected' ? failedRun.reason : undefined;
  const elapsed = performance.now() - started;
  const metrics = Object.fromEntries((Object.keys(profile.p95Milliseconds) as Metric[]).map(operation => {
    const durations = samples.filter(sample => sample.operation === operation).map(sample => sample.milliseconds).sort((a, b) => a - b);
    const percentile = (value: number) => durations[Math.ceil(value * durations.length) - 1] ?? null;
    return [operation, { samples: durations.length, p50: percentile(.5), p95: percentile(.95), max: durations.at(-1) ?? null, limitP95: profile.p95Milliseconds[operation] }];
  }));
  await mkdir('test-results/performance', { recursive: true, mode: 0o700 });
  await writeFile('test-results/performance/result.json', JSON.stringify({ profile: profile.id, profileSha256: createHash('sha256').update(profileBytes).digest('hex'),
    source: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), environment: { node: process.version, kernel: release(), cpu: cpus()[0]?.model, memoryBytes: totalmem() },
    elapsedMilliseconds: elapsed, unexpectedFailure: failure ? (failure instanceof Error ? failure.name : 'Unknown') : null, metrics, samples }, null, 2), { mode: 0o600 });
  if (failure) throw failure;
  console.info(JSON.stringify({ profile: profile.id, elapsedMilliseconds: elapsed, metrics }));
  for (const operation of Object.keys(profile.p95Milliseconds) as Metric[]) {
    expect(metrics[operation]!.samples).toBe(profile.samplesPerOperation);
    expect(metrics[operation]!.p95).toBeLessThanOrEqual(profile.p95Milliseconds[operation]);
  }
  expect(samples).toHaveLength(profile.samplesPerOperation * 6);
  const total = profile.baselinePaidOrders + profile.customers * profile.iterationsPerCustomer;
  expect(await f.db.order.count({ where: { status: 'PAID' } })).toBe(total);
  expect(await f.db.financialEvent.count({ where: { type: 'SALE' } })).toBe(total);
  expect(await f.db.reservation.count({ where: { status: 'ACTIVE' } })).toBe(0);
  for (const offerId of offers.slice(0, profile.customers)) expect(await f.db.offer.findUnique({ where: { id: offerId } })).toMatchObject({ stockOnHand: 500 - total / profile.customers });
});
