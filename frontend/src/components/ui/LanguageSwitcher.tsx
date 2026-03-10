import { useTranslation } from 'react-i18next'
import { useLocaleStore, type Locale } from '@/store/localeStore'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu'

const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'ar', label: 'العربية', flag: '🇸🇦' },
  { value: 'ms', label: 'Bahasa Melayu', flag: '🇲🇾' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
]

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation()
  const { locale, setLocale } = useLocaleStore()
  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={t('language.label')}
          className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-lg px-2 py-1.5"
        >
          <span aria-hidden="true">{current.flag}</span>
          {!compact && <span className="hidden sm:inline">{current.label}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map(({ value, label, flag }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setLocale(value)}
            className={locale === value ? 'font-semibold text-brand-primary' : ''}
          >
            <span aria-hidden="true" className="mr-2">{flag}</span>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
