export function fixtureClock(realtime = false, now = Date.now) {
  let current = now(), offset = 0;
  return {
    clock: { now: () => new Date(realtime ? now() + offset : current) },
    advance(milliseconds) { if (realtime) offset += milliseconds; else current += milliseconds; }
  };
}
