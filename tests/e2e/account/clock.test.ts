import { expect, test } from 'vitest';
import { fixtureClock } from './clock.mjs';

test('manual fixture keeps new cookie expiry in the future after a browser inspection lasts over 15 minutes', () => {
  let browserTime = Date.UTC(2026, 9, 25, 20);
  const manual = fixtureClock(true, () => browserTime);
  browserTime += 35 * 60000;
  const expires = new Date(manual.clock.now().getTime() + 15 * 60000);
  expect(expires.getTime() - browserTime).toBe(15 * 60000);
  manual.advance(16 * 60000);
  expect(manual.clock.now().getTime() - browserTime).toBe(16 * 60000);
  expect(browserTime).toBe(Date.UTC(2026, 9, 25, 20, 35));
});

test('automated fixture remains deterministic when wall time moves until its explicit advance', () => {
  let wall = Date.UTC(2026, 9, 25, 20);
  const controlled = fixtureClock(false, () => wall);
  const start = controlled.clock.now().getTime();
  wall += 35 * 60000;
  expect(controlled.clock.now().getTime()).toBe(start);
  controlled.advance(16 * 60000);
  expect(controlled.clock.now().getTime()).toBe(start + 16 * 60000);
});
