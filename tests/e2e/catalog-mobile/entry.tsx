import { registerRootComponent } from 'expo';
import { ScrollView } from 'react-native';
import Catalog from '../../../apps/mobile/src/features/catalog/Catalog';

/** Same native feature, rendered through Expo's web adapter solely for automated verification. */
function Preview() {
  return <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: '#f4f0e7' }}><Catalog origin={location.origin} initialQuery={new URLSearchParams(location.search).get('query') ?? ''} /></ScrollView>;
}
registerRootComponent(Preview);
