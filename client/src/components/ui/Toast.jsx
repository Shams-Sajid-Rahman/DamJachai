import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn.js';
import { Icon } from '../icons.jsx';

const ToastContext = createContext(null);

const STYLES = {
  success: { box: 'border-emerald-200 bg-white', icon: 'checkCircle', color: 'text-emerald-600' },
  error: { box: 'border-red-200 bg-white', icon: 'alert', color: 'text-red-600' },
  info: { box: 'border-primary/30 bg-white', icon: 'info', color: 'text-primary-dark' },
};

export function ToastProvider({ children }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((x) => x.id !== id)), []);

  const show = useCallback(
    (type, message, { duration = 4500 } = {}) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, type, message }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (m, o) => show('success', m, o),
      error: (m, o) => show('error', m, o),
      info: (m, o) => show('info', m, o),
      dismiss,
    }),
    [show, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6"
      >
        {toasts.map((toast) => {
          const s = STYLES[toast.type];
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={cn('pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg animate-toast-in', s.box)}
            >
              <Icon name={s.icon} className={cn('mt-0.5 h-5 w-5 shrink-0', s.color)} />
              <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="-m-1 rounded p-1 text-slate-400 hover:text-slate-600"
                aria-label={t('common.close')}
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
