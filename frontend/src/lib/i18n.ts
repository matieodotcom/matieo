import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '@/locales/en/translation.json'
import ar from '@/locales/ar/translation.json'
import ms from '@/locales/ms/translation.json'
import fr from '@/locales/fr/translation.json'
import es from '@/locales/es/translation.json'
import hi from '@/locales/hi/translation.json'

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      ms: { translation: ms },
      fr: { translation: fr },
      es: { translation: es },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    lng: 'en',
    interpolation: { escapeValue: false },
    detection: { order: [], caches: [] },
  })

export default i18next
