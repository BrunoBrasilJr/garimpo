import { useState } from 'react';
import { registerRootComponent } from 'expo';
import { ScrollView, Text, View } from 'react-native';
import { MobileAccountClient, errorMessage } from '../../apps/mobile/src/features/account/client';
import { Button, Field } from '../../apps/mobile/src/features/catalog/Controls';
import { EngagementActions, Saved } from '../../apps/mobile/src/features/engagement/Engagement';
import { styles as s } from '../../apps/mobile/src/features/catalog/styles';
/** Test-only store and browser renderer. Actual shared feature uses the real mobile bearer API. */
function Preview() {
  const [client] = useState(() => {
    let refresh: string | null = null;
    return new MobileAccountClient(location.origin, { get: async () => refresh, set: async value => { refresh = value; }, clear: async () => { refresh = null; } }, globalThis.fetch.bind(globalThis));
  });
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [ready, setReady] = useState(false), [saved, setSaved] = useState(false), [error, setError] = useState('');
  const editionId = new URLSearchParams(location.search).get('id') ?? '';
  return <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f4f0e7' }}>{!ready ? <View style={s.page}><Field label="E-mail" value={email} change={setEmail} /><Field label="Senha" value={password} change={setPassword} /><Button title="Entrar" onPress={() => { void client.login(email, password).then(() => setReady(true)).catch(cause => setError(errorMessage(cause))); }} />{error ? <Text accessibilityRole="alert">{error}</Text> : null}</View> : <>
    <Button title={saved ? 'Voltar à edição' : 'Meus desejos e alertas'} onPress={() => setSaved(value => !value)} />
    {saved ? <Saved client={client} open={() => setSaved(false)} /> : <EngagementActions client={client} editionId={editionId} />}
  </>}</ScrollView>;
}
registerRootComponent(Preview);
