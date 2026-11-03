import { useEffect, useState } from 'react';
export function useServerNow(serverTime?: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const parsed = Date.parse(serverTime ?? ''), offset = Number.isFinite(parsed) ? parsed - Date.now() : 0; setNow(Date.now() + offset); const timer = setInterval(() => setNow(Date.now() + offset), 1000); return () => clearInterval(timer); }, [serverTime]);
  return now;
}
export function Deadline({ expiresAt, now, label }: { expiresAt: string; now: number; label: string }) {
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
  return <div><p>{label}: <time dateTime={expiresAt}>{new Date(expiresAt).toLocaleString('pt-BR')}</time></p><p role="timer" aria-live="off" aria-label={label}>{seconds ? `Tempo restante: ${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}min ${seconds % 60}s` : 'Prazo encerrado. Atualize para conferir o estado no servidor.'}</p></div>;
}
