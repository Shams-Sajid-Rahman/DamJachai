import { useLang } from '../hooks/useLang.js';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { SearchBar } from '../components/SearchBar.jsx';

// Temporary home page. It is replaced by the 3D landing page in Phase 6.
export default function HomePage() {
  const { t } = useLang();
  usePageMeta({});
  return (
    <section className="-mt-16 flex min-h-[70vh] items-center bg-navy px-4 pt-16">
      <div className="mx-auto w-full max-w-2xl py-20 text-center">
        <h1 className="text-3xl font-bold text-white sm:text-5xl">{t('app.tagline')}</h1>
        <SearchBar size="lg" className="mt-8" dark />
      </div>
    </section>
  );
}
