import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-bold text-navy">404</p>
      <p className="text-slate-600">{t('notFound.message')}</p>
      <Link to="/" className="font-medium text-primary-dark underline underline-offset-4">
        {t('notFound.home')}
      </Link>
    </main>
  );
}
