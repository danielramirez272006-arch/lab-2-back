import { useState, useMemo } from 'react';
import { getProductos } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import AlertMessage from '../components/AlertMessage';
import { Search, Filter, ArrowUpDown, Loader2, Sparkles, RefreshCw } from 'lucide-react';

export default function CatalogoPage() {
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [orden, setOrden] = useState('');

  // Custom Hook useFetch (Requisito de Rúbrica)
  const { data: productos, loading, error, refetch } = useFetch(
    () => getProductos({ search, categoria, orden }),
    [search, categoria, orden]
  );

  const categorias = useMemo(() => {
    return ['Periféricos', 'Monitores', 'Computadoras', 'Audio', 'Mobiliario', 'Componentes', 'Accesorios'];
  }, []);

  return (
    <div id="catalogo-page">
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Catálogo de Hardware & Periféricos</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Equipos de alto rendimiento y ergonomía profesional con inventario validado en tiempo real.
          </p>
        </div>

        <button onClick={refetch} className="btn btn-secondary btn-sm" id="btn-refresh-catalogo">
          <RefreshCw size={15} /> Actualizar Inventario
        </button>
      </div>

      {/* Controles de Búsqueda, Filtro y Orden (Requisito de Rúbrica) */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1.25rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Búsqueda por texto */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              id="input-search"
              placeholder="Buscar por nombre o especificación..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtro por Categoría */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={18} style={{ color: 'var(--text-muted)' }} />
            <select
              id="select-categoria"
              className="form-select"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Criterio de Ordenamiento */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpDown size={18} style={{ color: 'var(--text-muted)' }} />
            <select
              id="select-orden"
              className="form-select"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="">Recientes primero</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="nombre_asc">Nombre: A - Z</option>
              <option value="stock_desc">Mayor Stock Disponible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensajes de Estado */}
      {error && <AlertMessage type="error" message={error} />}

      {/* Estado de Carga */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
          <p>Consultando catálogo e inventario en la base de datos...</p>
        </div>
      )}

      {/* Grid de Productos */}
      {!loading && productos && (
        <>
          {productos.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                No se encontraron productos con los filtros seleccionados.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '1rem' }}
                onClick={() => { setSearch(''); setCategoria(''); setOrden(''); }}
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="product-grid" id="product-list">
              {productos.map(producto => (
                <ProductCard key={producto.id} product={producto} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
