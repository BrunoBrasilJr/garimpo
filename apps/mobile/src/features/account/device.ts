import * as SecureStore from 'expo-secure-store';
import { MobileAccountClient } from './client';

const key = 'garimpo.refresh.v1';
export function deviceClient() {
  const origin = process.env.EXPO_PUBLIC_API_ORIGIN;
  if (!origin) throw new Error('Configure EXPO_PUBLIC_API_ORIGIN with the trusted HTTPS API origin.');
  return new MobileAccountClient(origin, {
    get: () => SecureStore.getItemAsync(key),
    set: value => SecureStore.setItemAsync(key, value, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY }),
    clear: () => SecureStore.deleteItemAsync(key)
  });
}
