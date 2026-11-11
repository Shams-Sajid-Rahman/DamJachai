import { useLang } from '../../../hooks/useLang.js';
import { Input } from '../../../components/ui/Input.jsx';
import { Select, Toggle } from '../../../components/ui/Select.jsx';

/**
 * Renders a form from a field list.
 * field: { name, label, type: text | textarea | number | select | toggle | tags | email | url,
 *          options?(values) | options[], required?, hint?, placeholder?, disabled?(values) | disabled, hidden?(values), wide? }
 */
export function FormFields({ fields, values, errors = {}, onChange }) {
  const { t } = useLang();
  const set = (name, value) => onChange({ ...values, [name]: value });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        if (f.hidden?.(values)) return null;
        const disabled = typeof f.disabled === 'function' ? f.disabled(values) : f.disabled;
        const common = { key: f.name, label: f.label, hint: f.hint, error: errors[f.name], required: f.required, disabled };
        const wide = f.wide || f.type === 'textarea' || f.type === 'tags';
        const cls = wide ? 'sm:col-span-2' : '';

        if (f.type === 'toggle') {
          return (
            <div key={f.name} className={cls}>
              <Toggle label={f.label} description={f.hint} checked={!!values[f.name]} onChange={(v) => set(f.name, v)} />
            </div>
          );
        }
        if (f.type === 'select') {
          const options = typeof f.options === 'function' ? f.options(values) : f.options;
          return (
            <Select
              {...common}
              className={cls}
              value={values[f.name] ?? ''}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.placeholder ?? t('admin.form.choose')}
              options={options || []}
            />
          );
        }
        if (f.type === 'tags') {
          return (
            <Input
              {...common}
              className={cls}
              multiline
              rows={3}
              value={values[f.name] ?? ''}
              onChange={(e) => set(f.name, e.target.value)}
              placeholder={f.placeholder}
            />
          );
        }
        return (
          <Input
            {...common}
            className={cls}
            multiline={f.type === 'textarea'}
            rows={3}
            type={f.type === 'textarea' ? undefined : f.type || 'text'}
            inputMode={f.type === 'number' ? 'decimal' : undefined}
            step={f.step}
            value={values[f.name] ?? ''}
            onChange={(e) => set(f.name, e.target.value)}
            placeholder={f.placeholder}
          />
        );
      })}
    </div>
  );
}

/** Client-side check of required fields. Returns { field: message }. */
export function requiredErrors(fields, values, t) {
  const errors = {};
  for (const f of fields) {
    if (!f.required || f.hidden?.(values)) continue;
    const v = values[f.name];
    if (v === undefined || v === null || String(v).trim() === '') errors[f.name] = t('validation.required');
  }
  return errors;
}

// Converters between form strings and API values.
export const toNumberOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
export const toIdOrNull = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
export const toTextOrNull = (v) => (v === undefined || v === null || String(v).trim() === '' ? null : String(v).trim());
export const toOptional = (v) => (v === undefined || v === null || String(v).trim() === '' ? undefined : String(v).trim());
export const splitTags = (v) => String(v || '').split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
