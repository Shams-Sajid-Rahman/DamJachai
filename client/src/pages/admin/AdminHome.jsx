import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext.jsx';

// Placeholder until the admin panel is built in Phase 8.
export default function AdminHome() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold text-navy">{t('admin.title')}</h1>
      <p className="mt-2 text-slate-600">{t('admin.welcome', { name: user?.name })}</p>
    </main>
  );
}
