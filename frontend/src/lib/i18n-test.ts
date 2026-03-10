import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en/translation.json'

const testI18n = i18next.createInstance()

testI18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  fallbackLng: 'en',
  lng: 'en',
  interpolation: { escapeValue: false },
  initImmediate: false,
})

export default testI18n
