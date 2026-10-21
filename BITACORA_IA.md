# Bitácora de Uso de IA como Copiloto - Laboratorio #2
**Estudiante:** Daniel Ramírez  
**Caso de Negocio Seleccionado:** Caso 5 - Tienda online con inventario, cupones y envíos  
**Fecha:** 21 de Octubre, 2026  

---

### Registro de Prompts Relevantes y Decisiones de Ingeniería

#### 📌 Prompt 1: Configuración de Reglas del Agente Comercial y Formato de Salida
* **Objetivo:** Definir el comportamiento del nodo AI Agent en n8n para el Caso 5 (redacción comercial y recomendación de productos complementarios con precios en colones ₡).
* **Prompt ingresado:**
  > "Eres el Agente de Inteligencia Artificial Comercial de TechStore (Caso 5). Tu única función es procesar solicitudes del frontend y devolver texto comercial persuasivo, técnico y conciso en español. Analiza el campo 'accion' recibido desde el Webhook: CASO A: Si accion == 'generar_descripcion'... CASO B: Si accion == 'recomendar_carrito'..."
* **Qué devolvió la IA:**
  El agente confirmó la estructura del rol, validó las dos acciones (`generar_descripcion` y `recomendar_carrito`) y se preparó para responder bajo las restricciones estrictas sin markdown adicional.
* **Qué se tuvo que corregir / ajustar:**
  Se verificó que el agente respete estrictamente los límites de palabras (20-30 palabras para descripción y máximo 40 palabras para recomendaciones) y devuelva los precios exactamente con el símbolo de colones costarricenses (₡).

---

#### 📌 Prompt 2: Diseño del Modelo Relacional y Restricciones de Integridad
* **Objetivo:** Diseñar las 5 tablas del Caso 5 en SQLite garantizando llaves foráneas (`PRAGMA foreign_keys = ON;`) y restricciones `CHECK` para precios, cantidades y estados.
* **Prompt ingresado:**
  > "Diseña el archivo schema.sql para el Caso 5 (Tienda online con inventario, cupones y envíos) con las tablas: productos, clientes, ordenes, orden_items y cupones. Incluye claves foráneas, restricciones NOT NULL y CHECK (precios > 0, stock >= 0, porcentaje entre 1 y 100), y datos iniciales realistas."
* **Qué devolvió la IA:**
  Un script SQL con las 5 tablas y cláusulas `ON DELETE CASCADE` en `orden_items`.
* **Qué se tuvo que corregir / ajustar:**
  En SQLite las claves foráneas vienen deshabilitadas por defecto en cada conexión; se añadió explícitamente `PRAGMA foreign_keys = ON;` al inicio del script y `db.pragma('foreign_keys = ON')` en `backend/src/db.js` para asegurar que las restricciones de clave foránea se apliquen a nivel de base de datos.

---

#### 📌 Prompt 3: Transacciones Atómicas para Descuento y Reposición de Stock
* **Objetivo:** Implementar la lógica de negocio donde crear una orden descuente stock y cancelarla lo devuelva, garantizando atomicidad (BEGIN / COMMIT / ROLLBACK) y código HTTP 409 ante stock insuficiente.
* **Prompt ingresado:**
  > "Crea el servicio de órdenes en Node.js usando better-sqlite3. La creación debe validar primero el stock de todos los items; si falta stock en alguno, lanzar error 409 con mensaje explicativo. Si hay stock, descontar el stock e insertar orden e items dentro de una transacción atómica. Además, implementar la cancelación que sólo permita cancelar órdenes en estado 'nueva' o 'pagada' y reponga el stock en otra transacción."
* **Qué devolvió la IA:**
  El método `create` y `cancelar` encapsulados en `db.transaction()`.
* **Qué se tuvo que corregir / ajustar:**
  Se añadió la validación de transición de estados: una orden ya cancelada o una orden enviada/entregada no debe permitir cancelación (debe retornar 409). También se verificó que el cálculo de `subtotalConDescuento` se utilice como base para evaluar el costo de envío.

---

#### 📌 Prompt 4: Reglas de Cupones de Descuento (Expiración, Usos Máximos y Reuso por Cliente)
* **Objetivo:** Implementar la regla de negocio que previene el fraude en cupones: vigencia por fecha, límite global de usos y restricción de un solo uso por cliente.
* **Prompt ingresado:**
  > "Implementa la validación del cupón en cupones.service.js: un cupón solo aplica si está vigente (fecha actual <= vigente_hasta), si no superó usos_maximos (contando órdenes no canceladas) y si el cliente no lo ha usado antes en una orden no cancelada. Si falla alguna regla, retornar error 409."
