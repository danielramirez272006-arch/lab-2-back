import { useState } from 'react';
import { cambiarEstadoOrden, cancelarOrden } from '../services/api';
import AlertMessage from './AlertMessage';
import { X, Check, Truck, Package, Ban, ArrowRight } from 'lucide-react';

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
    if (!window.confirm('¿Confirmas que deseas cancelar esta orden? El stock de todos los productos será repuesto automáticamente.')) {
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await cancelarOrden(order.id);
      setSuccess('Orden cancelada y stock repuesto exitosamente');
      if (onOrderUpdated) onOrderUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const puedeCancelar = order.estado === 'nueva' || order.estado === 'pagada';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 8, 15, 0.8)',
      backdropFilter: 'blur(8px)',
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
        background: '#121826',
        border: '1px solid rgba(255, 255, 255, 0.12)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem' }}>Detalle de Orden #{order.id}</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha: {order.fecha}</span>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
            <X size={18} />
          </button>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}
        {success && <AlertMessage type="success" message={success} onClose={() => setSuccess(null)} />}

        {/* Cliente y Estado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
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
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '0.5rem',
            color: '#fff'
          }}>
            <span>Total Pagado:</span>
            <span style={{ color: 'var(--accent-secondary)' }}>{formatearMonto(order.total)}</span>
          </div>
        </div>

        {/* Acciones de Transición de Estados y Cancelación */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          padding: '1rem',
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
