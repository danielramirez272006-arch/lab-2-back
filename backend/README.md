# Backend - TechStore (Caso 5)
API REST desarrollada en Node.js + Express con base de datos SQLite y transacciones atómicas.

## Comandos rápidos
```bash
npm install        # Instalar dependencias
npm run seed       # Inicializar schema.sql y datos de prueba
npm run dev        # Iniciar servidor en modo desarrollo (http://localhost:3001)
npm run test-endpoints  # Ejecutar las 22 pruebas automatizadas
```

## Endpoints Principales
- `GET /api/productos`: Catálogo con filtros y ordenamiento.
- `GET /api/cupones`: Lista de cupones con conteo de usos actuales.
- `POST /api/ordenes`: Crear orden con transacción atómica, descuento y flete.
- `POST /api/ordenes/:id/cancelar`: Cancelar orden y reponer inventario en transacción.
- `GET /api/resumen`: Panel de métricas SQL (ventas por categoría, top 3, ticket promedio y alertas de reposición).
