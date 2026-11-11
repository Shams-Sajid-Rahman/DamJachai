import { useLang } from '../../hooks/useLang.js';
import { usePageMeta } from '../../hooks/usePageMeta.js';
import { PageHeader } from '../../components/layout/PageHeader.jsx';

// Placeholder. The full page is built in Phase 7.
export default function LabPage() {
  const { t } = useLang();
  usePageMeta({ title: t('pages.lab.title') });
  return <PageHeader title={t('pages.lab.title')} subtitle={t('pages.lab.subtitle')} />;
}
