import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { useBasketCompare } from '../../hooks/queries.js';
import { useBasket, BASKET_MAX } from '../../context/BasketContext.jsx';
import { formatNumber, formatPrice, localName } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';
import { PageHeader, Container } from '../../components/layout/PageHeader.jsx';
import { SearchBar } from '../../components/SearchBar.jsx';
import { LocationFilters } from '../../components/LocationFilters.jsx';
import { Toggle } from '../../components/ui/Select.jsx';
import { Card, CardHeader } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { Icon } from '../../components/icons.jsx';
import { RatingStars } from '../../components/RatingStars.jsx';
import { ReportTime } from '../../components/ReportTime.jsx';
import { LabBadges, LabLocation } from '../../components/LabCard.jsx';
import { Disclaimer } from '../../components/layout/Footer.jsx';

function LabTotal({ result, tests, rank, cheapestTotal }) {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const isBest = rank === 0;
  const extra = result.total - cheapestTotal;
  const nameOf = (id) => localName(tests.find((x) => x.id === id), lang);

  return (
    <li className={cn('rounded-2xl border bg-white p-5 shadow-card', isBest ? 'border-coral ring-2 ring-coral/30' : 'border-slate-100')}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold', isBest ? 'bg-coral text-navy' : 'bg-slate-100 text-slate-600')}>
              {formatNumber(rank + 1, lang)}
            </span>
            <Link to={`/labs/${result.lab.slug}`} className="truncate text-lg font-semibold text-navy hover:text-primary-dark">{result.lab.name}</Link>
          </div>
          <LabLocation lab={result.lab} className="mt-1" />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <RatingStars value={result.lab.rating.average} count={result.lab.rating.count} />
            <span className="text-sm text-slate-600">{t('basket.allReportsIn')} <ReportTime hours={result.maxReportHours} /></span>
          </div>
          <div className="mt-2"><LabBadges lab={result.lab} /></div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{t('basket.total')}</p>
          <p className={cn('text-3xl font-bold tabular-nums', isBest ? 'text-coral-ink' : 'text-navy')}>{formatPrice(result.total, lang)}</p>
          {result.totalBeforeDiscount > result.total && (
            <p className="text-xs text-slate-500 line-through">{formatPrice(result.totalBeforeDiscount, lang)}</p>
          )}
          {isBest ? (
            <Badge variant="coral" icon="tag" className="mt-1">{t('basket.bestDeal')}</Badge>
          ) : (
            <p className="mt-1 text-xs text-slate-500">{t('basket.moreThanBest', { amount: formatPrice(extra, lang) })}</p>
          )}
        </div>
      </div>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-dark">
        <Icon name="chevronDown" className={cn('h-4 w-4 transition', open && 'rotate-180')} />
        {open ? t('basket.hideBreakdown') : t('basket.showBreakdown')}
      </button>
      {open && (
        <ul className="mt-2 divide-y divide-slate-100 rounded-xl bg-slate-50 px-4">
          {result.items.map((item) => (
            <li key={item.testId} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="text-slate-700">{nameOf(item.testId)}</span>
              <span className="font-medium tabular-nums text-navy">{formatPrice(item.effectivePrice, lang)}</span>
            </li>
          ))}
          {result.lab.homeCollection && result.lab.homeCollectionFee > 0 && (
            <li className="flex items-center justify-between gap-3 py-2 text-xs text-slate-500">
              <span>{t('basket.homeCollectionExtra')}</span>
              <span>+{formatPrice(result.lab.homeCollectionFee, lang)}</span>
            </li>
          )}
        </ul>
      )}
    </li>
  );
}

