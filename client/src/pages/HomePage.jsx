import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/Logo.jsx';
import { LanguageToggle } from '../components/LanguageToggle.jsx';
import { fetchHealth } from '../lib/healthApi.js';

// Phase 0 placeholder: proves that routing, i18n, Tailwind and the API connection work.
export default function HomePage() {
  const { t } = useTranslation();
  const { data, isPending, isError } = useQuery({ queryKey: ['health'], queryFn: fetchHealth });

  let statusText = t('status.checking');
  let dotColor = 'bg-slate-400';
  if (isError) {
    statusText = t('status.down');
    dotColor = 'bg-coral';
  } else if (!isPending && data?.status === 'ok') {
    statusText = t('status.ok');
    dotColor = 'bg-primary';
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-navy px-4 text-center">
      <Logo variant="light" className="scale-125" />
      <p className="text-lg text-slate-200">{t('app.tagline')}</p>
      <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} aria-hidden="true" />
        {statusText}
      </p>
      <LanguageToggle className="border-white/30 text-white hover:bg-white/10" />
    </main>
  );
}
