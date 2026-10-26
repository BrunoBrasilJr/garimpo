import { useEffect, useId, useState } from 'react';
import type { AccountView } from '@garimpo/contracts';
import { Form } from '../../account/Form';
import { ClientError, readableError, request } from '../../account/client';

function Role({ value = 'OPERATOR' }: { value?: string }) {
  const id = useId();
  return <div className="account-field"><label htmlFor={id}>Papel</label><select id={id} name="role" defaultValue={value}><option value="OPERATOR">Operador</option><option value="ADMIN">Administrador</option></select></div>;
}
function AccessAction({ blocked }: { blocked: boolean }) {
  const id = useId();
  return <div className="account-field"><label htmlFor={id}>Ação</label><select id={id} name="action" defaultValue={blocked ? 'unblock' : 'block'}><option value="block">Bloquear</option><option value="unblock">Desbloquear</option><option value="deactivate">Inativar</option></select></div>;
}
export function Staff({ user, onUser, notify }: { user: AccountView; onUser: (value: AccountView | null) => void; notify: (value: string) => void }) {
  const [page, setPage] = useState(1), [version, setVersion] = useState(0), [rows, setRows] = useState<AccountView[]>([]), [total, setTotal] = useState(0), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    request<{ items: AccountView[]; total: number }>(`/admin/staff?page=${page}&pageSize=20`, 'GET', undefined, true, controller.signal)
      .then(value => { setRows(value.items); setTotal(value.total); setError(''); })
      .catch(cause => { if (!controller.signal.aborted) { setError(readableError(cause)); if (cause instanceof ClientError && cause.status === 401) onUser(null); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, version, onUser]);
  async function updated(id?: string) {
    if (id === user.id) { try { onUser(await request<AccountView>('/me')); } catch { onUser(null); } }
    setVersion(value => value + 1); notify('Conta interna atualizada.');
  }
  return <>
    <section className="account-card"><h2>Contas internas</h2><p>Administre os acessos da equipe. É necessário manter um administrador ativo.</p>
      {error ? <p role="alert">{error}</p> : null}{loading ? <p role="status">Carregando equipe…</p> : null}
      <p>Página {page} · {total} contas</p>
      <div className="account-actions"><button className="secondary" disabled={page === 1} onClick={() => { setLoading(true); setPage(value => value - 1); }}>Anterior</button>
        <button className="secondary" disabled={page * 20 >= total} onClick={() => { setLoading(true); setPage(value => value + 1); }}>Próxima</button></div>
    </section>
    <Form title="Adicionar pessoa à equipe" fields={[{ name: 'name', label: 'Nome completo', autoComplete: 'name' }, { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' },
      { name: 'password', label: 'Senha inicial', type: 'password', autoComplete: 'new-password', hint: 'De 15 a 128 caracteres. Compartilhe somente com o titular por um canal protegido.' }]} submit="Criar conta interna" onSubmit={async values => {
      await request('/admin/staff', 'POST', values); await updated();
    }}><Role /></Form>
    {rows.map(person => <article className="account-card" key={person.id} aria-label={`Conta de ${person.name}`}>
      <h3>{person.name}</h3><p>{person.email}</p><p>{person.inactiveAt ? 'Inativa' : person.blockedAt ? 'Bloqueada' : 'Ativa'} · {person.role === 'ADMIN' ? 'Administrador' : 'Operador'}</p>
      <Form key={person.name + person.role} title={`Editar ${person.name}`} fields={[{ name: 'name', label: 'Nome completo', value: person.name }]} submit="Salvar pessoa" onSubmit={async values => {
        await request(`/admin/staff/${person.id}`, 'PATCH', values); await updated(person.id);
      }}><Role value={person.role} /></Form>
      <Form title={`Corrigir e-mail de ${person.name}`} fields={[{ name: 'email', label: 'Novo e-mail', type: 'email', autoComplete: 'email' }]} submit="Pedir confirmação do novo e-mail" onSubmit={async values => {
        await request(`/admin/staff/${person.id}`, 'PATCH', values); notify('Confirmação enviada ao novo endereço. O anterior continua ativo até a confirmação.');
      }} />
      {!person.inactiveAt ? <Form title={`Alterar acesso de ${person.name}`} fields={[{ name: 'reason', label: 'Motivo da alteração' }]} submit="Aplicar alteração de acesso" onSubmit={async values => {
        const { action, reason } = values; await request(`/admin/staff/${person.id}/${action}`, 'POST', { reason }); await updated(person.id);
      }}><AccessAction blocked={Boolean(person.blockedAt)} /></Form> : null}
    </article>)}
  </>;
}
