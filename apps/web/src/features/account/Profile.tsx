import { useEffect, useState } from 'react';
import type { AccountView } from '@garimpo/contracts';
import { request, readableError } from './client';
import { Form } from './Form';
export interface Address { id: string; recipient: string; zip: string; region: string; city: string; neighborhood: string; street: string; number: string; complement?: string | null }
const addressFields = [
  ['recipient', 'Destinatário'], ['zip', 'CEP (8 números)'], ['region', 'UF (2 letras)'], ['city', 'Cidade'],
  ['neighborhood', 'Bairro'], ['street', 'Rua'], ['number', 'Número'], ['complement', 'Complemento']
] as const;
export function Profile({ user, onUser, notify }: { user: AccountView; onUser: (user: AccountView) => void; notify: (message: string) => void }) {
  const [addresses, setAddresses] = useState<Address[]>([]), [editing, setEditing] = useState<Address | null>(null), [removeId, setRemoveId] = useState(''), [error, setError] = useState('');
  async function reload() { setAddresses(await request<Address[]>('/me/addresses')); }
  useEffect(() => {
    if (user.context !== 'CUSTOMER') return;
    const controller = new AbortController();
    request<Address[]>('/me/addresses', 'GET', undefined, true, controller.signal).then(setAddresses).catch(cause => { if (!controller.signal.aborted) setError(readableError(cause)); });
    return () => controller.abort();
  }, [user.id, user.context]);
  if (user.context === 'STAFF') return <section className="account-card"><h2>Sua conta interna</h2><p>{user.name}</p><p>{user.email}</p><p>{user.role === 'ADMIN' ? 'Administrador' : 'Operador'}</p></section>;
  return <>
    <section className="account-card"><h2>Seu perfil</h2><p>{user.email}</p><p className="account-badge">{user.emailVerifiedAt ? 'E-mail confirmado' : 'E-mail ainda não confirmado'}</p>
      {!user.emailVerifiedAt ? <Form title="Confirmação de e-mail" fields={[]} submit="Reenviar link" onSubmit={async () => {
        const value = await request<{ message: string }>('/auth/email-verification', 'POST', { email: user.email }, false); notify(value.message);
      }} /> : null}
    </section>
    <Form key={user.name} title="Como podemos chamar você?" fields={[{ name: 'name', label: 'Nome completo', autoComplete: 'name', value: user.name }]} submit="Salvar nome" onSubmit={async values => {
      onUser(await request<AccountView>('/me', 'PATCH', values)); notify('Nome atualizado.');
    }} />
    <Form title="Alterar e-mail" fields={[{ name: 'email', label: 'Novo e-mail', type: 'email', autoComplete: 'email' }]} submit="Enviar confirmação" onSubmit={async values => {
      await request('/me/email-change', 'POST', values); notify('Confirme o novo endereço pelo link recebido. Seu e-mail atual continua válido até lá.');
    }} />
    <section className="account-card"><h2>Seus endereços</h2>{error ? <p role="alert">{error}</p> : null}
      {!addresses.length ? <p>Nenhum endereço cadastrado.</p> : <ul className="address-list">{addresses.map(address => <li key={address.id}>
        <strong>{address.recipient}</strong><p>{address.street}, {address.number} · {address.city}/{address.region} · {address.zip}</p>
        <button className="secondary" onClick={() => { setEditing(address); setRemoveId(''); }}>Editar endereço de {address.recipient}</button>
        <button className="secondary" onClick={() => setRemoveId(address.id)}>Excluir endereço de {address.recipient}</button>
        {removeId === address.id ? <Form title="Confirmar exclusão do endereço" fields={[]} submit="Confirmar exclusão" onSubmit={async () => {
          await request(`/me/addresses/${address.id}`, 'DELETE'); setRemoveId(''); await reload(); notify('Endereço excluído.');
        }} /> : null}
      </li>)}</ul>}
    </section>
    <Form key={editing?.id ?? 'new'} title={editing ? 'Editar endereço' : 'Novo endereço'} fields={addressFields.map(([name, label]) => ({ name, label, value: editing?.[name] ?? '', required: name !== 'complement',
      ...(name === 'zip' ? { pattern: '[0-9]{8}', inputMode: 'numeric' as const } : {}), ...(name === 'region' ? { pattern: '[A-Z]{2}', hint: 'Use duas letras maiúsculas.' } : {}) }))} submit={editing ? 'Salvar endereço' : 'Adicionar endereço'} onSubmit={async values => {
      await request(editing ? `/me/addresses/${editing.id}` : '/me/addresses', editing ? 'PATCH' : 'POST', values); setEditing(null); await reload(); notify('Endereço salvo.');
    }} />
    {editing ? <button className="secondary" onClick={() => setEditing(null)}>Cancelar edição</button> : null}
  </>;
}
