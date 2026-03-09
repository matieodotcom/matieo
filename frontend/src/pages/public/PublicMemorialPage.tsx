import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Calendar, MapPin, User, Images, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { UserAvatar } from '@/components/ui/Avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu'
import { usePublicMemorial } from '@/hooks/use-public-memorial'
import { useTributes, usePostTribute } from '@/hooks/use-tributes'
import { useAuthStore } from '@/store/authStore'
import { useSignOut } from '@/hooks/use-auth'
import { COVER_GRADIENTS, isCustomColor } from '@/pages/app/CreateMemorialPage'
import type { MemorialPhoto } from '@/types/memorial'

interface LightboxPhoto {
  url: string
  alt: string
}

function formatDate(raw: string): string {
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

function timeAgo(raw: string): string {
  const diff = Date.now() - new Date(raw).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      <div className="h-52 w-full bg-neutral-200 dark:bg-neutral-800" />
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex items-start gap-6">
          <div className="-mt-20 h-60 w-60 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 border-4 border-neutral-50 dark:border-neutral-950" />
          <div className="flex-1 mt-3 space-y-3">
            <div className="h-7 w-48 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-3">
          <div className="h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-3">
          <div className="h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 404 ───────────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      <p className="text-5xl font-bold text-neutral-200 dark:text-neutral-800 mb-4">404</p>
      <h1 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
        Memorial not found
      </h1>
      <p className="text-sm text-neutral-400 mb-8">
        This memorial may have been removed or the link is incorrect.
      </p>
      <Link
        to="/memorials"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
      >
        <ArrowLeft size={14} />
        Browse memorials
      </Link>
    </div>
  )
}

// ── Memorial header ───────────────────────────────────────────────────────────

function MemorialHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { signOut } = useSignOut()
  // 'default' key means direct access (new tab, typed URL, bookmark) — no history to go back to
  const canGoBack = location.key !== 'default'

  // Not logged in (or still loading) → full Navbar with all nav options
  if (!user) {
    return <Navbar />
  }

  // Auth resolving → minimal placeholder to avoid layout shift
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="w-16 h-4 bg-neutral-100 dark:bg-neutral-800 rounded" />
          <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-full" />
        </div>
      </header>
    )
  }

  // Logged in → minimal header: back · logo · avatar dropdown
  const displayName = user.user_metadata?.full_name ?? user.email ?? ''
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => (canGoBack ? navigate(-1) : navigate('/'))}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-8 h-8" aria-hidden="true" />
          <span className="text-brand-secondary dark:text-white font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="User menu"
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              <UserAvatar src={avatarUrl} name={displayName} size="md" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/settings">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublicMemorialPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: response, isPending, error } = usePublicMemorial(slug ?? '')
  const user = useAuthStore((s) => s.user)

  const [lightboxPhotos, setLightboxPhotos] = useState<LightboxPhoto[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [tributeText, setTributeText] = useState('')

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

  const memorial = response?.data

  const { data: tributesRes } = useTributes(memorial?.id ?? '')
  const { mutate: postTribute, isPending: posting } = usePostTribute(memorial?.id ?? '')
  const tributes = tributesRes?.data ?? []

  const is404 = !isPending && (error?.message === 'Memorial not found' || (!error && !memorial))

  const coverGradient = memorial?.cover_gradient ?? 'blue'
  const customColor = isCustomColor(coverGradient) ? coverGradient : null
  const gradient = !customColor
    ? (COVER_GRADIENTS.find((g) => g.key === coverGradient) ?? COVER_GRADIENTS[0])
    : null

  const galleryPhotos: MemorialPhoto[] = memorial?.memorial_photos ?? []
  const galleryLightbox: LightboxPhoto[] = galleryPhotos.map((p, i) => ({
    url: p.cloudinary_url,
    alt: `Gallery photo ${i + 1}`,
  }))

  const fullName = memorial?.full_name ?? ''
  const dateRange = [memorial?.date_of_birth, memorial?.date_of_death]
    .filter(Boolean)
    .map((d) => formatDate(d!))
    .join(' · ')

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

      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
        <MemorialHeader />

        <main className="flex-1">
          {isPending && <Skeleton />}

          {!isPending && (error && !is404) && (
            <div className="mx-auto max-w-3xl px-4 py-20 text-center">
              <p className="text-neutral-500 dark:text-neutral-400">
                Something went wrong. Please try again.
              </p>
            </div>
          )}

          {is404 && <NotFound />}

          {!isPending && !error && memorial && (
            <>
              {/* ── Cover ── */}
              <div className="h-52 w-full overflow-hidden">
                {memorial.cover_url ? (
                  <img src={memorial.cover_url} alt="Cover" className="h-full w-full object-cover" />
                ) : customColor ? (
                  customColor.startsWith('linear-gradient')
                    ? <div className="h-full w-full" style={{ backgroundImage: customColor }} />
                    : <div className="h-full w-full" style={{ backgroundColor: customColor }} />
                ) : (
                  <div className={`h-full w-full bg-gradient-to-r ${gradient!.tw}`} />
                )}
              </div>

              {/* ── Profile zone ── */}
              <div className="mx-auto max-w-3xl px-4">
                <div className="flex items-start gap-6">
                  <div className="shrink-0 -mt-20 h-60 w-60 rounded-full border-4 border-neutral-50 dark:border-neutral-950 overflow-hidden shadow-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                    {memorial.profile_url ? (
                      <button
                        type="button"
                        aria-label="View profile photo"
                        onClick={() => openProfile(memorial.profile_url!, fullName || 'Profile photo')}
                        className="h-full w-full"
                      >
                        <img
                          src={memorial.profile_url}
                          alt={fullName}
                          className="h-full w-full object-cover cursor-pointer"
                        />
                      </button>
                    ) : (
                      <User className="h-16 w-16 text-neutral-400" />
                    )}
                  </div>

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
                    {memorial.location && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {memorial.location}
                      </p>
                    )}
                    {memorial.age_at_death && (
                      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        Age: {memorial.age_at_death} years
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Body ── */}
              <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">

                {/* Quote */}
                {memorial.quote && (
                  <div className="py-8 text-center">
                    <blockquote className="text-2xl font-semibold italic text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      &ldquo;{memorial.quote}&rdquo;
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
                            key={photo.id}
                            type="button"
                            aria-label={`View gallery photo ${i + 1}`}
                            onClick={() => openGallery(galleryLightbox, i)}
                            className="aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                          >
                            <img
                              src={photo.cloudinary_url}
                              alt={photo.caption ?? `Gallery photo ${i + 1}`}
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
                    {memorial.biography ? (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                        {memorial.biography}
                      </p>
                    ) : (
                      <p className="text-sm text-neutral-400 italic">No biography added yet.</p>
                    )}
                  </div>
                </div>

                {/* Tributes */}
                <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
                  <h2 className="mb-5 text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    Tributes ({tributes.length})
                  </h2>

                  {user ? (
                    <div className="mb-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
                      <label htmlFor="tribute-input" className="sr-only">Write a tribute</label>
                      <textarea
                        id="tribute-input"
                        value={tributeText}
                        onChange={(e) => setTributeText(e.target.value)}
                        placeholder="Share your memories and pay tribute…"
                        rows={3}
                        maxLength={500}
                        className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      />
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-neutral-400">{tributeText.length}/500</span>
                        <button
                          type="button"
                          disabled={!tributeText.trim() || posting}
                          onClick={() => {
                            postTribute(tributeText.trim(), {
                              onSuccess: () => setTributeText(''),
                            })
                          }}
                          className="rounded-lg bg-brand-primary hover:bg-brand-primaryHover px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors"
                        >
                          {posting ? 'Posting…' : 'Post Tribute'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4 text-center">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        <Link to="/signin" className="text-brand-primary hover:underline font-medium">Sign in</Link>
                        {' '}to leave a tribute
                      </p>
                    </div>
                  )}

                  {tributes.length === 0 ? (
                    <p className="text-sm text-neutral-400 italic text-center py-4">
                      Be the first to leave a tribute.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {tributes.map((t) => (
                        <div key={t.id} className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 shrink-0 rounded-full bg-brand-primary/10 flex items-center justify-center">
                              <span className="text-xs font-semibold text-brand-primary" aria-hidden="true">
                                {t.author_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                  {t.author_name}
                                </span>
                                <span className="text-xs text-neutral-400">{timeAgo(t.created_at)}</span>
                              </div>
                              <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                                {t.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </>
  )
}
