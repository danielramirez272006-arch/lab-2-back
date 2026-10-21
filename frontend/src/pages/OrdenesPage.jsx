import { useState } from 'react';
import { getOrdenes, getOrdenById } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import OrderModal from '../components/OrderModal';
import AlertMessage from '../components/AlertMessage';
import { ClipboardList, Filter, Eye, RefreshCw, Loader2 } from 'lucide-react';

export default function OrdenesPage() {
  const [filtroEstado, setFiltroEstado] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Custom hook useFetch
  const { data: ordenes, loading, error, refetch } = useFetch(
    () => getOrdenes({ estado: filtroEstado }),
    [filtroEstado]
  );

  const formatearMonto = (monto) => `₡${Number(monto || 0).toLocaleString('es-CR')}`;

  const handleVerDetalle = async (id) => {
    setLoadingDetail(true);
    try {
      const detalle = await getOrdenById(id);
      setSelectedOrder(detalle);
    } catch (err) {
      alert(`Error al cargar orden #${id}: ${err.message}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOrderUpdated = (updatedOrder) => {
    setSelectedOrder(updatedOrder);
    refetch(); // Recargar lista completa
  };

  return (
    <div id="ordenes-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Gestión y Seguimiento de Órdenes</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Supervisa el flujo de pedidos, transiciones de estado y cancelaciones con reposición de inventario.
          </p>
        </div>

        <button onClick={refetch} className="btn btn-secondary btn-sm" id="btn-refresh-ordenes">
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="glass-card" style={{ marginBottom: '2rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Filter size={18} style={{ color: 'var(--text-muted)' }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filtrar por Estado:</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: '', label: 'Todas' },
            { id: 'nueva', label: 'Nuevas' },
            { id: 'pagada', label: 'Pagadas' },
            { id: 'enviada', label: 'Enviadas' },
            { id: 'entregada', label: 'Entregadas' },
            { id: 'cancelada', label: 'Canceladas' }
          ].map(item => (
            <button
              key={item.id}
              className={`btn btn-sm ${filtroEstado === item.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFiltroEstado(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--accent-primary)' }} />
          <p>Cargando órdenes desde el backend...</p>
        </div>
      )}

      {!loading && ordenes && (
        <>
          {ordenes.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                No se encontraron órdenes {filtroEstado ? `en estado '${filtroEstado}'` : 'registradas'}.
              </p>
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="custom-table" id="tabla-ordenes">
                  <thead>
                    <tr>
                      <th>Orden</th>
                      <th>Cliente</th>
                      <th>Ciudad</th>
                      <th>Fecha</th>
                      <th>Artículos</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                      <th style={{ textAlign: 'center' }}>Estado</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map(orden => (
                      <tr key={orden.id} id={`orden-row-${orden.id}`}>
                        <td style={{ fontWeight: 700 }}>#{orden.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{orden.cliente_nombre}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{orden.cliente_email}</div>
                        </td>
                        <td>{orden.cliente_ciudad}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{orden.fecha}</td>
                        <td>{orden.total_items} items</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#fff' }}>
                          {formatearMonto(orden.total)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge-status status-${orden.estado}`}>
                            {orden.estado}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleVerDetalle(orden.id)}
                            disabled={loadingDetail}
                            id={`btn-detalle-${orden.id}`}
                          >
                            <Eye size={14} /> Detalle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Detalle con Acciones */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
}
