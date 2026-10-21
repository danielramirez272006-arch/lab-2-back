import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initializeDatabase() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  // Ejecutar el script SQL
  db.exec(schemaSql);
  console.log('✅ Base de datos inicializada exitosamente con schema.sql');

  // Mostrar conteo de datos cargados
  const productosCount = db.prepare('SELECT COUNT(*) as count FROM productos').get().count;
  const clientesCount = db.prepare('SELECT COUNT(*) as count FROM clientes').get().count;
  const cuponesCount = db.prepare('SELECT COUNT(*) as count FROM cupones').get().count;
  const ordenesCount = db.prepare('SELECT COUNT(*) as count FROM ordenes').get().count;

  console.log(`📦 Productos: ${productosCount}`);
  console.log(`👤 Clientes: ${clientesCount}`);
  console.log(`🏷️ Cupones: ${cuponesCount}`);
  console.log(`🛒 Órdenes cargadas: ${ordenesCount}`);
}

// Si se ejecuta directamente vía CLI: node src/initDb.js
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    initializeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  }
}
