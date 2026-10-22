import { Check, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export default function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      subtitle: 'Estuche esencial de silicona o policarbonato para resguardo diario.',
      currency: '₡',
      amount: '16.000',
      period: 'por estuche',
      featured: false,
      badge: null,
      features: [
        'Protección contra caídas de hasta 2 metros',
        'Bisel perimetral para resguardo de pantalla',
        'Textura soft-touch antideslizante',
        'Envío estándar según provincia (₡2.000 – ₡4.500)'
      ],
      ctaText: 'Ver Modelos Starter',
      ctaClass: 'btn-secondary'
    },
    {
      name: 'Studio',
      subtitle: 'Nuestra combinación más vendida: Cuero nórdico con anillo MagSafe.',
      currency: '₡',
      amount: '28.000',
      period: 'por estuche',
      featured: true,
      badge: 'MÁS POPULAR',
      features: [
        'Cuero curtido vegetal o titanio aeronáutico',
        'Matriz magnética MagSafe de neodimio N52',
        'Botones de aluminio mecanizado CNC',
        'Envío gratis en compras mayores a ₡30.000',
        'Recomendación inteligente de combos con IA',
        'Garantía de ajuste milimétrico de por vida'
      ],
      ctaText: 'Elegir Edición Studio',
      ctaClass: 'btn-primary'
    },
    {
      name: 'Firm',
      subtitle: 'Colección de lujo con estuche de madera, billetera folio y accesorios.',
      currency: '₡',
      amount: '49.000',
      period: 'pack completo',
      featured: false,
      badge: 'COLECCIÓN EXCLUSIVA',
      features: [
        'Estuche de madera de nogal & aleación de titanio',
        'Billetera folio magnética con bloqueo RFID',
        'Envío express prioritario a todo Costa Rica',
        'Aplicación directa de cupones de descuento',
        'Atención personalizada por el Agente n8n',
        'Garantía extendida de reemplazo inmediato'
      ],
      ctaText: 'Adquirir Pack Colección',
      ctaClass: 'btn-secondary'
    }
  ];

  const handleSelectPlan = (planName) => {
    const el = document.getElementById('galeria-estuches') || document.getElementById('catalogo-page');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pricing-section" data-reveal id="tarifas-section">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="breadcrumb-caps" style={{ color: 'var(--color-accent-cobalt)' }}>
          TARIFAS & LICENCIAMIENTO / 05
        </div>
        <h2 style={{
          fontSize: 'clamp(28px, 4.2vw, 50px)',
          fontWeight: 800,
          letterSpacing: '-0.025em',
          marginTop: '0.4rem'
        }}>
          Inversión clara, <span className="font-serif-italic">escalabilidad garantizada</span>
        </h2>
        <p style={{ color: 'var(--color-muted)', maxWidth: '600px', margin: '0.75rem auto 0' }}>
          Sin sorpresas. Elige el formato que mejor se adapte a tu estilo de protección y aprovecha el envío gratuito por compras sobre ₡30.000.
        </p>
      </div>

      <div className="pricing-grid">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`pricing-card ${plan.featured ? 'featured' : ''}`}
            data-reveal
          >
            {plan.badge && (
              <div className={`pricing-featured-badge ${plan.featured ? 'badge-primary' : 'badge-subtle'}`}>
                <Sparkles size={11} />
                <span>{plan.badge}</span>
              </div>
            )}

            <div className="pricing-header">
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-ink)' }}>
                {plan.name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginTop: '0.35rem', minHeight: '42px', lineHeight: 1.45 }}>
                {plan.subtitle}
              </p>
            </div>

            <div className="pricing-price-box">
              <div className="pricing-price-row">
                <span className="pricing-currency">{plan.currency}</span>
                <span className="pricing-amount">{plan.amount}</span>
                <span className="pricing-period">/ {plan.period}</span>
              </div>
            </div>

            <ul className="pricing-features-list">
              {plan.features.map((feat, i) => (
                <li key={i}>
                  <Check size={16} color={plan.featured ? '#3A4BFF' : '#059669'} />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`btn ${plan.ctaClass}`}
              style={{
                width: '100%',
                marginTop: '1.25rem',
                backgroundColor: plan.featured ? '#3A4BFF' : undefined,
                borderColor: plan.featured ? '#3A4BFF' : undefined
              }}
              onClick={() => handleSelectPlan(plan.name)}
            >
              <span>{plan.ctaText}</span>
              <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Short Footer */}
      <footer className="tessel-footer">
        <div className="footer-top">
          <div>
            <div className="breadcrumb-caps" style={{ color: '#1B1D22', fontSize: '0.9rem' }}>
              TESSEL × CASES STUDIO
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-muted)', marginTop: '0.4rem', maxWidth: '420px' }}>
              Tienda especializada en estuches de precisión para smartphones, transacciones atómicas SQLite y agente comercial n8n.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                Sistema
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                <li style={{ marginBottom: '0.4rem' }}>• Backend :3001 (Node 24)</li>
                <li style={{ marginBottom: '0.4rem' }}>• Frontend :5173 (Vite + CSS)</li>
                <li style={{ marginBottom: '0.4rem' }}>• Agente n8n :5678 (DeepSeek)</li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '0.5rem' }}>
                Rúbrica Caso 5
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem' }}>
                <li style={{ marginBottom: '0.4rem' }}>• 22/22 Tests Aprobados</li>
                <li style={{ marginBottom: '0.4rem' }}>• Manejo de Error 409 Conflict</li>
                <li style={{ marginBottom: '0.4rem' }}>• 60fps con rAF + Observer</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Tessel Architecture & TechStore. Todos los derechos reservados.</span>
          <span style={{ color: '#3A4BFF', fontWeight: 600 }}>Diseño Minimalista Tessel</span>
        </div>
      </footer>
    </section>
  );
}
