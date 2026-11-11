import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';

// Placeholder. The full page is built in Phase 7.
export default function BasketPage() {
  const { t } = useLang();
  usePageMeta({ title: t('pages.basket.title') });
  return <PageHeader title={t('pages.basket.title')} subtitle={t('pages.basket.subtitle')} />;
}
