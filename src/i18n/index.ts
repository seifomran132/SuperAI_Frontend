import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { brand } from '~/brand';
import ar from './ar.json';
import errorsAr from './errors.ar.json';

// Arabic is the default and only shipped language at launch. English is kept
// in sync but stays out of the first-screen bundle: `loadEnglish` loads it.
export const defaultLanguage = 'ar';

void i18n.use(initReactI18next).init({
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  supportedLngs: ['ar', 'en'],
  resources: {
    ar: { translation: ar, errors: errorsAr },
  },
  interpolation: {
    escapeValue: false,
    defaultVariables: { brandName: brand.name.ar },
  },
  returnNull: false,
});

/** Enables English on demand; call it before switching the language to `en`. */
export async function loadEnglish() {
  const [en, adminEn, landingEn, brandKitsEn, errorsEn] = await Promise.all([
    import('./en.json'),
    import('./admin.en.json'),
    import('./landing.en.json'),
    import('./brand-kits.en.json'),
    import('./errors.en.json'),
  ]);
  i18n.addResourceBundle('en', 'translation', en.default);
  i18n.addResourceBundle('en', 'translation', adminEn.default, true, true);
  i18n.addResourceBundle('en', 'translation', landingEn.default, true, true);
  i18n.addResourceBundle('en', 'translation', brandKitsEn.default, true, true);
  i18n.addResourceBundle('en', 'errors', errorsEn.default);
}

export function directionOf(language: string): 'rtl' | 'ltr' {
  return i18n.dir(language);
}

export { i18n };
