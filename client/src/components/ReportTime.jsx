import { useLang } from '../hooks/useLang.js';
import { formatNumber, reportTime } from '../lib/format.js';
import { Icon } from './icons.jsx';

/** "6 hours" or "2 days", with a clock icon. */
export function ReportTime({ hours, className = '' }) {
  const { t, lang } = useLang();
  const rt = reportTime(hours);
  if (!rt) return <span className={`text-slate-400 ${className}`}>—</span>;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap ${className}`}>
      <Icon name="clock" className="h-4 w-4 text-slate-400" />
      {t(`price.${rt.unit}`, { count: rt.value, n: formatNumber(rt.value, lang) })}
    </span>
  );
}
