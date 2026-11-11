import { useLang } from '../../hooks/useLang.js';
import { formatNumber } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';
import { Icon } from '../icons.jsx';

/** Page numbers with ellipses, e.g. 1 … 4 5 6 … 12 */
export function pageList(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…');
    out.push(p);
  });
  return out;
}

export function Pagination({ page, totalPages, onChange, className }) {
  const { t, lang } = useLang();
  if (!totalPages || totalPages <= 1) return null;

  const btn = 'inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-medium transition';

  return (
    <nav aria-label={t('common.pagination')} className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        className={cn(btn, 'text-slate-600 hover:bg-white disabled:opacity-40')}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label={t('common.previous')}
      >
        <Icon name="chevronLeft" className="h-4 w-4" />
      </button>
      {pageList(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1 text-slate-400">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(btn, p === page ? 'bg-primary text-white shadow-sm' : 'text-slate-700 hover:bg-white')}
          >
            {formatNumber(p, lang)}
          </button>
        ),
      )}
      <button
        type="button"
        className={cn(btn, 'text-slate-600 hover:bg-white disabled:opacity-40')}
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label={t('common.next')}
      >
        <Icon name="chevronRight" className="h-4 w-4" />
      </button>
    </nav>
  );
}
