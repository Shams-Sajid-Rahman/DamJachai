import { useEffect, useState } from 'react';
import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { useUrlState } from '../../hooks/useUrlState.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useLabs } from '../../hooks/queries.js';
import { formatNumber } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';
import { PageHeader, Container } from '../../components/layout/PageHeader.jsx';
import { LocationFilters } from '../../components/LocationFilters.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select, Toggle } from '../../components/ui/Select.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { LabCard } from '../../components/LabCard.jsx';

const DEFAULTS = { q: '', city: '', area: '', homeCollection: false, accredited: false, sort: 'name', page: 1 };

export default function LabsPage() {
  const { t, lang } = useLang();
  const [filters, setFilters] = useUrlState(DEFAULTS);
  const [search, setSearch] = useState(filters.q);
  const debounced = useDebounce(search, 350);

  useEffect(() => {
    if (debounced !== filters.q) setFilters({ q: debounced });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const { data, isPending, isError, isFetching, refetch } = useLabs({
    ...filters,
    homeCollection: filters.homeCollection || undefined,
    accredited: filters.accredited || undefined,
    limit: 12,
  });
  usePageMeta({ title: t('pages.labs.title'), description: t('labs.metaDescription') });

  const total = data?.meta.total ?? 0;

  return (
    <>
      <PageHeader title={t('pages.labs.title')} subtitle={t('pages.labs.subtitle')} />
      <Container className="space-y-6 py-8">
        <Card className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <Input
            label={t('labs.searchLabel')}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('labs.searchPlaceholder')}
          />
          <LocationFilters city={filters.city} area={filters.area} onChange={setFilters} />
          <Select
            label={t('filters.sort')}
            value={filters.sort}
            onChange={(e) => setFilters({ sort: e.target.value })}
            options={['name', 'rating', 'tests'].map((s) => ({ value: s, label: t(`labs.sorts.${s}`) }))}
          />
          <div className="flex flex-wrap gap-6 sm:col-span-2 lg:col-span-4">
            <Toggle label={t('filters.homeCollection')} checked={filters.homeCollection} onChange={(v) => setFilters({ homeCollection: v })} />
            <Toggle label={t('filters.accredited')} checked={filters.accredited} onChange={(v) => setFilters({ accredited: v })} />
          </div>
        </Card>

        <p className="text-sm text-slate-600" aria-live="polite">
          {!isPending && t('labs.found', { count: total, n: formatNumber(total, lang) })}
        </p>

        {isError && <EmptyState icon="alert" title={t('errors.loadFailed')} action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />}
        {isPending && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
        {data && total === 0 && (
          <EmptyState
            icon="building"
            title={t('labs.noResults')}
            action={<Button variant="secondary" onClick={() => { setSearch(''); setFilters({ ...DEFAULTS }); }}>{t('filters.clear')}</Button>}
          />
        )}
        {data && total > 0 && (
          <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', isFetching && 'opacity-60')}>
            {data.data.map((lab) => <LabCard key={lab.id} lab={lab} />)}
          </div>
        )}
        <Pagination page={filters.page} totalPages={data?.meta.totalPages} onChange={(page) => setFilters({ page })} />
      </Container>
    </>
  );
}
