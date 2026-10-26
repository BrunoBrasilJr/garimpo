import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { AccountView } from '@garimpo/contracts';
import { deviceClient } from '../features/account/device';
import { MobileError, errorMessage } from '../features/account/client';
import { AccountForm } from '../features/account/Form';
import type { MobileField } from '../features/account/Form';

type Screen = 'login' | 'register' | 'reset' | 'confirm' | 'change-confirm' | 'profile' | 'addresses';
interface Address { id: string; recipient: string; zip: string; region: string; city: string; neighborhood: string; street: string; number: string; complement?: string | null }
const email: MobileField = { name: 'email', label: 'E-mail', email: true };
const password: MobileField = { name: 'password', label: 'Senha', secret: true };
const code: MobileField = { name: 'token', label: 'Código ou link recebido', secret: true };
const newPassword: MobileField = { name: 'newPassword', label: 'Nova senha', secret: true, newPassword: true };
function linkToken(value: string) {
  if (/^[\w-]{43}$/.test(value)) return value;
  try { const url = new URL(value); if (url.protocol === 'https:') return new URLSearchParams(url.hash.split('?')[1]).get('token') ?? ''; } catch { /* Validated by the API below. */ }
  return '';
}
function Button({ title, onPress }: { title: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" style={styles.link} onPress={onPress}><Text style={styles.linkText}>{title}</Text></Pressable>;
}
export default function App() {
  const [client] = useState(() => { try { return deviceClient(); } catch { return null; } });
  const [user, setUser] = useState<AccountView | null>(null), [screen, setScreen] = useState<Screen>('login'), [notice, setNotice] = useState(''), [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]), [editing, setEditing] = useState<Address | null>(null), [deleteId, setDeleteId] = useState('');
  const [exitFailed, setExitFailed] = useState(false);
  const epoch = useRef(0), leaving = useRef(false);
  useEffect(() => {
    let active = true;
    if (!client) { setLoading(false); setNotice('A conexão segura está indisponível. Tente novamente em instantes.'); return; }
    client.restore().then(value => { if (active) { setUser(value); if (value) setScreen('profile'); } }).catch(cause => { if (active) setNotice(errorMessage(cause)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [client]);
  async function call<T = Record<string, unknown>>(path: string, method = 'GET', values?: unknown, authenticated = true): Promise<T> {
    if (!client) throw new MobileError(0, {}, 'A conexão segura está indisponível. Tente novamente em instantes.');
    const generation = epoch.current;
    try {
      const result = await client.request<T>(path, method, values, authenticated);
      if (authenticated && generation !== epoch.current) throw new MobileError(401, {}, 'Entre para continuar.');
      return result;
    } catch (cause) {
      if (cause instanceof MobileError && cause.status === 401) { setUser(null); setScreen('login'); }
      throw cause;
    }
  }
  useEffect(() => {
    if (screen !== 'addresses' || !client || !user) return;
    let active = true;
    client.request<Address[]>('/me/addresses').then(value => { if (active) setAddresses(value); }).catch(cause => { if (active) setNotice(errorMessage(cause)); });
    return () => { active = false; };
  }, [screen, user, client]);
  async function refreshAddresses() { setAddresses(await call<Address[]>('/me/addresses')); }
  async function logout() {
    if (leaving.current) return;
    leaving.current = true;
    epoch.current++;
    try { await client?.logout(); setExitFailed(false); setNotice('Você saiu da sua conta.'); }
    catch (cause) { setExitFailed(true); setNotice(errorMessage(cause) + ' Não foi possível confirmar a saída completa.'); }
    finally { leaving.current = false; setUser(null); setAddresses([]); setEditing(null); setScreen('login'); }
  }
  const formProps = { notify: setNotice };
  function content() {
    if (loading) return <Text accessibilityRole="alert" style={styles.body}>Preparando seu acesso…</Text>;
    if (exitFailed) return <Button title="Tentar sair novamente" onPress={() => { void logout(); }} />;
    if (screen === 'register') return <AccountForm {...formProps} title="Crie sua conta" fields={[{ name: 'name', label: 'Nome completo' }, email, { ...password, newPassword: true }]} submit="Criar conta" onSubmit={async values => {
      await call('/auth/register', 'POST', values, false); setNotice('Conta criada! Confirme seu e-mail pelo link recebido e entre para continuar.'); setScreen('login');
    }} />;
    if (screen === 'reset') return <>
      <AccountForm {...formProps} title="Recuperar acesso" fields={[email]} submit="Pedir link de recuperação" onSubmit={async values => {
        const result = await call<{ message: string }>('/auth/password-reset', 'POST', values, false); setNotice(result.message);
      }} />
      <AccountForm {...formProps} title="Definir nova senha" fields={[code, newPassword]} submit="Alterar senha" onSubmit={async values => {
        await call('/auth/password-reset/confirm', 'POST', { ...values, token: linkToken(values.token ?? '') }, false);
        epoch.current++; setUser(null); setScreen('login'); setNotice('Senha alterada. Entre novamente.');
      }} />
    </>;
    if (screen === 'confirm' || screen === 'change-confirm') return <>
      <AccountForm {...formProps} title={screen === 'confirm' ? 'Confirmar e-mail' : 'Confirmar novo e-mail'} fields={[code]} submit="Confirmar endereço" onSubmit={async values => {
        await call(`/auth/${screen === 'confirm' ? 'email-verification' : 'email-change'}/confirm`, 'POST', { token: linkToken(values.token ?? '') }, false);
        if (user) { setUser(await call<AccountView>('/me')); setScreen('profile'); }
        else setScreen('login');
        setNotice('E-mail confirmado.');
      }} />
      {screen === 'confirm' ? <><AccountForm {...formProps} title="Receber outro link" fields={[email]} submit="Reenviar confirmação" onSubmit={async values => {
        const result = await call<{ message: string }>('/auth/email-verification', 'POST', values, false); setNotice(result.message);
      }} /><Button title="Confirmar alteração de e-mail" onPress={() => setScreen('change-confirm')} /></> : null}
    </>;
    if (user && screen === 'addresses') return <>
      <View style={styles.card}><Text style={styles.subtitle} accessibilityRole="header">Seus endereços</Text>
        {!addresses.length ? <Text style={styles.body}>Nenhum endereço cadastrado.</Text> : addresses.map(address => <View key={address.id} style={styles.address}>
          <Text style={styles.body}>{address.recipient}</Text><Text style={styles.body}>{address.street}, {address.number} · {address.city}/{address.region} · {address.zip}</Text>
          <Button title={`Editar endereço de ${address.recipient}`} onPress={() => setEditing(address)} />
          <Button title={`Excluir endereço de ${address.recipient}`} onPress={() => setDeleteId(address.id)} />
          {deleteId === address.id ? <AccountForm {...formProps} title="Confirmar exclusão do endereço" fields={[]} submit="Confirmar exclusão" onSubmit={async () => {
            await call(`/me/addresses/${address.id}`, 'DELETE'); setDeleteId(''); await refreshAddresses(); setNotice('Endereço excluído.');
          }} /> : null}
        </View>)}
      </View>
      <AccountForm {...formProps} key={editing?.id ?? addresses.length} title={editing ? 'Editar endereço' : 'Novo endereço'} fields={([
        ['recipient', 'Destinatário'], ['zip', 'CEP (8 números)'], ['region', 'UF (2 letras maiúsculas)'], ['city', 'Cidade'],
        ['neighborhood', 'Bairro'], ['street', 'Rua'], ['number', 'Número'], ['complement', 'Complemento']
      ] as const).map(([name, label]) => ({ name, label, value: editing?.[name] ?? '', optional: name === 'complement', numeric: name === 'zip' }))} submit={editing ? 'Salvar endereço' : 'Adicionar endereço'} onSubmit={async values => {
        await call(editing ? `/me/addresses/${editing.id}` : '/me/addresses', editing ? 'PATCH' : 'POST', values);
        setEditing(null); await refreshAddresses(); setNotice('Endereço salvo.');
      }} />
      {editing ? <Button title="Cancelar edição" onPress={() => setEditing(null)} /> : null}
    </>;
    if (user && screen === 'profile') return <>
      <View style={styles.card}><Text style={styles.subtitle} accessibilityRole="header">Seu perfil</Text><Text style={styles.body}>{user.name}</Text><Text style={styles.body}>{user.email}</Text>
        <Text style={styles.badge}>{user.emailVerifiedAt ? 'E-mail confirmado' : 'E-mail ainda não confirmado'}</Text>
        <Button title="Atualizar perfil" onPress={() => { void call<AccountView>('/me').then(setUser).catch(cause => setNotice(errorMessage(cause))); }} />
        {!user.emailVerifiedAt ? <Button title="Confirmar meu e-mail" onPress={() => setScreen('confirm')} /> : null}
      </View>
      <AccountForm {...formProps} key={user.name} title="Como podemos chamar você?" fields={[{ name: 'name', label: 'Nome completo', value: user.name }]} submit="Salvar nome" onSubmit={async values => { setUser(await call<AccountView>('/me', 'PATCH', values)); setNotice('Nome atualizado.'); }} />
      <AccountForm {...formProps} title="Alterar e-mail" fields={[{ ...email, label: 'Novo e-mail' }]} submit="Enviar confirmação" onSubmit={async values => { await call('/me/email-change', 'POST', values); setNotice('Confirme o novo endereço pelo link recebido. O e-mail atual continua válido até lá.'); }} />
      <Button title="Confirmar alteração de e-mail" onPress={() => setScreen('change-confirm')} />
    </>;
    return <><AccountForm {...formProps} title="Bom te ver de novo" fields={[email, password]} submit="Entrar" onSubmit={async values => {
      if (!client) throw new MobileError(0, {}, 'A conexão segura está indisponível. Tente novamente em instantes.');
      setUser(await client.login(values.email ?? '', values.password ?? '')); setScreen('profile'); setNotice('Você entrou na sua conta.');
    }} /><Button title="Esqueci minha senha" onPress={() => setScreen('reset')} /></>;
  }
  return <SafeAreaView style={styles.screen}><StatusBar style="dark" /><KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.brand} accessibilityRole="header">◉ Garimpo</Text><Text style={styles.eyebrow}>DISCOS E DESCOBERTAS</Text>
      <Text style={styles.title} accessibilityRole="header">Sua próxima boa história.</Text>
      <Text style={styles.body}>Um lugar para quem gosta de descobrir música e guardar boas histórias em vinil.</Text>
      <View style={styles.navigation}>{user ? <><Button title="Minha conta" onPress={() => setScreen('profile')} /><Button title="Endereços" onPress={() => setScreen('addresses')} /><Button title="Sair" onPress={() => { void logout(); }} /></> :
        <><Button title="Entrar" onPress={() => setScreen('login')} /><Button title="Criar conta" onPress={() => setScreen('register')} /><Button title="Recuperar acesso" onPress={() => setScreen('reset')} /><Button title="Confirmar e-mail" onPress={() => setScreen('confirm')} /></>}</View>
      {notice ? <Text style={styles.notice} accessibilityRole="alert" accessibilityLiveRegion="polite">{notice}</Text> : null}
      <View key={screen} style={styles.panels}>{content()}</View>
      <Text style={styles.footer}>Garimpo · Música que encontra você.</Text>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f4f0e7' }, content: { padding: 24, paddingBottom: 48, gap: 20 },
  brand: { fontSize: 28, fontWeight: '700', color: '#173c32' }, eyebrow: { fontSize: 12, letterSpacing: 2, color: '#36594c', fontWeight: '700' },
  title: { fontSize: 38, fontWeight: '700', color: '#173c32' }, subtitle: { fontSize: 25, fontWeight: '700', color: '#173c32' }, body: { fontSize: 17, lineHeight: 26, color: '#173c32' },
  navigation: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, link: { minHeight: 48, justifyContent: 'center', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#829183' },
  linkText: { color: '#173c32', fontSize: 16, textDecorationLine: 'underline' }, panels: { gap: 20 }, card: { padding: 20, borderWidth: 1, borderColor: '#c9cbbd', borderRadius: 16, backgroundColor: '#fcfaf4', gap: 16 },
  address: { borderTopWidth: 1, borderTopColor: '#c9cbbd', paddingTop: 20, gap: 12 }, badge: { color: '#173c32', fontSize: 15, backgroundColor: '#e2e9d9', padding: 10, borderRadius: 8 },
  notice: { fontSize: 16, lineHeight: 25, color: '#173c32', padding: 16, borderLeftWidth: 4, borderLeftColor: '#365f3f', backgroundColor: '#e2e9d9' }, footer: { color: '#52624e', fontSize: 14 }
});
