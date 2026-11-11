import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';

// Placeholder. The full page is built in Phase 7.
export default function TestComparePage() {
  const { t } = useLang();
  usePageMeta({ title: t('pages.compare.title') });
  return <PageHeader title={t('pages.compare.title')} subtitle={t('pages.compare.subtitle')} />;
}
