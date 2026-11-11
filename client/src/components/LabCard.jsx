import { Link } from 'react-router-dom';
import { useLang } from '../hooks/useLang.js';
import { formatNumber, formatPrice, localName } from '../lib/format.js';
import { RatingStars } from './RatingStars.jsx';
import { Badge } from './ui/Badge.jsx';
import { Icon } from './icons.jsx';

export function LabBadges({ lab }) {
  const { t, lang } = useLang();
  return (
    <div className="flex flex-wrap gap-1.5">
      {lab.isAccredited && <Badge variant="teal" icon="shield">{t('lab.accredited')}</Badge>}
      {lab.homeCollection && (
        <Badge variant="slate" icon="home">
          {lab.homeCollectionFee ? t('lab.homeCollectionFee', { fee: formatPrice(lab.homeCollectionFee, lang) }) : t('lab.homeCollection')}
        </Badge>
      )}
      {lab.isSample && <Badge variant="amber">{t('common.sampleData')}</Badge>}
    </div>
  );
}

export function LabLocation({ lab, className = '' }) {
  const { lang } = useLang();
  return (
    <p className={`flex items-center gap-1 text-sm text-slate-500 ${className}`}>
      <Icon name="mapPin" className="h-4 w-4 shrink-0" />
      <span className="truncate">{[localName(lab.area, lang), localName(lab.city, lang)].filter(Boolean).join(', ')}</span>
    </p>
  );
}

export function LabCard({ lab, action }) {
  const { t, lang } = useLang();
  return (
    <article className="relative flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-navy">
            <Link to={`/labs/${lab.slug}`} className="after:absolute after:inset-0">
              {lab.name}
            </Link>
          </h3>
          <LabLocation lab={lab} />
        </div>
        {action && <div className="relative z-10 shrink-0">{action}</div>}
      </div>
      <RatingStars value={lab.rating?.average} count={lab.rating?.count} />
      <LabBadges lab={lab} />
      {lab.testCount != null && (
        <p className="mt-auto border-t border-slate-100 pt-3 text-sm text-slate-600">
          {t('labs.testCount', { count: lab.testCount, n: formatNumber(lab.testCount, lang) })}
        </p>
      )}
    </article>
  );
}
