import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import CatalogoPage from './pages/CatalogoPage';
import CarritoPage from './pages/CarritoPage';
import OrdenesPage from './pages/OrdenesPage';
import MetricasPage from './pages/MetricasPage';
import GestionPage from './pages/GestionPage';
import AlertMessage from './components/AlertMessage';

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
        <div className="app-container">
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
            borderTop: '1px solid var(--border-subtle)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-muted)'
          }}>
            <p>Laboratorio #2 · React + Node.js + SQLite + Agente de IA (Caso 5: TechStore)</p>
          </footer>

          <ToastNotifier />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
