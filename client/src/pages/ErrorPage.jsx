import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Logo } from '../components/Logo.jsx';

/** Shown when a page crashes or a route throws. */
export default function ErrorPage() {
  const error = useRouteError();
  const { t } = useTranslation();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  if (import.meta.env.DEV) console.error(error);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-mint px-4 text-center">
      <Logo />
      <h1 className="text-2xl font-bold text-navy">{is404 ? t('notFound.message') : t('errors.pageCrashed')}</h1>
      <p className="max-w-md text-slate-600">{t('errors.pageCrashedHint')}</p>
      <div className="flex gap-3">
        <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-primary-dark px-4 py-2 font-semibold text-white">
          {t('common.reload')}
        </button>
        <Link to="/" className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-navy">
          {t('notFound.home')}
        </Link>
      </div>
    </main>
  );
}
