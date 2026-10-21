import db from '../db.js';

export const productosService = {
  // Listar productos con soporte de búsqueda, filtrado por categoría y ordenamiento
  getAll({ search, categoria, orden } = {}) {
    let query = 'SELECT * FROM productos WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (nombre LIKE ? OR descripcion LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    if (orden === 'precio_asc') {
      query += ' ORDER BY precio ASC';
    } else if (orden === 'precio_desc') {
      query += ' ORDER BY precio DESC';
    } else if (orden === 'nombre_asc') {
      query += ' ORDER BY nombre ASC';
    } else if (orden === 'stock_desc') {
      query += ' ORDER BY stock DESC';
    } else {
      query += ' ORDER BY id DESC';
    }

    return db.prepare(query).all(...params);
  },

  getById(id) {
    return db.prepare('SELECT * FROM productos WHERE id = ?').get(id);
  },

  create({ nombre, descripcion, precio, stock, categoria }) {
    if (!nombre || precio === undefined || stock === undefined || !categoria) {
      const err = new Error('Los campos nombre, precio, stock y categoria son requeridos');
      err.status = 400;
      throw err;
    }

    if (Number(precio) <= 0) {
      const err = new Error('El precio debe ser un número mayor a 0');
      err.status = 400;
      throw err;
    }

    if (Number(stock) < 0) {
      const err = new Error('El stock no puede ser negativo');
      err.status = 400;
      throw err;
    }

    const stmt = db.prepare(`
      INSERT INTO productos (nombre, descripcion, precio, stock, categoria)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(nombre, descripcion || '', Number(precio), Number(stock), categoria);
    return this.getById(result.lastInsertRowid);
  },

  update(id, { nombre, descripcion, precio, stock, categoria }) {
    const existing = this.getById(id);
    if (!existing) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }

    const newNombre = nombre !== undefined ? nombre : existing.nombre;
    const newDesc = descripcion !== undefined ? descripcion : existing.descripcion;
    const newPrecio = precio !== undefined ? Number(precio) : existing.precio;
    const newStock = stock !== undefined ? Number(stock) : existing.stock;
    const newCategoria = categoria !== undefined ? categoria : existing.categoria;

    if (newPrecio <= 0) {
      const err = new Error('El precio debe ser un número mayor a 0');
      err.status = 400;
      throw err;
    }

    if (newStock < 0) {
      const err = new Error('El stock no puede ser negativo');
      err.status = 400;
      throw err;
    }

    const stmt = db.prepare(`
      UPDATE productos
      SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?
      WHERE id = ?
    `);

    stmt.run(newNombre, newDesc, newPrecio, newStock, newCategoria, id);
    return this.getById(id);
  },

  delete(id) {
    const existing = this.getById(id);
    if (!existing) {
      const err = new Error('Producto no encontrado');
      err.status = 404;
      throw err;
    }

    // Verificar si el producto tiene órdenes asociadas
    const countItems = db.prepare('SELECT COUNT(*) as count FROM orden_items WHERE producto_id = ?').get(id);
    if (countItems.count > 0) {
      const err = new Error('No se puede eliminar el producto porque está asociado a órdenes existentes');
      err.status = 409;
      throw err;
    }

    db.prepare('DELETE FROM productos WHERE id = ?').run(id);
    return { mensaje: 'Producto eliminado correctamente', id };
  }
};
