import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useLang } from '../../hooks/useLang.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useBasket } from '../../context/BasketContext.jsx';
import { useClickOutside } from '../../hooks/useClickOutside.js';
import { formatNumber } from '../../lib/format.js';
import { cn } from '../../lib/cn.js';
import { Logo } from '../Logo.jsx';
import { LanguageToggle } from '../LanguageToggle.jsx';
import { Icon } from '../icons.jsx';
import { Button } from '../ui/Button.jsx';

const LINKS = [
  { to: '/tests', key: 'nav.tests', icon: 'flask' },
  { to: '/labs', key: 'nav.labs', icon: 'building' },
  { to: '/basket', key: 'nav.basket', icon: 'basket' },
];

function BasketCount({ dark }) {
  const { count } = useBasket();
  const { lang } = useLang();
  if (!count) return null;
  return (
    <span className={cn('ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold', dark ? 'bg-coral text-white' : 'bg-coral text-white')}>
      {formatNumber(count, lang)}
    </span>
  );
}

function UserMenu({ dark }) {
  const { t } = useLang();
  const { user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close, open);

  const item = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-mint';
  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm font-medium transition',
          dark ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-slate-100',
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark text-xs font-bold text-white">{initials}</span>
        <span className="max-w-[8rem] truncate">{user.name.split(' ')[0]}</span>
        <Icon name="chevronDown" className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
          <p className="truncate px-3 pb-2 pt-1 text-xs text-slate-500">{user.email}</p>
          <Link role="menuitem" to="/favorites" className={item} onClick={close}>
            <Icon name="heart" className="h-4 w-4" /> {t('nav.favorites')}
          </Link>
          <Link role="menuitem" to="/report-price" className={item} onClick={close}>
            <Icon name="tag" className="h-4 w-4" /> {t('nav.reportPrice')}
          </Link>
          {isAdmin && (
            <Link role="menuitem" to="/admin" className={item} onClick={close}>
              <Icon name="shield" className="h-4 w-4" /> {t('nav.admin')}
            </Link>
          )}
          <hr className="my-1 border-slate-100" />
          <button role="menuitem" type="button" className={item} onClick={() => { close(); logout(); }}>
            <Icon name="logout" className="h-4 w-4" /> {t('nav.logout')}
          </button>
        </div>
      )}
    </div>
  );
}

/** `dark` is used on the landing page, where the navbar sits on the navy hero. */
export function Navbar({ dark = false }) {
  const { t } = useLang();
  const { isAuthenticated, isAdmin, user, logout, status } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const linkClass = ({ isActive }) =>
    cn(
      'inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition',
      dark
        ? isActive ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10 hover:text-white'
        : isActive ? 'bg-mint text-primary-dark' : 'text-slate-600 hover:bg-slate-100 hover:text-navy',
    );

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b backdrop-blur-md',
        dark ? 'border-white/10 bg-navy/70' : 'border-slate-200/70 bg-white/90',
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-navy">
        {t('nav.skipToContent')}
      </a>
      <nav aria-label={t('nav.main')} className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="shrink-0" title={t('nav.home')}>
          <Logo variant={dark ? 'light' : 'dark'} />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {t(l.key)}
              {l.to === '/basket' && <BasketCount dark={dark} />}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <LanguageToggle className={dark ? 'border-white/30 text-white hover:bg-white/10' : ''} />
          {status === 'loading' ? (
            <span className="h-8 w-24 animate-pulse rounded-full bg-slate-200/40" />
          ) : isAuthenticated ? (
            <UserMenu dark={dark} />
          ) : (
            <>
              <Button to="/login" variant="ghost" size="sm" className={dark ? 'text-white hover:bg-white/10' : ''}>
                {t('nav.login')}
              </Button>
              <Button to="/register" variant="coral" size="sm">
                {t('nav.register')}
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Link to="/basket" aria-label={t('nav.basket')} className={cn('relative rounded-full p-2', dark ? 'text-white' : 'text-navy')}>
            <Icon name="basket" className="h-6 w-6" />
            <span className="absolute -right-1 -top-1"><BasketCount dark={dark} /></span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            className={cn('rounded-full p-2', dark ? 'text-white hover:bg-white/10' : 'text-navy hover:bg-slate-100')}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-slate-100 bg-white px-4 pb-5 pt-3 shadow-lg md:hidden">
          <div className="grid gap-1">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-3 font-medium', isActive ? 'bg-mint text-primary-dark' : 'text-slate-700')}
              >
                <Icon name={l.icon} /> {t(l.key)}
                {l.to === '/basket' && <BasketCount />}
              </NavLink>
            ))}
            {isAuthenticated && (
              <>
                <NavLink to="/favorites" className="flex items-center gap-3 rounded-xl px-3 py-3 font-medium text-slate-700">
                  <Icon name="heart" /> {t('nav.favorites')}
                </NavLink>
                <NavLink to="/report-price" className="flex items-center gap-3 rounded-xl px-3 py-3 font-medium text-slate-700">
                  <Icon name="tag" /> {t('nav.reportPrice')}
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className="flex items-center gap-3 rounded-xl px-3 py-3 font-medium text-slate-700">
                    <Icon name="shield" /> {t('nav.admin')}
                  </NavLink>
                )}
              </>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <LanguageToggle />
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="max-w-[9rem] truncate text-sm text-slate-600">{user.name}</span>
                <Button variant="secondary" size="sm" onClick={logout}>
                  {t('nav.logout')}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button to="/login" variant="secondary" size="sm">{t('nav.login')}</Button>
                <Button to="/register" variant="coral" size="sm">{t('nav.register')}</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
