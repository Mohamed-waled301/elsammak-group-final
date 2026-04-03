import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const savedLanguage = localStorage.getItem('language') || 'en';

function applyDocumentLanguage(lng: string) {
  const isAr = lng === 'ar' || lng.startsWith('ar');
  document.documentElement.lang = isAr ? 'ar' : 'en';
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  localStorage.setItem('language', isAr ? 'ar' : 'en');
}

i18n
 .use(initReactI18next)
 .init({
 resources: {
 en: { translation: enTranslations },
 ar: { translation: arTranslations }
 },
 lng: savedLanguage,
 fallbackLng: 'en',
 interpolation: {
 escapeValue: false 
 }
 });

i18n.on('languageChanged', applyDocumentLanguage);
applyDocumentLanguage(i18n.language || 'en');

export default i18n;
