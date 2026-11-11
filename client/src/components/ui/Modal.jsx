import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/cn.js';
import { Icon } from '../icons.jsx';
import { Button } from './Button.jsx';

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

/**
 * Accessible modal built on the native <dialog>. The browser handles the focus trap, Escape and the top layer.
 * `variant="drawer"` slides in from the right (used by the admin forms).
 */
export function Modal({ open, onClose, title, description, size = 'md', variant = 'modal', footer, children, className }) {
  const ref = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isDrawer = variant === 'drawer';

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose?.();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose?.(); // a click on the backdrop
      }}
      aria-labelledby={title ? 'modal-title' : undefined}
      className={cn(
        'backdrop:bg-navy/60 backdrop:backdrop-blur-sm open:flex open:flex-col bg-white p-0 text-slate-700 shadow-2xl',
        isDrawer
          ? 'm-0 ml-auto h-dvh max-h-dvh w-full max-w-xl rounded-none'
          : cn('w-[calc(100%-2rem)] rounded-2xl', SIZES[size]),
        className,
      )}
    >
      {open && (
        <>
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              {title && (
                <h2 id="modal-title" className="text-lg font-semibold text-navy">
                  {title}
                </h2>
              )}
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label={t('common.close')} className="-mr-2 -mt-1">
              <Icon name="close" />
            </Button>
          </div>
          <div className={cn('overflow-y-auto px-5 py-5 sm:px-6', isDrawer ? 'flex-1' : 'max-h-[70vh]')}>{children}</div>
          {footer && (
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 sm:px-6">{footer}</div>
          )}
        </>
      )}
    </dialog>
  );
}

/** A yes / no confirmation dialog, for deletes and other risky actions. */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel, danger = true, loading = false }) {
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel || t('common.confirm')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
