import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SignInModal } from '@/components/auth/SignInModal'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import {
  useServiceProvider,
  useServiceProviderComments,
  useCreateProviderComment,
} from '@/hooks/use-services'
import { useAuthStore } from '@/store/authStore'

// ── Gallery grid ──────────────────────────────────────────────────────────────

function GalleryGrid({ urls }: { urls: string[] }) {
  const { t } = useTranslation()
  if (!urls.length) {
    return <p className="text-sm text-neutral-400">{t('services.provider.noGallery')}</p>
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {urls.slice(0, 5).map((url, i) => (
        <div
          key={url}
          className={`overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 ${
            i === 0 ? 'col-span-2 row-span-2' : ''
          }`}
        >
          <img
            src={url}
            alt={`Gallery photo ${i + 1}`}
            className="h-full w-full object-cover min-h-[140px]"
          />
        </div>
      ))}
    </div>
  )
}

// ── Comments ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ServiceProviderPage() {
  const { t } = useTranslation()
  const { id = '' } = useParams<{ slug: string; id: string }>()
  const user = useAuthStore((s) => s.user)

  const { data: providerResp, isLoading, error } = useServiceProvider(id)
  const { data: commentsResp } = useServiceProviderComments(id)
  const { mutate: postComment, isPending: posting } = useCreateProviderComment(id)

  const [commentText, setCommentText] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const [signInOpen, setSignInOpen] = useState(false)

  const provider = providerResp?.data ?? null
  const comments = commentsResp?.data ?? []

  function handlePost() {
    if (!user) { setSignInOpen(true); return }
    const content = commentText.trim()
    if (!content) { setCommentError('Comment cannot be empty.'); return }
    setCommentError(null)
    postComment(content, {
      onSuccess: () => setCommentText(''),
      onError: (err) => setCommentError((err as Error).message),
    })
  }

  if (!isLoading && (error || !provider)) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-neutral-500 text-sm">{t('services.provider.notFound')}</p>
        </main>
        <Footer />
      </div>
    )
  }

  const category = provider?.service_categories
  const mapQuery = provider?.address ? encodeURIComponent(provider.address) : null

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-48 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
              <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            </div>
          </div>
        ) : provider ? (
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar */}
            <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden bg-brand-primaryLight dark:bg-brand-primary/20 flex items-center justify-center">
              {provider.icon_url ? (
                <img src={provider.icon_url} alt={provider.name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-brand-primary">
                  {provider.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{provider.name}</h1>
              {category && (
                <span className="inline-block mt-1 rounded-full bg-brand-primaryLight dark:bg-brand-primary/20 px-3 py-0.5 text-xs font-medium text-brand-primary">
                  {category.name}
                </span>
              )}
              {provider.description && (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">{provider.description}</p>
              )}
            </div>
          </div>
        ) : null}

        {/* ── Gallery ─────────────────────────────────────────────────────── */}
        {!isLoading && (
          <section>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              {t('services.provider.gallery')}
            </h2>
            <GalleryGrid urls={provider?.gallery_urls ?? []} />
          </section>
        )}

        {/* ── About ───────────────────────────────────────────────────────── */}
        {!isLoading && provider?.about && (
          <section>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {t('services.provider.about')}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">{provider.about}</p>
          </section>
        )}

        {/* ── Services Offered ────────────────────────────────────────────── */}
        {!isLoading && category && (
          <section>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              {t('services.provider.servicesOffered')}
            </h2>
            <span className="inline-block rounded-full border border-brand-primary/40 bg-brand-primaryLight dark:bg-brand-primary/10 px-3 py-1 text-sm text-brand-primary">
              {category.name}
            </span>
          </section>
        )}

        {/* ── Contact + Map ────────────────────────────────────────────────── */}
        {!isLoading && provider && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact details */}
              <div className="space-y-3">
                {provider.address && (
                  <div className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <MapPin size={15} className="shrink-0 mt-0.5 text-neutral-400" />
                    <span>{provider.address}</span>
                  </div>
                )}
                {provider.phone && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Phone size={15} className="shrink-0 text-neutral-400" />
                    <a href={`tel:${provider.phone}`} className="hover:text-brand-primary transition-colors">{provider.phone}</a>
                  </div>
                )}
                {provider.email && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <Mail size={15} className="shrink-0 text-neutral-400" />
                    <a href={`mailto:${provider.email}`} className="hover:text-brand-primary transition-colors">{provider.email}</a>
                  </div>
                )}
                {provider.website && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                    <ExternalLink size={15} className="shrink-0 text-neutral-400" />
                    <a href={provider.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary transition-colors truncate">
                      {provider.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {(provider.phone || provider.email) && (
                  <a
                    href={provider.email ? `mailto:${provider.email}` : `tel:${provider.phone}`}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-4 py-2 transition-colors"
                  >
                    {t('services.provider.contactUs')}
                  </a>
                )}
              </div>

              {/* Map */}
              {mapQuery && (
                <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 h-64 md:h-auto">
                  <iframe
                    title="Location map"
                    src={`https://maps.google.com/maps?q=${mapQuery}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '240px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── Comments ────────────────────────────────────────────────────── */}
        {!isLoading && (
          <section>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              {t('services.provider.comments', { count: comments.length })}
            </h2>

            {/* Post form */}
            <div className="mb-6 space-y-2">
              <label htmlFor="comment-input" className="sr-only">{t('services.provider.commentPlaceholder')}</label>
              <textarea
                id="comment-input"
                value={commentText}
                onChange={(e) => { setCommentText(e.target.value); setCommentError(null) }}
                placeholder={t('services.provider.commentPlaceholder')}
                rows={3}
                className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/40 resize-none"
              />
              {commentError && <ErrorMessage message={commentError} />}
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400">{t('services.provider.commentPublic')}</p>
                <button
                  type="button"
                  onClick={handlePost}
                  disabled={posting}
                  className="rounded-lg bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50"
                >
                  {posting ? '…' : t('services.provider.postComment')}
                </button>
              </div>
            </div>

            {/* Comment list */}
            {comments.length === 0 ? (
              <p className="text-sm text-neutral-400">{t('services.provider.noComments')}</p>
            ) : (
              <ul className="space-y-4">
                {comments.map((c) => {
                  const name = c.profiles?.full_name ?? 'Anonymous'
                  return (
                    <li key={c.id} className="flex gap-3">
                      <div className="h-8 w-8 shrink-0 rounded-full bg-brand-primaryLight dark:bg-brand-primary/20 flex items-center justify-center text-xs font-semibold text-brand-primary">
                        {initials(name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{name}</span>
                          <span className="text-xs text-neutral-400">{formatDate(c.created_at)}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">{c.content}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}
      </main>

      <Footer />

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
    </div>
  )
}
