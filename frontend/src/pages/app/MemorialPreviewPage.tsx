import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Heart, Eye, Share2, User, CalendarOff, Images } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { COVER_GRADIENTS } from '@/pages/app/CreateMemorialPage'
import type { MemorialFormValues } from '@/hooks/use-create-memorial'

interface PreviewState {
  values: MemorialFormValues
}

// ── Small display helpers ──────────────────────────────────────────────────────

function formatDate(raw: string): string {
  if (!raw) return ''
  try {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(raw))
  } catch {
    return raw
  }
}

// ── Preview page ───────────────────────────────────────────────────────────────

export default function MemorialPreviewPage() {
  const { state } = useLocation() as { state: PreviewState | null }
  const navigate = useNavigate()

  if (!state?.values) {
    return <Navigate to="/dashboard/memorials/create" replace />
  }

  const v = state.values
  const fullName = [v.firstName, v.lastName].filter(Boolean).join(' ') || 'Untitled Memorial'
  const location = [v.state, v.country].filter(Boolean).join(', ')
  const dobFormatted = v.dateOfBirth ? formatDate(v.dateOfBirth) : ''
  const dodFormatted = v.dateOfDeath ? formatDate(v.dateOfDeath) : ''
  const dateRange = [dobFormatted, dodFormatted].filter(Boolean).join(' · ')
  const gradient = COVER_GRADIENTS.find((g) => g.key === (v.coverGradient ?? 'blue')) ?? COVER_GRADIENTS[0]
  const galleryPhotos = v.galleryPhotos ?? []

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      {/* Back + preview banner */}
      <div className="sticky top-[80px] z-40 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-11 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to editing
          </button>
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-full px-3 py-0.5">
            Preview
          </span>
        </div>
      </div>

      {/* Cover */}
      <div className="w-full h-52 overflow-hidden">
        {v.coverPhoto ? (
          <img
            src={v.coverPhoto.url}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-r ${gradient.tw}`} />
        )}
      </div>

      {/* Profile zone */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Profile photo + identity row */}
          <div className="flex items-end gap-5 -mt-14 pb-5">
            {/* Circular profile photo */}
            <div className="shrink-0 h-28 w-28 rounded-full border-4 border-white dark:border-neutral-900 overflow-hidden shadow-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              {v.profilePhoto ? (
                <img
                  src={v.profilePhoto.url}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-neutral-400" />
              )}
            </div>

            {/* Name, dates, location, age */}
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {fullName}
              </h1>
              {dateRange && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {dateRange}
                </p>
              )}
              {location && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {location}
                </p>
              )}
              {v.ageAtDeath && (
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  Age: {v.ageAtDeath} years
                </p>
              )}
            </div>
          </div>

          {/* Likes / views / share row */}
          <div className="flex items-center justify-between pb-5">
            <div className="flex items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                0
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                0 views
              </span>
            </div>
            <button
              type="button"
              disabled
              className="flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Quote */}
      {v.quote && (
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-14 text-center">
          <blockquote className="text-2xl font-medium italic text-neutral-800 dark:text-neutral-200 leading-relaxed">
            &ldquo;{v.quote}&rdquo;
          </blockquote>
        </div>
      )}

      {/* Biography + Gallery */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Biography */}
          <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
            <h2 className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Photo Gallery
              </h2>
            </div>
            {galleryPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {galleryPhotos.map((photo) => (
                  <div
                    key={photo.public_id}
                    className="aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
                  >
                    <img
                      src={photo.url}
                      alt={`Gallery photo ${galleryPhotos.indexOf(photo) + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Images className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mb-2" />
                <p className="text-sm text-neutral-400">No photos added yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-8">
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">Events</h2>
            <button
              type="button"
              disabled
              className="flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed"
            >
              + Create Event
            </button>
          </div>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <CalendarOff className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">No events created yet</p>
            <p className="text-xs text-neutral-400 mt-1">Click &ldquo;Create Event&rdquo; to add your first event</p>
          </div>
        </div>
      </div>

      {/* Tributes */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
          <h2 className="mb-5 text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Tributes{v.tributeMessage ? ' (1)' : ' (0)'}
          </h2>

          {/* Tribute input — disabled in preview */}
          <div className="mb-6">
            <textarea
              disabled
              placeholder="Share your memories and pay tribute…"
              rows={3}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2.5 text-sm text-neutral-400 placeholder:text-neutral-300 resize-none cursor-not-allowed"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-neutral-400">Your tribute will be visible to everyone</span>
              <button
                type="button"
                disabled
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed"
              >
                Post Tribute
              </button>
            </div>
          </div>

          {/* Tribute message from form as a posted tribute */}
          {v.tributeMessage && (
            <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                  <User className="h-4 w-4 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">You</span>
                    {v.creatorRelationship && (
                      <span className="text-xs text-neutral-400">{v.creatorRelationship}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
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
