import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import CatalogoPage from './pages/CatalogoPage';
import CarritoPage from './pages/CarritoPage';
import OrdenesPage from './pages/OrdenesPage';
import MetricasPage from './pages/MetricasPage';
import GestionPage from './pages/GestionPage';
import AlertMessage from './components/AlertMessage';
import ScrollProgress from './components/ScrollProgress';
import PauseMotionPill from './components/PauseMotionPill';
import { useRevealAnimation } from './hooks/useRevealAnimation';

function AppContent() {
  useRevealAnimation();

  return (
    <div className="app-container">
      <ScrollProgress />
      <Navbar />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/metricas" element={<MetricasPage />} />
          <Route path="/gestion" element={<GestionPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer style={{
        borderTop: '1px solid var(--color-hairline)',
        padding: '2.5rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--color-muted)',
        background: 'transparent'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Tessel Cases Studio</strong> · Laboratorio #2 (Caso 5: E-commerce, Logística & IA)
          </div>
          <div className="breadcrumb-caps" style={{ fontSize: '0.7rem' }}>
            NODE.JS + SQLITE + REACT + N8N
          </div>
        </div>
      </footer>

      <ToastNotifier />
      <PauseMotionPill />
    </div>
  );
}

function ToastNotifier() {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div className="toast-container">
      <AlertMessage type={toast.type} message={toast.message} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}
