// Script de pruebas automáticas para todos los endpoints y reglas de negocio del Caso 5
// Verifica respuestas 200, 201, 400, 404, 409 y transacciones atómicas
import http from 'http';
import app from './src/app.js';
import { initializeDatabase } from './src/initDb.js';

let server;
const PORT = 3099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('🧪 ========================================================');
  console.log('🧪 INICIANDO BATERÍA DE PRUEBAS AUTOMÁTICAS - CASO 5');
  console.log('🧪 ========================================================\n');

  // Reiniciar base de datos para pruebas limpias
  initializeDatabase();

  server = app.listen(PORT);
  let passed = 0;
  let failed = 0;

  function assert(title, condition, detail = '') {
    if (condition) {
      console.log(`✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${title} -> ${detail}`);
      failed++;
    }
  }

  try {
    // 1. Healthcheck
    const health = await request('GET', '/health');
    assert('Healthcheck responde 200', health.status === 200);

    // 2. Listado de productos (200)
    const prods = await request('GET', '/productos');
    assert('GET /api/productos retorna 200 y un array', health.status === 200 && Array.isArray(prods.data));

    // 3. Filtro por categoría (200)
    const prodsPerif = await request('GET', '/productos?categoria=Periféricos');
    const todosPerif = prodsPerif.data.every(p => p.categoria === 'Periféricos');
    assert('GET /api/productos?categoria=Periféricos filtra correctamente', todosPerif && prodsPerif.data.length > 0);

    // 4. Detalle de producto existente (200)
    const prod1 = await request('GET', '/productos/1');
    assert('GET /api/productos/1 retorna 200 y el objeto', prod1.status === 200 && prod1.data.id === 1);

    // 5. Detalle de producto inexistente (404)
    const prod404 = await request('GET', '/productos/9999');
    assert('GET /api/productos/9999 retorna 404', prod404.status === 404 && prod404.data.error);

    // 6. Validación al crear producto con datos inválidos (400)
    const prodInvalido = await request('POST', '/productos', { nombre: 'Incompleto' });
    assert('POST /api/productos sin datos requeridos retorna 400', prodInvalido.status === 400 && prodInvalido.data.error);

    // 7. Crear producto exitosamente (201)
    const nuevoProd = await request('POST', '/productos', {
      nombre: 'Micrófono USB Podcaster',
      descripcion: 'Micrófono condensador cardioide con brazo articulado',
      precio: 35000,
      stock: 10,
      categoria: 'Audio'
    });
    assert('POST /api/productos válido retorna 201', nuevoProd.status === 201 && nuevoProd.data.id);

    // 8. Error 409 al intentar eliminar producto con órdenes asociadas
    const deleteAsociado = await request('DELETE', '/productos/1');
    assert('DELETE /api/productos/:id asociado a órdenes retorna 409', deleteAsociado.status === 409);

    // 9. Error 409 al registrar cliente con email duplicado
    const clienteDup = await request('POST', '/clientes', {
      nombre: 'Mauricio Duplicado',
      email: 'mauricio@techstore.cr',
      ciudad: 'San José'
    });
    assert('POST /api/clientes con email duplicado retorna 409', clienteDup.status === 409);

    // 10. REGLA DE NEGOCIO: Error 409 al validar cupón expirado
    const cuponExpirado = await request('POST', '/cupones/validar', {
      codigo: 'EXPIRED50',
      cliente_id: 1
    });
    assert('POST /api/cupones/validar con cupón expirado retorna 409', cuponExpirado.status === 409);

    // 11. REGLA DE NEGOCIO: Error 409 al intentar pedir más stock del disponible
    const ordenSinStock = await request('POST', '/ordenes', {
      cliente_id: 1,
      items: [
        { producto_id: 4, cantidad: 999 } // Stock de Laptop Gamer Nitro 16 es solo 5
      ]
    });
    assert('POST /api/ordenes con stock insuficiente retorna 409', ordenSinStock.status === 409 && ordenSinStock.data.error.includes('Stock insuficiente'));

    // 12. Crear orden exitosamente con cupón y cálculo de envío gratis
    const stockAntes = (await request('GET', '/productos/2')).data.stock;
    const ordenValida = await request('POST', '/ordenes', {
      cliente_id: 5, // Esteban Romero de Puntarenas
      cupon_codigo: 'TECH10',
      items: [
        { producto_id: 2, cantidad: 2 } // 28000 * 2 = 56000. Descuento 10% = 5600 -> Subtotal 50400 >= 30000 -> Envio gratis
      ]
    });
    const stockDespues = (await request('GET', '/productos/2')).data.stock;
    assert('POST /api/ordenes exitosa retorna 201', ordenValida.status === 201 && ordenValida.data.id);
    assert('Transacción descontó el stock correctamente', stockDespues === stockAntes - 2);
    assert('Envío gratis aplicado por superar el monto mínimo', ordenValida.data.envio === 0 && ordenValida.data.descuento === 5600);

    // 13. REGLA DE NEGOCIO: Error 409 si el cliente intenta reutilizar el cupón que ya usó
    const ordenCuponReusado = await request('POST', '/ordenes', {
      cliente_id: 5, // Ya usó TECH10 en la orden anterior
      cupon_codigo: 'TECH10',
      items: [
        { producto_id: 2, cantidad: 1 }
      ]
    });
    assert('POST /api/ordenes con cupón ya usado por el cliente retorna 409', ordenCuponReusado.status === 409);

    // 14. GET /api/ordenes/:id con datos relacionados
    const ordenDetalle = await request('GET', `/ordenes/${ordenValida.data.id}`);
    const tieneRelaciones = ordenDetalle.data.cliente && ordenDetalle.data.items && ordenDetalle.data.items.length > 0;
    assert('GET /api/ordenes/:id retorna datos relacionados (cliente e items)', ordenDetalle.status === 200 && tieneRelaciones);

    // 15. Transición válida de estado: nueva -> pagada
    const ordenPagada = await request('PATCH', `/ordenes/${ordenValida.data.id}/estado`, { nuevo_estado: 'pagada' });
    assert('PATCH /api/ordenes/:id/estado (nueva -> pagada) retorna 200', ordenPagada.status === 200 && ordenPagada.data.estado === 'pagada');

    // 16. Transición inválida de estado (pagada -> entregada sin enviar): debe dar 409
    const transInvalida = await request('PATCH', `/ordenes/${ordenValida.data.id}/estado`, { nuevo_estado: 'entregada' });
    assert('PATCH con transición inválida (pagada -> entregada) retorna 409', transInvalida.status === 409);

    // 17. Cancelación de orden y reposición de stock
    const stockAntesCancelar = (await request('GET', '/productos/2')).data.stock;
    const ordenCancelada = await request('POST', `/ordenes/${ordenValida.data.id}/cancelar`);
    const stockDespuesCancelar = (await request('GET', '/productos/2')).data.stock;
    assert('POST /api/ordenes/:id/cancelar retorna 200', ordenCancelada.status === 200 && ordenCancelada.data.estado === 'cancelada');
    assert('Transacción de cancelación repone el stock correctamente', stockDespuesCancelar === stockAntesCancelar + 2);

    // 18. Error 409 al intentar cancelar una orden ya cancelada
    const cancelarReiterado = await request('POST', `/ordenes/${ordenValida.data.id}/cancelar`);
    assert('Cancelar orden ya cancelada retorna 409', cancelarReiterado.status === 409);

    // 19. REGLA DE NEGOCIO: Endpoint de métricas GET /api/resumen
    const resumen = await request('GET', '/resumen');
    const metricasCompletas = (
      resumen.status === 200 &&
      Array.isArray(resumen.data.ventas_por_categoria) &&
      Array.isArray(resumen.data.top_3_productos) &&
      resumen.data.ticket_promedio !== undefined &&
      resumen.data.ingresos_totales !== undefined
    );
    assert('GET /api/resumen calcula métricas SQL (ventas por categoría, top 3, ticket promedio)', metricasCompletas);

    console.log('\n========================================================');
    console.log(`📊 RESULTADOS: ${passed} PASADAS, ${failed} FALLADAS`);
    console.log('========================================================\n');

  } catch (error) {
    console.error('Error durante las pruebas:', error);
  } finally {
    server.close();
  }
}

runTests();
