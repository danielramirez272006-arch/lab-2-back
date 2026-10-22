import { useEffect, useRef, useState } from 'react';
import { PenTool, Ruler, Armchair, Sparkles } from 'lucide-react';

export default function StickyStorySection() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [chapter, setChapter] = useState(0); // 0: Sketch, 1: Measure, 2: Furnish
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let animId = null;

    const handleScroll = () => {
      const container = containerRef.current;
      const card = cardRef.current;
      if (!container || !card) return;

      const isPaused = document.body.classList.contains('motion-paused') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const rect = container.getBoundingClientRect();
      const totalDist = container.offsetHeight - window.innerHeight;
      if (totalDist <= 0) return;

      // Scroll progress from 0 to 1 inside container
      const currentScroll = -rect.top;
      let p = currentScroll / totalDist;
      if (p < 0) p = 0;
      if (p > 1) p = 1;

      setScrollProgress(p);

      // Determine active chapter
      if (p < 0.33) {
        setChapter(0);
      } else if (p < 0.67) {
        setChapter(1);
      } else {
        setChapter(2);
      }

      if (isPaused) {
        card.style.transform = 'none';
        return;
      }

      // 3D Tilt: Tilts in with rotateX/rotateY and becomes flat as p approaches 0.35
      const tiltFactor = Math.max(0, 1 - (p / 0.35));
      const rotX = (15 * tiltFactor).toFixed(2);
      const rotY = (-7 * tiltFactor).toFixed(2);
      const scale = (0.92 + (0.08 * (1 - tiltFactor))).toFixed(3);

      card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`;
    };

    const onScrollOrResize = () => {
      if (animId) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  const chapters = [
    {
      num: '01',
      title: 'Sketch',
      desc: 'Boceto preliminar y escaneo 3D del perfil del smartphone. Partículas acopladas al chasis.'
    },
    {
      num: '02',
      title: 'Measure',
      desc: 'Tolerancias de 0.1mm en bisel de pantalla, botoneras y cámaras. Verificación de reglas en SQLite.'
    },
    {
      num: '03',
      title: 'Furnish',
      desc: 'Ensamble de imanes MagSafe, forro de microfibra aterciopelada y validación de inventario en vivo.'
    }
  ];

  return (
    <section className="sticky-story-wrapper" ref={containerRef}>
      <div className="sticky-story-viewport">
        {/* Header de la historia */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem', zIndex: 10 }}>
          <div className="breadcrumb-caps" style={{ color: 'var(--color-accent-cobalt)' }}>
            HISTORIA EN TIEMPO REAL / TESSEL 300VH
          </div>
          <h2 style={{
            fontSize: 'clamp(24px, 3.2vw, 40px)',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            margin: '0.25rem 0'
          }}>
            Del concepto CAD al estuche <span className="font-serif-italic">perfectamente calibrado</span>
          </h2>
        </div>

        {/* Browser Mockup Window con Tilt 3D */}
        <div className="browser-mockup-window" ref={cardRef}>
          {/* Browser Window Header */}
          <div className="browser-window-header">
            <div className="browser-window-dots">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="browser-window-title">
              tessel.studio — case_magsafe_pro_max.cad
            </div>
            <div style={{ width: '52px' }} />
          </div>

          {/* Browser Canvas Area */}
          <div className="browser-window-body">
            {/* Blueprint Grid Background */}
            <div className="browser-blueprint-grid" />

            {/* SVG Interactive Phone Case Stages */}
            <svg
              viewBox="0 0 600 360"
              className="browser-plan-svg"
              style={{ width: '100%', height: '100%', maxHeight: '340px' }}
            >
              {/* Outer Phone Case Outline */}
              <rect
                x="200"
                y="30"
                width="200"
                height="300"
                rx="28"
                fill={chapter >= 2 ? '#E9E4D8' : 'none'}
                stroke={chapter === 0 ? '#3A4BFF' : '#1B1D22'}
                strokeWidth={chapter === 0 ? '2' : '3.5'}
                strokeDasharray={chapter === 0 ? '6 4' : 'none'}
              />

              {/* Camera Island Box */}
              <rect
                x="215"
                y="45"
                width="70"
                height="70"
                rx="14"
                fill={chapter >= 2 ? '#FFFFFF' : 'none'}
                stroke={chapter === 0 ? '#77746C' : '#1B1D22'}
                strokeWidth={chapter === 0 ? '1.5' : '2.5'}
                strokeDasharray={chapter === 0 ? '4 3' : 'none'}
              />

              {/* Volume & Action Buttons */}
              <rect x="194" y="90" width="6" height="22" rx="2" fill="#1B1D22" />
              <rect x="194" y="125" width="6" height="32" rx="2" fill="#1B1D22" />
              <rect x="194" y="165" width="6" height="32" rx="2" fill="#1B1D22" />
              {/* Power / Camera Control Button */}
              <rect x="400" y="115" width="6" height="42" rx="2" fill="#1B1D22" />

              {/* Chapter 01: Sketch notations */}
              {chapter === 0 && (
                <g className="fade-in-group">
                  <path d="M 230 180 Q 250 160 300 170" fill="none" stroke="#3A4BFF" strokeWidth="1.5" strokeDasharray="3 3" />
                  <text x="250" y="155" fill="#3A4BFF" fontSize="11" fontFamily="DM Sans" fontWeight="600">curvatura 28mm</text>
                  <text x="300" y="240" textAnchor="middle" fill="#77746C" fontSize="12" fontFamily="DM Sans">Boceto CAD Inicial</text>
                  <text x="250" y="85" fill="#3A4BFF" fontSize="10" fontFamily="DM Sans">isla cámaras</text>
                </g>
              )}

              {/* Chapter 02: Measure dimension lines */}
              {chapter >= 1 && (
                <g className="fade-in-group">
                  {/* Top Width Dimension */}
                  <line x1="200" y1="18" x2="400" y2="18" stroke="#3A4BFF" strokeWidth="1.2" />
                  <line x1="200" y1="14" x2="200" y2="22" stroke="#3A4BFF" strokeWidth="1.2" />
                  <line x1="400" y1="14" x2="400" y2="22" stroke="#3A4BFF" strokeWidth="1.2" />
                  <rect x="270" y="10" width="60" height="16" fill="#F3EFE6" rx="3" />
                  <text x="300" y="22" textAnchor="middle" fill="#3A4BFF" fontSize="10" fontWeight="700" fontFamily="DM Sans">78.1 mm</text>

                  {/* Left Height Dimension */}
                  <line x1="180" y1="30" x2="180" y2="330" stroke="#3A4BFF" strokeWidth="1.2" />
                  <line x1="175" y1="30" x2="185" y2="30" stroke="#3A4BFF" strokeWidth="1.2" />
                  <line x1="175" y1="330" x2="185" y2="330" stroke="#3A4BFF" strokeWidth="1.2" />
                  <rect x="145" y="172" width="64" height="16" fill="#F3EFE6" rx="3" />
                  <text x="177" y="184" textAnchor="middle" fill="#3A4BFF" fontSize="10" fontWeight="700" fontFamily="DM Sans">160.8 mm</text>

                  {/* Camera clearance callout */}
                  <text x="250" y="130" fill="#3A4BFF" fontSize="9" fontWeight="700" fontFamily="DM Sans">+0.8mm bisel</text>
                </g>
              )}

              {/* Chapter 03: Furnish / Assembled case with MagSafe Ring */}
              {chapter >= 2 && (
                <g className="fade-in-group">
                  {/* Triple Camera Lenses */}
                  <circle cx="235" cy="65" r="9" fill="#1B1D22" stroke="#3A4BFF" strokeWidth="1.5" />
                  <circle cx="235" cy="95" r="9" fill="#1B1D22" stroke="#3A4BFF" strokeWidth="1.5" />
                  <circle cx="265" cy="80" r="9" fill="#1B1D22" stroke="#3A4BFF" strokeWidth="1.5" />
                  <circle cx="265" cy="58" r="3" fill="#3A4BFF" />
                  <circle cx="265" cy="102" r="4" fill="#77746C" />

                  {/* Central MagSafe Neodymium Ring */}
                  <circle cx="300" cy="190" r="42" fill="none" stroke="#3A4BFF" strokeWidth="3" strokeDasharray="8 4" />
                  <circle cx="300" cy="190" r="34" fill="none" stroke="rgba(58, 75, 255, 0.25)" strokeWidth="1.5" />
                  <line x1="300" y1="236" x2="300" y2="252" stroke="#3A4BFF" strokeWidth="3" />
                  <text x="300" y="194" textAnchor="middle" fill="#3A4BFF" fontSize="10" fontWeight="800" fontFamily="DM Sans">MagSafe</text>

                  {/* Material & AI Badge */}
                  <rect x="235" y="278" width="130" height="22" rx="11" fill="#FFFFFF" stroke="rgba(27,29,34,0.15)" />
                  <text x="300" y="293" textAnchor="middle" fill="#1B1D22" fontSize="9" fontWeight="700" fontFamily="DM Sans">
                    ✨ 100% Calibrado & En Stock
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Chapter Index Bottom Bar que se llena al scrollear */}
        <div className="chapter-index-bar">
          {chapters.map((ch, idx) => {
            const isActive = chapter === idx;
            const isCompleted = chapter > idx;
            let fillWidth = '0%';
            if (isCompleted) fillWidth = '100%';
            else if (isActive) {
              const segProgress = (scrollProgress - (idx * 0.333)) / 0.333;
              fillWidth = `${Math.min(100, Math.max(0, segProgress * 100))}%`;
            }

            return (
              <div key={ch.num} className={`chapter-index-item ${isActive ? 'active' : ''}`}>
                <div className="chapter-index-header">
                  <span className="chapter-num">{ch.num}</span>
                  <span className="chapter-title">{ch.title}</span>
                </div>
                <div className="chapter-progress-track">
                  <div
                    className="chapter-progress-fill"
                    style={{ width: fillWidth }}
                  />
                </div>
                <p className="chapter-desc">{ch.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
