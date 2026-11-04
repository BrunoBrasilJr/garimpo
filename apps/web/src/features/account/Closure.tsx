import { useEffect, useRef, useState } from 'react';
import type { AccountView, ClosureResult } from '@garimpo/contracts';
import { guestTag } from '@garimpo/contracts';
import { request, readableError } from './client';
import './closure.css';
export function Closure({ user, closed }: { user: AccountView; closed: (message: string) => void }) {
  const [confirmed, setConfirmed] = useState(false), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const key = useRef('closure.' + guestTag()), controller = useRef<AbortController | null>(null), active = useRef(true), executing = useRef(false), alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => { active.current = true; return () => { active.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => { if (error) alert.current?.focus(); }, [error]);
  async function submit() {
    if (!confirmed || executing.current) return; executing.current = true; setSaving(true); setError(''); const operation = new AbortController(); controller.current = operation;
    try { const result = await request<ClosureResult>('/me/closure', 'POST', { confirm: true }, true, operation.signal, { accountId: user.id, idempotencyKey: key.current }); if (active.current) closed(result.message); }
    catch (cause) { if (active.current && !operation.signal.aborted) setError(readableError(cause) + ' Se a resposta se perdeu, confira o acesso antes de repetir.'); }
    finally { executing.current = false; if (active.current) setSaving(false); }
  }
  return <form className="account-card account-closure" aria-label="Encerrar minha conta" aria-busy={saving} onSubmit={e => { e.preventDefault(); void submit(); }}><h2>Encerrar minha conta</h2><p>Você sairá de todos os aparelhos. A finalização reservada e os pedidos aguardando pagamento serão cancelados. Pedidos pagos e histórico serão preservados para atendimento.</p><p>Encerrar não apaga imediatamente seus dados. A política de retenção ainda está pendente. A reativação exige confirmação pelo e-mail cadastrado, enquanto os dados estiverem retidos, e não remove bloqueio administrativo.</p>{error ? <p role="alert" tabIndex={-1} ref={alert}>{error}</p> : null}<label><input type="checkbox" required checked={confirmed} disabled={saving} onChange={e => setConfirmed(e.target.checked)} />Entendi os efeitos e quero encerrar minha conta</label><button disabled={saving || !confirmed}>{saving ? 'Encerrando conta…' : 'Confirmar encerramento da conta'}</button></form>;
}
