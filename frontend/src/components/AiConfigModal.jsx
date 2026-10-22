import { useState } from 'react';
import { getAiConfig, saveAiConfig } from '../services/aiService';
import AlertMessage from './AlertMessage';
import { Sparkles, X, Check, Globe, Cpu, Loader2 } from 'lucide-react';

export default function AiConfigModal({ onClose, onSaved }) {
  const current = getAiConfig();
  const [url, setUrl] = useState(current.customUrl);
  const [mode, setMode] = useState(current.mode);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setTestResult({ type: 'error', message: 'Ingresa una URL de Webhook para probar la conexión.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/agente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: url.trim(),
          payload: {
            accion: 'generar_descripcion',
            nombre: 'Estuche Tessel MagSafe Cuero Nórdico',
            categoria: 'MagSafe'
          }
        })
      });

      const resData = await res.json().catch(() => ({}));
      if (res.ok && resData.ok) {
        setTestResult({
          type: 'success',
          message: '¡Conexión exitosa con el Agente de IA en n8n! Respuesta recibida de DeepSeek.'
        });
      } else {
        setTestResult({
          type: 'error',
          message: resData.error || `El webhook respondió con código ${res.status}. Asegúrate de activar el workflow en n8n.`
        });
      }
    } catch (err) {
      setTestResult({ type: 'error', message: `No se pudo conectar: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveAiConfig(url, mode);
    if (onSaved) onSaved({ customUrl: url, mode });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '540px',
        width: '100%',
        background: '#ffffff',
        border: '1px solid var(--border-strong)',
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: 'var(--accent-ai-gradient)',
              padding: '0.4rem',
              borderRadius: '8px',
              color: '#fff'
            }}>
              <Sparkles size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Configuración de Agente de IA (n8n)</h3>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem' }}>
            <X size={16} />
          </button>
        </div>

        {testResult && (
          <AlertMessage
            type={testResult.type}
            message={testResult.message}
            onClose={() => setTestResult(null)}
          />
        )}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Modo de Operación:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${mode === 'mock' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('mock')}
                style={{ justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
              >
                <Cpu size={16} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Simulación Local</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Sin necesidad de n8n</div>
                </div>
              </button>

              <button
                type="button"
                className={`btn btn-sm ${mode === 'live' ? 'btn-ai' : 'btn-secondary'}`}
                onClick={() => setMode('live')}
                style={{ justifyContent: 'flex-start', padding: '0.6rem 0.8rem' }}
              >
                <Globe size={16} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>n8n en Vivo</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>Webhook HTTP POST</div>
                </div>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">URL del Webhook de n8n:</label>
            <input
              type="url"
              className="form-input"
              placeholder="http://localhost:5678/webhook/techstore-agente-ia"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
              Importa el archivo <code>workflow_n8n_caso5.json</code> en tu n8n y pega aquí la URL generada en el nodo Webhook.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={testing || !url.trim()}
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              {testing ? 'Probando...' : 'Probar Conexión'}
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <Check size={14} /> Guardar Configuración
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
