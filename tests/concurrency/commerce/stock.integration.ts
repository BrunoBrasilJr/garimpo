import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { foundation, credentials } from '../../accounts/lifecycle/fixtures.ts';

let fixture: Awaited<ReturnType<typeof foundation>>;
beforeAll(async () => { fixture = await foundation(undefined, '023'); });
afterAll(async () => { await fixture?.close(); });

test('two real transactions cannot reserve and remove the same last unit', async () => {
  const buyer = await fixture.customer();
  const offer = await fixture.offer('USED');
  const draft = await fixture.draft(buyer, offer.id);
  const headers = (session: typeof buyer) => ({ ...credentials(session), 'Idempotency-Key': randomUUID() });
  await fixture.control.query('BEGIN');
  await fixture.control.query('SELECT id FROM "Edition" WHERE id=$1 FOR UPDATE', [offer.editionId]);
  const requests = Promise.all([
    fixture.server.call('/checkouts', 'POST', draft, headers(buyer)),
    fixture.server.call('/admin/offers/' + offer.id + '/stock-adjustments', 'POST',
      { delta: -1, reason: 'Disputa sintética pelo saldo' }, headers(fixture.admin))
  ]);
  let waiting = false;
  try {
    for (let attempt = 0; attempt < 150; attempt++) {
      await fixture.control.query('SELECT pg_stat_clear_snapshot()');
      const result = await fixture.control.query(
        "SELECT count(*)::int AS total FROM pg_stat_activity WHERE application_name='TASK023_A' AND wait_event_type='Lock'"
      );
      if (result.rows[0].total >= 2) { waiting = true; break; }
      await delay(20);
    }
  } finally {
    await fixture.control.query('ROLLBACK');
  }
  const [reservation, adjustment] = await requests;
  expect(waiting).toBe(true);
  expect([[201, 409], [409, 201]]).toContainEqual([reservation.status, adjustment.status]);
  const actual = await fixture.db.offer.findUniqueOrThrow({ where: { id: offer.id } });
  const held = await fixture.db.reservation.count({ where: { offerId: offer.id, status: 'ACTIVE' } });
  expect(held).toBe(reservation.status === 201 ? 1 : 0);
  expect(actual.stockOnHand).toBe(held);
});
