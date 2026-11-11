import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations are split into one JSON file per feature (common, auth, landing, ...).
// They are merged into a single "translation" namespace, so keys look like t('nav.tests').
const modules = import.meta.glob('../locales/*/*.json', { eager: true, import: 'default' });

function buildResources() {
  const resources = {};
  for (const [path, content] of Object.entries(modules)) {
    const lang = path.split('/').at(-2);
    resources[lang] ??= { translation: {} };
    Object.assign(resources[lang].translation, content);
  }
  return resources;
}

export const SUPPORTED_LANGUAGES = ['bn', 'en'];
export const LANGUAGE_STORAGE_KEY = 'damjachai_lang';

function syncHtmlLang(lng) {
  document.documentElement.lang = lng?.startsWith('en') ? 'en' : 'bn';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: buildResources(),
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    fallbackLng: 'bn',
    interpolation: { escapeValue: false }, // React already escapes output
    returnNull: false,
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
