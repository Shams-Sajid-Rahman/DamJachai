import { Link } from 'react-router-dom';
import { useLang } from '../../hooks/useLang.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Logo } from '../../components/Logo.jsx';

// Placeholder for the admin panel, which is built in Phase 8.
export default function AdminApp() {
  const { t } = useLang();
  const { user } = useAuth();
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Link to="/"><Logo /></Link>
      <h1 className="mt-8 text-3xl font-bold text-navy">{t('admin.title')}</h1>
      <p className="mt-2 text-slate-600">{t('admin.welcome', { name: user?.name })}</p>
    </main>
  );
}
