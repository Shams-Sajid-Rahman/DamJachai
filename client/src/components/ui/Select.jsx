import { forwardRef, useId } from 'react';
import { cn } from '../../lib/cn.js';
import { Field, fieldClasses } from './Input.jsx';
import { Icon } from '../icons.jsx';

/**
 * Native <select> with the same look as Input.
 * options: [{ value, label }]. `placeholder` adds an empty first option.
 */
export const Select = forwardRef(function Select(
  { label, hint, error, id, options = [], placeholder, className, selectClassName, required, ...props },
  ref,
) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <Field id={selectId} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          className={cn(fieldClasses(!!error), 'h-11 appearance-none pr-10', selectClassName)}
          {...props}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="chevronDown" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    </Field>
  );
});

/** A labelled on/off switch (a checkbox with role="switch"). */
export function Toggle({ label, checked, onChange, id, className, description }) {
  const autoId = useId();
  const toggleId = id || autoId;
  return (
    <label htmlFor={toggleId} className={cn('flex cursor-pointer items-start gap-3', className)}>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          id={toggleId}
          type="checkbox"
          role="switch"
          className="peer sr-only"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
      <span className="text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}
