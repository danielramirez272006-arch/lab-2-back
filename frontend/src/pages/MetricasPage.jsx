import { getResumen } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import MetricCard from '../components/MetricCard';
import AlertMessage from '../components/AlertMessage';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, Trophy, Layers, PieChart, RefreshCw, Loader2, Clock, ShieldAlert } from 'lucide-react';

export default function MetricasPage() {
  const { data: resumen, loading, error, refetch } = useFetch(getResumen);

  const formatearMonto = (monto) => `₡${Number(monto || 0).toLocaleString('es-CR')}`;

  // Calcular porcentaje de ventas para barras visuales
  const totalVentasCategorias = resumen?.ventas_por_categoria?.reduce(
    (acc, c) => acc + (c.total_ventas || 0), 0
  ) || 1;

  return (
    <div id="metricas-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Panel de Métricas y Analítica</h1>
            <span className="logo-badge" style={{ background: 'var(--accent-ai-gradient)' }}>Reto Extra Activo</span>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Indicadores comerciales calculados con SQL (SUM, COUNT, GROUP BY) y predicción de reposición de inventario.
          </p>
        </div>

        <button onClick={refetch} className="btn btn-secondary btn-sm" id="btn-refresh-metricas">
          <RefreshCw size={15} /> Actualizar Métricas
        </button>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
          <p>Calculando agregaciones en la base de datos...</p>
        </div>
      )}

      {!loading && resumen && (
        <>
          {/* Tarjetas KPI Superiores */}
          <div className="metrics-grid">
            <MetricCard
              title="Ingresos Totales Acumulados"
              value={formatearMonto(resumen.ingresos_totales)}
              subtitle={`En ${resumen.total_ordenes_activas} órdenes válidas`}
              icon={<DollarSign size={24} />}
            />

            <MetricCard
              title="Ticket Promedio por Orden"
              value={formatearMonto(resumen.ticket_promedio)}
              subtitle="Valor medio por transacción"
              icon={<TrendingUp size={24} />}
            />

            <MetricCard
              title="Descuentos Otorgados"
              value={formatearMonto(resumen.total_descuentos_otorgados)}
              subtitle="Ahorro aplicado mediante cupones"
              icon={<ShoppingBag size={24} />}
            />

            <MetricCard
              title="Alertas de Inventario"
              value={`${resumen.alertas_reposicion?.length || 0} productos`}
              subtitle="Riesgo de agotamiento próximo"
              icon={<AlertTriangle size={24} color="#f59e0b" />}
            />
          </div>

          {/* RETO EXTRA OFICIAL: Alertas de reposición basadas en ritmo de ventas de la última semana */}
          <div className="glass-card" style={{
            marginBottom: '2rem',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(18, 24, 38, 0.8) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldAlert size={22} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.25rem' }}>Reto Extra: Alertas de Reposición Predictivas</h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                Velocidad de venta de los últimos 7 días
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              El sistema analiza las ventas recientes para estimar los días restantes antes de un quiebre de stock:
            </p>

            {(!resumen.alertas_reposicion || resumen.alertas_reposicion.length === 0) ? (
              <p style={{ color: 'var(--color-success)', fontSize: '0.9rem' }}>
                ✅ Todos los productos tienen inventario suficiente para el ritmo de ventas actual.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th style={{ textAlign: 'center' }}>Stock Actual</th>
                      <th style={{ textAlign: 'center' }}>Ventas 7 Días</th>
                      <th style={{ textAlign: 'center' }}>Consumo Diario Est.</th>
                      <th style={{ textAlign: 'center' }}>Días Restantes</th>
                      <th style={{ textAlign: 'center' }}>Nivel de Riesgo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.alertas_reposicion.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                        <td><span className="product-badge-cat">{item.categoria}</span></td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.stock} un.</td>
                        <td style={{ textAlign: 'center' }}>{item.vendido_ultima_semana} un.</td>
                        <td style={{ textAlign: 'center' }}>~{item.consumo_diario_estimado} un./día</td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={14} /> {item.dias_restantes_estimados} días
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge-status ${item.nivel_riesgo === 'critico' ? 'status-cancelada' : 'status-enviada'}`}>
                            {item.nivel_riesgo === 'critico' ? '⚠️ Crítico (≤3 días)' : '⚡ Advertencia'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            {/* Top 3 Productos Más Vendidos */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Trophy size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.2rem' }}>Top 3 Productos Más Vendidos</h3>
              </div>

              {resumen.top_3_productos?.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No hay ventas registradas aún.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {resumen.top_3_productos?.map((prod, idx) => (
                    <div
                      key={prod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        borderLeft: `4px solid ${idx === 0 ? 'var(--accent-gold)' : (idx === 1 ? '#94a3b8' : '#cd7f32')}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                          fontSize: '1.4rem',
                          fontWeight: 800,
                          color: idx === 0 ? 'var(--accent-gold)' : (idx === 1 ? '#cbd5e1' : '#d97706'),
                          minWidth: '24px'
                        }}>
                          #{idx + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{prod.nombre}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{prod.categoria}</div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: 'var(--color-success)' }}>
                          {prod.unidades_vendidas} unidades
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {formatearMonto(prod.total_recaudado)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ventas por Categoría */}
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Layers size={20} color="var(--accent-secondary)" />
                <h3 style={{ fontSize: '1.2rem' }}>Ventas por Categoría</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {resumen.ventas_por_categoria?.map((cat, idx) => {
                  const porcentaje = Math.round((cat.total_ventas / totalVentasCategorias) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 600 }}>{cat.categoria}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatearMonto(cat.total_ventas)} ({porcentaje}%)
                        </span>
                      </div>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        height: '8px',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${porcentaje}%`,
                          background: 'linear-gradient(90deg, #6366f1, #06b6d4)'
                        }} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {cat.unidades_vendidas} unidades en {cat.total_ordenes} órdenes
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Distribución por Estado y Catálogo General */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <PieChart size={18} color="var(--accent-primary)" />
                <h4 style={{ fontSize: '1rem' }}>Órdenes por Estado</h4>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {resumen.ordenes_por_estado?.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '0.6rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem'
                  }}>
                    <span className={`badge-status status-${item.estado}`}>{item.estado}</span>
                    <strong style={{ fontSize: '1.1rem' }}>{item.cantidad}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h4 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Resumen del Ecosistema</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', textAlign: 'center' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{resumen.totales_catalogo?.total_productos}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Productos Activos</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{resumen.totales_catalogo?.total_clientes}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clientes Registrados</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
