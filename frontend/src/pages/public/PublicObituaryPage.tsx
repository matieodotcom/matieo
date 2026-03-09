import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { Calendar, MapPin, User, Phone, Mail, ArrowLeft, Users } from 'lucide-react'
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
import type { ObituaryRow } from '@/types/obituary'

interface SingleObituaryResponse {
  data: ObituaryRow | null
  error: string | null
}

function usePublicObituary(slug: string) {
  return useQuery({
    queryKey: ['public-obituary', slug],
    queryFn: () => apiFetch<SingleObituaryResponse>(`/api/obituaries/by-slug/${slug}`),
    enabled: !!slug,
    select: (res) => res,
  })
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="animate-pulse max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="h-52 w-full bg-neutral-200 dark:bg-neutral-800 rounded-xl" />
      <div className="space-y-3">
        <div className="h-7 w-48 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-4 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
      </div>
      <div className="rounded-xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-3">
        <div className="h-5 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-4 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
        <div className="h-4 w-3/4 rounded bg-neutral-100 dark:bg-neutral-800" />
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
        Obituary not found
      </h1>
      <p className="text-sm text-neutral-400 mb-8">
        This obituary may have been removed or the link is incorrect.
      </p>
      <Link
        to="/obituary"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
      >
        <ArrowLeft size={14} />
        Browse obituaries
      </Link>
    </div>
  )
}

// ── Obituary header (Navbar variant) ─────────────────────────────────────────

function ObituaryHeader() {
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
          aria-label="Go back"
          onClick={() => (canGoBack ? navigate(-1) : navigate('/obituary'))}
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
  const { slug } = useParams<{ slug: string }>()
  const { data: response, isPending, error } = usePublicObituary(slug ?? '')

  const obituary = response?.data

  const is404 = !isPending && (error?.message === 'Obituary not found' || (!error && !obituary))

  const fullName = obituary?.full_name ?? ''
  const dateRange = [obituary?.date_of_birth, obituary?.date_of_death]
    .filter(Boolean)
    .map((d) => formatDate(d!))
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
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        {is404 && <NotFound />}

        {!isPending && !error && obituary && (
          <>
            {/* ── Cover photo ── */}
            {obituary.cover_url ? (
              <div className="h-52 w-full overflow-hidden">
                <img src={obituary.cover_url} alt="Cover" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-52 w-full bg-gradient-to-r from-brand-primary/20 to-brand-primary/5" />
            )}

            {/* ── Profile zone ── */}
            <div className="mx-auto max-w-3xl px-4">
              <div className="flex items-start gap-6">
                <div className="shrink-0 -mt-16 h-32 w-32 sm:-mt-20 sm:h-40 sm:w-40 rounded-2xl border-4 border-neutral-50 dark:border-neutral-950 overflow-hidden shadow-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                  {obituary.profile_url ? (
                    <img
                      src={obituary.profile_url}
                      alt={fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-neutral-400" />
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
                      Age: {obituary.age_at_death} years
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="mx-auto max-w-3xl px-4 py-10 space-y-6">

              {/* Biography */}
              {obituary.biography && (
                <SectionCard title="Obituary">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-wrap">
                    {obituary.biography}
                  </p>
                </SectionCard>
              )}

              {/* Funeral Details */}
              {obituary.funeral_details && (
                <SectionCard title="Funeral / Prayer Service">
                  <dl className="space-y-2">
                    {obituary.funeral_details.name && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Venue</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">{obituary.funeral_details.name}</dd>
                      </div>
                    )}
                    {obituary.funeral_details.location && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Location</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">{obituary.funeral_details.location}</dd>
                      </div>
                    )}
                    {(obituary.funeral_details.date || obituary.funeral_details.time) && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Date &amp; Time</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">
                          {[obituary.funeral_details.date && formatDate(obituary.funeral_details.date), obituary.funeral_details.time]
                            .filter(Boolean)
                            .join(' at ')}
                        </dd>
                      </div>
                    )}
                    {obituary.funeral_details.note && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Note</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5 whitespace-pre-wrap">{obituary.funeral_details.note}</dd>
                      </div>
                    )}
                  </dl>
                </SectionCard>
              )}

              {/* Burial Details */}
              {obituary.burial_details && (
                <SectionCard title="Burial">
                  <dl className="space-y-2">
                    {obituary.burial_details.burial_center_name && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Cemetery / Center</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">{obituary.burial_details.burial_center_name}</dd>
                      </div>
                    )}
                    {obituary.burial_details.location && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Location</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">{obituary.burial_details.location}</dd>
                      </div>
                    )}
                    {(obituary.burial_details.burial_date || obituary.burial_details.burial_time) && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Date &amp; Time</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5">
                          {[obituary.burial_details.burial_date && formatDate(obituary.burial_details.burial_date), obituary.burial_details.burial_time]
                            .filter(Boolean)
                            .join(' at ')}
                        </dd>
                      </div>
                    )}
                    {obituary.burial_details.note && (
                      <div>
                        <dt className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">Note</dt>
                        <dd className="text-sm text-neutral-700 dark:text-neutral-300 mt-0.5 whitespace-pre-wrap">{obituary.burial_details.note}</dd>
                      </div>
                    )}
                  </dl>
                </SectionCard>
              )}

              {/* Family Members */}
              {obituary.family_members && obituary.family_members.length > 0 && (
                <SectionCard title="Survived By">
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
                <SectionCard title="Contact Person">
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

              {/* Back link */}
              <div className="pt-4">
                <Link
                  to="/obituary"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-primary hover:underline"
                >
                  <ArrowLeft size={14} />
                  Back to Obituaries
                </Link>
              </div>

            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
