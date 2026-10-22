import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, LayoutGrid, ShoppingCart, ClipboardList, BarChart3,
  PackagePlus, Sparkles, X, ArrowRight, CornerDownLeft
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    { id: 'customize-case', title: 'Personalizar Estuche / Materiales', subtitle: 'Seleccionar acabados de madera, titanio o terrazzo en vivo', icon: Sparkles, onSelect: () => { const el = document.getElementById('estudio-materiales'); if (el) el.scrollIntoView({ behavior: 'smooth' }); onClose(); } },
    { id: 'ai-combo', title: 'Consultar Agente de IA Comercial', subtitle: 'Pedir recomendación de combos y accesorios para tu carrito', icon: Search, onSelect: () => { onClose(); window.location.href = '/carrito'; } },
    { id: 'share-link', title: 'Compartir Catálogo Tessel', subtitle: 'Copiar enlace directo de la tienda al portapapeles', icon: ArrowRight, onSelect: () => { navigator.clipboard?.writeText(window.location.origin); alert('Enlace de Tessel Cases copiado al portapapeles'); onClose(); } },
    { id: 'catalogo', title: 'Explorar Colección de Estuches', subtitle: 'MagSafe, fibra de carbono, titanio y stock en tiempo real', icon: LayoutGrid, path: '/' },
    { id: 'carrito', title: 'Ver Carrito y Checkout', subtitle: 'Calcular envío gratis, aplicar cupones y pedir combo IA', icon: ShoppingCart, path: '/carrito' },
    { id: 'ordenes', title: 'Seguimiento de Órdenes', subtitle: 'Flujo de estados (nueva → pagada → enviada) y cancelación', icon: ClipboardList, path: '/ordenes' },
    { id: 'metricas', title: 'Panel de Métricas SQL', subtitle: 'Ventas por categoría, Top 3 y alertas de reposición', icon: BarChart3, path: '/metricas' },
    { id: 'gestion', title: 'Gestión de Inventario & Cupones', subtitle: 'Crear productos con redactor IA y administrar cupones', icon: PackagePlus, path: '/gestion' }
  ];

  const filtered = actions.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + (filtered.length || 1)) % (filtered.length || 1));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        const action = filtered[selectedIndex];
        if (action.onSelect) {
          action.onSelect();
        } else if (action.path) {
          navigate(action.path);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-modal" onClick={e => e.stopPropagation()}>
        <div className="command-palette-input-wrap">
          <Search size={18} color="var(--color-muted)" />
          <input
            type="text"
            className="command-palette-input"
            placeholder="Escribe una acción o navega con flechas (ej. Carrito, Métricas)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
          <span className="command-palette-badge">ESC</span>
        </div>

        <div className="command-palette-list">
          {filtered.length === 0 ? (
            <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.9rem' }}>
              No se encontraron acciones para "{query}"
            </div>
          ) : (
            filtered.map((action, index) => {
              const Icon = action.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={action.id}
                  className={`command-palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    if (action.onSelect) {
                      action.onSelect();
                    } else if (action.path) {
                      navigate(action.path);
                      onClose();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="command-palette-item-icon">
                    <Icon size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="command-palette-item-title">{action.title}</div>
                    <div className="command-palette-item-subtitle">{action.subtitle}</div>
                  </div>
                  {isSelected && <CornerDownLeft size={15} color="var(--color-accent-cobalt)" />}
                </div>
              );
            })
          )}
        </div>

        <div className="command-palette-footer">
          <span>Navegar <kbd>↑</kbd> <kbd>↓</kbd></span>
          <span>Seleccionar <kbd>Enter</kbd></span>
          <span>Cerrar <kbd>Esc</kbd></span>
        </div>
      </div>
    </div>
  );
}
