import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useLang } from '../../hooks/useLang.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminApi } from '../../lib/adminApi.js';
import { formatNumber } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';
import { Logo } from '../../components/Logo.jsx';
import { LanguageToggle } from '../../components/LanguageToggle.jsx';
import { Icon } from '../../components/icons.jsx';

const NAV = [
  { to: '/admin', key: 'dashboard', icon: 'chart', end: true },
  { to: '/admin/labs', key: 'labs', icon: 'building' },
  { to: '/admin/tests', key: 'tests', icon: 'flask' },
  { to: '/admin/categories', key: 'categories', icon: 'folder' },
  { to: '/admin/locations', key: 'locations', icon: 'mapPin' },
  { to: '/admin/prices', key: 'prices', icon: 'tag' },
  { to: '/admin/import', key: 'import', icon: 'upload' },
  { to: '/admin/price-reports', key: 'reports', icon: 'message', badge: 'pendingReports' },
  { to: '/admin/reviews', key: 'reviews', icon: 'star', badge: 'pendingReviews' },
  { to: '/admin/users', key: 'users', icon: 'users' },
  { to: '/admin/audit', key: 'audit', icon: 'history' },
];

export const DASHBOARD_KEY = ['admin', 'dashboard'];

function Sidebar({ onNavigate }) {
  const { t, lang } = useLang();
  // The dashboard query also gives the pending counts shown as badges.
  const { data } = useQuery({ queryKey: DASHBOARD_KEY, queryFn: adminApi.dashboard, staleTime: 30_000 });

  return (
    <nav aria-label={t('admin.nav.label')} className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const count = item.badge ? data?.totals?.[item.badge] : 0;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive ? 'bg-primary/15 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon name={item.icon} className="h-5 w-5" />
            <span className="flex-1">{t(`admin.nav.${item.key}`)}</span>
            {count > 0 && (
              <span className="rounded-full bg-coral px-2 py-0.5 text-[11px] font-bold text-navy">{formatNumber(count, lang)}</span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

/** Admin shell: a navy sidebar on desktop, a slide-in menu on phones, and a top bar. */
export default function AdminLayout() {
  const { t } = useLang();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="min-h-dvh bg-slate-50 lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-navy lg:flex">
        <Link to="/admin" className="px-5 py-5"><Logo variant="light" /></Link>
        <div className="flex-1 overflow-y-auto"><Sidebar /></div>
        <p className="px-5 py-4 text-xs text-slate-400">{t('admin.panelLabel')}</p>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={t('admin.nav.label')}>
          <button type="button" className="absolute inset-0 bg-navy/60" aria-label={t('common.close')} onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-navy">
            <div className="flex items-center justify-between px-5 py-5">
              <Logo variant="light" />
              <button type="button" onClick={() => setOpen(false)} className="text-white" aria-label={t('common.close')}><Icon name="close" /></button>
            </div>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-lg p-2 text-navy lg:hidden" onClick={() => setOpen(true)} aria-label={t('nav.openMenu')}>
            <Icon name="menu" />
          </button>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy">
            <Icon name="chevronLeft" className="h-4 w-4" /> {t('admin.backToSite')}
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <span className="hidden text-sm text-slate-600 sm:inline">{user?.name}</span>
          <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100">
            <Icon name="logout" className="h-4 w-4" /> <span className="hidden sm:inline">{t('nav.logout')}</span>
          </button>
        </div>
      </header>

      <main id="main" className="px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
