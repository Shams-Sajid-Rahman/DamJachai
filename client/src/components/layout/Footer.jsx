import { Link } from 'react-router-dom';
import { useLang } from '../../hooks/useLang.js';
import { Logo } from '../Logo.jsx';
import { Icon } from '../icons.jsx';

export function Disclaimer({ className = '' }) {
  const { t } = useLang();
  return (
    <p className={`flex items-start gap-2 text-sm ${className}`}>
      <Icon name="info" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{t('footer.disclaimer')}</span>
    </p>
  );
}

export function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navy text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo variant="light" />
          <p className="max-w-sm text-sm text-slate-400">{t('footer.about')}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{t('footer.explore')}</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/tests" className="hover:text-white">{t('nav.tests')}</Link></li>
            <li><Link to="/labs" className="hover:text-white">{t('nav.labs')}</Link></li>
            <li><Link to="/basket" className="hover:text-white">{t('nav.basket')}</Link></li>
            <li><Link to="/report-price" className="hover:text-white">{t('nav.reportPrice')}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">{t('footer.important')}</h2>
          <Disclaimer className="text-slate-300" />
          <p className="mt-3 flex items-start gap-2 text-sm text-amber-200">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{t('footer.sampleData')}</span>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-slate-400 sm:px-6">
          © {year} DamJachai · {t('footer.noMedicalAdvice')}
        </p>
      </div>
    </footer>
  );
}
