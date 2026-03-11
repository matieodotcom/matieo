import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Calendar, MapPin, User, Phone, Mail, ArrowLeft, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'
import { useSignOut } from '@/hooks/use-auth'
import { useCondolences, usePostCondolence } from '@/hooks/use-condolences'
import { SignInModal } from '@/components/auth/SignInModal'
import { useLocaleStore } from '@/store/localeStore'
import { EmojiPickerButton } from '@/components/ui/EmojiPickerButton'
import type { ObituaryRow } from '@/types/obituary'
import type { TFunction } from 'i18next'

interface SingleObituaryResponse {
  data: ObituaryRow | null
  error: string | null
}

function usePublicObituary(slug: string) {
  return useQuery({
    queryKey: ['public-obituary', slug],
    queryFn: () => apiFetch<SingleObituaryResponse>(`/api/obituaries/by-slug/${slug}`),
    enabled: !!slug,
    staleTime: 60_000,
    retry: false,
    select: (res) => res,
  })
}

function formatDate(raw: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(raw))
  } catch {
    return raw
  }
}

function timeAgo(raw: string, t: TFunction): string {
  const diff = Date.now() - new Date(raw).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return t('common.justNow')
  if (m < 60) return t('common.minutesAgo', { m })
  const h = Math.floor(m / 60)
  if (h < 24) return t('common.hoursAgo', { h })
  return t('common.daysAgo', { d: Math.floor(h / 24) })
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse bg-neutral-50 dark:bg-neutral-950 min-h-screen">
      <div className="h-80 w-full bg-neutral-200 dark:bg-neutral-800" />
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex items-start gap-6">
          <div className="-mt-16 sm:-mt-20 h-40 w-40 sm:h-52 sm:w-52 shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700 border-4 border-neutral-50 dark:border-neutral-950" />
          <div className="flex-1 mt-3 space-y-3">
            <div className="h-7 w-48 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-3">
          <div className="h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>
        <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-3">
          <div className="h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  )
}

// ── 404 ───────────────────────────────────────────────────────────────────────

function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center px-4">
      <p className="text-5xl font-bold text-neutral-200 dark:text-neutral-800 mb-4">404</p>
      <h1 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
        {t('publicObituary.notFound.heading')}
      </h1>
      <p className="text-sm text-neutral-400 mb-8">
        {t('publicObituary.notFound.message')}
      </p>
      <Link
        to="/obituary"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
      >
        <ArrowLeft size={14} />
        {t('publicObituary.notFound.browse')}
      </Link>
    </div>
  )
}

// ── Obituary header (Navbar variant) ─────────────────────────────────────────

