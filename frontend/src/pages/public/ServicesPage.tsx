import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Flower2,
  Package,
  Car,
  HeartHandshake,
  Building2,
  UtensilsCrossed,
  BookOpen,
  Home,
  Flame,
  Tent,
  Mountain,
  Camera,
  Trees,
  Wind,
  ArrowRight,
  Search,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { usePublicServiceCategories } from '@/hooks/use-services'

// ── Icon map (slug → lucide component) ───────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Flower2, Package, Car, HeartHandshake, Building2, UtensilsCrossed,
  BookOpen, Home, Flame, Tent, Mountain, Camera, Trees, Wind,
}

const COLOR_MAP: Record<string, string> = {
  florists:        'from-pink-400 to-rose-500',
  casketUrn:       'from-stone-400 to-stone-600',
  transportation:  'from-sky-400 to-blue-500',
  counselling:     'from-violet-400 to-purple-500',
  undertakers:     'from-slate-400 to-slate-600',
  caterers:        'from-orange-400 to-amber-500',
  prayerServices:  'from-indigo-400 to-indigo-600',
  funeralParlour:  'from-teal-400 to-teal-600',
  crematorium:     'from-red-400 to-red-600',
  canopy:          'from-emerald-400 to-green-500',
  burialServices:  'from-lime-400 to-green-600',
  photography:     'from-cyan-400 to-cyan-600',
  memorialParks:   'from-green-400 to-emerald-600',
  fengShui:        'from-yellow-400 to-amber-500',
}

// ── Hero Carousel ─────────────────────────────────────────────────────────────

const SLIDES = [
  {
    gradient: 'from-brand-secondary via-brand-primary to-indigo-500',
    label: 'Funeral Services',
  },
  {
    gradient: 'from-slate-700 via-slate-600 to-slate-500',
    label: 'Memorial Parks',
  },
  {
    gradient: 'from-teal-700 via-teal-600 to-emerald-500',
    label: 'Grief Counselling',
  },
  {
    gradient: 'from-violet-700 via-purple-600 to-indigo-500',
    label: 'Prayer Services',
  },
] as const

function HeroBanner() {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(0)
  const total = SLIDES.length

  const prev = useCallback(() => setCurrent((i) => (i - 1 + total) % total), [total])
  const next = useCallback(() => setCurrent((i) => (i + 1) % total), [total])

  // Auto-advance every 4 s
  useEffect(() => {
    const id = setInterval(next, 4000)
    return () => clearInterval(id)
  }, [next])

  const slide = SLIDES[current]

  return (
    <div className="relative w-full h-64 sm:h-80 overflow-hidden select-none">
      {/* Slide background */}
      <div
        key={current}
        className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-700`}
      />

      {/* Centred content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center pointer-events-none">
        <ImageIcon size={40} strokeWidth={1} className="text-white/30" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md leading-tight">
            {t('services.hero.heading')}
          </h1>
          <p className="text-white/80 text-sm mt-1 drop-shadow">{t('services.hero.tagline')}</p>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-5 h-2 bg-white'
                : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Category card ─────────────────────────────────────────────────────────────

function CategoryCard({ categoryKey, icon: Icon, color, imageUrl, providers }: {
  categoryKey: string
  icon: React.ElementType
  color: string
  imageUrl?: string | null
  providers: number
}) {
  const { t } = useTranslation()
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group">
      {/* Thumbnail */}
      <div className={`h-32 bg-gradient-to-br ${color} flex items-center justify-center overflow-hidden`}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
        ) : (
          <Icon size={40} className="text-white/90 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
        )}
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
          {t(`services.category.${categoryKey}.name`, { defaultValue: categoryKey })}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3 line-clamp-2">
          {t(`services.category.${categoryKey}.description`, { defaultValue: '' })}
        </p>
        <p className="text-xs font-medium text-brand-primary">
          {t('services.categories.providers', { count: providers })}
        </p>
      </div>
    </article>
  )
}

// ── List Your Services CTA ────────────────────────────────────────────────────

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
                <div key={i} className="rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse h-48" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((c) => {
                const Icon = (c.icon && ICON_MAP[c.icon]) ? ICON_MAP[c.icon] : Building2
                const color = COLOR_MAP[c.slug] ?? 'from-neutral-400 to-neutral-600'
                return (
                  <CategoryCard
                    key={c.id}
                    categoryKey={c.slug}
                    icon={Icon}
                    color={color}
                    imageUrl={c.image_url}
                    providers={c.service_count}
                  />
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-neutral-400 text-sm">
              {categories.length === 0
                ? t('services.categories.noResults')
                : t('services.categories.noResults')}
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
