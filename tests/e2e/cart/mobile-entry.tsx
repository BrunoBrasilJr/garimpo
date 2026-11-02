import { useState } from 'react';
import { registerRootComponent } from 'expo';
import { ScrollView, Text, TextInput, View } from 'react-native';
import type { AccountView } from '@garimpo/contracts';
import { MobileAccountClient, errorMessage } from '../../../apps/mobile/src/features/account/client';
import Catalog from '../../../apps/mobile/src/features/catalog/Catalog';
import { Button, Field } from '../../../apps/mobile/src/features/catalog/Controls';
import { styles as s } from '../../../apps/mobile/src/features/catalog/styles';
import { AddToCart } from '../../../apps/mobile/src/features/cart/Add';
import { Cart } from '../../../apps/mobile/src/features/cart/Cart';
import { MergeNotice } from '../../../apps/mobile/src/features/cart/MergeNotice';
/** Browser renderer only; production guest AsyncStorage and bearer feature code, test-only in-memory login token store. */
function Preview() {
  const [client] = useState(() => { let token: string | null = null; return new MobileAccountClient(location.origin, { get: async () => token, set: async value => { token = value; }, clear: async () => { token = null; } }, globalThis.fetch.bind(globalThis)); });
  const [user, setUser] = useState<AccountView | null>(null), [screen, setScreen] = useState('catalog'), [email, setEmail] = useState(''), [password, setPassword] = useState(''), [error, setError] = useState(''), [readyFor, setReadyFor] = useState(''), [epoch, setEpoch] = useState(0);
  const id = new URLSearchParams(location.search).get('id') ?? '';
  return <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f4f0e7', gap: 18 }}><View style={s.page}><Text allowFontScaling accessibilityRole="header" style={s.title}>Garimpo</Text><Button title="Explorar discos" secondary onPress={() => setScreen('catalog')} /><Button title="Carrinho" onPress={() => setScreen('cart')} />
    {!user ? <View style={s.card}><Field label="E-mail" value={email} change={setEmail} /><TextInput accessibilityLabel="Senha" secureTextEntry allowFontScaling style={s.input} value={password} onChangeText={setPassword} /><Button title="Entrar" onPress={() => { setError(''); void client.login(email, password).then(value => { setPassword(''); setReadyFor(''); setUser(value); setEpoch(value => value + 1); }).catch(cause => setError(errorMessage(cause))); }} /></View> : <Button title="Sair" secondary onPress={() => { void client.logout().then(() => { setUser(null); setReadyFor(''); }).catch(cause => setError(errorMessage(cause))); }} />}
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : null}
    {user ? <MergeNotice key={user.id + ':' + epoch} client={client} user={user} open={() => setScreen('cart')} settled={setReadyFor} /> : null}
    {screen === 'cart' ? user && readyFor !== user.id ? <Text allowFontScaling style={s.text}>Conferindo carrinho deste aparelho…</Text> : <Cart key={user?.id ?? 'visitor'} user={user} client={client} origin={location.origin} login={() => {}} browse={() => setScreen('catalog')} /> : <Catalog origin={location.origin} initialEdition={id} cart={(edition, offer) => <AddToCart key={(user?.id ?? 'visitor') + ':' + (offer?.id ?? '')} editionId={edition.id} offer={offer} user={user} client={client} open={() => setScreen('cart')} />} />}
  </View></ScrollView>;
}
registerRootComponent(Preview);