export default function BasketPage() {
  const { t, lang } = useLang();
  const basket = useBasket();
  const [filters, setFilters] = useState({ city: '', area: '', homeCollection: false });
  usePageMeta({ title: t('pages.basket.title'), description: t('basket.metaDescription') });

  const body = useMemo(
    () => ({
      testIds: basket.items.map((i) => i.id),
      city: filters.city || undefined,
      area: filters.area || undefined,
      homeCollection: filters.homeCollection || undefined,
    }),
    [basket.items, filters],
  );
  const { data, isPending, isError, isFetching, refetch } = useBasketCompare(body);
  const hasTests = basket.count > 0;
  const tests = data?.tests ?? basket.items;

  return (
    <>
      <PageHeader title={t('pages.basket.title')} subtitle={t('pages.basket.subtitle')} />
      <Container className="grid items-start gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="space-y-6 lg:sticky lg:top-20">
          <Card>
            <CardHeader
              title={t('basket.yourTests', { count: basket.count, n: formatNumber(basket.count, lang) })}
              action={hasTests && <Button variant="link" onClick={basket.clear}>{t('basket.clear')}</Button>}
            />
            <SearchBar onSelect={basket.add} placeholder={t('basket.addPlaceholder')} buttonLabel={t('common.add')} />
            {basket.isFull && <p className="mt-2 text-xs text-amber-800">{t('basket.full', { max: BASKET_MAX })}</p>}
            {hasTests ? (
              <ul className="mt-4 divide-y divide-slate-100">
                {basket.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 py-2.5">
                    <Link to={`/tests/${item.slug}`} className="min-w-0 truncate text-sm font-medium text-navy hover:text-primary-dark">
                      {localName(item, lang)}
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => basket.remove(item.id)} aria-label={t('basket.removeTest', { name: localName(item, lang) })}>
                      <Icon name="close" className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-500">{t('basket.emptyHint')}</p>
            )}
          </Card>
          {hasTests && (
            <Card className="grid gap-4">
              <LocationFilters city={filters.city} area={filters.area} onChange={(c) => setFilters((f) => ({ ...f, ...c }))} />
              <Toggle label={t('filters.homeCollection')} checked={filters.homeCollection} onChange={(v) => setFilters((f) => ({ ...f, homeCollection: v }))} />
            </Card>
          )}
        </div>

        <div className="space-y-5">
          {!hasTests && (
            <Card>
              <EmptyState
                icon="basket"
                title={t('basket.emptyTitle')}
                description={t('basket.emptyDescription')}
                action={<Button to="/tests">{t('basket.browseTests')}</Button>}
              />
            </Card>
          )}
          {hasTests && isPending && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
          {hasTests && isError && (
            <EmptyState icon="alert" title={t('errors.loadFailed')} action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />
          )}
          {hasTests && data && (
            <div className={cn('space-y-5 transition-opacity', isFetching && 'opacity-60')} aria-live="polite">
              {data.complete.length > 0 ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-navy">
                      {t('basket.labsWithAll', { count: data.complete.length, n: formatNumber(data.complete.length, lang) })}
                    </h2>
                    {data.stats.saving > 0 && (
                      <Badge variant="coral" icon="tag" className="text-sm">
                        {t('basket.saveUpTo', { amount: formatPrice(data.stats.saving, lang) })}
                      </Badge>
                    )}
                  </div>
                  <ol className="space-y-3">
                    {data.complete.map((result, i) => (
                      <LabTotal key={result.lab.id} result={result} tests={tests} rank={i} cheapestTotal={data.stats.cheapestTotal} />
                    ))}
                  </ol>
                </>
              ) : (
                <Card>
                  <EmptyState icon="building" title={t('basket.noCompleteLab')} description={t('basket.noCompleteLabHint')} />
                </Card>
              )}

              {data.partial.length > 0 && (
                <Card>
                  <CardHeader title={t('basket.partialTitle')} subtitle={t('basket.partialSubtitle')} />
                  <ul className="divide-y divide-slate-100">
                    {data.partial.map((p) => (
                      <li key={p.lab.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <Link to={`/labs/${p.lab.slug}`} className="font-medium text-navy hover:text-primary-dark">{p.lab.name}</Link>
                          <p className="text-xs text-amber-800">
                            {t('basket.missing')}{' '}
                            {p.missingTestIds.map((id) => localName(tests.find((x) => x.id === id), lang)).join(', ')}
                          </p>
                        </div>
                        <span className="text-sm text-slate-600">
                          {t('basket.partialTotal', {
                            matched: formatNumber(p.matched, lang),
                            total: formatNumber(basket.count, lang),
                            price: formatPrice(p.total, lang),
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900"><Disclaimer /></div>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
