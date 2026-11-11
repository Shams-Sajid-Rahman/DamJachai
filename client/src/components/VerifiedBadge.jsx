import { useLang } from '../hooks/useLang.js';
import { formatDate, isStale, timeAgo } from '../lib/format.js';
import { cn } from '../lib/cn.js';
import { Icon } from './icons.jsx';

/** "Verified 3 days ago". Shown in amber with a warning when the price is older than 90 days. */
export function VerifiedBadge({ date, className, compact = false }) {
  const { t, lang } = useLang();
  if (!date) return null;
  const stale = isStale(date);

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-xs', stale ? 'font-semibold text-amber-700' : 'text-slate-500', className)}
      title={`${t('price.lastVerified')}: ${formatDate(date, lang)}`}
    >
      <Icon name={stale ? 'alert' : 'checkCircle'} className="h-3.5 w-3.5 shrink-0" />
      {compact ? timeAgo(date, lang) : t('price.verifiedAgo', { when: timeAgo(date, lang) })}
      {stale && !compact && <span className="sr-only">. {t('price.staleWarning')}</span>}
    </span>
  );
}
