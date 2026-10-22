import { useState } from 'react';
import {
  getProductos, createProducto, updateProducto, deleteProducto,
  getCupones, createCupon, updateCupon, deleteCupon
} from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { callAiAgent } from '../services/aiService';
import AlertMessage from '../components/AlertMessage';
import {
  PackagePlus, Tag, PlusCircle, Edit, Trash2, Sparkles, Loader2, RefreshCw, X, Check, Calendar, Percent, Hash
} from 'lucide-react';

const CATEGORIAS = ['MagSafe', 'Rugged', 'Madera & Metal', 'Fibra de Carbono', 'Silicona', 'Transparente', 'Billetera Folio', 'Edición Especial'];

export default function GestionPage() {
  const [activeTab, setActiveTab] = useState('productos'); // 'productos' | 'cupones'

  // Fetch productos
  const { data: productos, loading: loadingProd, error: errorProd, refetch: refetchProd } = useFetch(getProductos);

  // Fetch cupones
  const { data: cupones, loading: loadingCup, error: errorCup, refetch: refetchCup } = useFetch(getCupones);

  // Formulario Producto
  const [prodForm, setProdForm] = useState({
    nombre: '',
    categoria: 'MagSafe',
    precio: '',
    stock: '',
    descripcion: ''
  });
  const [editandoProdId, setEditandoProdId] = useState(null);

  // Formulario Cupón
  const [cupForm, setCupForm] = useState({
    codigo: '',
    porcentaje: '',
    vigente_hasta: '',
    usos_maximos: ''
  });
  const [editandoCupId, setEditandoCupId] = useState(null);

  // Estados comunes de notificación
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // IA para productos
  const [iaLoading, setIaLoading] = useState(false);
  const [iaSuccessMsg, setIaSuccessMsg] = useState(null);

  const formatearMonto = (monto) => `₡${Number(monto || 0).toLocaleString('es-CR')}`;

  // ==================== LOGICA PRODUCTOS ====================
  const resetProdForm = () => {
    setProdForm({ nombre: '', categoria: 'MagSafe', precio: '', stock: '', descripcion: '' });
    setEditandoProdId(null);
    setFormError(null);
    setFormSuccess(null);
    setIaSuccessMsg(null);
  };

  const handleEditProd = (p) => {
    setEditandoProdId(p.id);
    setProdForm({
      nombre: p.nombre,
      categoria: p.categoria,
      precio: p.precio,
      stock: p.stock,
      descripcion: p.descripcion || ''
    });
    setFormError(null);
    setFormSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerarDescripcionIA = async () => {
    if (!prodForm.nombre.trim()) {
      setFormError('Por favor ingresa primero el nombre del producto para que la IA pueda generar su descripción.');
      return;
    }

    setIaLoading(true);
    setFormError(null);
    setIaSuccessMsg(null);

    try {
      const payload = {
        accion: 'generar_descripcion',
        nombre: prodForm.nombre.trim(),
        categoria: prodForm.categoria
      };

      const res = await callAiAgent(payload);
      if (res.ok) {
        setProdForm(prev => ({ ...prev, descripcion: res.data }));
        setIaSuccessMsg('✨ Descripción generada con éxito por el Agente de IA (20 a 30 palabras).');
      } else {
        setFormError(res.error || 'No se pudo generar la descripción con IA');
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIaLoading(false);
    }
  };

  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    if (!prodForm.nombre.trim() || prodForm.precio === '' || prodForm.stock === '') {
      setFormError('Todos los campos marcados son obligatorios.');
      setFormLoading(false);
      return;
    }

    if (Number(prodForm.precio) <= 0) {
      setFormError('El precio debe ser un número mayor a ₡0.');
      setFormLoading(false);
      return;
    }

    if (Number(prodForm.stock) < 0) {
      setFormError('El stock no puede ser negativo.');
      setFormLoading(false);
      return;
    }

    try {
      if (editandoProdId) {
        await updateProducto(editandoProdId, prodForm);
        setFormSuccess(`Producto #${editandoProdId} actualizado correctamente`);
      } else {
        await createProducto(prodForm);
        setFormSuccess('Nuevo producto añadido al inventario exitosamente');
      }
      resetProdForm();
      refetchProd();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProducto = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar '${nombre}'?`)) return;
    try {
      await deleteProducto(id);
      setFormSuccess(`'${nombre}' eliminado del inventario`);
      refetchProd();
    } catch (err) {
      setFormError(err.message);
    }
  };

  // ==================== LOGICA CUPONES (RECURSO 2) ====================
  const resetCupForm = () => {
    setCupForm({ codigo: '', porcentaje: '', vigente_hasta: '', usos_maximos: '' });
    setEditandoCupId(null);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleEditCup = (c) => {
    setEditandoCupId(c.id);
    setCupForm({
      codigo: c.codigo,
      porcentaje: c.porcentaje,
      vigente_hasta: c.vigente_hasta,
      usos_maximos: c.usos_maximos
    });
    setFormError(null);
    setFormSuccess(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitCupon = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const pct = Number(cupForm.porcentaje);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      setFormError('El porcentaje de descuento debe estar entre 1% y 100%.');
      setFormLoading(false);
      return;
    }

    const usos = Number(cupForm.usos_maximos);
    if (isNaN(usos) || usos <= 0) {
      setFormError('Los usos máximos deben ser mayores a 0.');
      setFormLoading(false);
      return;
    }

    try {
      if (editandoCupId) {
        await updateCupon(editandoCupId, cupForm);
        setFormSuccess(`Cupón #${editandoCupId} actualizado correctamente`);
      } else {
        await createCupon(cupForm);
        setFormSuccess(`Cupón '${cupForm.codigo.toUpperCase()}' creado exitosamente`);
      }
      resetCupForm();
      refetchCup();
    } catch (err) {
      // Captura de código 409 (ej. código duplicado)
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCupon = async (id, codigo) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el cupón '${codigo}'?`)) return;
    try {
      await deleteCupon(id);
      setFormSuccess(`Cupón '${codigo}' eliminado`);
      refetchCup();
    } catch (err) {
      // Si el cupón ya tiene órdenes asociadas, la API rechaza con 409
      setFormError(err.message);
    }
  };

  const hoy = new Date().toISOString().split('T')[0];

  return (
    <div id="gestion-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.4rem' }}>Centro de Gestión y Catálogo</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            CRUD completo de los dos recursos principales (Productos y Cupones) con validaciones 400 y 409.
          </p>
        </div>

        <button
          onClick={() => { activeTab === 'productos' ? refetchProd() : refetchCup(); }}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw size={15} /> Recargar Datos
        </button>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          className={`btn ${activeTab === 'productos' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('productos'); setFormError(null); setFormSuccess(null); }}
        >
          <PackagePlus size={18} /> Gestión de Productos
        </button>
        <button
          className={`btn ${activeTab === 'cupones' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => { setActiveTab('cupones'); setFormError(null); setFormSuccess(null); }}
        >
          <Tag size={18} /> Gestión de Cupones (CRUD 2)
        </button>
      </div>

      {formError && <AlertMessage type="error" message={formError} onClose={() => setFormError(null)} />}
      {formSuccess && <AlertMessage type="success" message={formSuccess} onClose={() => setFormSuccess(null)} />}
      {iaSuccessMsg && <AlertMessage type="success" message={iaSuccessMsg} onClose={() => setIaSuccessMsg(null)} />}
      {errorProd && activeTab === 'productos' && <AlertMessage type="error" message={errorProd} />}
      {errorCup && activeTab === 'cupones' && <AlertMessage type="error" message={errorCup} />}

      {/* ==================== VISTA PRODUCTOS ==================== */}
      {activeTab === 'productos' && (
        <>
          <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editandoProdId ? `Editar Producto #${editandoProdId}` : 'Añadir Nuevo Producto al Catálogo'}
              </h3>
              {editandoProdId && (
                <button className="btn btn-secondary btn-sm" onClick={resetProdForm}>
                  <X size={15} /> Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitProducto}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Nombre del Producto *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. Estuche MagSafe Cuero Nórdico"
                    value={prodForm.nombre}
                    onChange={(e) => setProdForm({ ...prodForm, nombre: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Categoría *</label>
                  <select
                    className="form-select"
                    value={prodForm.categoria}
                    onChange={(e) => setProdForm({ ...prodForm, categoria: e.target.value })}
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Precio en Colones (₡) *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ej. 45000"
                    min="1"
                    step="1"
                    value={prodForm.precio}
                    onChange={(e) => setProdForm({ ...prodForm, precio: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stock en Unidades *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ej. 15"
                    min="0"
                    step="1"
                    value={prodForm.stock}
                    onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>Descripción Comercial y Técnica</label>
                  <button
                    type="button"
                    className="btn btn-ai btn-sm"
                    onClick={handleGenerarDescripcionIA}
                    disabled={iaLoading || !prodForm.nombre.trim()}
                  >
                    {iaLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {iaLoading ? 'Redactando...' : 'Generar Descripción con IA (Caso A)'}
                  </button>
                </div>
                <textarea
                  className="form-textarea"
                  placeholder="Detalles sobre switches, sensores, ergonomía, conectividad..."
                  value={prodForm.descripcion}
                  onChange={(e) => setProdForm({ ...prodForm, descripcion: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                {editandoProdId && (
                  <button type="button" className="btn btn-secondary" onClick={resetProdForm}>
                    Cancelar
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : (editandoProdId ? <Check size={16} /> : <PlusCircle size={16} />)}
                  {editandoProdId ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>

          <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Inventario de Productos ({productos?.length || 0})</h3>

          {loadingProd && (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-primary)' }} />
            </div>
          )}

          {!loadingProd && productos && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {p.descripcion?.slice(0, 60)}{p.descripcion?.length > 60 ? '...' : ''}
                          </div>
                        </td>
                        <td><span className="product-badge-cat">{p.categoria}</span></td>
                        <td style={{ fontWeight: 600 }}>{formatearMonto(p.precio)}</td>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            color: p.stock <= 0 ? 'var(--color-error)' : (p.stock <= 5 ? 'var(--color-warning)' : 'var(--color-success)')
                          }}>
                            {p.stock} un.
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => handleEditProd(p)} title="Editar producto">
                              <Edit size={14} />
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeleteProducto(p.id, p.nombre)} title="Eliminar producto">
                              <Trash2 size={14} />
                            </button>
                          </div>
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

      {/* ==================== VISTA CUPONES (RECURSO 2) ==================== */}
      {activeTab === 'cupones' && (
        <>
          <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editandoCupId ? `Editar Cupón #${editandoCupId}` : 'Crear Nuevo Cupón de Descuento'}
              </h3>
              {editandoCupId && (
                <button className="btn btn-secondary btn-sm" onClick={resetCupForm}>
                  <X size={15} /> Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmitCupon}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">
                    <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Código de Cupón *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. NAVIDAD25"
                    value={cupForm.codigo}
                    onChange={(e) => setCupForm({ ...cupForm, codigo: e.target.value.toUpperCase() })}
                    style={{ textTransform: 'uppercase' }}
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    La base de datos rechaza con 409 si el código ya existe.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Percent size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Porcentaje de Descuento (1 - 100%) *
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ej. 15"
                    min="1"
                    max="100"
                    step="1"
                    value={cupForm.porcentaje}
                    onChange={(e) => setCupForm({ ...cupForm, porcentaje: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Vigente Hasta (Fecha) *
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={cupForm.vigente_hasta}
                    onChange={(e) => setCupForm({ ...cupForm, vigente_hasta: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Hash size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Usos Máximos Permitidos *
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Ej. 50"
                    min="1"
                    step="1"
                    value={cupForm.usos_maximos}
                    onChange={(e) => setCupForm({ ...cupForm, usos_maximos: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                {editandoCupId && (
                  <button type="button" className="btn btn-secondary" onClick={resetCupForm}>
                    Cancelar
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? <Loader2 size={16} className="animate-spin" /> : (editandoCupId ? <Check size={16} /> : <PlusCircle size={16} />)}
                  {editandoCupId ? 'Actualizar Cupón' : 'Crear Cupón'}
                </button>
              </div>
            </form>
          </div>

          <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Cupones Registrados ({cupones?.length || 0})</h3>

          {loadingCup && (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-primary)' }} />
            </div>
          )}

          {!loadingCup && cupones && (
            <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th style={{ textAlign: 'center' }}>Descuento</th>
                      <th style={{ textAlign: 'center' }}>Vigencia</th>
                      <th style={{ textAlign: 'center' }}>Usos Actuales</th>
                      <th style={{ textAlign: 'center' }}>Estado</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cupones.map(c => {
                      const expirado = c.vigente_hasta < hoy;
                      const agotado = c.usos_actuales >= c.usos_maximos;

                      return (
                        <tr key={c.id}>
                          <td>
                            <span style={{
                              fontWeight: 800,
                              fontFamily: 'monospace',
                              fontSize: '1rem',
                              padding: '0.2rem 0.6rem',
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: 'var(--accent-gold)',
                              borderRadius: '6px',
                              border: '1px solid rgba(245, 158, 11, 0.3)'
                            }}>
                              {c.codigo}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-success)' }}>
                            -{c.porcentaje}%
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                            {c.vigente_hasta}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>
                            {c.usos_actuales} / {c.usos_maximos}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {expirado ? (
                              <span className="badge-status status-cancelada">Expirado</span>
                            ) : (agotado ? (
                              <span className="badge-status status-enviada">Agotado</span>
                            ) : (
                              <span className="badge-status status-pagada">Vigente</span>
                            ))}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => handleEditCup(c)} title="Editar cupón">
                                <Edit size={14} />
                              </button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCupon(c.id, c.codigo)} title="Eliminar cupón">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
