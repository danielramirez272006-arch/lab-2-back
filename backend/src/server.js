import dotenv from 'dotenv';
import app from './app.js';
import db from './db.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

// Verificar que las tablas existan al arrancar; si no existen, inicializar automáticamente
const checkTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='productos'").get();
if (!checkTables) {
  console.log('⚡ Detectada primera ejecución: inicializando base de datos...');
  const { initializeDatabase } = await import('./initDb.js');
  initializeDatabase();
}

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Endpoint de métricas disponible en http://localhost:${PORT}/api/resumen`);
  console.log(`📦 Catálogo de productos en http://localhost:${PORT}/api/productos`);
});
