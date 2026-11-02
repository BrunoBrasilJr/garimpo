import { createRoot } from 'react-dom/client';
import { ReviewSection } from '../../apps/web/src/features/reviews/Reviews';
import '../../apps/web/src/features/account/account.css';
const params = new URLSearchParams(location.search);
createRoot(document.getElementById('root')!).render(<main className="account-site"><div className="account-card"><ReviewSection editionId={params.get('id') ?? ''} orderId={params.get('orderId') ?? ''} /></div></main>);
