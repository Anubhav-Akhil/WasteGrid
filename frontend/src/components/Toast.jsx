import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const ICONS = {
  success: <CheckCircle2 size={18} color="#34d399" />,
  danger:  <XCircle     size={18} color="#f87171" />,
  warning: <AlertTriangle size={18} color="#fbbf24" />,
  info:    <Info        size={18} color="#22d3ee" />,
};

function ToastItem({ id, type = 'info', title, message, onRemove }) {
  const [exiting, setExiting] = useState(false);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onRemove(id), 260);
  };

  return (
    <div className={`toast toast-${type} ${exiting ? 'exiting' : ''}`}>
      <span className="toast-icon">{ICONS[type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <div className="toast-title">{title}</div>}
        {message && <div className="toast-msg">{message}</div>}
      </div>
      <button className="toast-close" onClick={dismiss}><X size={14} /></button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const addToast = useCallback((opts) => {
    const id = ++counter.current;
    setToasts(prev => [...prev, { id, ...opts }]);
    const duration = opts.duration ?? 4000;
    if (duration > 0) setTimeout(() => removeToast(id), duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, title = 'Success') => addToast({ type: 'success', title, message: msg }),
    error:   (msg, title = 'Error')   => addToast({ type: 'danger',  title, message: msg }),
    warning: (msg, title = 'Warning') => addToast({ type: 'warning', title, message: msg }),
    info:    (msg, title = 'Info')    => addToast({ type: 'info',    title, message: msg }),
    custom:  (opts) => addToast(opts),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
