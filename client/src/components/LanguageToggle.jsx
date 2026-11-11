import { useTranslation } from 'react-i18next';
import { cn } from '../lib/cn.js';
import { Icon } from './icons.jsx';

/** Switches between Bangla and English. The choice is saved in localStorage by i18next. */
export function LanguageToggle({ className = '' }) {
  const { t, i18n } = useTranslation();
  const next = i18n.resolvedLanguage === 'bn' ? 'en' : 'bn';

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      title={t('language.switchLabel')}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-primary/40 px-3 py-1.5 text-sm font-medium text-primary-dark transition hover:bg-primary/10',
        className,
      )}
    >
      <Icon name="globe" className="h-4 w-4" />
      <span lang={next}>{t('language.switchTo')}</span>
    </button>
  );
}
