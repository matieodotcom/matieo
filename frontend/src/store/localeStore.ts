import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import i18n from '@/lib/i18n'

export type Locale = 'en' | 'ar' | 'ms' | 'fr' | 'es' | 'hi'

interface LocaleStore {
  locale: Locale
  setLocale: (l: Locale) => void
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => {
        i18n.changeLanguage(locale)
        document.documentElement.lang = locale
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
        set({ locale })
      },
    }),
    { name: 'matieo-locale' },
  ),
)
