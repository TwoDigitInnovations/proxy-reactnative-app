import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'moment/locale/fr';
import fr from '../locales/fr.json';

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]['code'];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';

export function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGES.some(item => item.code === value);
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: {} },
    fr: { translation: fr },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  returnEmptyString: false,
  react: { useSuspense: false },
  saveMissing: __DEV__,
  saveMissingTo: 'current',
  missingKeyHandler: (lngs, _ns, key) => {
    if (lngs.some(lng => lng !== DEFAULT_LANGUAGE)) {
      console.warn(`[i18n] Missing ${lngs.join(', ')} translation for: "${key}"`);
    }
  },
});

export default i18n;
