import { useLocation, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapPin, Phone, Mail, ExternalLink, Building2 } from 'lucide-react'

export interface ServicePreviewValues {
  name: string
  phone: string
  email: string
  website: string
  address: string
  city: string
  country: string
  about: string
  description: string
  categoryName: string
  iconUrl: string | null
  galleryUrls: string[]
}

interface PreviewState {
  values: ServicePreviewValues
  fromId?: string
}

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ServicePreviewPage() {
  const { t } = useTranslation()
  const { state } = useLocation() as { state: PreviewState | null }

  if (!state?.values) {
    return <Navigate to="/dashboard/services/create" replace />
  }

  const v = state.values
  const location = [v.address, v.city, v.country].filter(Boolean).join(', ')
  const mapQuery = v.address ? encodeURIComponent(v.address) : null

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 bg-neutral-50 dark:bg-neutral-950 min-h-screen">

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden bg-brand-primaryLight dark:bg-brand-primary/20 flex items-center justify-center">
            {v.iconUrl ? (
              <img src={v.iconUrl} alt={v.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl font-bold text-brand-primary">
                {v.name ? v.name.slice(0, 2).toUpperCase() : <Building2 size={24} />}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{v.name}</h1>
            {v.categoryName && (
              <span className="inline-block mt-1 rounded-full bg-brand-primaryLight dark:bg-brand-primary/20 px-3 py-0.5 text-xs font-medium text-brand-primary">
                {v.categoryName}
              </span>
            )}
            {v.description && (
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 max-w-xl">{v.description}</p>
            )}
          </div>
        </div>

        {/* ── Gallery ── */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
            {t('services.provider.gallery')}
          </h2>
          <GalleryGrid urls={v.galleryUrls} />
        </section>

        {/* ── About ── */}
        {v.about && (
          <section>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {t('services.provider.about')}
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">{v.about}</p>
          </section>
        )}

        {/* ── Services Offered ── */}
        {v.categoryName && (
          <section>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              {t('services.provider.servicesOffered')}
            </h2>
            <span className="inline-block rounded-full border border-brand-primary/40 bg-brand-primaryLight dark:bg-brand-primary/10 px-3 py-1 text-sm text-brand-primary">
              {v.categoryName}
            </span>
          </section>
        )}

        {/* ── Contact + Map ── */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              {location && (
                <div className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <MapPin size={15} className="shrink-0 mt-0.5 text-neutral-400" aria-hidden="true" />
                  <span>{location}</span>
                </div>
              )}
              {v.phone && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Phone size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
                  <span>{v.phone}</span>
                </div>
              )}
              {v.email && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Mail size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
                  <span>{v.email}</span>
                </div>
              )}
              {v.website && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <ExternalLink size={15} className="shrink-0 text-neutral-400" aria-hidden="true" />
                  <span className="truncate">{v.website.replace(/^https?:\/\//, '')}</span>
                </div>
              )}
              {(v.phone || v.email) && (
                <button
                  type="button"
                  disabled
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand-primary text-white text-sm font-medium px-4 py-2 opacity-60 cursor-not-allowed"
                >
                  {t('services.provider.contactUs')}
                </button>
              )}
            </div>

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

        {/* ── Comments (disabled in preview) ── */}
        <section>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            {t('services.provider.comments', { count: 0 })}
          </h2>
          <div className="mb-6 space-y-2">
            <label htmlFor="preview-comment-input" className="sr-only">
              {t('services.provider.commentPlaceholder')}
            </label>
            <textarea
              id="preview-comment-input"
              disabled
              placeholder={t('services.provider.commentPlaceholder')}
              rows={3}
              className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 px-4 py-3 text-sm text-neutral-400 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 resize-none cursor-not-allowed"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-400">{t('services.provider.commentPublic')}</p>
              <button
                type="button"
                disabled
                className="rounded-lg bg-brand-primary text-white text-sm font-medium px-4 py-2 opacity-60 cursor-not-allowed"
              >
                {t('services.provider.postComment')}
              </button>
            </div>
          </div>
          <p className="text-sm text-neutral-400">{t('services.provider.noComments')}</p>
        </section>

      </main>
    </div>
  )
}
