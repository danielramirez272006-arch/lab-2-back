import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('techstore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toast, setToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('techstore_cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const addToCart = (product, cantidad = 1) => {
    if (product.stock <= 0) {
      showToast(`'${product.nombre}' está agotado`, 'error');
      return false;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        const nuevaCantidad = existing.cantidad + cantidad;
        if (nuevaCantidad > product.stock) {
          showToast(`No puedes agregar más de ${product.stock} unidades de '${product.nombre}'`, 'warning');
          return prev;
        }
        showToast(`Cantidad actualizada: ${existing.nombre} (x${nuevaCantidad})`, 'success');
        return prev.map(item => item.id === product.id ? { ...item, cantidad: nuevaCantidad } : item);
      } else {
        if (cantidad > product.stock) {
          showToast(`Stock insuficiente. Solo quedan ${product.stock} unidades`, 'warning');
          return prev;
        }
        showToast(`Agregado al carrito: ${product.nombre}`, 'success');
        return [...prev, {
          id: product.id,
          nombre: product.nombre,
          precio: Number(product.precio),
          stock: product.stock,
          categoria: product.categoria,
          cantidad
        }];
      }
    });
    return true;
  };

  const updateQuantity = (productId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        if (cantidad > item.stock) {
          showToast(`Stock máximo alcanzado para este producto (${item.stock} unidades)`, 'warning');
          return item;
        }
        return { ...item, cantidad };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Producto removido del carrito', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = cart.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      totalItems,
      subtotal,
      toast,
      showToast
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
}
