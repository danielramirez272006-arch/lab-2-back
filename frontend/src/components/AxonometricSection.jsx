import { useEffect, useRef, useState } from 'react';
import { Layers, Box, Cpu } from 'lucide-react';

export default function AxonometricSection() {
  const sectionRef = useRef(null);
  const floorRef = useRef(null);
  const wallsRef = useRef(null);
  const furnitureRef = useRef(null);
  const [sineOffset, setSineOffset] = useState(0);

  useEffect(() => {
    let animId = null;

    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const isPaused = document.body.classList.contains('motion-paused') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isPaused) {
        if (floorRef.current) floorRef.current.style.transform = 'none';
        if (wallsRef.current) wallsRef.current.style.transform = 'none';
        if (furnitureRef.current) furnitureRef.current.style.transform = 'none';
        return;
      }

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Progress 0 when section enters bottom, 1 when leaves top
      const totalScrollable = windowHeight + rect.height;
      let t = (windowHeight - rect.top) / totalScrollable;
      if (t < 0) t = 0;
      if (t > 1) t = 1;

      // Sine curve: peaks at center (t = 0.5) where sin(0.5 * PI) = 1
      const sine = Math.sin(t * Math.PI);
      const maxDisplacement = 46; // pixels of drift apart
      const offset = sine * maxDisplacement;

      setSineOffset(offset);

      // Floor slab drifts downward
      if (floorRef.current) {
        floorRef.current.style.transform = `translateY(${offset.toFixed(1)}px)`;
      }
      // Walls stay anchored or slight drift
      if (wallsRef.current) {
        wallsRef.current.style.transform = `translateY(0px)`;
      }
      // Furniture layer drifts upward
      if (furnitureRef.current) {
        furnitureRef.current.style.transform = `translateY(${-offset.toFixed(1)}px)`;
      }
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

  return (
    <section className="axonometric-section" ref={sectionRef} data-reveal>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div className="breadcrumb-caps" style={{ color: 'var(--color-accent-cobalt)' }}>
          DESPIECE AXONOMÉTRICO / 04
        </div>
        <h2 style={{
          fontSize: 'clamp(28px, 4.2vw, 50px)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          marginTop: '0.4rem'
        }}>
          Ingeniería de tres capas en <span className="font-serif-italic">deriva armónica</span>
        </h2>
        <p style={{ color: 'var(--color-muted)', maxWidth: '640px', margin: '0.75rem auto 0' }}>
          Las tres capas del estuche (forro interior de microfibra, chasis de policarbonato y coraza exterior MagSafe) se separan y vuelven a ensamblar sobre una curva senoidal atada al scroll.
        </p>
      </div>

      {/* Interactive Exploded Axonometric SVG Visualization */}
      <div className="axonometric-stage">
        <svg
          viewBox="0 0 640 460"
          className="axonometric-svg"
          style={{ width: '100%', maxHeight: '460px', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9E4D8" />
              <stop offset="100%" stopColor="#DFD9CC" />
            </linearGradient>
            <linearGradient id="cobaltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3A4BFF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2938E0" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* LAYER 1: INNER MICROFIBER LINING */}
          <g ref={floorRef} className="axonometric-layer" style={{ transition: 'transform 0.05s ease-out' }}>
            {/* Isometric diamond / slab */}
            <polygon
              points="320,290 520,380 320,440 120,380"
              fill="url(#floorGrad)"
              stroke="#1B1D22"
              strokeWidth="2.5"
            />
            {/* Floor thickness */}
            <polygon
              points="120,380 320,440 320,452 120,392"
              fill="#D4CEC2"
              stroke="#1B1D22"
              strokeWidth="2.5"
            />
            <polygon
              points="320,440 520,380 520,392 320,452"
              fill="#C2BBAF"
              stroke="#1B1D22"
              strokeWidth="2.5"
            />
            {/* Texture grid */}
            <line x1="220" y1="335" x2="420" y2="410" stroke="rgba(27,29,34,0.12)" strokeWidth="1" />
            <line x1="420" y1="335" x2="220" y2="410" stroke="rgba(27,29,34,0.12)" strokeWidth="1" />

            {/* Label Badge */}
            <g transform="translate(40, 420)">
              <rect width="180" height="26" rx="4" fill="#FFFFFF" stroke="var(--color-hairline)" />
              <text x="12" y="17" fontSize="11" fontWeight="700" fontFamily="DM Sans" fill="#1B1D22">
                01. Forro Interior Microfibra
              </text>
            </g>
          </g>

          {/* LAYER 2: SHOCK-ABSORBING CHASSIS */}
          <g ref={wallsRef} className="axonometric-layer">
            {/* Left structural perimeter */}
            <polygon
              points="120,340 320,250 320,190 120,280"
              fill="rgba(243, 239, 230, 0.7)"
              stroke="#1B1D22"
              strokeWidth="2.5"
            />
            {/* Right structural perimeter */}
            <polygon
              points="320,250 520,340 520,280 320,190"
              fill="rgba(233, 228, 216, 0.85)"
              stroke="#1B1D22"
              strokeWidth="2.5"
            />
            {/* Air-pocket shock absorber */}
            <polygon
              points="270,300 370,255 370,205 270,250"
              fill="rgba(58, 75, 255, 0.15)"
              stroke="#3A4BFF"
              strokeWidth="1.8"
              strokeDasharray="4 2"
            />

            {/* Label Badge */}
            <g transform="translate(450, 220)">
              <rect width="165" height="26" rx="4" fill="#FFFFFF" stroke="var(--color-hairline)" />
              <text x="12" y="17" fontSize="11" fontWeight="700" fontFamily="DM Sans" fill="#1B1D22">
                02. Chasis Policarbonato
              </text>
            </g>
          </g>

          {/* LAYER 3: OUTER TACTILE BACKPLATE & MAGSAFE */}
          <g ref={furnitureRef} className="axonometric-layer" style={{ transition: 'transform 0.05s ease-out' }}>
            {/* Outer plate */}
            <polygon
              points="280,180 360,145 420,170 340,205"
              fill="#FFFFFF"
              stroke="#1B1D22"
              strokeWidth="2"
            />
            {/* Camera bump */}
            <polygon
              points="310,165 350,150 350,132 310,147"
              fill="url(#cobaltGrad)"
              stroke="#3A4BFF"
              strokeWidth="1.5"
            />
            {/* MagSafe magnetic ring in isometric view */}
            <ellipse cx="350" cy="175" rx="20" ry="11" fill="none" stroke="#3A4BFF" strokeWidth="2" strokeDasharray="5 3" />
            <circle cx="350" cy="175" r="4" fill="#3A4BFF" />

            {/* Label Badge */}
            <g transform="translate(40, 110)">
              <rect width="180" height="26" rx="4" fill="#FFFFFF" stroke="var(--color-hairline)" />
              <text x="12" y="17" fontSize="11" fontWeight="700" fontFamily="DM Sans" fill="#3A4BFF">
                ✨ 03. Coraza MagSafe & Botones
              </text>
            </g>
          </g>
        </svg>

        {/* Dynamic Sine Amplitude Meter */}
        <div className="axonometric-indicator">
          <span>Desfase senoidal: <strong>{sineOffset.toFixed(1)}px</strong></span>
          <span style={{ color: 'var(--color-muted)' }}>• Curva Math.sin(scroll * π) a 60fps</span>
        </div>
      </div>
    </section>
  );
}
