import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import bn from '../locales/bn.json';

export const SUPPORTED_LANGUAGES = ['bn', 'en'];
export const LANGUAGE_STORAGE_KEY = 'damjachai_lang';

function syncHtmlLang(lng) {
  document.documentElement.lang = lng?.startsWith('en') ? 'en' : 'bn';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    fallbackLng: 'bn',
    interpolation: { escapeValue: false }, // React already escapes output
    detection: {
      // Only a choice the user made counts. First-time visitors get Bangla.
      order: ['localStorage'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

syncHtmlLang(i18n.resolvedLanguage);
i18n.on('languageChanged', syncHtmlLang);

export default i18n;
