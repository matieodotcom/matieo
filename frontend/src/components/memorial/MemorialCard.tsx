import { Link } from 'react-router-dom'
import { Calendar, MapPin } from 'lucide-react'
import type { MemorialRow } from '@/types/memorial'

interface MemorialCardProps {
  memorial: MemorialRow
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr))
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function MemorialCard({ memorial }: MemorialCardProps) {
  const { full_name, date_of_birth, date_of_death, location, profile_url, status, slug } = memorial

  const dateRange = [date_of_birth, date_of_death]
    .filter(Boolean)
    .map((d) => formatDate(d!))
    .join(' · ')

  const href =
    status === 'draft'
      ? `/dashboard/memorials/${memorial.id}/edit`
      : `/memorial/${slug ?? memorial.id}`

  return (
    <article className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link to={href} tabIndex={-1} aria-hidden>
        {profile_url ? (
          <img
            src={profile_url}
            alt={full_name}
            className="w-full h-52 object-cover object-top"
          />
        ) : (
          <div className="w-full h-52 bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
            <span className="text-3xl font-bold text-neutral-300 dark:text-neutral-500">{getInitials(full_name)}</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            to={href}
            className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-brand-primary transition-colors leading-snug"
          >
            {full_name}
          </Link>
          <span
            className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
              status === 'published'
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
            }`}
          >
            {status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>

        {dateRange && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
            <Calendar size={13} className="shrink-0" />
            <span>{dateRange}</span>
          </div>
        )}

        {location && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 mb-3">
            <MapPin size={13} className="shrink-0" />
            <span>{location}</span>
          </div>
        )}

        <Link
          to={href}
          className="inline-flex items-center gap-1 text-sm text-brand-primary font-medium hover:underline mt-1"
        >
          {status === 'draft' ? 'Continue Editing →' : 'View Memorial →'}
        </Link>
      </div>
    </article>
  )
}
