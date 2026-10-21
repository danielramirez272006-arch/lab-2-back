// Capa de servicios centralizada para comunicación con la API REST (Requisito Rúbrica)
const API_URL = import.meta.env.VITE_API_URL || '/api';

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const defaultHeaders = {
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Manejo de códigos 400, 404, 409 con formato { error: "mensaje" }
    const errorMsg = data.error || `Error en la solicitud (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ==================== PRODUCTOS ====================
export async function getProductos({ search = '', categoria = '', orden = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (categoria) params.append('categoria', categoria);
  if (orden) params.append('orden', orden);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/productos${query}`);
}

export async function getProductoById(id) {
  return request(`/productos/${id}`);
}

export async function createProducto(productoData) {
  return request('/productos', {
    method: 'POST',
    body: JSON.stringify(productoData)
  });
}

export async function updateProducto(id, productoData) {
  return request(`/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productoData)
  });
}

export async function deleteProducto(id) {
  return request(`/productos/${id}`, {
    method: 'DELETE'
  });
}

// ==================== CLIENTES ====================
export async function getClientes() {
  return request('/clientes');
}

export async function createCliente(clienteData) {
  return request('/clientes', {
    method: 'POST',
    body: JSON.stringify(clienteData)
  });
}

// ==================== CUPONES (CRUD COMPLETO) ====================
export async function getCupones() {
  return request('/cupones');
}

export async function getCuponById(id) {
  return request(`/cupones/${id}`);
}

export async function createCupon(cuponData) {
  return request('/cupones', {
    method: 'POST',
    body: JSON.stringify(cuponData)
  });
}

export async function updateCupon(id, cuponData) {
  return request(`/cupones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cuponData)
  });
}

export async function deleteCupon(id) {
  return request(`/cupones/${id}`, {
    method: 'DELETE'
  });
}

export async function validarCupon(codigo, cliente_id) {
  return request('/cupones/validar', {
    method: 'POST',
    body: JSON.stringify({ codigo, cliente_id })
  });
}

// ==================== ÓRDENES ====================
export async function getOrdenes({ estado = '', cliente_id = '' } = {}) {
  const params = new URLSearchParams();
  if (estado) params.append('estado', estado);
  if (cliente_id) params.append('cliente_id', cliente_id);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/ordenes${query}`);
}

export async function getOrdenById(id) {
  return request(`/ordenes/${id}`);
}

export async function createOrden(ordenData) {
  return request('/ordenes', {
    method: 'POST',
    body: JSON.stringify(ordenData)
  });
}

export async function cambiarEstadoOrden(id, nuevo_estado) {
  return request(`/ordenes/${id}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ nuevo_estado })
  });
}

export async function cancelarOrden(id) {
  return request(`/ordenes/${id}/cancelar`, {
    method: 'POST'
  });
}

export async function cotizarEnvio(ciudad, subtotal) {
  return request('/ordenes/cotizar-envio', {
    method: 'POST',
    body: JSON.stringify({ ciudad, subtotal })
  });
}

// ==================== MÉTRICAS / RESUMEN ====================
export async function getResumen() {
  return request('/resumen');
}
