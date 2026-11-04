export interface Route { name: string; token: string; query?: string }
const routes = new Set(['login', 'register', 'password-reset', 'email-verification', 'email-change', 'profile', 'staff', 'catalog-admin', 'catalog', 'edition', 'saved', 'reviews-admin', 'pricing-admin', 'cart', 'freight-admin', 'checkout', 'payments', 'orders', 'orders-admin', 'customers-admin', 'reactivation']);
export function readRoute(hash: string): Route {
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?');
  return { name: routes.has(path) ? path : 'login', token: new URLSearchParams(query).get('token') ?? '', ...(['catalog', 'edition', 'orders', 'orders-admin', 'customers-admin'].includes(path) ? { query } : {}) };
}
