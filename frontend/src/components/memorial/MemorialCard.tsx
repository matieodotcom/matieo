import { Link } from 'react-router-dom'
import { Calendar, MapPin, MoreVertical, Trash2, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { MemorialRow } from '@/types/memorial'
import { useLocaleStore } from '@/store/localeStore'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/DropdownMenu'

interface MemorialCardProps {
  memorial: MemorialRow
  onDelete?: (id: string) => void
  onUnpublish?: (id: string) => void
  showPublisher?: boolean
  showStatus?: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function MemorialCard({ memorial, onDelete, onUnpublish, showPublisher, showStatus = true }: MemorialCardProps) {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.locale)
  const { full_name, date_of_birth, date_of_death, location, age_at_death, profile_url, status, slug, creator_name } = memorial

  function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  }

  const dateRange = [date_of_birth, date_of_death]
    .filter(Boolean)
    .map((d) => formatDate(d!))
    .join(' · ')

  const href =
    status === 'draft'
      ? `/dashboard/memorials/${memorial.id}/edit`
      : `/memorial/${slug ?? memorial.id}`

  return (
    <article className="relative bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {profile_url ? (
        <img
          src={profile_url}
          alt={full_name}
          className="w-full h-52 object-cover object-center"
        />
      ) : (
        <div className="w-full h-52 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
          <span className="text-3xl font-bold text-neutral-300 dark:text-neutral-500">{getInitials(full_name)}</span>
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            to={href}
            className="font-semibold text-neutral-900 dark:text-neutral-100 leading-snug after:absolute after:inset-0 after:rounded-xl"
          >
            {full_name}
          </Link>
          <div className="relative z-10 flex items-center gap-1.5 shrink-0">
            {showStatus && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  status === 'published'
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                }`}
              >
                {status === 'published' ? t('card.published') : t('card.draft')}
              </span>
            )}
            {(status === 'draft' ? !!onDelete : !!onUnpublish) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    aria-label={t('card.memorialOptions')}
                    className="flex items-center justify-center h-8 w-8 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <MoreVertical size={15} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {status === 'draft' && onDelete && (
                    <DropdownMenuItem
                      className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                      onSelect={() => onDelete(memorial.id)}
                    >
                      <Trash2 size={14} className="mr-2 shrink-0" />
                      {t('card.deleteDraft')}
                    </DropdownMenuItem>
                  )}
                  {status === 'published' && onUnpublish && (
                    <DropdownMenuItem onSelect={() => onUnpublish(memorial.id)}>
                      <EyeOff size={14} className="mr-2 shrink-0" />
                      {t('card.unpublish')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {dateRange && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
            <Calendar size={13} className="shrink-0" />
            <span>{dateRange}</span>
          </div>
        )}

        {location && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
            <MapPin size={13} className="shrink-0" />
            <span>{location}</span>
          </div>
        )}

        {age_at_death != null && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">
            {t('card.age', { age: age_at_death })}
          </p>
        )}

        {showPublisher && creator_name && (
          <p className="text-xs text-neutral-400 dark:text-neutral-500 text-right mt-auto pt-2">
            {t('card.by', { name: creator_name })}
          </p>
        )}
      </div>
    </article>
  )
}
