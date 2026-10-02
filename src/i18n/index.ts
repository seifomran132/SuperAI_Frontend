import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { brand } from '~/brand';
import ar from './ar.json';
import en from './en.json';
import errorsAr from './errors.ar.json';
import errorsEn from './errors.en.json';

// Arabic is the default and only shipped language at launch; English is kept
// in sync so another language can be enabled without code changes.
export const defaultLanguage = 'ar';

void i18n.use(initReactI18next).init({
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: ['ar', 'en'],
  resources: {
    ar: { translation: ar, errors: errorsAr },
    en: { translation: en, errors: errorsEn },
  },
  interpolation: {
    escapeValue: false,
    defaultVariables: { brandName: brand.name.ar },
  },
  returnNull: false,
});

export function directionOf(language: string): 'rtl' | 'ltr' {
  return i18n.dir(language);
}

export { i18n };
