import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { useFavorites } from '../../hooks/queries.js';
import { PageHeader, Container } from '../../components/layout/PageHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { SkeletonCard } from '../../components/ui/Skeleton.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LabCard } from '../../components/LabCard.jsx';
import { FavoriteButton } from '../../components/FavoriteButton.jsx';

export default function FavoritesPage() {
  const { t } = useLang();
  const { data, isPending, isError, refetch } = useFavorites();
  usePageMeta({ title: t('pages.favorites.title'), noindex: true });

  return (
    <>
      <PageHeader title={t('pages.favorites.title')} subtitle={t('pages.favorites.subtitle')} />
      <Container className="py-8">
        {isPending && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}
        {isError && <EmptyState icon="alert" title={t('errors.loadFailed')} action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />}
        {data?.length === 0 && (
          <EmptyState icon="heart" title={t('favorites.emptyTitle')} description={t('favorites.emptyText')} action={<Button to="/labs">{t('favorites.browse')}</Button>} />
        )}
        {data?.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((lab) => (
              <LabCard key={lab.id} lab={lab} action={<FavoriteButton labId={lab.id} isFavorite className="h-9 px-3" />} />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
