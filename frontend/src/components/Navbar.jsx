import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getAiConfig } from '../services/aiService';
import AiConfigModal from './AiConfigModal';
import { ShoppingCart, LayoutGrid, ClipboardList, BarChart3, PackagePlus, Sparkles, Settings2 } from 'lucide-react';

export default function Navbar() {
  const { totalItems } = useCart();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState(getAiConfig());
  const [isBumping, setIsBumping] = useState(false);

  // Micro-interacción: animar rebote cuando cambia la cantidad de items
  useEffect(() => {
    if (totalItems === 0) return;
    setIsBumping(true);
    const timer = setTimeout(() => {
      setIsBumping(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [totalItems]);

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <div className="nav-wrapper">
          <NavLink to="/" className="nav-logo" id="logo-link">
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <span>TechStore</span>
            <span className="logo-badge">Caso 5</span>
          </NavLink>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-catalogo">
                <LayoutGrid size={18} />
                <span>Catálogo</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/carrito" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-carrito">
                <ShoppingCart size={18} />
                <span>Carrito</span>
                {totalItems > 0 && (
                  <span className={`cart-counter ${isBumping ? 'cart-bump' : ''}`} id="cart-counter">
                    {totalItems}
                  </span>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink to="/ordenes" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-ordenes">
                <ClipboardList size={18} />
                <span>Órdenes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/metricas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-metricas">
                <BarChart3 size={18} />
                <span>Métricas</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/gestion" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-gestion">
                <PackagePlus size={18} />
                <span>Gestión</span>
              </NavLink>
            </li>
          </ul>

          {/* Botón de Configuración de IA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: aiConfig.mode === 'live' ? 'rgba(168, 85, 247, 0.5)' : 'var(--border-subtle)',
                background: aiConfig.mode === 'live' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.04)'
              }}
              id="btn-config-ia"
              title="Configurar Webhook de n8n para el Agente de IA"
            >
              <Sparkles size={14} color={aiConfig.mode === 'live' ? '#d8b4fe' : '#94a3b8'} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                {aiConfig.mode === 'live' ? 'n8n: En Vivo' : 'IA: Simulación'}
              </span>
              <Settings2 size={13} style={{ opacity: 0.6 }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Barra de Navegación Inferior para Móviles */}
      <div className="mobile-bottom-nav">
        <NavLink to="/" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <LayoutGrid size={18} />
          <span>Catálogo</span>
        </NavLink>

        <NavLink to="/carrito" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <ShoppingCart size={18} />
          <span>Carrito</span>
          {totalItems > 0 && (
            <span
              className={`cart-counter ${isBumping ? 'cart-bump' : ''}`}
              style={{ position: 'absolute', top: '2px', right: '14px', padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}
            >
              {totalItems}
            </span>
          )}
        </NavLink>

        <NavLink to="/ordenes" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <ClipboardList size={18} />
          <span>Órdenes</span>
        </NavLink>

        <NavLink to="/metricas" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <BarChart3 size={18} />
          <span>Métricas</span>
        </NavLink>

        <NavLink to="/gestion" className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <PackagePlus size={18} />
          <span>Gestión</span>
        </NavLink>
      </div>

      {/* Modal de Configuración de IA */}
      {isAiModalOpen && (
        <AiConfigModal
          onClose={() => setIsAiModalOpen(false)}
          onSaved={(newCfg) => setAiConfig(newCfg)}
        />
      )}
    </>
  );
}
