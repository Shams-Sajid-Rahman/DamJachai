import { useTranslation } from 'react-i18next';

/** The current language as 'bn' or 'en', plus the t function. */
export function useLang() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === 'en' ? 'en' : 'bn';
  return { t, i18n, lang };
}
