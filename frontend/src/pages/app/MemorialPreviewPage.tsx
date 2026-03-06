import { useState, useEffect, useCallback } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { Calendar, MapPin, User, Images, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { COVER_GRADIENTS, isCustomColor } from '@/pages/app/CreateMemorialPage'
import type { MemorialFormValues } from '@/hooks/use-create-memorial'

interface PreviewState {
  values: MemorialFormValues
}

interface LightboxPhoto {
  url: string
  alt: string
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
  const [lightboxPhotos, setLightboxPhotos] = useState<LightboxPhoto[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const isOpen = lightboxIndex !== null
  const canNav = lightboxPhotos.length > 1

  const openProfile = useCallback((url: string, alt: string) => {
    setLightboxPhotos([{ url, alt }])
    setLightboxIndex(0)
  }, [])

  const openGallery = useCallback((photos: LightboxPhoto[], startIndex: number) => {
    setLightboxPhotos(photos)
    setLightboxIndex(startIndex)
  }, [])

  const close = useCallback(() => setLightboxIndex(null), [])

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + lightboxPhotos.length) % lightboxPhotos.length : null))
  }, [lightboxPhotos.length])

  const next = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % lightboxPhotos.length : null))
  }, [lightboxPhotos.length])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft' && canNav) prev()
      if (e.key === 'ArrowRight' && canNav) next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, canNav, close, prev, next])

  if (!state?.values) {
    return <Navigate to="/dashboard/memorials/create" replace />
  }

  const v = state.values
  const fullName = [v.firstName, v.lastName].filter(Boolean).join(' ')
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
  const galleryLightbox: LightboxPhoto[] = galleryPhotos.map((p, i) => ({
    url: p.url,
    alt: `Gallery photo ${i + 1}`,
  }))

  return (
    <>
      {/* ── Lightbox ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={close}
        >
          {/* Close */}
          <button
            type="button"
            aria-label="Close photo viewer"
            onClick={close}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Prev */}
          {canNav && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {/* Image */}
          <img
            src={lightboxPhotos[lightboxIndex!].url}
            alt={lightboxPhotos[lightboxIndex!].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          />

          {/* Next */}
          {canNav && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          )}

          {/* Counter */}
          {canNav && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
              {lightboxIndex! + 1} / {lightboxPhotos.length}
            </span>
          )}
        </div>
      )}

      {/* ── Page ── */}
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
          <div className="flex items-start gap-6">
            {/* Profile photo */}
            <div className="shrink-0 -mt-20 h-60 w-60 rounded-full border-4 border-neutral-50 dark:border-neutral-950 overflow-hidden shadow-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              {v.profilePhoto ? (
                <button
                  type="button"
                  aria-label="View profile photo"
                  onClick={() => openProfile(v.profilePhoto!.url, fullName || 'Profile photo')}
                  className="h-full w-full"
                >
                  <img
                    src={v.profilePhoto.url}
                    alt={fullName}
                    className="h-full w-full object-cover cursor-pointer"
                  />
                </button>
              ) : (
                <User className="h-16 w-16 text-neutral-400" />
              )}
            </div>

            {/* Identity */}
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

          {/* Photo Gallery + Biography */}
          <div className="flex flex-col gap-6">
            {/* Photo Gallery */}
            <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
              <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Photo Gallery
              </h2>
              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {galleryPhotos.map((photo, i) => (
                    <button
                      key={photo.public_id}
                      type="button"
                      aria-label={`View gallery photo ${i + 1}`}
                      onClick={() => openGallery(galleryLightbox, i)}
                      className="aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                      <img
                        src={photo.url}
                        alt={`Gallery photo ${i + 1}`}
                        className="h-full w-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Images className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mb-2" aria-hidden="true" />
                  <p className="text-sm text-neutral-400">No photos added yet.</p>
                </div>
              )}
            </div>

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
    </>
  )
}
