const localDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' });
function dayAt(time: number) { const p = localDay.formatToParts(new Date(time)), n = (type: string) => Number(p.find(p => p.type === type)!.value); return n('year') * 10000 + n('month') * 100 + n('day'); }
export function calendarDay(value: string) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01' || value > '9999-12-31') return false; const date = new Date(value + 'T12:00:00Z'); return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value; }
/** First real instant of a São Paulo calendar date, including historical midnight DST gaps. */
export function dayStart(value: string) {
  if (!calendarDay(value)) throw new Error('Invalid calendar date.');
  const nominal = Date.parse(value + 'T00:00:00Z'), target = Number(value.replaceAll('-', '')); let low = nominal - 86400000, high = nominal + 2 * 86400000;
  while (low < high) { const middle = low + Math.floor((high - low) / 2); if (dayAt(middle) < target) low = middle + 1; else high = middle; }
  return new Date(low);
}
export function afterDay(value: string) { const date = new Date(value + 'T12:00:00Z'); date.setUTCDate(date.getUTCDate() + 1); return dayStart(date.toISOString().slice(0, 10)); }