function ObituaryHeader() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { signOut } = useSignOut()
  const canGoBack = location.key !== 'default'

  if (!user) {
    return <Navbar />
  }

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

  const displayName = user.user_metadata?.full_name ?? user.email ?? ''
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <button
          type="button"
          aria-label={t('publicObituary.goBack')}
          onClick={() => (canGoBack ? navigate(-1) : navigate('/obituary'))}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={15} />
          <span className="hidden sm:inline">{t('publicObituary.back_label')}</span>
        </button>

        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-8 h-8" aria-hidden="true" />
          <span className="text-brand-secondary dark:text-white font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={t('nav.userMenu')}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
            >
              <UserAvatar src={avatarUrl} name={displayName} size="md" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/settings">{t('nav.profile')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">{t('nav.settings')}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut}>{t('nav.signOut')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6">
      <h2 className="mb-4 text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</h2>
      {children}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublicObituaryPage() {
  const { t } = useTranslation()
  const { locale } = useLocaleStore()
  const { slug } = useParams<{ slug: string }>()
  const { data: response, isPending, error } = usePublicObituary(slug ?? '')
  const user = useAuthStore((s) => s.user)
  const [condolenceText, setCondolenceText] = useState('')
  const [signInOpen, setSignInOpen] = useState(false)

  const PAGE_SIZE = 10
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const obituary = response?.data

  const { data: condolencesRes } = useCondolences(obituary?.id ?? '')
  const { mutate: postCondolence, isPending: posting } = usePostCondolence(obituary?.id ?? '')
  const condolences = condolencesRes?.data ?? []

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount((n) => n + PAGE_SIZE) },
      { threshold: 0.1 },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [condolences.length])

  const is404 = !isPending && (error?.message === 'Obituary not found' || (!error && !obituary))

  const fullName = obituary?.full_name ?? ''
  const dateRange = [obituary?.date_of_birth, obituary?.date_of_death]
    .filter(Boolean)
    .map((d) => formatDate(d!, locale))
    .join(' · ')

  const location = [obituary?.state, obituary?.country].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <ObituaryHeader />

      <main className="flex-1">
        {isPending && <Skeleton />}

        {!isPending && error && !is404 && (
          <div className="mx-auto max-w-3xl px-4 py-20 text-center">
            <p className="text-neutral-500 dark:text-neutral-400">
              {t('publicObituary.error')}
            </p>
          </div>
        )}

        {is404 && <NotFound />}

        {!isPending && !error && obituary && (
          <>
            {/* ── Cover photo ── */}
            <div className="h-80 w-full overflow-hidden">
              {obituary.cover_url ? (
                <img src={obituary.cover_url} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-brand-secondary to-brand-primary" />
              )}
            </div>

            {/* ── Profile zone ── */}
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <div className="flex items-start gap-6">
                <div className="shrink-0 -mt-16 h-40 w-40 sm:-mt-20 sm:h-52 sm:w-52 rounded-full border-4 border-neutral-50 dark:border-neutral-950 overflow-hidden shadow-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  {obituary.profile_url ? (
                    <img
                      src={obituary.profile_url}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-neutral-400" />
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
                  {location && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      {location}
                    </p>
                  )}
                  {obituary.age_at_death && (
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                      {t('publicObituary.age', { age: obituary.age_at_death })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">

              {/* Biography */}
              {obituary.biography && (
                <SectionCard title={t('publicObituary.obituarySection')}>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                    {obituary.biography}
                  </p>
                </SectionCard>
              )}

              {/* Funeral Details */}
              {obituary.funeral_details && (
                <SectionCard title={t('publicObituary.funeralService')}>
                  <dl className="space-y-2">
                    {obituary.funeral_details.name && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t('publicObituary.venue')}</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">{obituary.funeral_details.name}</dd>
                      </div>
                    )}
                    {obituary.funeral_details.location && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t('publicObituary.location')}</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">{obituary.funeral_details.location}</dd>
                      </div>
                    )}
                    {(obituary.funeral_details.date || obituary.funeral_details.time) && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t('publicObituary.dateAndTime')}</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">
                          {[obituary.funeral_details.date && formatDate(obituary.funeral_details.date, locale), obituary.funeral_details.time]
                            .filter(Boolean)
                            .join(` ${t('publicObituary.at')} `)}
                        </dd>
                      </div>
                    )}
                    {obituary.funeral_details.note && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t('publicObituary.note')}</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5 whitespace-pre-wrap">{obituary.funeral_details.note}</dd>
                      </div>
                    )}
                  </dl>
                </SectionCard>
              )}

              {/* Burial Details */}
              {obituary.burial_details && (
                <SectionCard title={t('publicObituary.burial')}>
                  <dl className="space-y-2">
                    {obituary.burial_details.burial_center_name && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t('publicObituary.cemetery')}</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">{obituary.burial_details.burial_center_name}</dd>
                      </div>
                    )}
                    {obituary.burial_details.location && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t('publicObituary.location')}</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">{obituary.burial_details.location}</dd>
                      </div>
                    )}
                    {(obituary.burial_details.burial_date || obituary.burial_details.burial_time) && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t('publicObituary.dateAndTime')}</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">
                          {[obituary.burial_details.burial_date && formatDate(obituary.burial_details.burial_date, locale), obituary.burial_details.burial_time]
                            .filter(Boolean)
                            .join(` ${t('publicObituary.at')} `)}
                        </dd>
                      </div>
                    )}
                    {obituary.burial_details.note && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">{t('publicObituary.note')}</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5 whitespace-pre-wrap">{obituary.burial_details.note}</dd>
                      </div>
                    )}
                  </dl>
                </SectionCard>
              )}

              {/* Family Members */}
              {obituary.family_members && obituary.family_members.length > 0 && (
                <SectionCard title={t('publicObituary.survivedBy')}>
                  <ul className="space-y-2">
                    {obituary.family_members.map((member, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Users size={14} className="shrink-0 text-neutral-400" aria-hidden="true" />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">
                          {member.name}
                          {member.relationship && (
                            <span className="text-neutral-400 dark:text-neutral-500"> ({member.relationship})</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </SectionCard>
              )}

              {/* Contact Person */}
              {obituary.contact_person && (
                <SectionCard title={t('publicObituary.contactPerson')}>
                  <div className="space-y-2">
                    {obituary.contact_person.name && (
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {obituary.contact_person.name}
                        {obituary.contact_person.relationship && (
                          <span className="text-neutral-400 dark:text-neutral-500 font-normal"> · {obituary.contact_person.relationship}</span>
                        )}
                      </p>
                    )}
                    {obituary.contact_person.phone && (
                      <a
                        href={`tel:${obituary.contact_person.phone}`}
                        className="flex items-center gap-1.5 text-sm text-brand-primary hover:underline"
                      >
                        <Phone size={13} className="shrink-0" />
                        {obituary.contact_person.phone}
                      </a>
                    )}
                    {obituary.contact_person.email && (
                      <a
                        href={`mailto:${obituary.contact_person.email}`}
                        className="flex items-center gap-1.5 text-sm text-brand-primary hover:underline"
                      >
                        <Mail size={13} className="shrink-0" />
                        {obituary.contact_person.email}
                      </a>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* Condolences */}
              <SectionCard title={t('publicObituary.condolences', { count: condolences.length })}>
                {user ? (
                  <div className="mb-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
                    <label htmlFor="condolence-input" className="sr-only">{t('publicObituary.condolenceInputLabel')}</label>
                    <textarea
                      id="condolence-input"
                      value={condolenceText}
                      onChange={(e) => setCondolenceText(e.target.value)}
                      placeholder={t('publicObituary.condolencePlaceholder')}
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <EmojiPickerButton onEmojiSelect={(emoji) => setCondolenceText((prev) => prev + emoji)} />
                        <span className="text-xs text-neutral-400">{condolenceText.length}/500</span>
                      </div>
                      <button
                        type="button"
                        disabled={!condolenceText.trim() || posting}
                        onClick={() => {
                          postCondolence(condolenceText.trim(), {
                            onSuccess: () => { setCondolenceText(''); setVisibleCount(PAGE_SIZE) },
                          })
                        }}
                        className="rounded-lg bg-brand-primary hover:bg-brand-primaryHover px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors"
                      >
                        {posting ? t('publicObituary.posting') : t('publicObituary.postCondolence')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 rounded-xl border border-neutral-100 dark:border-neutral-800 p-4 text-center">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      <button
                        type="button"
                        onClick={() => setSignInOpen(true)}
                        className="text-brand-primary hover:underline font-medium"
                      >
                        {t('common.signIn')}
                      </button>
                      {' '}{t('publicObituary.signInToCondolence')}
                    </p>
                  </div>
                )}

                {condolences.length === 0 ? (
                  <p className="text-sm text-neutral-400 italic text-center py-4">
                    {t('publicObituary.firstCondolence')}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {condolences.slice(0, visibleCount).map((c) => (
                      <div key={c.id} className="rounded-xl border border-neutral-100 dark:border-neutral-800 p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 shrink-0 rounded-full bg-brand-primary/10 flex items-center justify-center">
                            <span className="text-xs font-semibold text-brand-primary" aria-hidden="true">
                              {c.author_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                {c.author_name}
                              </span>
                              <span className="text-xs text-neutral-400">{timeAgo(c.created_at, t)}</span>
                            </div>
                            <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                              {c.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {visibleCount < condolences.length && (
                      <div ref={sentinelRef} className="flex justify-center py-4">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
                      </div>
                    )}
                  </div>
                )}
              </SectionCard>

              {/* Back link */}
              <div className="pt-4">
                <Link
                  to="/obituary"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
                >
                  <ArrowLeft size={14} />
                  {t('publicObituary.back')}
                </Link>
              </div>

            </div>
          </>
        )}
      </main>

      <Footer />
      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} onSuccess={() => setSignInOpen(false)} />
    </div>
  )
}
