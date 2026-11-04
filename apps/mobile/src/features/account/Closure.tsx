import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { AccountView, ClosureResult } from '@garimpo/contracts';
import { guestTag } from '@garimpo/contracts';
import { MobileAccountClient, errorMessage } from './client';
import { Button } from '../catalog/Controls';
import { styles as s } from '../catalog/styles';
export function Closure({ user, client, closed }: { user: AccountView; client: MobileAccountClient; closed: (message: string, cleanupFailed: boolean) => void }) {
  const [confirmed, setConfirmed] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const alive = useRef(true), executing = useRef(false), controller = useRef<AbortController | null>(null), key = useRef('closure.' + guestTag());
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort(); }; }, []);
  async function submit() {
    if (!confirmed || executing.current) return; executing.current = true; setSaving(true); setError(''); const operation = new AbortController(); controller.current = operation;
    try {
      const result = await client.request<ClosureResult>('/me/closure', 'POST', { confirm: true }, true, { signal: operation.signal, accountId: user.id, idempotencyKey: key.current });
      try { await client.forgetClosedAccount(); } catch (cause) { if (alive.current) closed(result.message + ' ' + errorMessage(cause), true); return; }
      if (alive.current) closed(result.message, false);
    } catch (cause) { if (alive.current && !operation.signal.aborted) setError(errorMessage(cause) + ' Se a resposta se perdeu, confira o acesso antes de repetir.'); }
    finally { executing.current = false; if (alive.current) setSaving(false); }
  }
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.heading}>Encerrar minha conta</Text><Text allowFontScaling style={s.text}>Você sairá de todos os aparelhos. A finalização reservada e os pedidos pendentes serão cancelados. Pedidos pagos e histórico serão preservados para atendimento.</Text><Text allowFontScaling style={s.text}>Encerrar não apaga imediatamente seus dados. A retenção ainda está pendente. Reativar exige confirmação pelo e-mail cadastrado, enquanto os dados estiverem retidos, e não remove bloqueio administrativo.</Text>{error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : null}<Pressable accessibilityRole="checkbox" accessibilityLabel="Entendi os efeitos e quero encerrar minha conta" accessibilityState={{ checked: confirmed, disabled: saving }} disabled={saving} onPress={() => setConfirmed(v => !v)} style={s.field}><Text allowFontScaling style={s.label}>{confirmed ? '☑ ' : '☐ '}Entendi os efeitos e quero encerrar minha conta</Text></Pressable><Button title={saving ? 'Encerrando conta…' : 'Confirmar encerramento da conta'} disabled={!confirmed || saving} onPress={() => { void submit(); }} /></View>;
}
