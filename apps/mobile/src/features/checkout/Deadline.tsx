import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { styles as s } from '../catalog/styles';
export function useServerNow(serverTime?: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const parsed = Date.parse(serverTime ?? ''), offset = Number.isFinite(parsed) ? parsed - Date.now() : 0; setNow(Date.now() + offset); const timer = setInterval(() => setNow(Date.now() + offset), 1000); return () => clearInterval(timer); }, [serverTime]);
  return now;
}
export function Deadline({ expiresAt, now, label }: { expiresAt: string; now: number; label: string }) {
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));
  return <View><Text allowFontScaling style={s.text}>{label}: {new Date(expiresAt).toLocaleString('pt-BR')}</Text><Text allowFontScaling accessibilityLiveRegion="none" accessibilityLabel={label} style={s.text}>{seconds ? `Tempo restante: ${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}min ${seconds % 60}s` : 'Prazo encerrado. Atualize para conferir o estado no servidor.'}</Text></View>;
}
