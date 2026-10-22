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

// Endpoint relay para n8n (elimina bloqueos de CORS del navegador)
app.post('/api/ai/agente', async (req, res) => {
  try {
    const { webhookUrl, payload } = req.body;
    const targetUrl = webhookUrl || process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/techstore-agente-ia';
    const bodyToSend = payload !== undefined ? payload : req.body;

    const n8nResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyToSend)
    });

    const data = await n8nResponse.json().catch(async () => {
      const text = await n8nResponse.text().catch(() => '');
      return { output: text };
    });

    if (!n8nResponse.ok) {
      const errMsg = data.message || data.hint || `n8n devolvió código ${n8nResponse.status}. Activa el workflow con el botón Active en n8n.`;
      return res.status(n8nResponse.status).json({ ok: false, error: errMsg });
    }

    // Normalizar contrato { ok, data, error }
    const formattedData = data.data || data.output || (typeof data === 'string' ? data : JSON.stringify(data));
    res.status(200).json({ ok: true, data: formattedData });
  } catch (err) {
    res.status(502).json({
      ok: false,
      error: `No se pudo comunicar con n8n (${err.message}). Asegúrate de que n8n esté corriendo en el puerto 5678.`
    });
  }
});

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
