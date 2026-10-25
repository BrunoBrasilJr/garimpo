import type { AccountView } from '@garimpo/contracts';
import { Form } from './Form';
import { request } from './client';
import type { Route } from '../../navigation/route';

const email = { name: 'email', label: 'E-mail', type: 'email', autoComplete: 'email' };
const token = (value: string) => ({ name: 'token', label: 'Código do link', type: 'password', value });
const newPassword = { name: 'newPassword', label: 'Nova senha', type: 'password', autoComplete: 'new-password', hint: 'De 15 a 128 caracteres. Uma frase longa também vale.' };
export function Access({ route, onUser, navigate, notify }: { route: Route; onUser: (user: AccountView | null) => void; navigate: (name: string) => void; notify: (message: string) => void }) {
  if (route.name === 'register') return <Form title="Crie sua conta" fields={[{ name: 'name', label: 'Nome completo', autoComplete: 'name' }, email,
    { ...newPassword, name: 'password', label: 'Senha' }]} submit="Criar conta" onSubmit={async values => {
    await request('/auth/register', 'POST', values, false); notify('Conta criada! Confirme seu e-mail pelo link recebido e entre para continuar.'); navigate('login');
  }} />;
  if (route.name === 'password-reset') return <>
    <Form title="Recuperar acesso" fields={[email]} submit="Pedir link de recuperação" onSubmit={async values => {
      const result = await request<{ message: string }>('/auth/password-reset', 'POST', values, false); notify(result.message);
    }} />
    <Form key={route.token} title="Definir nova senha" fields={[token(route.token), newPassword]} submit="Alterar senha" onSubmit={async values => {
      await request('/auth/password-reset/confirm', 'POST', values, false); onUser(null); notify('Senha alterada. Entre novamente com a nova senha.'); navigate('login');
    }} />
  </>;
  if (route.name === 'email-verification' || route.name === 'email-change') return <>
    <Form key={route.token} title={route.name === 'email-change' ? 'Confirmar novo e-mail' : 'Confirmar e-mail'} fields={[token(route.token)]} submit="Confirmar endereço" onSubmit={async values => {
      await request(`/auth/${route.name}/confirm`, 'POST', values, false);
      try { onUser(await request<AccountView>('/me')); } catch { onUser(null); }
      notify('E-mail confirmado.'); navigate('profile');
    }} />
    {route.name === 'email-verification' ? <Form title="Receber outro link" fields={[email]} submit="Reenviar confirmação" onSubmit={async values => {
      const result = await request<{ message: string }>('/auth/email-verification', 'POST', values, false); notify(result.message);
    }} /> : null}
  </>;
  return <><Form title="Bom te ver de novo" fields={[email, { name: 'password', label: 'Senha', type: 'password', autoComplete: 'current-password' }]} submit="Entrar" onSubmit={async values => {
    const result = await request<{ user: AccountView }>('/auth/login', 'POST', values, false); onUser(result.user); navigate('profile'); notify('Você entrou na sua conta.');
  }} /><a href="#/password-reset">Esqueci minha senha</a><p>Ainda não tem conta? <a href="#/register">Cadastre-se</a></p></>;
}
