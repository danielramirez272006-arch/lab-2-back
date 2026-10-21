import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function AlertMessage({ type = 'error', message, onClose }) {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div className={`alert alert-${type}`}>
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {isError && <AlertCircle size={18} />}
        {isSuccess && <CheckCircle2 size={18} />}
        {!isError && !isSuccess && <Info size={18} />}
      </div>
      <div style={{ flex: 1 }}>{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '1.2rem',
            lineHeight: 1
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
