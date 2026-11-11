import { useTranslation } from 'react-i18next';

export function LanguageToggle({ className = '' }) {
  const { t, i18n } = useTranslation();
  const next = i18n.resolvedLanguage === 'bn' ? 'en' : 'bn';

  return (
    <button
      type="button"
      onClick={() => i18n.changeLanguage(next)}
      lang={next}
      className={`rounded-full border border-primary/40 px-3 py-1 text-sm font-medium text-primary-dark transition hover:bg-primary/10 ${className}`}
    >
      {t('language.switchTo')}
    </button>
  );
}
