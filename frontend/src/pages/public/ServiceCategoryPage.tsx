import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useServiceCategory } from '@/hooks/use-services'
import type { OrganisationService } from '@/hooks/use-services'

// ── Provider card ────────────────────────────────────────────────────────────

function ProviderCard({ provider, slug }: { provider: OrganisationService; slug: string }) {
  const location = [provider.city, provider.country].filter(Boolean).join(', ')
  const image = provider.gallery_urls?.[0] || provider.icon_url || '/placeholder.jpg'

  return (
    <Link to={`/services/${slug}/${provider.id}`}>
      <article className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
        <div className="h-48 bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
          <img
            src={image}
            alt={provider.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
            {provider.name}
          </h3>
          {location && (
            <p className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
              <MapPin size={12} className="shrink-0" />
              {location}
            </p>
          )}
        </div>
      </article>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ServiceCategoryPage() {
  const { t } = useTranslation()
  const { slug = '' } = useParams<{ slug: string }>()
  const { data, isLoading, error } = useServiceCategory(slug)
  const [search, setSearch] = useState('')

  const categoryData = data?.data
  const category = categoryData?.category
  const providers = categoryData?.providers ?? []

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return providers
    return providers.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.city?.toLowerCase().includes(q)) ||
      (p.country?.toLowerCase().includes(q)),
    )
  }, [search, providers])

  // 404 — category not found
  if (!isLoading && (error || (!categoryData && !isLoading))) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-neutral-500 text-sm">{t('services.category.notFound')}</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />

      {/* Hero banner */}
      {isLoading ? (
        <div className="h-56 sm:h-64 bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      ) : (
        <div className="relative h-56 sm:h-64 overflow-hidden">
          {category?.image_url ? (
            <img src={category.image_url} alt={category.name} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-brand-primary" />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
              {category?.name}
            </h1>
            {category?.description && (
              <p className="text-white/80 text-sm mt-1 max-w-lg">{category.description}</p>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header + search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            {!isLoading && (
              <>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  {category?.name}
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {t('services.category.available', { count: categoryData?.total ?? 0 })}
                </p>
              </>
            )}
          </div>
          <div className="relative w-full sm:w-64 shrink-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              id="category-provider-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('services.category.searchProviders')}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse h-64" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProviderCard key={p.id} provider={p} slug={slug} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-neutral-400 text-sm">
            {t('services.category.emptyProviders')}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
