import AsyncStorage from '@react-native-async-storage/async-storage';
import { GuestCartStore } from '@garimpo/contracts';
/** Visitor item IDs/quantities only. Login refresh credentials remain exclusively in SecureStore. */
export const guestCart = new GuestCartStore({ get: () => AsyncStorage.getItem('garimpo.guestcart.v1'), set: value => AsyncStorage.setItem('garimpo.guestcart.v1', value) });
