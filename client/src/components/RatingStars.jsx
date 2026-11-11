import { useState } from 'react';
import { useLang } from '../hooks/useLang.js';
import { formatNumber } from '../lib/format.js';
import { cn } from '../lib/cn.js';
import { Icon } from './icons.jsx';

const SIZES = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-8 w-8' };

/** Shows an average rating (0–5, partial stars supported), with an optional review count. */
export function RatingStars({ value, count, size = 'sm', showValue = true, className }) {
  const { t, lang } = useLang();
  const rating = Number(value) || 0;
  const label = value == null ? t('rating.none') : t('rating.label', { value: formatNumber(rating, lang, { maximumFractionDigits: 1 }) });

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)} title={label}>
      <span className="relative inline-flex" role="img" aria-label={label}>
        <span className="flex text-slate-200">
          {[0, 1, 2, 3, 4].map((i) => (
            <Icon key={i} name="star" filled strokeWidth={0} className={SIZES[size]} />
          ))}
        </span>
        <span className="absolute inset-0 flex overflow-hidden text-amber-400" style={{ width: `${(rating / 5) * 100}%` }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Icon key={i} name="star" filled strokeWidth={0} className={cn(SIZES[size], 'shrink-0')} />
          ))}
        </span>
      </span>
      {showValue && value != null && (
        <span className="text-sm font-semibold text-slate-700">{formatNumber(rating, lang, { maximumFractionDigits: 1 })}</span>
      )}
      {count != null && <span className="text-xs text-slate-500">({formatNumber(count, lang)})</span>}
    </span>
  );
}

/** Star picker for the review form (radio group semantics). */
export function RatingInput({ value, onChange, name = 'rating', error }) {
  const { t } = useLang();
  const [hover, setHover] = useState(0);
  const shown = hover || value || 0;

  return (
    <div>
      <div role="radiogroup" aria-label={t('rating.choose')} className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="cursor-pointer rounded-md p-0.5 focus-within:ring-2 focus-within:ring-primary"
            onMouseEnter={() => setHover(n)}
          >
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
              aria-label={t('rating.stars', { count: n })}
            />
            <Icon name="star" filled strokeWidth={0} className={cn('h-8 w-8 transition', n <= shown ? 'text-amber-400' : 'text-slate-200')} />
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
}
