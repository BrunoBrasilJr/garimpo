export interface AccountView {
  id: string;
  name: string;
  email: string;
  context: 'CUSTOMER' | 'STAFF';
  role: 'USER' | 'ADMIN' | 'OPERATOR';
  emailVerifiedAt: string | null;
  blockedAt: string | null;
  inactiveAt: string | null;
}

export interface AddressInput {
  recipient: string; zip: string; region: string; city: string;
  neighborhood: string; street: string; number: string; complement?: string;
}
