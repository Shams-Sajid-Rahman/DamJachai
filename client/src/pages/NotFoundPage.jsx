import { useLang } from '../hooks/useLang.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { Button } from '../components/ui/Button.jsx';
import { SearchBar } from '../components/SearchBar.jsx';

export default function NotFoundPage() {
  const { t } = useLang();
  usePageMeta({ title: '404' });

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <p className="text-7xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold text-navy">{t('notFound.message')}</h1>
      <p className="text-slate-600">{t('notFound.hint')}</p>
      <SearchBar className="mt-2" />
      <Button to="/" variant="secondary">
        {t('notFound.home')}
      </Button>
    </section>
  );
}
