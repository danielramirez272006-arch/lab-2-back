import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getClientes, getProductos, validarCupon, createOrden, createCliente } from '../services/api';
import { callAiAgent } from '../services/aiService';
import AlertMessage from '../components/AlertMessage';
import { Trash2, Plus, Minus, Sparkles, Tag, Check, Truck, ArrowRight, Loader2, User, UserPlus, X } from 'lucide-react';

const CIUDADES_COSTA_RICA = [
  'San José', 'Heredia', 'Alajuela', 'Cartago', 'Puntarenas', 'Liberia', 'Limón'
];

export default function CarritoPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, addToCart } = useCart();

  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [ciudadEnvio, setCiudadEnvio] = useState('San José');

  // Modal nuevo cliente
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', email: '', ciudad: 'San José' });
  const [creandoCliente, setCreandoCliente] = useState(false);
  const [clienteError, setClienteError] = useState(null);

  // Cupón
  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [validandoCupon, setValidandoCupon] = useState(false);
  const [cuponError, setCuponError] = useState(null);

  // IA Comercial
  const [iaLoading, setIaLoading] = useState(false);
  const [iaRecomendacion, setIaRecomendacion] = useState(null);
  const [catalogo, setCatalogo] = useState([]);

  // Estados de checkout
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [ordenCompletada, setOrdenCompletada] = useState(null);

  // Cargar clientes y catálogo al montar
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [cls, prods] = await Promise.all([getClientes(), getProductos()]);
        setClientes(cls);
        if (cls.length > 0) {
          setClienteId(cls[0].id);
          setCiudadEnvio(cls[0].ciudad);
        }
        setCatalogo(prods);
      } catch (err) {
        console.error('Error al cargar datos iniciales:', err);
      }
    }
    loadInitialData();
  }, []);

  const handleClienteChange = (id) => {
    setClienteId(id);
    const cli = clientes.find(c => c.id === Number(id));
    if (cli && cli.ciudad) {
      setCiudadEnvio(cli.ciudad);
    }
    if (cuponAplicado) {
      setCuponAplicado(null);
      setCuponError('Por favor valida nuevamente el cupón para el cliente seleccionado.');
    }
  };

  // Crear nuevo cliente desde el carrito (demuestra error 409 si el email ya existe)
  const handleCrearCliente = async (e) => {
    e.preventDefault();
    setCreandoCliente(true);
    setClienteError(null);

    try {
      const nuevo = await createCliente(nuevoCliente);
      setClientes(prev => [...prev, nuevo]);
      setClienteId(nuevo.id);
      setCiudadEnvio(nuevo.ciudad);
      setShowClienteModal(false);
      setNuevoCliente({ nombre: '', email: '', ciudad: 'San José' });
    } catch (err) {
      // Si el email ya existe, el servidor responde con 409
      setClienteError(err.message);
    } finally {
      setCreandoCliente(false);
    }
  };

  // Cálculos de montos
  const montoDescuento = cuponAplicado
    ? Number((subtotal * (cuponAplicado.porcentaje / 100)).toFixed(2))
    : 0;

  const subtotalConDescuento = Math.max(0, subtotal - montoDescuento);

  // Regla de envío: gratis si subtotal con descuento >= 30,000
  const UMBRAL_GRATIS = 30000;
  const esEnvioGratis = subtotalConDescuento >= UMBRAL_GRATIS;

  const tarifas = {
    'san josé': 2000,
    'san jose': 2000,
    'heredia': 2000,
    'alajuela': 2500,
    'cartago': 2500,
    'puntarenas': 4000,
    'liberia': 4500,
    'guanacaste': 4500,
    'limón': 4500,
    'limon': 4500
  };

  const costoEnvioCalculado = esEnvioGratis
    ? 0
    : (tarifas[ciudadEnvio.toLowerCase()] || 3000);

  const totalFinal = subtotalConDescuento + costoEnvioCalculado;

  const progresoGratis = Math.min(100, (subtotalConDescuento / UMBRAL_GRATIS) * 100);
  const faltanteParaGratis = Math.max(0, UMBRAL_GRATIS - subtotalConDescuento);

  const formatearMonto = (monto) => `₡${Number(monto || 0).toLocaleString('es-CR')}`;

  const handleValidarCupon = async (e) => {
    e.preventDefault();
    if (!codigoCupon.trim()) return;

    setValidandoCupon(true);
    setCuponError(null);
    try {
      const res = await validarCupon(codigoCupon.trim(), clienteId);
      setCuponAplicado(res.cupon);
      setCuponError(null);
    } catch (err) {
      setCuponAplicado(null);
      setCuponError(err.message);
    } finally {
      setValidandoCupon(false);
    }
  };

  const handlePedirRecomendacionIA = async () => {
    setIaLoading(true);
    try {
      const payload = {
        accion: 'recomendar_carrito',
        carrito: cart,
        catalogo_disponible: catalogo
      };
      const res = await callAiAgent(payload);
      if (res.ok) {
        setIaRecomendacion(res);
      } else {
        alert(res.error || 'No fue posible obtener sugerencias de la IA');
      }
    } catch (err) {
      console.error('Error al consultar agente de IA:', err);
    } finally {
      setIaLoading(false);
    }
  };

  const handleConfirmarOrden = async () => {
    if (cart.length === 0) return;

    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const payload = {
        cliente_id: Number(clienteId),
        cupon_codigo: cuponAplicado ? cuponAplicado.codigo : undefined,
        items: cart.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad
        }))
      };

      const nuevaOrden = await createOrden(payload);
      setOrdenCompletada(nuevaOrden);
      clearCart();
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (ordenCompletada) {
    return (
      <div style={{ maxWidth: '600px', margin: '3rem auto' }} className="glass-card">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Check size={36} />
          </div>

          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>¡Orden #{ordenCompletada.id} Procesada con Éxito!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            La transacción atómica fue completada en la base de datos y el stock fue descontado.
          </p>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cliente:</span>
              <strong>{ordenCompletada.cliente?.nombre}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Destino:</span>
              <strong>{ordenCompletada.cliente?.ciudad}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Envío:</span>
              <strong>{ordenCompletada.envio === 0 ? 'Gratis (₡0)' : formatearMonto(ordenCompletada.envio)}</strong>
            </div>
            {ordenCompletada.descuento > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>
                <span>Descuento aplicado:</span>
                <strong>-{formatearMonto(ordenCompletada.descuento)}</strong>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', fontSize: '1.15rem' }}>
              <span>Total:</span>
              <strong style={{ color: 'var(--accent-secondary)' }}>{formatearMonto(ordenCompletada.total)}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => navigate('/ordenes')}>
              Ver en Historial de Órdenes <ArrowRight size={16} />
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="carrito-page">
      <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Carrito de Compras y Checkout</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Verifica tus artículos seleccionados, aplica cupones vigentes y calcula tu envío a cualquier parte del país.
      </p>

      {/* Sugerencias del Agente de IA Comercial (Caso B) */}
      {cart.length > 0 && (
        <div className="ai-banner">
          <div className="ai-banner-header">
            <Sparkles size={20} />
            <span>Agente Comercial IA - Sugerencias de Combo (Caso B)</span>
          </div>

          {!iaRecomendacion ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <p className="ai-banner-content" style={{ margin: 0 }}>
                Analiza tus productos seleccionados para encontrar 2 complementos técnicos ideales con precios en colones (₡).
              </p>
              <button
                className="btn btn-ai btn-sm"
                onClick={handlePedirRecomendacionIA}
                disabled={iaLoading}
                id="btn-recomendar-ia"
              >
                {iaLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {iaLoading ? 'Analizando catálogo...' : 'Generar Combo Ideal con IA'}
              </button>
            </div>
          ) : (
            <div>
              <p className="ai-banner-content" style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
                "{iaRecomendacion.data}"
              </p>

              {iaRecomendacion.warning && (
                <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginBottom: '0.75rem' }}>
                  {iaRecomendacion.warning}
                </div>
              )}

              {iaRecomendacion.sugerencias && (
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {iaRecomendacion.sugerencias.map((prod, i) => (
                    <div key={i} style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{prod.nombre} ({formatearMonto(prod.precio)})</span>
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => addToCart(prod, 1)}
                      >
                        + Agregar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Tu carrito está vacío actualmente.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Lista de Productos en el Carrito */}
          <div>
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.15rem' }}>Artículos en el Carrito ({cart.length})</h3>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={clearCart}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                >
                  Vaciar
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {cart.map(item => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.85rem',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.nombre}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {formatearMonto(item.precio)} c/u · Stock: {item.stock}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem' }}
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 600 }}>
                          {item.cantidad}
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.5rem' }}
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          disabled={item.cantidad >= item.stock}
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div style={{ minWidth: '85px', textAlign: 'right', fontWeight: 700 }}>
                        {formatearMonto(item.cantidad * item.precio)}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.25rem' }}
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Barra de Envío Gratis */}
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Truck size={16} color="var(--accent-secondary)" />
                  <strong>Envío Gratis</strong> (compras mayores a ₡30,000)
                </span>
                <span style={{ fontWeight: 700, color: esEnvioGratis ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                  {esEnvioGratis ? '¡Alcanzado!' : `Faltan ${formatearMonto(faltanteParaGratis)}`}
                </span>
              </div>
              <div className="shipping-progress">
                <div className="shipping-bar" style={{ width: `${progresoGratis}%` }} />
              </div>
            </div>
          </div>

          {/* Resumen de Compra y Formulario de Cliente */}
          <div>
            <div className="glass-card" style={{ position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Resumen del Pedido</h3>

              {/* Selector de Cliente + Botón Nuevo Cliente */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Cliente que realiza la orden:
                  </label>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                    onClick={() => setShowClienteModal(true)}
                  >
                    <UserPlus size={13} /> + Nuevo Cliente
                  </button>
                </div>
                <select
                  className="form-select"
                  value={clienteId}
                  onChange={(e) => handleClienteChange(e.target.value)}
                  id="select-cliente"
                >
                  {clientes.map(cli => (
                    <option key={cli.id} value={cli.id}>
                      {cli.nombre} ({cli.ciudad})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ciudad de destino */}
              <div className="form-group">
                <label className="form-label">Ciudad de Envío:</label>
                <select
                  className="form-select"
                  value={ciudadEnvio}
                  onChange={(e) => setCiudadEnvio(e.target.value)}
                  id="select-ciudad-envio"
                >
                  {CIUDADES_COSTA_RICA.map(cd => (
                    <option key={cd} value={cd}>{cd}</option>
                  ))}
                </select>
              </div>

              {/* Cupón de Descuento */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Cupón de Descuento:</label>
                <form onSubmit={handleValidarCupon} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. TECH10, SUPER20"
                    value={codigoCupon}
                    onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase' }}
                    id="input-cupon"
                  />
                  <button
                    type="submit"
                    className="btn btn-secondary btn-sm"
                    disabled={validandoCupon || !codigoCupon.trim()}
                    id="btn-aplicar-cupon"
                  >
                    {validandoCupon ? <Loader2 size={16} className="animate-spin" /> : <Tag size={16} />}
                    Aplicar
                  </button>
                </form>

                {cuponError && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <AlertMessage type="error" message={cuponError} onClose={() => setCuponError(null)} />
                  </div>
                )}

                {cuponAplicado && (
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--color-success-bg)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '8px',
                    color: '#6ee7b7',
                    fontSize: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>🎟️ Cupón <strong>{cuponAplicado.codigo}</strong> (-{cuponAplicado.porcentaje}%)</span>
                    <button
                      onClick={() => setCuponAplicado(null)}
                      style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
                    >
                      Remover
                    </button>
                  </div>
                )}
              </div>

              {/* Desglose de Totales */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                marginBottom: '1.5rem',
                fontSize: '0.925rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                  <span>{formatearMonto(subtotal)}</span>
                </div>

                {montoDescuento > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>
                    <span>Descuento ({cuponAplicado?.porcentaje}%):</span>
                    <span>-{formatearMonto(montoDescuento)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Envío a {ciudadEnvio}:</span>
                  <span>{esEnvioGratis ? <strong style={{ color: 'var(--color-success)' }}>GRATIS</strong> : formatearMonto(costoEnvioCalculado)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  paddingTop: '0.75rem',
                  fontSize: '1.25rem',
                  fontWeight: 800
                }}>
                  <span>Total Final:</span>
                  <span style={{ color: 'var(--accent-secondary)' }}>{formatearMonto(totalFinal)}</span>
                </div>
              </div>

              {/* Error de checkout (ej. 409) */}
              {checkoutError && (
                <div style={{ marginBottom: '1rem' }}>
                  <AlertMessage type="error" message={checkoutError} onClose={() => setCheckoutError(null)} />
                </div>
              )}

              {/* Botón de Confirmación */}
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                onClick={handleConfirmarOrden}
                disabled={checkoutLoading || cart.length === 0}
                id="btn-confirmar-orden"
              >
                {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {checkoutLoading ? 'Procesando Transacción...' : 'Confirmar Orden (Transacción Atómica)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear Nuevo Cliente */}
      {showClienteModal && (
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
          zIndex: 300,
          padding: '1.5rem'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', background: '#ffffff', border: '1px solid var(--border-strong)', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem' }}>Registrar Nuevo Cliente</h3>
              <button onClick={() => setShowClienteModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem' }}>
                <X size={16} />
              </button>
            </div>

            {clienteError && <AlertMessage type="error" message={clienteError} onClose={() => setClienteError(null)} />}

            <form onSubmit={handleCrearCliente}>
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ej. Ana Jiménez"
                  value={nuevoCliente.nombre}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Electrónico *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="ana@correo.com"
                  value={nuevoCliente.email}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  La base de datos rechaza con 409 si el correo ya está registrado.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Ciudad / Provincia *</label>
                <select
                  className="form-select"
                  value={nuevoCliente.ciudad}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, ciudad: e.target.value })}
                >
                  {CIUDADES_COSTA_RICA.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowClienteModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={creandoCliente}>
                  {creandoCliente ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
