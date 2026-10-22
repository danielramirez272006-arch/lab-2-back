import { useCart } from '../context/CartContext';
import {
  ShoppingCart, Check, AlertCircle, Smartphone, ShieldCheck,
  Sparkles, Layers, Zap, Eye, CreditCard, Feather
} from 'lucide-react';

function getCategoryIcon(categoria) {
  switch (categoria) {
    case 'MagSafe':
      return <Zap size={22} color="#3A4BFF" />;
    case 'Rugged':
      return <ShieldCheck size={22} color="#3A4BFF" />;
    case 'Madera & Metal':
      return <Layers size={22} color="#3A4BFF" />;
    case 'Fibra de Carbono':
      return <Sparkles size={22} color="#3A4BFF" />;
    case 'Silicona':
      return <Feather size={22} color="#3A4BFF" />;
    case 'Transparente':
      return <Eye size={22} color="#3A4BFF" />;
    case 'Billetera Folio':
      return <CreditCard size={22} color="#3A4BFF" />;
    default:
      return <Smartphone size={22} color="#3A4BFF" />;
  }
}

export default function ProductCard({ product }) {
  const { addToCart, cart } = useCart();
  const enCarrito = cart.find(i => i.id === product.id);
  const cantidadEnCarrito = enCarrito ? enCarrito.cantidad : 0;
  const stockRestante = product.stock - cantidadEnCarrito;

  const formatearPrecio = (precio) => {
    return `₡${Number(precio).toLocaleString('es-CR')}`;
  };

  const getStockStatus = () => {
    if (product.stock <= 0) {
      return <span className="stock-tag stock-out"><AlertCircle size={13} /> Agotado</span>;
    }
    if (product.stock <= 5) {
      return <span className="stock-tag stock-low"><AlertCircle size={13} /> Últimas {product.stock} un.</span>;
    }
    return <span className="stock-tag stock-available"><Check size={13} /> En Stock ({product.stock})</span>;
  };

  return (
    <div className="product-card-wrapper" data-reveal id={`product-card-${product.id}`}>
      {/* Stacked sheets that fan out slightly on hover */}
      <div className="card-sheet-stack card-sheet-stack-2" />
      <div className="card-sheet-stack card-sheet-stack-1" />

      <div className="product-card">
        <div>
          {/* Cabecera con Icono y Categoría */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--color-panel)',
              border: '1px solid var(--color-hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {getCategoryIcon(product.categoria)}
            </div>
            <span className="product-badge-cat">{product.categoria}</span>
          </div>

          <h3 className="product-title">{product.nombre}</h3>
          <p className="product-desc">{product.descripcion || 'Sin descripción disponible.'}</p>
        </div>

        <div className="product-footer">
          <div>
            <div className="product-price">{formatearPrecio(product.precio)}</div>
            {getStockStatus()}
          </div>

          <button
            className="btn btn-primary btn-sm"
            id={`btn-add-${product.id}`}
            onClick={() => addToCart(product, 1)}
            disabled={stockRestante <= 0}
            style={{
              backgroundColor: '#3A4BFF',
              borderColor: '#3A4BFF',
              color: '#ffffff'
            }}
          >
            <ShoppingCart size={15} />
            {stockRestante <= 0 ? 'Sin Stock' : (cantidadEnCarrito > 0 ? `Agregar (+${cantidadEnCarrito})` : 'Agregar')}
          </button>
        </div>
      </div>
    </div>
  );
}
