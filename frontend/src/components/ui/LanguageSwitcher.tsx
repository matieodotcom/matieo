import { useTranslation } from 'react-i18next'
import { useLocaleStore, type Locale } from '@/store/localeStore'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu'

const LOCALES: { value: Locale; label: string; code: string }[] = [
  { value: 'en', label: 'English',      code: 'EN' },
  { value: 'ar', label: 'العربية',      code: 'AR' },
  { value: 'ms', label: 'Bahasa Melayu', code: 'MS' },
  { value: 'fr', label: 'Français',     code: 'FR' },
  { value: 'es', label: 'Español',      code: 'ES' },
  { value: 'hi', label: 'हिन्दी',       code: 'HI' },
]

function LangBadge({ code, className = '' }: { code: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded border border-current px-1 text-[10px] font-bold leading-4 tracking-wide ${className}`}
    >
      {code}
    </span>
  )
}

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
          <LangBadge code={current.code} />
          {!compact && <span className="hidden sm:inline">{current.label}</span>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LOCALES.map(({ value, label, code }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setLocale(value)}
            className={locale === value ? 'font-semibold text-brand-primary' : ''}
          >
            <LangBadge code={code} className="mr-2" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
