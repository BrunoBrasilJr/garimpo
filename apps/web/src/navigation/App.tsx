import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import type { AccountView } from '@garimpo/contracts';
import { Access } from '../features/account/Access';
import { Profile } from '../features/account/Profile';
import { Staff } from '../features/admin/staff/Staff';
import { readableError, request } from '../features/account/client';
import { readRoute } from './route';
import '../features/account/account.css';
import { MergeNotice } from '../features/cart/MergeNotice';
const CatalogAdmin = lazy(() => import('../features/admin/catalog/Catalog'));
const PublicCatalog = lazy(() => import('../features/catalog/Catalog'));
const Saved = lazy(() => import('../features/engagement/Engagement'));
const ReviewModeration = lazy(() => import('../features/admin/reviews/Reviews'));
const PricingAdmin = lazy(() => import('../features/admin/pricing/Pricing'));
const Cart = lazy(() => import('../features/cart/Cart'));

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
  const accountRoute = route.name === 'profile' || route.name === 'staff' || route.name === 'catalog-admin' || route.name === 'saved' || route.name === 'reviews-admin' || route.name === 'pricing-admin';
  const publicRoute = route.name === 'catalog' || route.name === 'edition';
  return <div className="account-site">
    <a className="account-skip" href="#account-main" onClick={event => { event.preventDefault(); document.getElementById('account-main')?.focus(); }}>Pular para o conteúdo</a>
    <header className="account-header"><a href="#/catalog" className="account-brand"><span aria-hidden="true">◉</span> Garimpo</a>
      <nav aria-label="Navegação principal"><a href="#/catalog">Explorar discos</a>{!user || user.context === 'CUSTOMER' ? <a href="#/cart">Carrinho</a> : null}{user ? <><a href="#/profile">Minha conta</a>{user.context === 'STAFF' ? <><a href="#/catalog-admin">Catálogo</a><a href="#/reviews-admin">Avaliações</a></> : null}{user.context === 'STAFF' && user.role === 'ADMIN' ? <><a href="#/staff">Equipe</a><a href="#/pricing-admin">Descontos</a></> : null}<button className="secondary" onClick={() => { void logout(); }}>Sair</button></> : <><a href="#/login">Entrar</a><a href="#/register">Criar conta</a></>}</nav>
    </header>
    <main id="account-main" className={'account-shell' + (route.name === 'catalog-admin' ? ' catalog-layout' : publicRoute ? ' public-layout' : '')} tabIndex={-1}>
      <aside className="account-intro"><p className="eyebrow">DISCOS E DESCOBERTAS</p><h1 ref={heading} tabIndex={-1}>Sua próxima<br />boa história.</h1><p>Um lugar para quem gosta de descobrir música e guardar boas histórias em vinil.</p><div className="account-record" aria-hidden="true"><span>g.</span></div><p className="account-caption">Encontre novas histórias.<br /><a href="#/catalog">Explore nosso catálogo.</a></p></aside>
      <div className="account-panels">{notice ? <div role="status" className="account-notice">{notice}</div> : null}
        {!loading && user?.context === 'CUSTOMER' ? <MergeNotice key={user.id} user={user} /> : null}
        {publicRoute ? <Suspense fallback={<p role="status">Carregando catálogo…</p>}><PublicCatalog mode={route.name === 'edition' ? 'edition' : 'catalog'} query={route.query ?? ''} user={user} ready={!loading} /></Suspense> : loading ? <section className="account-card" role="status">Preparando seu acesso…</section> :
          route.name === 'cart' ? <Suspense fallback={<p role="status">Carregando carrinho…</p>}><Cart key={user?.id ?? 'visitor'} user={user} /></Suspense> :
          route.name === 'catalog-admin' && user ? user.context === 'STAFF' ? <Suspense fallback={<p role="status">Carregando catálogo…</p>}><CatalogAdmin /></Suspense> : <section className="account-card"><h2>Acesso restrito</h2><p>Somente a equipe pode administrar o catálogo.</p></section> :
          route.name === 'staff' && user ? user.context === 'STAFF' && user.role === 'ADMIN' ? <Staff user={user} onUser={setUser} notify={setNotice} /> : <section className="account-card"><h2>Acesso restrito</h2><p>Somente administradores podem gerenciar a equipe.</p></section> :
          route.name === 'pricing-admin' && user ? user.context === 'STAFF' && user.role === 'ADMIN' ? <Suspense fallback={<p role="status">Carregando descontos…</p>}><PricingAdmin /></Suspense> : <section className="account-card"><h2>Acesso restrito</h2><p>Somente administradores podem configurar cupons e promoções.</p></section> :
          route.name === 'reviews-admin' && user ? user.context === 'STAFF' ? <Suspense fallback={<p role="status">Carregando avaliações…</p>}><ReviewModeration /></Suspense> : <section className="account-card"><h2>Acesso restrito</h2><p>Somente a equipe pode moderar avaliações.</p></section> :
          route.name === 'saved' && user ? user.context === 'CUSTOMER' ? <Suspense fallback={<p role="status">Carregando desejos…</p>}><Saved /></Suspense> : <section className="account-card"><h2>Acesso de cliente</h2><p>Desejos e alertas pertencem à conta de compra.</p></section> :
          route.name === 'profile' && user ? <><Profile user={user} onUser={setUser} notify={setNotice} />{user.context === 'CUSTOMER' ? <a href="#/saved">Meus desejos e alertas</a> : null}</> :
          <Access key={route.name} route={accountRoute ? { name: 'login', token: '' } : route} onUser={setUser} navigate={navigate} notify={setNotice} />}
      </div>
    </main><footer className="account-footer">Garimpo · Música que encontra você.</footer>
  </div>;
}
