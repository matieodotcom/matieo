import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ArrowRight,
  Search,
  ImageIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { usePublicServiceCategories } from '@/hooks/use-services'

// ── Hero Banner ──────────────────────────────────────────────────────────────

function HeroBanner() {
  const { t } = useTranslation()
  return (
    <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-brand-primary">
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
        <ImageIcon size={40} strokeWidth={1} className="text-white/30" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md leading-tight">
            {t('services.hero.heading')}
          </h1>
          <p className="text-white/80 text-sm mt-1 drop-shadow">{t('services.hero.tagline')}</p>
        </div>
        <Link
          to="/signup?type=organization"
          className="mt-3 inline-flex items-center gap-2 bg-white text-brand-primary font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-white/90 transition-colors"
        >
          {t('services.listCta.button')}
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}

// ── Category card ────────────────────────────────────────────────────────────

function CategoryCard({ category }: { category: { id: string; slug: string; name: string; description: string | null; image_url: string | null; service_count: number } }) {
  const { t } = useTranslation()
  return (
    <Link to={`/services/${category.slug}`}>
      <article className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group">
        {/* Thumbnail */}
        <div className="h-40 bg-neutral-100 dark:bg-neutral-700 overflow-hidden">
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={t(`services.category.${category.slug}.name`, { defaultValue: category.name })}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-600 dark:to-neutral-700">
              <Building2 size={40} className="text-neutral-400 dark:text-neutral-500" strokeWidth={1.5} />
            </div>
          )}
        </div>
        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
            {t(`services.category.${category.slug}.name`, { defaultValue: category.name })}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3 line-clamp-2">
            {t(`services.category.${category.slug}.description`, { defaultValue: category.description ?? '' })}
          </p>
          <span className="inline-flex items-center text-xs font-medium text-brand-primary bg-brand-primaryLight dark:bg-brand-primary/20 px-2 py-0.5 rounded-full">
            {t('services.categories.providers', { count: category.service_count })}
          </span>
        </div>
      </article>
    </Link>
  )
}

// ── List Your Services CTA ───────────────────────────────────────────────────

function ListServicesCta() {
  const { t } = useTranslation()
  return (
    <section className="border border-neutral-200 dark:border-neutral-700 rounded-2xl mx-auto max-w-3xl px-8 py-12 text-center bg-white dark:bg-neutral-900 shadow-sm">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-primaryLight mb-4">
        <Building2 size={22} className="text-brand-primary" />
      </div>
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        {t('services.listCta.heading')}
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
        {t('services.listCta.description')}
      </p>
      <Link
        to="/signup?type=organization"
        className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"
      >
        {t('services.listCta.button')}
        <ArrowRight size={15} />
      </Link>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const { data, isLoading } = usePublicServiceCategories()
  const categories = data?.data ?? []

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return categories
    return categories.filter((c) =>
      t(`services.category.${c.slug}.name`, { defaultValue: c.name }).toLowerCase().includes(q) ||
      t(`services.category.${c.slug}.description`, { defaultValue: c.description ?? '' }).toLowerCase().includes(q),
    )
  }, [search, t, categories])

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <HeroBanner />

      <main className="flex-1">
        {/* ── Categories ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {t('services.categories.heading')}
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {t('services.categories.subheading')}
              </p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-64 shrink-0">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                id="services-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('services.categories.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Skeleton */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse h-64" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((c) => (
                <CategoryCard key={c.id} category={c} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-400 text-sm">
              {t('services.categories.noResults')}
            </div>
          )}
        </section>

        {/* ── List Your Services CTA ── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <ListServicesCta />
        </section>
      </main>

      <Footer />
    </div>
  )
}
