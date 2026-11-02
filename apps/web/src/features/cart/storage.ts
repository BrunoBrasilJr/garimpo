import { GuestCartStore } from '@garimpo/contracts';
const key = 'garimpo.guestcart.v1';
export const guestCart = new GuestCartStore({ get: async () => localStorage.getItem(key), set: async value => { localStorage.setItem(key, value); window.dispatchEvent(new Event('garimpo-guestcart')); } },
  work => navigator.locks ? navigator.locks.request('garimpo-guestcart', work) : work());
export const guestStorageKey = key;
