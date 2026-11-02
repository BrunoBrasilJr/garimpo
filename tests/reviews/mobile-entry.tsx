import { useState } from 'react';
import { registerRootComponent } from 'expo';
import { ScrollView, Text, View } from 'react-native';
import { MobileAccountClient, errorMessage } from '../../apps/mobile/src/features/account/client';
import { Button, Field } from '../../apps/mobile/src/features/catalog/Controls';
import { ReviewSection } from '../../apps/mobile/src/features/reviews/Reviews';
import { styles as s } from '../../apps/mobile/src/features/catalog/styles';
function Preview() {
  const [client] = useState(() => { let token: string | null = null; return new MobileAccountClient(location.origin, { get: async () => token, set: async value => { token = value; }, clear: async () => { token = null; } }, globalThis.fetch.bind(globalThis)); });
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [ready, setReady] = useState(false), [error, setError] = useState('');
  const params = new URLSearchParams(location.search);
  return <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f4f0e7' }}>{!ready ? <View style={s.page}><Field label="E-mail" value={email} change={setEmail} /><Field label="Senha" value={password} change={setPassword} /><Button title="Entrar" onPress={() => { void client.login(email, password).then(() => setReady(true)).catch(cause => setError(errorMessage(cause))); }} />{error ? <Text accessibilityRole="alert">{error}</Text> : null}</View> : <ReviewSection origin={location.origin} editionId={params.get('id') ?? ''} orderId={params.get('orderId') ?? ''} client={client} />}</ScrollView>;
}
registerRootComponent(Preview);
