import { useState } from 'react';
import { registerRootComponent } from 'expo';
import { ScrollView, Text, TextInput, View } from 'react-native';
import type { AccountView } from '@garimpo/contracts';
import { MobileAccountClient, errorMessage } from '../../../apps/mobile/src/features/account/client';
import { Checkout } from '../../../apps/mobile/src/features/checkout/Checkout';
import { Cart } from '../../../apps/mobile/src/features/cart/Cart';
import { MergeNotice } from '../../../apps/mobile/src/features/cart/MergeNotice';
import { Button, Field } from '../../../apps/mobile/src/features/catalog/Controls';
import { styles as s } from '../../../apps/mobile/src/features/catalog/styles';
/** RNW only: production feature/AsyncStorage/bearer, test-only in-memory refresh storage. No physical-device claim. */
function Preview() {
  const [client] = useState(() => { let token: string | null = null; return new MobileAccountClient(location.origin, { get: async () => token, set: async v => { token = v; }, clear: async () => { token = null; } }, globalThis.fetch.bind(globalThis)); });
  const [user, setUser] = useState<AccountView | null>(null), [screen, setScreen] = useState<'cart' | 'checkout' | 'payments'>('checkout'), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState(''), [readyFor, setReadyFor] = useState(''), [epoch, setEpoch] = useState(0);
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 18, backgroundColor: '#f4f0e7' }}><Text allowFontScaling accessibilityRole="header" style={s.title}>Garimpo</Text><Button title="Carrinho" onPress={() => setScreen('cart')} /><Button title="Finalizar compra" onPress={() => setScreen('checkout')} /><Button title="Pagamentos" onPress={() => setScreen('payments')} />
    {!user ? <View style={s.card}><Field label="E-mail" value={email} change={setEmail} /><TextInput accessibilityLabel="Senha" secureTextEntry allowFontScaling style={s.input} value={password} onChangeText={setPassword} /><Button title="Entrar" onPress={() => { setError(''); void client.login(email, password).then(v => { setPassword(''); setReadyFor(''); setUser(v); setEpoch(x => x + 1); }).catch(e => setError(errorMessage(e))); }} /></View> : <Button title="Sair" secondary onPress={() => { void client.logout().then(() => { setUser(null); setReadyFor(''); }).catch(e => setError(errorMessage(e))); }} />}
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : null}{user ? <MergeNotice key={user.id + ':' + epoch} user={user} client={client} open={() => setScreen('cart')} settled={setReadyFor} /> : null}
    {user && readyFor !== user.id ? <Text allowFontScaling style={s.text}>Conferindo carrinho deste aparelho…</Text> : screen === 'cart' ? <Cart key={'cart:' + (user?.id ?? '')} user={user} client={client} origin={location.origin} login={() => {}} browse={() => {}} checkout={() => setScreen('checkout')} /> : <Checkout key={screen + ':' + (user?.id ?? '')} user={user} client={client} mode={screen} login={() => {}} cart={() => setScreen('cart')} addresses={() => {}} />}
  </ScrollView>;
}
registerRootComponent(Preview);
