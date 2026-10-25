export interface Route { name: string; token: string }
const routes = new Set(['login', 'register', 'password-reset', 'email-verification', 'email-change', 'profile', 'staff']);
export function readRoute(hash: string): Route {
  const [path = '', query = ''] = hash.replace(/^#\/?/, '').split('?');
  return { name: routes.has(path) ? path : 'login', token: new URLSearchParams(query).get('token') ?? '' };
}
