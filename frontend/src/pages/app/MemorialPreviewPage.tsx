import { useLocation, Navigate } from 'react-router-dom'
import { Calendar, MapPin, User, Images } from 'lucide-react'
import { COVER_GRADIENTS, isCustomColor } from '@/pages/app/CreateMemorialPage'
import type { MemorialFormValues } from '@/hooks/use-create-memorial'

interface PreviewState {
  values: MemorialFormValues
}

function formatDate(raw: string): string {
  if (!raw) return ''
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(raw))
  } catch {
    return raw
  }
}

export default function MemorialPreviewPage() {
  const { state } = useLocation() as { state: PreviewState | null }

  if (!state?.values) {
    return <Navigate to="/dashboard/memorials/create" replace />
  }

  const v = state.values
  const fullName = [v.firstName, v.lastName].filter(Boolean).join(' ') || 'Untitled Memorial'
  const locationText = [v.state, v.country].filter(Boolean).join(', ')
  const dateRange = [
    v.dateOfBirth ? formatDate(v.dateOfBirth) : '',
    v.dateOfDeath ? formatDate(v.dateOfDeath) : '',
  ]
    .filter(Boolean)
    .join(' · ')
  const customColor = v.coverGradient && isCustomColor(v.coverGradient) ? v.coverGradient : null
  const gradient = !customColor
    ? (COVER_GRADIENTS.find((g) => g.key === (v.coverGradient ?? 'blue')) ?? COVER_GRADIENTS[0])
    : null
  const galleryPhotos = v.galleryPhotos ?? []

  return (
    // Responsive negative margin counteracts DashboardLayout main's p-4 sm:p-6 lg:p-8
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-neutral-50 dark:bg-neutral-950">

      {/* ── Cover ── */}
      <div className="h-52 w-full overflow-hidden">
        {v.coverPhoto ? (
          <img src={v.coverPhoto.url} alt="Cover" className="h-full w-full object-cover" />
        ) : customColor ? (
          <div className="h-full w-full" style={{ backgroundColor: customColor }} />
        ) : (
          <div className={`h-full w-full bg-gradient-to-r ${gradient!.tw}`} />
        )}
      </div>

      {/* ── Profile zone ── */}
      <div className="mx-auto max-w-3xl px-4">

        {/* Photo + identity */}
        <div className="flex items-start gap-6">
          {/* Photo: -mt-16 so it overlaps the cover by half its height */}
          <div className="shrink-0 -mt-20 h-60 w-60 rounded-full border-4 border-neutral-50 dark:border-neutral-950 overflow-hidden shadow-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            {v.profilePhoto ? (
              <img
                src={v.profilePhoto.url}
                alt={fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-16 w-16 text-neutral-400" />
            )}
          </div>

          {/* Text: mt-3 so it sits comfortably below the cover */}
          <div className="flex-1 min-w-0 mt-3">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {fullName}
            </h1>
            {dateRange && (
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {dateRange}
              </p>
            )}
            {locationText && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                {locationText}
              </p>
            )}
            {v.ageAtDeath && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Age: {v.ageAtDeath} years
              </p>
            )}
          </div>
        </div>

      </div>

      {/* ── Page body ── */}
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">

        {/* Quote */}
        {v.quote && (
          <div className="py-8 text-center">
            <blockquote className="text-2xl font-semibold italic text-neutral-800 dark:text-neutral-200 leading-relaxed">
              &ldquo;{v.quote}&rdquo;
            </blockquote>
          </div>
        )}

        {/* Biography + Photo Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biography */}
          <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
            <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Biography
            </h2>
            {v.biography ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {v.biography}
              </p>
            ) : (
              <p className="text-sm text-neutral-400 italic">No biography added yet.</p>
            )}
          </div>

          {/* Photo Gallery */}
          <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
            <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Photo Gallery
            </h2>
            {galleryPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {galleryPhotos.map((photo, i) => (
                  <div
                    key={photo.public_id}
                    className="aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
                  >
                    <img
                      src={photo.url}
                      alt={`Gallery photo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Images className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mb-2" aria-hidden="true" />
                <p className="text-sm text-neutral-400">No photos added yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Tributes */}
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <h2 className="mb-5 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Tributes{v.tributeMessage ? ' (1)' : ' (0)'}
          </h2>

          {/* Input area — disabled in preview */}
          <div className="mb-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
            <textarea
              disabled
              placeholder="Share your memories and pay tribute…"
              rows={3}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2.5 text-sm text-neutral-400 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 resize-none cursor-not-allowed"
            />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Your tribute will be visible to everyone
              </span>
              <button
                type="button"
                disabled
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed"
              >
                Post Tribute
              </button>
            </div>
          </div>

          {/* Tribute message as a posted entry */}
          {v.tributeMessage && (
            <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-neutral-500 dark:text-neutral-400" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      You
                    </span>
                    {v.creatorRelationship && (
                      <span className="text-xs text-neutral-400">· {v.creatorRelationship}</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                    {v.tributeMessage}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
