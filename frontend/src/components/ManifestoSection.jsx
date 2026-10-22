import { useEffect, useRef, useState } from 'react';
import { Sparkles, Globe } from 'lucide-react';

export default function ManifestoSection() {
  const containerRef = useRef(null);
  const [lang, setLang] = useState('es'); // 'es' o 'en'

  const spanishText = [
    { word: 'Cada', italic: false },
    { word: 'teléfono', italic: false },
    { word: 'ya', italic: false },
    { word: 'conoce', italic: false },
    { word: 'su', italic: true },
    { word: 'mejor', italic: true },
    { word: 'armadura.', italic: true },
    { word: 'Nosotros', italic: false },
    { word: 'solo', italic: false },
    { word: 'le', italic: false },
    { word: 'ayudamos', italic: false },
    { word: 'a', italic: false },
    { word: 'portarla.', italic: false }
  ];

  const englishText = [
    { word: 'Every', italic: false },
    { word: 'phone', italic: false },
    { word: 'already', italic: false },
    { word: 'knows', italic: false },
    { word: 'its', italic: false },
    { word: 'best', italic: true },
    { word: 'case.', italic: true },
    { word: 'We', italic: false },
    { word: 'just', italic: false },
    { word: 'help', italic: false },
    { word: 'it', italic: false },
    { word: 'wear', italic: true },
    { word: 'it.', italic: true }
  ];

  const words = lang === 'es' ? spanishText : englishText;

  useEffect(() => {
    let animId = null;

    const updateWords = () => {
      const container = containerRef.current;
      if (!container) return;

      const spans = container.querySelectorAll('.manifesto-word-unit');
      if (!spans || spans.length === 0) return;

      const isPaused = document.body.classList.contains('motion-paused') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isPaused) {
        spans.forEach(span => {
          span.style.opacity = '1';
          span.style.transform = 'none';
          span.style.color = '#1B1D22';
        });
        return;
      }

      // Viewport center reference (50% from top of window)
      const viewportCenter = window.innerHeight * 0.50;
      const buffer = window.innerHeight * 0.22; // 22vh transition zone

      spans.forEach(span => {
        const rect = span.getBoundingClientRect();
        const wordCenter = rect.top + rect.height / 2;

        // Progress: 0 when word is below viewport center + buffer
        // 1 when word reaches or passes viewport center
        let progress = (viewportCenter + buffer - wordCenter) / (buffer * 1.35);
        if (progress < 0) progress = 0;
        if (progress > 1) progress = 1;

        // Opacity smoothly travels from 15% (0.15) to 100% (1.0)
        const opacity = 0.15 + (progress * 0.85);
        span.style.opacity = opacity.toFixed(3);

        // Subtle lift of 4px as it clarifies
        const translateY = (1 - progress) * 3;
        span.style.transform = `translateY(${translateY.toFixed(1)}px)`;

        // Color shifts from muted to crisp ink
        if (progress > 0.8) {
          span.style.color = '#1B1D22';
        } else {
          span.style.color = '#77746C';
        }
      });
    };

    const onScrollOrResize = () => {
      if (animId) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(updateWords);
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });

    // Initial calculation
    onScrollOrResize();

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [lang]);

  return (
    <section className="manifesto-section" ref={containerRef} data-reveal>
      {/* Top Header con Breadcrumb y Toggle de Idioma */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="breadcrumb-caps" style={{ margin: 0, color: 'var(--color-muted)' }}>
          FILOSOFÍA / 02
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          background: 'var(--color-panel)',
          borderRadius: '9999px',
          padding: '2px 4px',
          border: '1px solid var(--color-hairline)'
        }}>
          <button
            type="button"
            onClick={() => setLang('es')}
            style={{
              border: 'none',
              background: lang === 'es' ? '#FFFFFF' : 'transparent',
              color: lang === 'es' ? 'var(--color-ink)' : 'var(--color-muted)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: lang === 'es' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            ES
          </button>
          <button
            type="button"
            onClick={() => setLang('en')}
            style={{
              border: 'none',
              background: lang === 'en' ? '#FFFFFF' : 'transparent',
              color: lang === 'en' ? 'var(--color-ink)' : 'var(--color-muted)',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: lang === 'en' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            EN
          </button>
        </div>
      </div>

      {/* Frase animada palabra por palabra */}
      <div className="manifesto-text-wrapper">
        <p className="manifesto-text" aria-label={lang === 'es' ? 'Cada espacio de trabajo ya conoce su mejor configuración. Nosotros solo le ayudamos a encontrarla.' : 'Every room already knows its best layout. We just help it say so.'}>
          {words.map((item, index) => (
            <span
              key={`${lang}-${index}`}
              className={`manifesto-word-unit ${item.italic ? 'font-serif-italic manifesto-highlight' : ''}`}
            >
              {item.word}
            </span>
          ))}
        </p>
      </div>

      {/* Subtítulo complementario con badge */}
      <div style={{
        marginTop: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        color: 'var(--color-muted)'
      }}>
        <Sparkles size={14} color="#3A4BFF" />
        <span>
          {lang === 'es'
            ? 'Original de Tessel: "Every room already knows its best layout. We just help it say so."'
            : 'Sincronizado a 60fps vía requestAnimationFrame al cruzar el centro del viewport.'}
        </span>
      </div>
    </section>
  );
}
