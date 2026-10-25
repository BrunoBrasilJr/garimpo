import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main>
      <span className="record" aria-hidden="true">●</span>
      <p className="eyebrow">DISCOS E DESCOBERTAS</p>
      <h1>Garimpo</h1>
      <p>Um novo lugar para encontrar sua próxima história em vinil.</p>
      <p className="notice">Em preparação. O catálogo estará disponível em breve.</p>
    </main>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing root element.');
createRoot(root).render(<StrictMode><App /></StrictMode>);
