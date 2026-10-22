import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getAiConfig } from '../services/aiService';
import AiConfigModal from './AiConfigModal';
import CommandPalette from './CommandPalette';
import {
  ShoppingCart, LayoutGrid, ClipboardList, BarChart3,
  PackagePlus, Sparkles, Settings2, Search
} from 'lucide-react';

export default function Navbar() {
  const { totalItems } = useCart();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState(getAiConfig());
  const [isBumping, setIsBumping] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  // Nav scroll: absolute al inicio, barra de papel difuminada tras 40px
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Comprobar estado de conexión con el Backend
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.ok ? setBackendOnline(true) : setBackendOnline(false))
      .catch(() => setBackendOnline(false));

    const interval = setInterval(() => {
      fetch('/api/health')
        .then(res => res.ok ? setBackendOnline(true) : setBackendOnline(false))
        .catch(() => setBackendOnline(false));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

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
      <nav className={`navbar ${isScrolled ? 'scrolled-paper' : 'navbar-initial'}`} id="main-navbar">
        <div className="nav-wrapper">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <NavLink to="/" className="nav-logo" id="logo-link">
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#3A4BFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(58, 75, 255, 0.3)'
              }}>
                <Sparkles size={16} color="#ffffff" />
              </div>
              <span style={{ fontWeight: 800, letterSpacing: '-0.03em' }}>Tessel Cases</span>
            </NavLink>

            {/* Breadcrumb en DM Sans caps */}
            <span className="breadcrumb-caps" style={{ display: 'inline-block' }}>
              TESSEL / CASES / 01
            </span>
          </div>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-catalogo">
                <LayoutGrid size={16} />
                <span>Catálogo</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/carrito" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-carrito">
                <ShoppingCart size={16} />
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
                <ClipboardList size={16} />
                <span>Órdenes</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/metricas" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-metricas">
                <BarChart3 size={16} />
                <span>Métricas</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/gestion" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} id="nav-gestion">
                <PackagePlus size={16} />
                <span>Gestión</span>
              </NavLink>
            </li>
          </ul>

          {/* Acciones y Estado del Sistema */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {/* Botón Command Palette Cmd+K */}
            <button
              type="button"
              className="btn-cmd-k"
              onClick={() => setIsCmdOpen(true)}
              title="Buscar o saltar a sección (⌘K / Ctrl+K)"
            >
              <Search size={13} color="var(--color-muted)" />
              <span className="btn-cmd-k-text">Buscar</span>
              <kbd className="btn-cmd-k-kbd">⌘K</kbd>
            </button>

            {/* Indicador de conexión en tiempo real con el Backend */}
            <div
              className={`status-pill ${backendOnline ? '' : 'offline'}`}
              id="backend-status-pill"
              title={backendOnline ? 'API REST conectada (Express en puerto 3001)' : 'API sin respuesta en /api/health'}
            >
              <span className={`pulse-dot ${backendOnline ? '' : 'offline'}`}></span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {backendOnline ? 'API Conectada' : 'API Desconectada'}
              </span>
            </div>

            {/* Botón de Configuración de IA */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{
                borderColor: aiConfig.mode === 'live' ? '#3A4BFF' : 'var(--color-hairline)',
                background: aiConfig.mode === 'live' ? 'rgba(58, 75, 255, 0.08)' : 'var(--color-panel)'
              }}
              id="btn-config-ia"
              title="Configurar Webhook de n8n para el Agente de IA"
            >
              <Sparkles size={13} color={aiConfig.mode === 'live' ? '#3A4BFF' : '#77746C'} />
              <span style={{ fontSize: '0.775rem', fontWeight: 600 }}>
                {aiConfig.mode === 'live' ? 'n8n: En Vivo' : 'IA: Simulación'}
              </span>
              <Settings2 size={12} style={{ opacity: 0.6 }} />
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

      {/* Command Palette Cmd+K */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
      />
    </>
  );
}
