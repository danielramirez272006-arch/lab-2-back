import db from '../db.js';

export const resumenService = {
  getMetricas() {
    // 1. Ventas por categoría (SQL con SUM, COUNT, GROUP BY)
    const ventasPorCategoria = db.prepare(`
      SELECT p.categoria, 
             COUNT(DISTINCT o.id) as total_ordenes,
             SUM(oi.cantidad) as unidades_vendidas,
             ROUND(SUM(oi.cantidad * oi.precio_unitario), 2) as total_ventas
      FROM orden_items oi
      JOIN productos p ON oi.producto_id = p.id
      JOIN ordenes o ON oi.orden_id = o.id
      WHERE o.estado != 'cancelada'
      GROUP BY p.categoria
      ORDER BY total_ventas DESC
    `).all();

    // 2. Los 3 productos más vendidos
    const top3Productos = db.prepare(`
      SELECT p.id, p.nombre, p.categoria,
             SUM(oi.cantidad) as unidades_vendidas,
             ROUND(SUM(oi.cantidad * oi.precio_unitario), 2) as total_recaudado
      FROM orden_items oi
      JOIN productos p ON oi.producto_id = p.id
      JOIN ordenes o ON oi.orden_id = o.id
      WHERE o.estado != 'cancelada'
      GROUP BY p.id, p.nombre, p.categoria
      ORDER BY unidades_vendidas DESC, total_recaudado DESC
      LIMIT 3
    `).all();

    // 3. Valor promedio por orden (ticket promedio) e ingresos totales
    const metricasGenerales = db.prepare(`
      SELECT 
        COUNT(*) as total_ordenes_validas,
        ROUND(COALESCE(AVG(total), 0), 2) as valor_promedio_orden,
        ROUND(COALESCE(SUM(total), 0), 2) as ingresos_totales,
        ROUND(COALESCE(SUM(descuento), 0), 2) as total_descuentos_otorgados
      FROM ordenes
      WHERE estado != 'cancelada'
    `).get();

    // 4. Distribución de órdenes por estado
    const ordenesPorEstado = db.prepare(`
      SELECT estado, COUNT(*) as cantidad
      FROM ordenes
      GROUP BY estado
    `).all();

    // 5. Conteo de entidades activas
    const conteos = {
      total_productos: db.prepare('SELECT COUNT(*) as c FROM productos').get().c,
      total_clientes: db.prepare('SELECT COUNT(*) as c FROM clientes').get().c,
      total_cupones: db.prepare('SELECT COUNT(*) as c FROM cupones').get().c,
      productos_bajo_stock: db.prepare('SELECT COUNT(*) as c FROM productos WHERE stock <= 5').get().c
    };

    // 6. RETO EXTRA OFICIAL (Caso 5):
    // "Alertas de reposición para los productos que se agotarían con el ritmo de ventas de la última semana"
    const alertasReposicion = db.prepare(`
      WITH ventas_semana AS (
        SELECT 
          oi.producto_id,
          SUM(oi.cantidad) as vendido_semana,
          ROUND(CAST(SUM(oi.cantidad) AS REAL) / 7.0, 2) as consumo_diario
        FROM orden_items oi
        JOIN ordenes o ON oi.orden_id = o.id
        WHERE o.estado != 'cancelada'
          AND date(o.fecha) >= date('now', '-7 days', 'localtime')
        GROUP BY oi.producto_id
      )
      SELECT 
        p.id,
        p.nombre,
        p.categoria,
        p.stock,
        COALESCE(vs.vendido_semana, 0) as vendido_ultima_semana,
        COALESCE(vs.consumo_diario, 0) as consumo_diario_estimado,
        CASE 
          WHEN COALESCE(vs.consumo_diario, 0) > 0 THEN ROUND(p.stock / vs.consumo_diario, 1)
          WHEN p.stock <= 5 THEN 3.0
          ELSE 99.0
        END as dias_restantes_estimados,
        CASE 
          WHEN (COALESCE(vs.consumo_diario, 0) > 0 AND (p.stock / vs.consumo_diario) <= 3) OR p.stock <= 2 THEN 'critico'
          WHEN (COALESCE(vs.consumo_diario, 0) > 0 AND (p.stock / vs.consumo_diario) <= 7) OR p.stock <= 5 THEN 'advertencia'
          ELSE 'estable'
        END as nivel_riesgo
      FROM productos p
      LEFT JOIN ventas_semana vs ON p.id = vs.producto_id
      WHERE (COALESCE(vs.consumo_diario, 0) > 0 AND (p.stock / vs.consumo_diario) <= 7) OR p.stock <= 5
      ORDER BY dias_restantes_estimados ASC, p.stock ASC
    `).all();

    return {
      ventas_por_categoria: ventasPorCategoria,
      top_3_productos: top3Productos,
      ticket_promedio: metricasGenerales.valor_promedio_orden,
      ingresos_totales: metricasGenerales.ingresos_totales,
      total_ordenes_activas: metricasGenerales.total_ordenes_validas,
      total_descuentos_otorgados: metricasGenerales.total_descuentos_otorgados,
      ordenes_por_estado: ordenesPorEstado,
      totales_catalogo: conteos,
      alertas_reposicion: alertasReposicion // RETO EXTRA
    };
  }
};
