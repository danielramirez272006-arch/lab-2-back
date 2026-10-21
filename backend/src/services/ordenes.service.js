import db from '../db.js';
import { cuponesService } from './cupones.service.js';

// Tarifas de envío por ciudad en colones (₡)
const TARIFAS_ENVIO = {
  'san jose': 2000,
  'san josé': 2000,
  'heredia': 2000,
  'alajuela': 2500,
  'cartago': 2500,
  'puntarenas': 4000,
  'guanacaste': 4500,
  'liberia': 4500,
  'limon': 4500,
  'limón': 4500
};

const TARIFA_DEFECTO = 3000;

export function calcularCostoEnvio(ciudad, subtotalConDescuento) {
  const montoMinimoGratis = Number(process.env.ENVIO_GRATIS_MINIMO) || 30000;
  if (subtotalConDescuento >= montoMinimoGratis) {
    return 0; // Envío gratis por superar el monto mínimo
  }

  if (!ciudad) return TARIFA_DEFECTO;
  const ciudadNormalizada = ciudad.trim().toLowerCase();
  return TARIFAS_ENVIO[ciudadNormalizada] !== undefined ? TARIFAS_ENVIO[ciudadNormalizada] : TARIFA_DEFECTO;
}

export const ordenesService = {
  // Obtener todas las órdenes con datos resumidos del cliente
  getAll({ estado, cliente_id } = {}) {
    let query = `
      SELECT o.*, c.nombre as cliente_nombre, c.email as cliente_email, c.ciudad as cliente_ciudad,
             cup.codigo as cupon_codigo, cup.porcentaje as cupon_porcentaje,
             (SELECT COUNT(*) FROM orden_items oi WHERE oi.orden_id = o.id) as total_items
      FROM ordenes o
      JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN cupones cup ON o.cupon_id = cup.id
      WHERE 1=1
    `;
    const params = [];

    if (estado) {
      query += ' AND o.estado = ?';
      params.push(estado);
    }

    if (cliente_id) {
      query += ' AND o.cliente_id = ?';
      params.push(cliente_id);
    }

    query += ' ORDER BY o.id DESC';

    return db.prepare(query).all(...params);
  },

  // Endpoint GET /api/ordenes/:id con datos relacionados completos
  getById(id) {
    const orden = db.prepare(`
      SELECT o.*, c.nombre as cliente_nombre, c.email as cliente_email, c.ciudad as cliente_ciudad,
             cup.codigo as cupon_codigo, cup.porcentaje as cupon_porcentaje
      FROM ordenes o
      JOIN clientes c ON o.cliente_id = c.id
      LEFT JOIN cupones cup ON o.cupon_id = cup.id
      WHERE o.id = ?
    `).get(id);

    if (!orden) return null;

    const items = db.prepare(`
      SELECT oi.*, p.nombre as producto_nombre, p.categoria as producto_categoria,
             (oi.cantidad * oi.precio_unitario) as total_linea
      FROM orden_items oi
      JOIN productos p ON oi.producto_id = p.id
      WHERE oi.orden_id = ?
    `).all(id);

    return {
      id: orden.id,
      estado: orden.estado,
      fecha: orden.fecha,
      subtotal: orden.subtotal,
      descuento: orden.descuento,
      envio: orden.envio,
      total: orden.total,
      cliente: {
        id: orden.cliente_id,
        nombre: orden.cliente_nombre,
        email: orden.cliente_email,
        ciudad: orden.cliente_ciudad
      },
      cupon: orden.cupon_id ? {
        id: orden.cupon_id,
        codigo: orden.cupon_codigo,
        porcentaje: orden.cupon_porcentaje
      } : null,
      items
    };
  },

  // Crear orden con transacción atómica (BEGIN / COMMIT / ROLLBACK)
  create({ cliente_id, cupon_codigo, items }) {
    if (!cliente_id) {
      const err = new Error('El campo cliente_id es obligatorio');
      err.status = 400;
      throw err;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('La orden debe contener al menos un producto en items');
      err.status = 400;
      throw err;
    }

    // 1. Validar cliente
    const cliente = db.prepare('SELECT * FROM clientes WHERE id = ?').get(cliente_id);
    if (!cliente) {
      const err = new Error('Cliente no encontrado');
      err.status = 404;
      throw err;
    }

    // 2. Validar cada item y stock disponible
    let subtotal = 0;
    const itemsProcesados = [];

    for (const item of items) {
      if (!item.producto_id || !item.cantidad || Number(item.cantidad) <= 0) {
        const err = new Error('Cada item debe especificar producto_id y una cantidad mayor a 0');
        err.status = 400;
        throw err;
      }

      const prod = db.prepare('SELECT * FROM productos WHERE id = ?').get(item.producto_id);
      if (!prod) {
        const err = new Error(`Producto con ID ${item.producto_id} no existe`);
        err.status = 404;
        throw err;
      }

      // REGLA DE NEGOCIO: No se puede pedir más que el stock disponible
      if (prod.stock < Number(item.cantidad)) {
        const err = new Error(`Stock insuficiente para '${prod.nombre}'. Stock disponible: ${prod.stock}, solicitado: ${item.cantidad}`);
        err.status = 409;
        throw err;
      }

      const cantidad = Number(item.cantidad);
      const precioUnitario = Number(prod.precio);
      subtotal += cantidad * precioUnitario;

      itemsProcesados.push({
        producto_id: prod.id,
        nombre: prod.nombre,
        cantidad,
        precio_unitario: precioUnitario
      });
    }

    // 3. Validar cupón si fue provisto
    let cuponId = null;
    let montoDescuento = 0;

    if (cupon_codigo) {
      const cupon = cuponesService.validarParaCliente(cupon_codigo, cliente_id);
      cuponId = cupon.id;
      montoDescuento = Number((subtotal * (cupon.porcentaje / 100)).toFixed(2));
    }

    const subtotalConDescuento = Math.max(0, subtotal - montoDescuento);

    // 4. REGLA DE NEGOCIO: Calcular envío según ciudad y gratuidad por monto mínimo
    const costoEnvio = calcularCostoEnvio(cliente.ciudad, subtotalConDescuento);
    const total = Number((subtotalConDescuento + costoEnvio).toFixed(2));

    // 5. TRANSACCIÓN ATÓMICA: Descontar stock e insertar orden y sus items
    const crearOrdenTransaccion = db.transaction(() => {
      // Descontar stock
      const updateStockStmt = db.prepare('UPDATE productos SET stock = stock - ? WHERE id = ?');
      for (const item of itemsProcesados) {
        updateStockStmt.run(item.cantidad, item.producto_id);
      }

      // Insertar orden principal
      const insertOrdenStmt = db.prepare(`
        INSERT INTO ordenes (cliente_id, cupon_id, estado, subtotal, descuento, envio, total)
        VALUES (?, ?, 'nueva', ?, ?, ?, ?)
      `);
      const ordenResult = insertOrdenStmt.run(cliente_id, cuponId, subtotal, montoDescuento, costoEnvio, total);
      const nuevaOrdenId = ordenResult.lastInsertRowid;

      // Insertar items
      const insertItemStmt = db.prepare(`
        INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario)
        VALUES (?, ?, ?, ?)
      `);
      for (const item of itemsProcesados) {
        insertItemStmt.run(nuevaOrdenId, item.producto_id, item.cantidad, item.precio_unitario);
      }

      return nuevaOrdenId;
    });

    const ordenId = crearOrdenTransaccion();
    return this.getById(ordenId);
  },

  // Transición de estados: nueva -> pagada -> enviada -> entregada
  cambiarEstado(id, nuevoEstado) {
    const orden = this.getById(id);
    if (!orden) {
      const err = new Error('Orden no encontrada');
      err.status = 404;
      throw err;
    }

    const estadosValidos = ['nueva', 'pagada', 'enviada', 'entregada', 'cancelada'];
    if (!estadosValidos.includes(nuevoEstado)) {
      const err = new Error(`Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`);
      err.status = 400;
      throw err;
    }

    if (orden.estado === nuevoEstado) {
      return orden;
    }

    // Si se desea cancelar, derivar a la lógica de cancelación con reposición de stock
    if (nuevoEstado === 'cancelada') {
      return this.cancelar(id);
    }

    // Validar flujo estricto: nueva -> pagada -> enviada -> entregada
    const transicionesValidas = {
      nueva: ['pagada'],
      pagada: ['enviada'],
      enviada: ['entregada'],
      entregada: [],
      cancelada: []
    };

    const permitidos = transicionesValidas[orden.estado] || [];
    if (!permitidos.includes(nuevoEstado)) {
      const err = new Error(`Transición no permitida de '${orden.estado}' a '${nuevoEstado}'. Flujo válido: nueva → pagada → enviada → entregada`);
      err.status = 409;
      throw err;
    }

    db.prepare('UPDATE ordenes SET estado = ? WHERE id = ?').run(nuevoEstado, id);
    return this.getById(id);
  },

  // Cancelar orden y reponer stock en transacción atómica
  cancelar(id) {
    const orden = this.getById(id);
    if (!orden) {
      const err = new Error('Orden no encontrada');
      err.status = 404;
      throw err;
    }

    if (orden.estado === 'cancelada') {
      const err = new Error('La orden ya se encuentra cancelada');
      err.status = 409;
      throw err;
    }

    // REGLA DE NEGOCIO: Una orden solo se puede cancelar antes de ser enviada (nueva o pagada)
    if (orden.estado !== 'nueva' && orden.estado !== 'pagada') {
      const err = new Error(`No se puede cancelar una orden en estado '${orden.estado}'. Solo se permite cancelar antes del envío (estados: nueva, pagada)`);
      err.status = 409;
      throw err;
    }

    // TRANSACCIÓN ATÓMICA: Devolver stock y marcar cancelada
    const cancelarTransaccion = db.transaction(() => {
      const restoreStockStmt = db.prepare('UPDATE productos SET stock = stock + ? WHERE id = ?');
      for (const item of orden.items) {
        restoreStockStmt.run(item.cantidad, item.producto_id);
      }

      db.prepare("UPDATE ordenes SET estado = 'cancelada' WHERE id = ?").run(id);
    });

    cancelarTransaccion();
    return this.getById(id);
  }
};