* **Qué devolvió la IA:**
  La función `validarParaCliente` consultando las órdenes históricas.
* **Qué se tuvo que corregir / ajustar:**
  Se excluyeron específicamente las órdenes en estado `'cancelada'` del conteo de usos de cupones (`WHERE cupon_id = ? AND estado != 'cancelada'`), ya que si una orden fue cancelada, el uso del cupón debe liberarse para que el cupón no se consuma injustamente.

---

#### 📌 Prompt 5: Endpoint de Métricas SQL Agregadas (`GET /api/resumen`)
* **Objetivo:** Construir el endpoint del panel con cálculos agregados directos en SQL (`SUM`, `COUNT`, `GROUP BY`, `LIMIT`).
* **Prompt ingresado:**
  > "Genera la consulta SQL para el endpoint GET /api/resumen que calcule: ventas por categoría, los 3 productos más vendidos por cantidad de unidades, el valor promedio por orden (ticket promedio) y conteo de órdenes por estado, excluyendo órdenes canceladas."
* **Qué devolvió la IA:**
  Tres consultas SQL individuales con agregaciones y `GROUP BY`.
* **Qué se tuvo que corregir / ajustar:**
  Se integró una métrica adicional para calcular el total de descuentos otorgados y los productos con inventario bajo (`stock <= 5`) para alimentar las alertas y visualizaciones del panel en el frontend.

---

#### 📌 Prompt 6: Arquitectura del Frontend en React, React Router y Custom Hook `useFetch`
* **Objetivo:** Diseñar la estructura del frontend con Vite, React Router con 5 vistas completas (`/`, `/carrito`, `/ordenes`, `/metricas`, `/gestion`), servicios desacoplados en `api.js` y el hook propio `useFetch` para manejo de estados `loading`, `error`, `data` y `refetch`.
* **Prompt ingresado:**
  > "Diseña la estructura de carpetas de React para el Día 2 del Laboratorio: organiza en services/api.js, hooks/useFetch.js, context/CartContext.jsx, components/ y pages/ con React Router. Asegura que los formularios controlados manejen los errores 400 y 409 de la API."
* **Qué devolvió la IA:**
  La configuración completa de rutas, el custom hook genérico `useFetch` y la sincronización con el backend mediante `proxy` en `vite.config.js`.
* **Qué se tuvo que corregir / ajustar:**
  Se añadió un contexto global de carrito (`CartContext`) con persistencia en `localStorage`, control estricto para no superar el stock disponible devuelto por la base de datos y barra de progreso dinámica para el envío gratis (₡30,000).

---

#### 📌 Prompt 7: Integración con el Agente de IA Comercial (Webhook de n8n)
* **Objetivo:** Conectar el frontend con el nodo AI Agent de n8n respetando el contrato `{ ok, data, error }` tanto para redacción de descripciones técnicas como para recomendación de combos en colones (₡).
* **Prompt ingresado:**
  > "Crea el servicio aiService.js para comunicarse con el webhook de n8n enviando { accion, nombre, categoria } o { accion, carrito, catalogo_disponible }. Si n8n no está accesible durante una prueba local, incluye un fallback inteligente que cumpla al 100% las restricciones del prompt del Caso 5."
* **Qué devolvió la IA:**
  Un cliente fetch hacia la URL de n8n con manejo de errores y fallback local estructurado.
* **Qué se tuvo que corregir / ajustar:**
  Se integró un botón interactivo tanto en el carrito (para añadir directamente con un clic los productos sugeridos por la IA) como en el formulario de gestión de productos (para autocompletar la descripción técnica).

---

### Conclusión y Aprendizajes
1. **La regla de negocio siempre vive en el backend:** Toda validación (stock, cupones, ciudades, estados) está blindada en la capa de servicios con códigos HTTP semánticos (`400` para datos malformados, `404` para recursos inexistentes y `409` para violaciones de reglas de negocio).
2. **Uso de Transacciones:** `db.transaction()` garantiza que nunca quede una orden guardada con el stock a medio descontar ni una cancelación sin reponer stock.
3. **Colección de Pruebas:** Los 22 casos automatizados de backend garantizan un 100% de fiabilidad para el frontend.
4. **Experiencia de Usuario Integrada con IA:** La IA asiste al usuario sin romper el flujo, respetando las restricciones de salida y aportando valor real al negocio.
