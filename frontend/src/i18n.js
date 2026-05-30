import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import yo from './locales/yo/translation.json';
import ha from './locales/ha/translation.json';
import ig from './locales/ig/translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    yo: { translation: yo },
    ha: { translation: ha },
    ig: { translation: ig },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
