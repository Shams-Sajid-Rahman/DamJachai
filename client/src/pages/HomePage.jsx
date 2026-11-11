import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/Logo.jsx';
import { LanguageToggle } from '../components/LanguageToggle.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchHealth } from '../lib/healthApi.js';

// Temporary home page. It is replaced by the 3D landing page in Phase 6.
export default function HomePage() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
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
      <div className="flex flex-wrap items-center justify-center gap-3 text-white">
        {isAuthenticated ? (
          <>
            <span>{t('nav.hello', { name: user.name })}</span>
            {isAdmin && (
              <Link to="/admin" className="underline underline-offset-4">
                {t('nav.admin')}
              </Link>
            )}
            <button type="button" onClick={logout} className="underline underline-offset-4">
              {t('nav.logout')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="underline underline-offset-4">{t('nav.login')}</Link>
            <Link to="/register" className="underline underline-offset-4">{t('nav.register')}</Link>
          </>
        )}
      </div>
      <LanguageToggle className="border-white/30 text-white hover:bg-white/10" />
    </main>
  );
}
