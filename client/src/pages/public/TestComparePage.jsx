import { Link, useParams } from 'react-router-dom';
import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { useUrlState } from '../../hooks/useUrlState.js';
import { useCompare } from '../../hooks/queries.js';
import { useBasket } from '../../context/BasketContext.jsx';
import { formatNumber, formatPrice, localName } from '../../lib/format.js';
import { getStatus } from '../../lib/errors.js';
import { cn } from '../../lib/cn.js';
import { Container } from '../../components/layout/PageHeader.jsx';
import { LocationFilters } from '../../components/LocationFilters.jsx';
import { Select, Toggle } from '../../components/ui/Select.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { Skeleton, SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { Icon } from '../../components/icons.jsx';
import { PriceTag } from '../../components/PriceTag.jsx';
import { RatingStars } from '../../components/RatingStars.jsx';
import { VerifiedBadge } from '../../components/VerifiedBadge.jsx';
import { ReportTime } from '../../components/ReportTime.jsx';
import { LabLocation } from '../../components/LabCard.jsx';
import { Disclaimer } from '../../components/layout/Footer.jsx';
import { PriceHistoryChart } from '../../components/charts/PriceHistoryChart.jsx';
import NotFoundPage from '../NotFoundPage.jsx';

const FILTER_DEFAULTS = { city: '', area: '', homeCollection: false, accredited: false, minRating: '', sort: 'price_asc' };

