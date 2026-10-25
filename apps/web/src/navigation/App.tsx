import { useEffect, useRef, useState } from 'react';
import type { AccountView } from '@garimpo/contracts';
import { Access } from '../features/account/Access';
import { Profile } from '../features/account/Profile';
import { Staff } from '../features/admin/staff/Staff';
import { readableError, request } from '../features/account/client';
import { readRoute } from './route';
import '../features/account/account.css';

export default function App() {
  const [route, setRoute] = useState(() => readRoute(location.hash)), [user, setUser] = useState<AccountView | null>(null), [loading, setLoading] = useState(true), [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const changed = () => setRoute(readRoute(location.hash));
    window.addEventListener('hashchange', changed); return () => window.removeEventListener('hashchange', changed);
  }, []);
  useEffect(() => {
    if (route.token) history.replaceState(null, '', location.pathname + location.search + '#/' + route.name);
    heading.current?.focus();
  }, [route.name, route.token]);
  useEffect(() => {
    const controller = new AbortController();
    request<AccountView>('/me', 'GET', undefined, true, controller.signal).then(setUser).catch(cause => {
      if (!controller.signal.aborted && (!(cause instanceof Error) || !('status' in cause) || cause.status !== 401)) setNotice(readableError(cause));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);
  function navigate(name: string) { location.hash = '#/' + name; }
  async function logout() {
    try { await request('/auth/logout', 'POST', {}, false); setNotice('Você saiu da sua conta.'); setUser(null); navigate('login'); }
    catch (cause) { setNotice(readableError(cause)); }
  }
  const accountRoute = route.name === 'profile' || route.name === 'staff';
  return <div className="account-site">
    <a className="account-skip" href="#account-main" onClick={event => { event.preventDefault(); document.getElementById('account-main')?.focus(); }}>Pular para o conteúdo</a>
    <header className="account-header"><a href="#/login" className="account-brand"><span aria-hidden="true">◉</span> Garimpo</a>
      <nav aria-label="Navegação principal">{user ? <><a href="#/profile">Minha conta</a>{user.context === 'STAFF' && user.role === 'ADMIN' ? <a href="#/staff">Equipe</a> : null}<button className="secondary" onClick={() => { void logout(); }}>Sair</button></> : <><a href="#/login">Entrar</a><a href="#/register">Criar conta</a></>}</nav>
    </header>
    <main id="account-main" className="account-shell" tabIndex={-1}>
      <aside className="account-intro"><p className="eyebrow">DISCOS E DESCOBERTAS</p><h1 ref={heading} tabIndex={-1}>Sua próxima<br />boa história.</h1><p>Um lugar para quem gosta de descobrir música e guardar boas histórias em vinil.</p><div className="account-record" aria-hidden="true"><span>g.</span></div><p className="account-caption">Comece pela sua conta.<br />O catálogo chega em breve.</p></aside>
      <div className="account-panels">{notice ? <div role="status" className="account-notice">{notice}</div> : null}
        {loading ? <section className="account-card" role="status">Preparando seu acesso…</section> :
          route.name === 'staff' && user ? user.context === 'STAFF' && user.role === 'ADMIN' ? <Staff user={user} onUser={setUser} notify={setNotice} /> : <section className="account-card"><h2>Acesso restrito</h2><p>Somente administradores podem gerenciar a equipe.</p></section> :
          route.name === 'profile' && user ? <Profile user={user} onUser={setUser} notify={setNotice} /> :
          <Access key={route.name} route={accountRoute ? { name: 'login', token: '' } : route} onUser={setUser} navigate={navigate} notify={setNotice} />}
      </div>
    </main><footer className="account-footer">Garimpo · Música que encontra você.</footer>
  </div>;
}
