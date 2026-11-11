import { forwardRef, useId } from 'react';
import { cn } from '../../lib/cn.js';

export const fieldClasses = (hasError) =>
  cn(
    'block w-full rounded-xl border bg-white px-3.5 text-slate-800 placeholder:text-slate-400 shadow-sm transition',
    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30',
    'disabled:cursor-not-allowed disabled:bg-slate-100',
    hasError ? 'border-red-400' : 'border-slate-300',
  );

/** A wrapper that renders a label, a hint and an error message around any form control. */
export function Field({ id, label, hint, error, required, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-coral" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-slate-500">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const Input = forwardRef(function Input(
  { label, hint, error, id, className, inputClassName, required, multiline = false, rows = 4, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;
  const Tag = multiline ? 'textarea' : 'input';

  return (
    <Field id={inputId} label={label} hint={hint} error={error} required={required} className={className}>
      <Tag
        ref={ref}
        id={inputId}
        required={required}
        rows={multiline ? rows : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldClasses(!!error), multiline ? 'py-2.5' : 'h-11', inputClassName)}
        {...props}
      />
    </Field>
  );
});
