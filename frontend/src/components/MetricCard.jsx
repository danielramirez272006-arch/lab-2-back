export default function MetricCard({ title, value, subtitle, icon, highlight = false }) {
  return (
    <div className={`glass-card kpi-card ${highlight ? 'highlight-glow' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="kpi-title">{title}</div>
          <div className="kpi-value">{value}</div>
          {subtitle && <div className="kpi-sub">{subtitle}</div>}
        </div>
        {icon && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.75rem',
            borderRadius: '12px',
            color: 'var(--accent-secondary)'
          }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
