import { useState } from 'react';
import { cambiarEstadoOrden, cancelarOrden } from '../services/api';
import AlertMessage from './AlertMessage';
import { X, Check, Truck, Package, Ban, ArrowRight, Clock, CreditCard, CheckCircle2, AlertTriangle } from 'lucide-react';

const PASOS = [
  { key: 'nueva', label: 'Nueva', icon: Clock },
  { key: 'pagada', label: 'Pagada', icon: CreditCard },
  { key: 'enviada', label: 'Enviada', icon: Truck },
  { key: 'entregada', label: 'Entregada', icon: CheckCircle2 }
];

export default function OrderModal({ order, onClose, onOrderUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!order) return null;

  const formatearMonto = (monto) => `₡${Number(monto || 0).toLocaleString('es-CR')}`;

  const handleCambiarEstado = async (nuevoEstado) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await cambiarEstadoOrden(order.id, nuevoEstado);
      setSuccess(`Estado actualizado a '${nuevoEstado}' correctamente`);
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (!window.confirm('¿Confirmas que deseas cancelar esta orden? El stock de todos los productos será repuesto automáticamente en SQLite.')) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await cancelarOrden(order.id);
      setSuccess('Orden cancelada y stock repuesto exitosamente mediante Transacción Atómica');
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const puedeCancelar = order.estado === 'nueva' || order.estado === 'pagada';
  const pasoActualIndex = PASOS.findIndex(p => p.key === order.estado);
  const esCancelada = order.estado === 'cancelada';
  const progresoPorcentaje = pasoActualIndex >= 0 ? (pasoActualIndex / (PASOS.length - 1)) * 100 : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#ffffff',
        border: '1px solid var(--border-strong)',
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-primary)' }}>Detalle de Orden #{order.id}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha: {order.fecha}</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Stepper Gráfico del Flujo de Estados (Requisito Rúbrica) */}
        {!esCancelada ? (
          <div style={{ margin: '1.5rem 0', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              FLUJO DE ESTADOS DE LA ORDEN
            </div>
            <div className="order-stepper">
              <div className="stepper-line">
                <div className="stepper-line-progress" style={{ width: `${progresoPorcentaje}%` }}></div>
              </div>
              {PASOS.map((paso, idx) => {
                const Icon = paso.icon;
                const isCompleted = idx < pasoActualIndex;
                const isActive = idx === pasoActualIndex;
                return (
                  <div key={paso.key} className={`stepper-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="stepper-circle">
                      <Icon size={18} />
                    </div>
                    <span className="stepper-label">{paso.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{
            margin: '1.25rem 0',
            padding: '1rem 1.25rem',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error-border)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--color-error)'
          }}>
            <Ban size={22} color="var(--color-error)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Orden Cancelada</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                El inventario de todos los productos fue devuelto a la base de datos mediante Transacción Atómica.
              </div>
            </div>
          </div>
        )}

        {/* Cliente y Estado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          padding: '1rem',
          background: 'var(--bg-elevated)',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>CLIENTE</div>
            <div style={{ fontWeight: 600 }}>{order.cliente?.nombre || 'Cliente General'}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{order.cliente?.email}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)' }}>📍 {order.cliente?.ciudad}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ESTADO ACTUAL</div>
            <div style={{ marginTop: '0.25rem' }}>
              <span className={`badge-status status-${order.estado}`}>
                {order.estado}
              </span>
            </div>
            {order.cupon && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>
                🎟️ Cupón: <strong>{order.cupon.codigo}</strong> (-{order.cupon.porcentaje}%)
              </div>
            )}
          </div>
        </div>

        {/* Lista de Items */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>PRODUCTOS COMPRADOS</h4>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th style={{ textAlign: 'center' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Unitario</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.producto_nombre}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.producto_categoria}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>x{item.cantidad}</td>
                    <td style={{ textAlign: 'right' }}>{formatearMonto(item.precio_unitario)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatearMonto(item.cantidad * item.precio_unitario)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1rem',
          marginBottom: '1.5rem',
          fontSize: '0.925rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
            <span>{formatearMonto(order.subtotal)}</span>
          </div>
          {order.descuento > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', color: 'var(--accent-gold)' }}>
              <span>Descuento aplicado:</span>
              <span>-{formatearMonto(order.descuento)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Costo de Envío:</span>
            <span>{order.envio === 0 ? <strong style={{ color: 'var(--color-success)' }}>GRATIS (₡0)</strong> : formatearMonto(order.envio)}</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '1.25rem',
            fontWeight: 800,
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.65rem',
            color: 'var(--text-primary)'
          }}>
            <span>Total Pagado:</span>
            <span style={{ color: 'var(--accent-primary)' }}>{formatearMonto(order.total)}</span>
          </div>
        </div>

        {/* Acciones de Transición de Estados y Cancelación */}
        <div style={{
          background: 'var(--bg-elevated)',
          padding: '1.15rem',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            ACCIONES DE REGLAS DE NEGOCIO
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {order.estado === 'nueva' && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleCambiarEstado('pagada')}
                disabled={loading}
              >
                <Check size={16} /> Marcar como Pagada
              </button>
            )}

            {order.estado === 'pagada' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleCambiarEstado('enviada')}
                disabled={loading}
              >
                <Truck size={16} /> Enviar Pedido (Transición)
              </button>
            )}

            {order.estado === 'enviada' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleCambiarEstado('entregada')}
                disabled={loading}
              >
                <Package size={16} /> Marcar como Entregada
              </button>
            )}

            {puedeCancelar && (
              <button
                className="btn btn-danger btn-sm"
                onClick={handleCancelar}
                disabled={loading}
                title="Repone stock en la base de datos automáticamente"
              >
                <Ban size={16} /> Cancelar y Reponer Stock
              </button>
            )}

            {order.estado === 'cancelada' && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-error)' }}>
                Esta orden está cancelada. El inventario ya fue devuelto.
              </span>
            )}

            {order.estado === 'entregada' && (
              <span style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>
                Orden completada y entregada con éxito.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
