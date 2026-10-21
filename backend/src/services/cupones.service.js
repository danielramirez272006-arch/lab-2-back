import db from '../db.js';

export const cuponesService = {
  // Listar cupones junto con la cantidad de usos actuales en órdenes no canceladas
  getAll() {
    return db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM ordenes o WHERE o.cupon_id = c.id AND o.estado != 'cancelada') AS usos_actuales
      FROM cupones c
      ORDER BY c.id DESC
    `).all();
  },

  getById(id) {
    return db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM ordenes o WHERE o.cupon_id = c.id AND o.estado != 'cancelada') AS usos_actuales
      FROM cupones c
      WHERE c.id = ?
    `).get(id);
  },

  getByCodigo(codigo) {
    if (!codigo) return null;
    return db.prepare('SELECT * FROM cupones WHERE UPPER(codigo) = UPPER(?)').get(codigo.trim());
  },

  create({ codigo, porcentaje, vigente_hasta, usos_maximos }) {
    if (!codigo || porcentaje === undefined || !vigente_hasta || usos_maximos === undefined) {
      const err = new Error('Los campos codigo, porcentaje, vigente_hasta y usos_maximos son requeridos');
      err.status = 400;
      throw err;
    }

    const pct = Number(porcentaje);
    if (isNaN(pct) || pct <= 0 || pct > 100) {
      const err = new Error('El porcentaje de descuento debe estar entre 1 y 100');
      err.status = 400;
      throw err;
    }

    const maxUsos = Number(usos_maximos);
    if (isNaN(maxUsos) || maxUsos <= 0) {
      const err = new Error('Los usos máximos deben ser mayores a 0');
      err.status = 400;
      throw err;
    }

    // Verificar unicidad de código
    const existing = this.getByCodigo(codigo);
    if (existing) {
      const err = new Error(`Ya existe un cupón con el código '${codigo.toUpperCase()}'`);
      err.status = 409;
      throw err;
    }

    const stmt = db.prepare(`
      INSERT INTO cupones (codigo, porcentaje, vigente_hasta, usos_maximos)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(codigo.toUpperCase().trim(), pct, vigente_hasta, maxUsos);
    return this.getById(result.lastInsertRowid);
  },

  update(id, { codigo, porcentaje, vigente_hasta, usos_maximos }) {
    const existing = this.getById(id);
    if (!existing) {
      const err = new Error('Cupón no encontrado');
      err.status = 404;
      throw err;
    }

    const newCodigo = codigo ? codigo.toUpperCase().trim() : existing.codigo;
    const newPct = porcentaje !== undefined ? Number(porcentaje) : existing.porcentaje;
    const newVigente = vigente_hasta || existing.vigente_hasta;
    const newMaxUsos = usos_maximos !== undefined ? Number(usos_maximos) : existing.usos_maximos;

    if (newPct <= 0 || newPct > 100) {
      const err = new Error('El porcentaje de descuento debe estar entre 1 y 100');
      err.status = 400;
      throw err;
    }

    if (newMaxUsos <= 0) {
      const err = new Error('Los usos máximos deben ser mayores a 0');
      err.status = 400;
      throw err;
    }

    // Si cambia de código, verificar que no colisione
    if (newCodigo !== existing.codigo) {
      const codeTaken = this.getByCodigo(newCodigo);
      if (codeTaken) {
        const err = new Error(`Ya existe otro cupón con el código '${newCodigo}'`);
        err.status = 409;
        throw err;
      }
    }

    const stmt = db.prepare(`
      UPDATE cupones
      SET codigo = ?, porcentaje = ?, vigente_hasta = ?, usos_maximos = ?
      WHERE id = ?
    `);

    stmt.run(newCodigo, newPct, newVigente, newMaxUsos, id);
    return this.getById(id);
  },

  delete(id) {
    const existing = this.getById(id);
    if (!existing) {
      const err = new Error('Cupón no encontrado');
      err.status = 404;
      throw err;
    }

    // Verificar si el cupón ya fue usado en alguna orden
    const countOrders = db.prepare('SELECT COUNT(*) as count FROM ordenes WHERE cupon_id = ?').get(id);
    if (countOrders.count > 0) {
      const err = new Error('No se puede eliminar el cupón porque está referenciado en órdenes históricas');
      err.status = 409;
      throw err;
    }

    db.prepare('DELETE FROM cupones WHERE id = ?').run(id);
    return { mensaje: 'Cupón eliminado correctamente', id };
  },

  // Validación de cupón según las reglas de negocio del Caso 5:
  // "Un cupón solo aplica si está vigente, no superó sus usos máximos y el cliente no lo ha usado antes"
  validarParaCliente(codigo, cliente_id) {
    const cupon = this.getByCodigo(codigo);
    if (!cupon) {
      const err = new Error(`El cupón '${codigo}' no existe`);
      err.status = 404;
      throw err;
    }

    // 1. Validar vigencia
    const hoy = new Date().toISOString().split('T')[0];
    if (cupon.vigente_hasta < hoy) {
      const err = new Error(`El cupón '${cupon.codigo}' expiró el ${cupon.vigente_hasta}`);
      err.status = 409;
      throw err;
    }

    // 2. Validar usos máximos globales (órdenes no canceladas)
    const usosGlobales = db.prepare(`
      SELECT COUNT(*) as count FROM ordenes 
      WHERE cupon_id = ? AND estado != 'cancelada'
    `).get(cupon.id).count;

    if (usosGlobales >= cupon.usos_maximos) {
      const err = new Error(`El cupón '${cupon.codigo}' ha superado su límite máximo de usos (${cupon.usos_maximos})`);
      err.status = 409;
      throw err;
    }

    // 3. Validar si el cliente ya lo utilizó antes en una orden no cancelada
    if (cliente_id) {
      const usoCliente = db.prepare(`
        SELECT COUNT(*) as count FROM ordenes 
        WHERE cliente_id = ? AND cupon_id = ? AND estado != 'cancelada'
      `).get(cliente_id, cupon.id).count;

      if (usoCliente > 0) {
        const err = new Error(`El cliente ya ha utilizado el cupón '${cupon.codigo}' en una orden previa`);
        err.status = 409;
        throw err;
      }
    }

    return cupon;
  }
};
