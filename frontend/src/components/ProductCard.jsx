import { useCart } from '../context/CartContext';
import {
  ShoppingCart, Check, AlertCircle, Monitor, Laptop, Headphones,
  Keyboard, HardDrive, Armchair, Camera, Cpu
} from 'lucide-react';

function getCategoryIcon(categoria) {
  switch (categoria) {
    case 'Periféricos':
      return <Keyboard size={24} color="#06b6d4" />;
    case 'Monitores':
      return <Monitor size={24} color="#6366f1" />;
    case 'Computadoras':
      return <Laptop size={24} color="#a855f7" />;
    case 'Audio':
      return <Headphones size={24} color="#ec4899" />;
    case 'Mobiliario':
      return <Armchair size={24} color="#f59e0b" />;
    case 'Componentes':
      return <HardDrive size={24} color="#10b981" />;
    case 'Accesorios':
      return <Camera size={24} color="#3b82f6" />;
    default:
      return <Cpu size={24} color="#6366f1" />;
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
      return <span className="stock-tag stock-out"><AlertCircle size={14} /> Agotado</span>;
    }
    if (product.stock <= 5) {
      return <span className="stock-tag stock-low"><AlertCircle size={14} /> Últimas {product.stock} un.</span>;
    }
    return <span className="stock-tag stock-available"><Check size={14} /> En Stock ({product.stock})</span>;
  };

  return (
    <div className="glass-card product-card" id={`product-card-${product.id}`}>
      <div>
        {/* Cabecera con Icono y Categoría */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
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
        >
          <ShoppingCart size={16} />
          {stockRestante <= 0 ? 'Sin Stock' : (cantidadEnCarrito > 0 ? `Agregar (+${cantidadEnCarrito})` : 'Agregar')}
        </button>
      </div>
    </div>
  );
}
