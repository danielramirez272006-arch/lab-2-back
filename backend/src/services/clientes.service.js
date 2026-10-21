import db from '../db.js';

export const clientesService = {
  getAll() {
    return db.prepare('SELECT * FROM clientes ORDER BY id ASC').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM clientes WHERE id = ?').get(id);
  },

  create({ nombre, email, ciudad }) {
    if (!nombre || !email || !ciudad) {
      const err = new Error('Los campos nombre, email y ciudad son requeridos');
      err.status = 400;
      throw err;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const err = new Error('El formato del email no es válido');
      err.status = 400;
      throw err;
    }

    // Verificar si el email ya existe
    const existing = db.prepare('SELECT id FROM clientes WHERE email = ?').get(email);
    if (existing) {
      const err = new Error('Ya existe un cliente registrado con ese correo electrónico');
      err.status = 409;
      throw err;
    }

    const stmt = db.prepare(`
      INSERT INTO clientes (nombre, email, ciudad)
      VALUES (?, ?, ?)
    `);

    const result = stmt.run(nombre, email, ciudad);
    return this.getById(result.lastInsertRowid);
  }
};
