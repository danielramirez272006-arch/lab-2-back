import { useState, useMemo } from 'react';
import { getProductos } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import ProductCard from '../components/ProductCard';
import AlertMessage from '../components/AlertMessage';
import HeroParticlesCanvas from '../components/HeroParticlesCanvas';
import StickyStorySection from '../components/StickyStorySection';
import ManifestoSection from '../components/ManifestoSection';
import ProductStorySection from '../components/ProductStorySection';
import AxonometricSection from '../components/AxonometricSection';
import PricingSection from '../components/PricingSection';
import {
  Search, ArrowUpDown, Loader2, Sparkles, RefreshCw,
  Truck, ShieldCheck, Bot
} from 'lucide-react';

export default function CatalogoPage() {
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [orden, setOrden] = useState('');
  const [promptInput, setPromptInput] = useState('');

  // Custom Hook useFetch (Requisito de Rúbrica)
  const { data: productos, loading, error, refetch } = useFetch(
    () => getProductos({ search, categoria, orden }),
    [search, categoria, orden]
  );

  const categorias = useMemo(() => {
    return ['MagSafe', 'Rugged', 'Madera & Metal', 'Fibra de Carbono', 'Silicona', 'Transparente', 'Billetera Folio', 'Edición Especial'];
  }, []);

  const handlePromptSearch = (e) => {
    e.preventDefault();
    if (promptInput.trim()) {
      setSearch(promptInput.trim());
    }
  };

  return (
    <div id="catalogo-page">
      {/* ==================== 1. HERO SECTION WITH COBALT PARTICLES ==================== */}
      <section className="hero-tessel" data-reveal>
        <HeroParticlesCanvas />

        <div className="hero-tessel-content">
          <div className="breadcrumb-caps" style={{ marginBottom: '1.25rem' }}>
            TESSEL / CASES STUDIO / 01
          </div>

          <h1 className="hero-fluid-headline">
            Cases that <span className="font-serif-italic">draw themselves.</span>
          </h1>

          <p className="hero-subtitle">
            Estuches de ingeniería arquitectónica para smartphones: tolerancias milimétricas de 0.1mm, carga MagSafe, chasis de titanio y transacciones atómicas SQLite.
          </p>

          {/* Prompt Card estilo Tessel */}
          <form className="tessel-prompt-card" onSubmit={handlePromptSearch}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
              <Sparkles size={18} color="#3A4BFF" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
              <textarea
                className="tessel-prompt-input"
                rows={2}
                placeholder="Describe or find your phone case... (ej. estuche de cuero nórdico con MagSafe o armadura anticaídas con soporte)"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
              />
            </div>

            <div className="tessel-prompt-footer">
              <div className="hero-chips-container" style={{ margin: 0 }}>
                <span className="hero-chip accent">
                  <Truck size={13} /> Envío Gratis &gt; ₡30.000
                </span>
                <span className="hero-chip">
                  <ShieldCheck size={13} /> Transacciones Atómicas (409)
                </span>
                <span className="hero-chip ai">
                  <Bot size={13} /> DeepSeek en n8n
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {search && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => { setSearch(''); setPromptInput(''); }}
                  >
                    Limpiar
                  </button>
                )}
                <button type="submit" className="btn btn-primary btn-sm" style={{ backgroundColor: '#3A4BFF', borderColor: '#3A4BFF' }}>
                  <Sparkles size={14} />
                  <span>Buscar Estuche</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ==================== 2. STICKY STORY SECTION (300VH) ==================== */}
      <StickyStorySection />

      {/* ==================== 3. MANIFESTO WORD-BY-WORD SCROLL OPACITY ==================== */}
      <ManifestoSection />

      {/* ==================== 4. GALLERY DE PRODUCTOS / ESTUCHES ==================== */}
      <div className="gallery-header" data-reveal id="galeria-estuches">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div className="breadcrumb-caps">GALERÍA DE ESTUCHES / 03</div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.025em', marginTop: '0.25rem' }}>
              Colección de Estuches & Protectores
            </h2>
          </div>

          <button onClick={refetch} className="btn btn-secondary btn-sm" id="btn-refresh-catalogo">
            <RefreshCw size={14} /> Actualizar Inventario
          </button>
        </div>

        {/* Filter chips tipo Tessel */}
        <div className="filter-chips-bar">
          <button
            className={`filter-chip ${categoria === '' ? 'active' : ''}`}
            onClick={() => setCategoria('')}
          >
            Todos ({productos?.length || 0})
          </button>
          {categorias.map(cat => (
            <button
              key={cat}
              className={`filter-chip ${categoria === cat ? 'active' : ''}`}
              onClick={() => setCategoria(cat === categoria ? '' : cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input & Orden */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginTop: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              id="input-search"
              placeholder="Buscar por texto o especificación..."
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowUpDown size={16} style={{ color: 'var(--color-muted)' }} />
            <select
              id="select-orden"
              className="form-select"
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="">Ordenar por: Defecto</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="nombre_asc">Nombre: A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && <AlertMessage type="error" message={error} />}

      {/* Estado Cargando */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#3A4BFF' }} />
          <p>Consultando base de datos SQLite...</p>
        </div>
      )}

      {/* Grid de Productos con data-reveal y fanning cards */}
      {!loading && productos && (
        <>
          {productos.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1.5rem', marginTop: '1.5rem' }} data-reveal>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
                No se encontraron productos que coincidan con los criterios seleccionados.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => { setSearch(''); setCategoria(''); setOrden(''); }}
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {productos.map(producto => (
                <ProductCard key={producto.id} product={producto} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ==================== 5. PRODUCT STORY & FLOATING SWATCHES ==================== */}
      <ProductStorySection />

      {/* ==================== 6. FIGURAS AXONOMÉTRICAS CON DERIVA SENOIDAL ==================== */}
      <AxonometricSection />

      {/* ==================== 7. PRICING SECTION & FOOTER ==================== */}
      <PricingSection />
    </div>
  );
}