function StatsBar({ stats }) {
  const { t, lang } = useLang();
  const items = [
    { label: t('compare.cheapest'), value: formatPrice(stats.minPrice, lang), tone: 'text-primary-dark' },
    { label: t('compare.average'), value: formatPrice(stats.avgPrice, lang), tone: 'text-navy' },
    { label: t('compare.highest'), value: formatPrice(stats.maxPrice, lang), tone: 'text-navy' },
    { label: t('compare.possibleSaving'), value: formatPrice(stats.saving, lang), tone: 'text-coral-ink' },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="rounded-2xl bg-white p-4 shadow-card">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{it.label}</dt>
          <dd className={cn('mt-1 text-2xl font-bold tabular-nums', it.tone)}>{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function FilterBar({ filters, setFilters }) {
  const { t } = useLang();
  return (
    <Card className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto]" padded>
      <LocationFilters city={filters.city} area={filters.area} onChange={setFilters} />
      <Select
        label={t('filters.minRating')}
        value={filters.minRating}
        onChange={(e) => setFilters({ minRating: e.target.value })}
        placeholder={t('filters.anyRating')}
        options={[4, 3, 2].map((n) => ({ value: String(n), label: t('filters.ratingAtLeast', { n }) }))}
      />
      <Select
        label={t('filters.sort')}
        value={filters.sort}
        onChange={(e) => setFilters({ sort: e.target.value })}
        options={['price_asc', 'price_desc', 'rating', 'report_time'].map((s) => ({ value: s, label: t(`filters.sorts.${s}`) }))}
      />
      <div className="flex flex-wrap gap-x-6 gap-y-3 sm:col-span-2 lg:col-span-1 lg:flex-col lg:justify-end lg:pb-1">
        <Toggle label={t('filters.homeCollection')} checked={filters.homeCollection} onChange={(v) => setFilters({ homeCollection: v })} />
        <Toggle label={t('filters.accredited')} checked={filters.accredited} onChange={(v) => setFilters({ accredited: v })} />
      </div>
    </Card>
  );
}

function SavingBadge({ row }) {
  const { t, lang } = useLang();
  if (!row.isCheapest || row.savingVsMax <= 0) return row.isCheapest ? <Badge variant="coral" icon="tag">{t('price.cheapest')}</Badge> : null;
  return <Badge variant="coral" icon="tag">{t('price.save', { amount: formatPrice(row.savingVsMax, lang) })}</Badge>;
}

function reportLink(testSlug, labSlug) {
  return `/report-price?test=${encodeURIComponent(testSlug)}&lab=${encodeURIComponent(labSlug)}`;
}

/** Desktop: a table. The cheapest row is highlighted in coral. */
function ResultsTable({ results, testSlug }) {
  const { t } = useLang();
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card md:block">
      <table className="w-full text-sm">
        <caption className="sr-only">{t('compare.tableCaption')}</caption>
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-4 py-3">{t('compare.lab')}</th>
            <th scope="col" className="px-4 py-3">{t('compare.price')}</th>
            <th scope="col" className="px-4 py-3">{t('compare.reportTime')}</th>
            <th scope="col" className="px-4 py-3">{t('compare.rating')}</th>
            <th scope="col" className="px-4 py-3">{t('compare.verified')}</th>
            <th scope="col" className="px-4 py-3"><span className="sr-only">{t('compare.actions')}</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {results.map((row) => (
            <tr key={row.labTestId} className={cn(row.isCheapest ? 'bg-coral-light/50' : 'hover:bg-slate-50/70')}>
              <td className={cn('px-4 py-4', row.isCheapest && 'border-l-4 border-coral')}>
                <Link to={`/labs/${row.lab.slug}`} className="font-semibold text-navy hover:text-primary-dark">{row.lab.name}</Link>
                <LabLocation lab={row.lab} />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {row.lab.isAccredited && <Badge variant="teal" icon="shield">{t('lab.accredited')}</Badge>}
                  {row.lab.homeCollection && <Badge variant="slate" icon="home">{t('lab.homeCollection')}</Badge>}
                </div>
              </td>
              <td className="px-4 py-4">
                <PriceTag price={row.price} discountedPrice={row.discountedPrice} highlight={row.isCheapest} />
                <div className="mt-1"><SavingBadge row={row} /></div>
              </td>
              <td className="px-4 py-4 text-slate-700"><ReportTime hours={row.reportHours} /></td>
              <td className="px-4 py-4"><RatingStars value={row.lab.rating.average} count={row.lab.rating.count} /></td>
              <td className="px-4 py-4"><VerifiedBadge date={row.lastVerifiedAt} compact /></td>
              <td className="px-4 py-4 text-right">
                <Link to={reportLink(testSlug, row.lab.slug)} className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-navy hover:underline">
                  {t('compare.reportShort')}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Mobile: one card per lab. */
function ResultCards({ results, testSlug }) {
  const { t } = useLang();
  return (
    <ul className="grid gap-3 md:hidden">
      {results.map((row) => (
        <li
          key={row.labTestId}
          className={cn('rounded-2xl border bg-white p-4 shadow-card', row.isCheapest ? 'border-coral ring-2 ring-coral/30' : 'border-slate-100')}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link to={`/labs/${row.lab.slug}`} className="block truncate font-semibold text-navy">{row.lab.name}</Link>
              <LabLocation lab={row.lab} />
            </div>
            <div className="text-right">
              <PriceTag price={row.price} discountedPrice={row.discountedPrice} highlight={row.isCheapest} />
            </div>
          </div>
          <div className="mt-2"><SavingBadge row={row} /></div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
            <ReportTime hours={row.reportHours} />
            <RatingStars value={row.lab.rating.average} count={row.lab.rating.count} />
            {row.lab.isAccredited && <Badge variant="teal" icon="shield">{t('lab.accredited')}</Badge>}
            {row.lab.homeCollection && <Badge variant="slate" icon="home">{t('lab.homeCollection')}</Badge>}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <VerifiedBadge date={row.lastVerifiedAt} />
            <Link to={reportLink(testSlug, row.lab.slug)} className="text-xs font-medium text-slate-500 underline">
              {t('compare.reportShort')}
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function TestComparePage() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const basket = useBasket();
  const [filters, setFilters] = useUrlState(FILTER_DEFAULTS);
  const query = {
    city: filters.city,
    area: filters.area,
    homeCollection: filters.homeCollection || undefined,
    accredited: filters.accredited || undefined,
    minRating: filters.minRating,
    sort: filters.sort,
  };
  const { data, isPending, isError, isFetching, error, refetch } = useCompare(slug, query);
  const test = data?.test;

  usePageMeta({
    title: test ? t('compare.metaTitle', { name: localName(test, lang) }) : t('pages.compare.title'),
    description: test ? t('compare.metaDescription', { name: test.nameEn, min: test.minPrice, max: test.maxPrice }) : undefined,
  });

  if (isError && getStatus(error) === 404) return <NotFoundPage />;

  const hasFilters = filters.city || filters.homeCollection || filters.accredited || filters.minRating;
  const inBasket = test && basket.has(test.id);
  const cheapest = data?.results.find((r) => r.isCheapest);

  return (
    <>
      <section className="border-b border-primary/10 bg-gradient-to-b from-white to-mint">
        <Container className="py-8 sm:py-10">
          <nav aria-label={t('compare.breadcrumb')} className="mb-3 text-sm text-slate-500">
            <Link to="/tests" className="hover:text-navy">{t('nav.tests')}</Link>
            {test && <> / <span>{localName(test.category, lang)}</span></>}
          </nav>
          {!test ? (
            <div className="space-y-3"><Skeleton className="h-9 w-2/3" /><Skeleton className="h-5 w-1/3" /></div>
          ) : (
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-bold text-navy sm:text-3xl">{localName(test, lang)}</h1>
                <p className="mt-1 text-slate-600">{lang === 'bn' ? test.nameEn : test.nameBn}</p>
                {test.aliases?.length > 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    {t('compare.alsoKnownAs')} {test.aliases.slice(0, 6).join(', ')}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant={inBasket ? 'secondary' : 'primary'} onClick={() => basket.toggle(test)} aria-pressed={inBasket}>
                  <Icon name={inBasket ? 'check' : 'basket'} className="h-4 w-4" />
                  {inBasket ? t('basket.inBasket') : t('basket.add')}
                </Button>
                <Button to={reportLink(test.slug, cheapest?.lab.slug || '')} variant="secondary">
                  <Icon name="tag" className="h-4 w-4" /> {t('compare.reportDifferent')}
                </Button>
              </div>
            </div>
          )}
          {test && (test.sampleType || test.preparationNote || test.description) && (
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
              {test.sampleType && (
                <p className="rounded-xl bg-white/70 p-3"><span className="block text-xs text-slate-500">{t('compare.sample')}</span>{test.sampleType}</p>
              )}
              {test.description && (
                <p className="rounded-xl bg-white/70 p-3"><span className="block text-xs text-slate-500">{t('compare.about')}</span>{test.description}</p>
              )}
              {test.preparationNote && (
                <p className="rounded-xl bg-white/70 p-3"><span className="block text-xs text-slate-500">{t('compare.preparation')}</span>{test.preparationNote}</p>
              )}
            </div>
          )}
        </Container>
      </section>

      <Container className="space-y-6 py-8">
        <FilterBar filters={filters} setFilters={setFilters} />

        {isError && (
          <EmptyState icon="alert" title={t('errors.loadFailed')} action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />
        )}
        {isPending && <div className="grid gap-3">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}</div>}

        {data && (
          <div className={cn('space-y-5 transition-opacity', isFetching && 'opacity-60')}>
            {data.stats.count > 0 && <StatsBar stats={data.stats} />}
            <p className="text-sm text-slate-600" aria-live="polite">
              {t('compare.labsFound', { count: data.stats.count, n: formatNumber(data.stats.count, lang) })}
            </p>
            {data.stats.count === 0 ? (
              <EmptyState
                title={t('compare.noLabs')}
                description={hasFilters ? t('compare.noLabsFiltered') : t('compare.noLabsAtAll')}
                action={hasFilters && <Button variant="secondary" onClick={() => setFilters(FILTER_DEFAULTS)}>{t('filters.clear')}</Button>}
              />
            ) : (
              <>
                <ResultsTable results={data.results} testSlug={slug} />
                <ResultCards results={data.results} testSlug={slug} />
              </>
            )}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
              <Disclaimer />
            </div>
          </div>
        )}

        {data && data.results.length > 0 && (
          <Card>
            <PriceHistoryChart
              key={slug}
              slug={slug}
              labs={data.results.map((r) => r.lab)}
              defaultLabId={cheapest?.lab.id}
            />
          </Card>
        )}
      </Container>
    </>
  );
}
