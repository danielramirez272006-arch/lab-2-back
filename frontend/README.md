# Frontend - TechStore (Caso 5)
Aplicación SPA en React 19 + Vite + React Router con diseño Vanilla CSS Glassmorphism e integración de Agente de IA Comercial (n8n).

## Comandos rápidos
```bash
npm install     # Instalar dependencias
npm run dev     # Iniciar servidor de desarrollo en http://localhost:5173
npm run build   # Compilar bundle de producción
```

## Vistas disponibles
- `/`: Catálogo con filtros por categoría, búsqueda por texto y ordenamiento.
- `/carrito`: Checkout, cálculo automático de envío por ciudad, cupones y recomendación IA.
- `/ordenes`: Historial de pedidos, transiciones de estado y cancelación con reposición de inventario.
- `/metricas`: Dashboard comercial con indicadores SQL y alertas de reposición (Reto Extra).
- `/gestion`: CRUD completo de Productos y Cupones con redactor técnico asistido por IA.
