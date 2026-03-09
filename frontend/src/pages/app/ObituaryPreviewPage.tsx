import { useCallback, useEffect, useState } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { COVER_GRADIENTS, isCustomColor } from '@/pages/app/CreateMemorialPage'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Users,
  X,
} from 'lucide-react'
import type { ObituaryFormValues } from '@/hooks/use-create-obituary'

interface PreviewState {
  values: ObituaryFormValues
  coverGradient?: string
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

function formatTime(raw: string): string {
  if (!raw) return ''
  try {
    const [h, m] = raw.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m)
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(d)
  } catch {
    return raw
  }
}

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
      <span className="shrink-0 text-neutral-400" aria-hidden="true">{icon}</span>
      {children}
    </p>
  )
}

// ── Detail card ───────────────────────────────────────────────────────────────

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
      <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      {children}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ObituaryPreviewPage() {
  const { state } = useLocation() as { state: PreviewState | null }
  const [lightboxPhotos, setLightboxPhotos] = useState<LightboxPhoto[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const isOpen = lightboxIndex !== null
  const canNav = lightboxPhotos.length > 1

  const openProfile = useCallback((url: string, alt: string) => {
    setLightboxPhotos([{ url, alt }])
    setLightboxIndex(0)
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
    return <Navigate to="/dashboard/obituary/create" replace />
  }

  const v = state.values
  const rawGradient = state.coverGradient ?? 'blue'
  const customColor = isCustomColor(rawGradient) ? rawGradient : null
  const coverPreset = !customColor
    ? (COVER_GRADIENTS.find((g) => g.key === rawGradient) ?? COVER_GRADIENTS[0])
    : null

  const fullName = [v.firstName, v.lastName].filter(Boolean).join(' ')
  const locationText = [v.state, v.country].filter(Boolean).join(', ')
  const dateRange = [
    v.dateOfBirth ? formatDate(v.dateOfBirth) : '',
    v.dateOfDeath ? formatDate(v.dateOfDeath) : '',
  ]
    .filter(Boolean)
    .join(' · ')

  const hasFuneral = !!(v.funeralName || v.funeralLocation || v.funeralDate)
  const hasBurial = !!(v.burialCenterName || v.burialLocation || v.burialDate)
  const hasFamilyMembers = (v.familyMembers ?? []).filter((m) => m.name?.trim()).length > 0
  const hasContact = !!(v.contactPersonName || v.contactPersonPhone)

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
          <button
            type="button"
            aria-label="Close photo viewer"
            onClick={close}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>

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

          <img
            src={lightboxPhotos[lightboxIndex!].url}
            alt={lightboxPhotos[lightboxIndex!].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
          />

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
            customColor.startsWith('linear-gradient')
              ? <div className="h-full w-full" style={{ backgroundImage: customColor }} />
              : <div className="h-full w-full" style={{ backgroundColor: customColor }} />
          ) : (
            <div className={`h-full w-full bg-gradient-to-r ${coverPreset!.tw}`} />
          )}
        </div>

        {/* ── Profile zone ── */}
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Profile photo */}
            <div className="shrink-0 -mt-16 sm:-mt-20 h-32 w-32 sm:h-48 sm:w-48 rounded-full border-4 border-neutral-50 dark:border-neutral-950 overflow-hidden shadow-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
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
                <User className="h-10 w-10 sm:h-16 sm:w-16 text-neutral-400" />
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 mt-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                {fullName || <span className="text-neutral-400 italic">No name provided</span>}
              </h1>
              <div className="mt-1.5 space-y-1">
                {dateRange && (
                  <InfoRow icon={<Calendar className="h-3.5 w-3.5" />}>{dateRange}</InfoRow>
                )}
                {v.ageAtDeath && (
                  <InfoRow icon={<User className="h-3.5 w-3.5" />}>Age: {v.ageAtDeath} years</InfoRow>
                )}
                {locationText && (
                  <InfoRow icon={<MapPin className="h-3.5 w-3.5" />}>{locationText}</InfoRow>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Page body ── */}
        <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">

          {/* Biography */}
          <DetailCard title="Biography">
            {v.biography ? (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                {v.biography}
              </p>
            ) : (
              <p className="text-sm text-neutral-400 italic">No biography added yet.</p>
            )}
          </DetailCard>

          {/* Family Members */}
          {hasFamilyMembers && (
            <DetailCard title="Family Members">
              <ul className="space-y-2">
                {(v.familyMembers ?? [])
                  .filter((m) => m.name?.trim())
                  .map((member, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <Users className="h-4 w-4 text-neutral-400" aria-hidden="true" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {member.name}
                        </span>
                        {member.relationship && (
                          <span className="ml-2 text-xs text-neutral-400">· {member.relationship}</span>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            </DetailCard>
          )}

          {/* Funeral Details */}
          {hasFuneral && (
            <DetailCard title="Funeral / Prayer Service">
              <div className="space-y-2">
                {v.funeralName && (
                  <InfoRow icon={<MapPin className="h-3.5 w-3.5" />}>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{v.funeralName}</span>
                  </InfoRow>
                )}
                {v.funeralLocation && (
                  <InfoRow icon={<MapPin className="h-3.5 w-3.5" />}>{v.funeralLocation}</InfoRow>
                )}
                {v.funeralDate && (
                  <InfoRow icon={<Calendar className="h-3.5 w-3.5" />}>{formatDate(v.funeralDate)}</InfoRow>
                )}
                {v.funeralTime && (
                  <InfoRow icon={<Clock className="h-3.5 w-3.5" />}>{formatTime(v.funeralTime)}</InfoRow>
                )}
                {v.funeralNote && (
                  <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap border-t border-neutral-100 dark:border-neutral-800 pt-3">
                    {v.funeralNote}
                  </p>
                )}
              </div>
            </DetailCard>
          )}

          {/* Burial Details */}
          {hasBurial && (
            <DetailCard title="Burial">
              <div className="space-y-2">
                {v.burialCenterName && (
                  <InfoRow icon={<MapPin className="h-3.5 w-3.5" />}>
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">{v.burialCenterName}</span>
                  </InfoRow>
                )}
                {v.burialLocation && (
                  <InfoRow icon={<MapPin className="h-3.5 w-3.5" />}>{v.burialLocation}</InfoRow>
                )}
                {v.burialDate && (
                  <InfoRow icon={<Calendar className="h-3.5 w-3.5" />}>{formatDate(v.burialDate)}</InfoRow>
                )}
                {v.burialTime && (
                  <InfoRow icon={<Clock className="h-3.5 w-3.5" />}>{formatTime(v.burialTime)}</InfoRow>
                )}
                {v.burialNote && (
                  <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap border-t border-neutral-100 dark:border-neutral-800 pt-3">
                    {v.burialNote}
                  </p>
                )}
              </div>
            </DetailCard>
          )}

          {/* Contact Person */}
          {hasContact && (
            <DetailCard title="Contact Person">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <User className="h-5 w-5 text-neutral-400" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  {v.contactPersonName && (
                    <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {v.contactPersonName}
                      {v.contactPersonRelationship && (
                        <span className="ml-2 text-xs font-normal text-neutral-400">
                          · {v.contactPersonRelationship}
                        </span>
                      )}
                    </p>
                  )}
                  {v.contactPersonPhone && (
                    <InfoRow icon={<Phone className="h-3.5 w-3.5" />}>{v.contactPersonPhone}</InfoRow>
                  )}
                  {v.contactPersonEmail && (
                    <InfoRow icon={<Mail className="h-3.5 w-3.5" />}>{v.contactPersonEmail}</InfoRow>
                  )}
                </div>
              </div>
            </DetailCard>
          )}

        </div>
      </div>
    </>
  )
}
