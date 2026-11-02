import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuestCartStore } from '@garimpo/contracts';
const guestListeners = new Set<() => void>(), accountListeners = new Set<() => void>();
/** Visitor item IDs/quantities only. Login refresh credentials remain exclusively in SecureStore. */
export const guestCart = new GuestCartStore({ get: () => AsyncStorage.getItem('garimpo.guestcart.v1'), set: async value => { await AsyncStorage.setItem('garimpo.guestcart.v1', value); for (const listener of guestListeners) listener(); } });
export function subscribeGuest(listener: () => void) { guestListeners.add(listener); return () => { guestListeners.delete(listener); }; }
export function subscribeAccountCart(listener: () => void) { accountListeners.add(listener); return () => { accountListeners.delete(listener); }; }
export function accountCartChanged() { for (const listener of accountListeners) listener(); }
