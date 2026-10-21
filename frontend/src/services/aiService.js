// Servicio de integración con el Agente de IA de n8n (Requisito Rúbrica)
// Contrato de respuesta esperado: { ok: boolean, data: string, error?: string }

export function getAiConfig() {
  const customUrl = localStorage.getItem('techstore_n8n_url') || import.meta.env.VITE_N8N_WEBHOOK_URL || '';
  const mode = localStorage.getItem('techstore_n8n_mode') || (customUrl ? 'live' : 'mock');
  return { customUrl, mode };
}

export function saveAiConfig(customUrl, mode) {
  if (customUrl) {
    localStorage.setItem('techstore_n8n_url', customUrl.trim());
  } else {
    localStorage.removeItem('techstore_n8n_url');
  }
  localStorage.setItem('techstore_n8n_mode', mode);
}

export async function callAiAgent(payload) {
  const { customUrl, mode } = getAiConfig();

  // Si está en modo 'live' y hay URL configurada, llamar al Webhook de n8n
  if (mode === 'live' && customUrl) {
    try {
      const response = await fetch(customUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`El Webhook de n8n respondió con error ${response.status}`);
      }

      const resJson = await response.json();
      if (typeof resJson === 'string') {
        return { ok: true, data: resJson };
      }

      return {
        ok: resJson.ok !== undefined ? resJson.ok : true,
        data: resJson.data || resJson.output || resJson.response || JSON.stringify(resJson),
        error: resJson.error || null
      };
    } catch (err) {
      console.warn('⚠️ Falló la llamada a n8n, activando fallback local:', err.message);
      const fallback = fallbackAiAgent(payload);
      fallback.warning = `No se pudo conectar a n8n (${err.message}). Se usó el respaldo local.`;
      return fallback;
    }
  }

  // Modo simulación rápida local (cumple estrictamente con las reglas del Caso 5)
  return fallbackAiAgent(payload);
}

function fallbackAiAgent(payload) {
  const { accion } = payload;

  if (accion === 'generar_descripcion') {
    const { nombre } = payload;
    const descripciones = [
      `Potencia tu productividad con ${nombre}. Chasis ergonómico de grado aeroespacial, respuesta táctil inmediata y eficiencia térmica superior para jornadas intensas de rendimiento profesional ininterrumpido.`,
      `Diseño ergonómico avanzado para confort total. ${nombre} combina componentes de alta durabilidad, conectividad ultrarrápida y precisión milimétrica diseñada para creadores y entusiastas del hardware premium.`
    ];
    const randomIndex = Math.floor(Math.random() * descripciones.length);
    return {
      ok: true,
      data: descripciones[randomIndex]
    };
  }

  if (accion === 'recomendar_carrito') {
    const { carrito = [], catalogo_disponible = [] } = payload;
    const carritoIds = new Set(carrito.map(p => p.id || p.producto_id));
    const candidatos = catalogo_disponible.filter(p => !carritoIds.has(p.id) && p.stock > 0);

    const prod1 = candidatos[0] || { nombre: 'Mouse Inalámbrico Ergonómico', precio: 28000 };
    const prod2 = candidatos[1] || { nombre: 'SSD NVMe 1TB Gen4', precio: 55000 };

    const formatearColones = (monto) => `₡${Number(monto).toLocaleString('es-CR')}`;

    return {
      ok: true,
      data: `Completa tu setup con ${prod1.nombre} (${formatearColones(prod1.precio)}) y ${prod2.nombre} (${formatearColones(prod2.precio)}). Maximizan tu ergonomía diaria y transfieren datos al instante, creando la sincronía técnica ideal para alto rendimiento.`,
      sugerencias: [prod1, prod2]
    };
  }

  return {
    ok: false,
    error: `Acción '${accion}' no soportada`
  };
}
