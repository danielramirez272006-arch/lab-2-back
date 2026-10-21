import express from 'express';
import cors from 'cors';
import productosRoutes from './routes/productos.routes.js';
import clientesRoutes from './routes/clientes.routes.js';
import cuponesRoutes from './routes/cupones.routes.js';
import ordenesRoutes from './routes/ordenes.routes.js';
import resumenRoutes from './routes/resumen.routes.js';

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Healthcheck y bienvenida
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', caso: 'Caso 5 - Tienda Online TechStore' });
});

// Enrutadores principales
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/cupones', cuponesRoutes);
app.use('/api/ordenes', ordenesRoutes);
app.use('/api/resumen', resumenRoutes);

// Manejo de rutas inexistentes (404)
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Middleware centralizado de manejo de errores (códigos 400, 404, 409, 500)
// Formato unificado exigido: { error: "mensaje" }
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';

  if (status === 500) {
    console.error('🔥 Error 500 no controlado:', err);
  }

  res.status(status).json({ error: message });
});

export default app;
