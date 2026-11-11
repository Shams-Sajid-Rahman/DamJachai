import { Link } from 'react-router-dom';
import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { useUrlState } from '../../hooks/useUrlState.js';
import { useCategories, useTestSearch } from '../../hooks/queries.js';
import { useBasket } from '../../context/BasketContext.jsx';
import { formatNumber, formatPrice, localName } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';
import { PageHeader, Container } from '../../components/layout/PageHeader.jsx';
import { SearchBar } from '../../components/SearchBar.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Icon } from '../../components/icons.jsx';
import { VerifiedBadge } from '../../components/VerifiedBadge.jsx';

const PAGE_SIZE = 12;

function TestRow({ test }) {
  const { t, lang } = useLang();
  const basket = useBasket();
  const inBasket = basket.has(test.id);
  const hasPrices = test.labCount > 0;

  return (
    <li className="relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:shadow-lg sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-primary-dark">{localName(test.category, lang)}</p>
        <h2 className="mt-0.5 text-lg font-semibold text-navy">
          <Link to={`/tests/${test.slug}`} className="after:absolute after:inset-0">
            {localName(test, lang)}
          </Link>
        </h2>
        <p className="text-sm text-slate-500">{lang === 'bn' ? test.nameEn : test.nameBn}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          {test.sampleType && <Badge variant="slate">{test.sampleType}</Badge>}
          <span>{t('tests.labCount', { count: test.labCount, n: formatNumber(test.labCount, lang) })}</span>
          {test.lastVerifiedAt && <VerifiedBadge date={test.lastVerifiedAt} compact />}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
        {hasPrices ? (
          <div className="text-right">
            <p className="text-xs text-slate-500">{t('tests.from')}</p>
            <p className="text-2xl font-bold text-navy">{formatPrice(test.minPrice, lang)}</p>
            {test.maxPrice > test.minPrice && (
              <p className="text-xs text-slate-500">{t('tests.upTo', { price: formatPrice(test.maxPrice, lang) })}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">{t('tests.noPrices')}</p>
        )}
        <Button
          variant={inBasket ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => basket.toggle(test)}
          aria-pressed={inBasket}
          className="relative z-10"
        >
          <Icon name={inBasket ? 'check' : 'basket'} className="h-4 w-4" />
          {inBasket ? t('basket.inBasket') : t('basket.add')}
        </Button>
      </div>
    </li>
  );
}

export default function TestsPage() {
  const { t, lang } = useLang();
  const [filters, setFilters] = useUrlState({ q: '', category: '', page: 1 });
  const { data: categories = [] } = useCategories();
  const { data, isPending, isError, isFetching, refetch } = useTestSearch({ ...filters, limit: PAGE_SIZE });

  usePageMeta({ title: filters.q ? t('tests.resultsFor', { q: filters.q }) : t('pages.tests.title'), description: t('tests.metaDescription') });

  const total = data?.meta.total ?? 0;
  const chip = (active) =>
    cn(
      'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition',
      active ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary-dark',
    );

  return (
    <>
      <PageHeader title={t('pages.tests.title')} subtitle={t('pages.tests.subtitle')}>
        <SearchBar defaultValue={filters.q} onSearch={(q) => setFilters({ q })} />
      </PageHeader>

      <Container className="py-8">
        <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label={t('tests.categories')}>
          <button type="button" className={chip(!filters.category)} onClick={() => setFilters({ category: '' })} aria-pressed={!filters.category}>
            {t('common.all')}
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              className={chip(filters.category === c.slug)}
              onClick={() => setFilters({ category: c.slug })}
              aria-pressed={filters.category === c.slug}
            >
              {localName(c, lang)} <span className="opacity-70">({formatNumber(c.testCount, lang)})</span>
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between gap-3 text-sm text-slate-600" aria-live="polite">
          <span>
            {!isPending && t('common.results', { count: total, n: formatNumber(total, lang) })}
            {filters.q && <> · <strong className="text-navy">“{filters.q}”</strong></>}
          </span>
          {(filters.q || filters.category) && (
            <Button variant="link" onClick={() => setFilters({ q: '', category: '' })}>
              {t('filters.clear')}
            </Button>
          )}
        </div>

        {isError && (
          <EmptyState icon="alert" title={t('errors.loadFailed')} action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />
        )}
        {isPending && (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
          </div>
        )}
        {data && !isError && total === 0 && (
          <EmptyState
            title={t('tests.noResults')}
            description={t('tests.noResultsHint')}
            action={<Button variant="secondary" onClick={() => setFilters({ q: '', category: '' })}>{t('tests.showAll')}</Button>}
          />
        )}
        {data && total > 0 && (
          <ul className={cn('grid gap-3 transition-opacity', isFetching && 'opacity-60')}>
            {data.data.map((test) => <TestRow key={test.id} test={test} />)}
          </ul>
        )}
        <Pagination className="mt-8" page={filters.page} totalPages={data?.meta.totalPages} onChange={(page) => setFilters({ page })} />
      </Container>
    </>
  );
}
