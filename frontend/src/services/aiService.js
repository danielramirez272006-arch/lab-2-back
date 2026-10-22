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

  // Si está en modo 'live' y hay URL configurada, llamar al Webhook de n8n mediante el proxy
  if (mode === 'live' && customUrl) {
    try {
      const response = await fetch('/api/ai/agente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhookUrl: customUrl,
          payload
        })
      });

      const resJson = await response.json();
      if (!response.ok || !resJson.ok) {
        throw new Error(resJson.error || `El Agente de n8n devolvió código ${response.status}`);
      }

      return {
        ok: true,
        data: resJson.data,
        error: null
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
      `Protección y elegancia absoluta para tu dispositivo con ${nombre}. Chasis bicapa con amortiguación de impacto militar, soporte magnético MagSafe y acabados táctiles refinados para un agarre seguro y sofisticado.`,
      `Diseño milimétrico y protección de pantalla para ${nombre}. Combina aleaciones ligeras, forro interior de microfibra suave y compatibilidad con carga rápida inalámbrica para una experiencia premium ininterrumpida.`
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

    const prod1 = candidatos[0] || { nombre: 'Estuche Tessel MagSafe Cuero Nórdico', precio: 28000 };
    const prod2 = candidatos[1] || { nombre: 'Estuche Tessel Armor Anticaídas 3M', precio: 22000 };

    const formatearColones = (monto) => `₡${Number(monto).toLocaleString('es-CR')}`;

    return {
      ok: true,
      data: `Equipa tu teléfono con el combo ideal: ${prod1.nombre} (${formatearColones(prod1.precio)}) para elegancia ejecutiva y ${prod2.nombre} (${formatearColones(prod2.precio)}) para protección extrema contra impactos diarios.`,
      sugerencias: [prod1, prod2]
    };
  }

  return {
    ok: false,
    error: `Acción '${accion}' no soportada`
  };
}
