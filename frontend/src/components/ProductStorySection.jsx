import { useState } from 'react';
import { CheckCircle2, Sparkles, Sliders, Palette, Cpu } from 'lucide-react';

export default function ProductStorySection() {
  const [selectedSwatch, setSelectedSwatch] = useState('oak');

  const swatches = [
    { id: 'oak', name: 'Oak', hex: '#D4A373', border: '#B88252', bgStyle: '#E6CDB2' },
    { id: 'terrazzo', name: 'Terrazzo', hex: '#C7B9A5', border: '#9E8E7A', bgStyle: '#DFD8CE' },
    { id: 'linen', name: 'Linen', hex: '#EBE6DC', border: '#C5BEB1', bgStyle: '#F5F2EB' },
    { id: 'slate', name: 'Slate', hex: '#4A5568', border: '#2D3748', bgStyle: '#718096' }
  ];

  const currentSwatch = swatches.find(s => s.id === selectedSwatch) || swatches[0];

  return (
    <section className="product-story-section" data-reveal id="estudio-materiales">
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div className="breadcrumb-caps" style={{ color: 'var(--color-accent-cobalt)' }}>
          ESTUDIO DE MATERIALES / TESSEL STUDIO
        </div>
        <h2 style={{
          fontSize: 'clamp(28px, 4.2vw, 52px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          marginTop: '0.4rem'
        }}>
          Control total en tiempo real con <span className="font-serif-italic">materialidad táctil</span>
        </h2>
        <p style={{ color: 'var(--color-muted)', maxWidth: '640px', margin: '0.75rem auto 0' }}>
          Cambia acabados, ajusta la textura del respaldo y observa cómo el estuche responde instantáneamente a cada elección de diseño.
        </p>
      </div>

      <div className="product-story-grid">
        {/* Left Column: Three Steps */}
        <div className="product-story-steps">
          <div className="story-step-card" data-reveal>
            <div className="story-step-num">01</div>
            <div>
              <h3 className="story-step-title">Escaneo CAD & Biseles de Pantalla</h3>
              <p className="story-step-desc">
                Definición milimétrica de tolerancias: bisel perimetral de 0.8mm para proteger el cristal frontal
                y protección de cámara con reborde de aluminio mecanizado CNC.
              </p>
            </div>
          </div>

          <div className="story-step-card" data-reveal>
            <div className="story-step-num">02</div>
            <div>
              <h3 className="story-step-title">Validación Relacional & Stock en SQLite</h3>
              <p className="story-step-desc">
                Cada pedido se valida con transacciones atómicas `BEGIN IMMEDIATE`. Las restricciones CHECK impiden
                precios inválidos, cupones duplicados o sobreventa de stock en alta demanda.
              </p>
            </div>
          </div>

          <div className="story-step-card" data-reveal>
            <div className="story-step-num">03</div>
            <div>
              <h3 className="story-step-title">Acabados en Vivo con Agente de IA Comercial</h3>
              <p className="story-step-desc">
                El agente de n8n sugiere combinaciones ideales de estuches complementarios. Utiliza la barra
                flotante inferior para previsualizar los acabados del respaldo en vivo.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Editor Mockup with Floating Swatch Bar */}
        <div className="product-story-editor-sticky">
          <div className="editor-mockup-frame">
            {/* Top Toolbar */}
            <div className="editor-mockup-toolbar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-muted)', marginLeft: '0.5rem' }}>
                  case_studio_viewer.cad — 1:1 Scale
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <span className="editor-tool-badge">2D Wireframe</span>
                <span className="editor-tool-badge active">3D Material</span>
              </div>
            </div>

            {/* Canvas with dynamic phone case backplate tint */}
            <div
              className="editor-mockup-canvas"
              style={{
                backgroundColor: '#FAF8F5'
              }}
            >
              {/* Phone Case SVG with live backplate color */}
              <svg viewBox="0 0 320 280" className="editor-canvas-svg">
                {/* Background grid */}
                <defs>
                  <pattern id="caseGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                    <path d="M 16 0 L 0 0 0 16" fill="none" stroke="rgba(27,29,34,0.05)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#caseGrid)" />

                {/* Outer Case Chassis Shadow */}
                <rect x="94" y="24" width="132" height="232" rx="24" fill="rgba(27,29,34,0.08)" />

                {/* Outer Phone Case Chassis Border */}
                <rect x="90" y="20" width="140" height="240" rx="24" fill="#1B1D22" />

                {/* Inner Case Backplate (TINTED LIVE BY SWATCH) */}
                <rect
                  x="94"
                  y="24"
                  width="132"
                  height="232"
                  rx="20"
                  fill={currentSwatch.hex}
                  stroke="rgba(27,29,34,0.15)"
                  strokeWidth="1.5"
                  style={{ transition: 'fill 0.35s ease' }}
                />

                {/* Camera Module Island */}
                <rect x="104" y="34" width="48" height="48" rx="10" fill="#1B1D22" />
                <circle cx="118" cy="48" r="7" fill="#3A4BFF" />
                <circle cx="118" cy="68" r="7" fill="#3A4BFF" />
                <circle cx="138" cy="58" r="7" fill="#3A4BFF" />
                <circle cx="138" cy="44" r="2.5" fill="#FFFFFF" />

                {/* MagSafe Ring */}
                <circle cx="156" cy="145" r="32" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.9" />
                <circle cx="156" cy="145" r="26" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <line x1="156" y1="180" x2="156" y2="192" stroke="#FFFFFF" strokeWidth="2.5" opacity="0.9" />

                {/* Buttons on sides */}
                <rect x="86" y="65" width="4" height="16" rx="1" fill="#3A4BFF" />
                <rect x="86" y="90" width="4" height="24" rx="1" fill="#3A4BFF" />
                <rect x="86" y="120" width="4" height="24" rx="1" fill="#3A4BFF" />
                <rect x="230" y="85" width="4" height="30" rx="1" fill="#3A4BFF" />

                {/* Badge Overlay */}
                <g transform="translate(16, 235)">
                  <rect width="130" height="22" rx="11" fill="rgba(255,255,255,0.92)" stroke="rgba(27,29,34,0.15)" />
                  <circle cx="12" cy="11" r="4.5" fill={currentSwatch.hex} />
                  <text x="22" y="15" fontSize="10" fontWeight="700" fontFamily="DM Sans" fill="#1B1D22">
                    Respaldo: {currentSwatch.name}
                  </text>
                </g>
              </svg>

              {/* Floating Swatch Bar (Oak, Terrazzo, Linen, Slate) */}
              <div className="floating-swatch-bar">
                <span className="swatch-bar-label">
                  <Palette size={13} color="#3A4BFF" />
                  <span>Material:</span>
                </span>
                {swatches.map(swatch => {
                  const isSelected = selectedSwatch === swatch.id;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      className={`swatch-btn ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedSwatch(swatch.id)}
                      title={`Aplicar acabado ${swatch.name}`}
                    >
                      <span
                        className="swatch-color-circle"
                        style={{ backgroundColor: swatch.hex, borderColor: swatch.border }}
                      />
                      <span className="swatch-name">{swatch.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
