import { useState, useMemo } from 'react'
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
  Phone,
  Globe,
  ArrowRight,
  Search,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

// ── Category data ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'florists',       icon: Flower2,        color: 'from-pink-400 to-rose-500',       providers: 73 },
  { key: 'casketUrn',      icon: Package,         color: 'from-stone-400 to-stone-600',     providers: 8  },
  { key: 'transportation', icon: Car,             color: 'from-sky-400 to-blue-500',        providers: 6  },
  { key: 'counselling',    icon: HeartHandshake,  color: 'from-violet-400 to-purple-500',   providers: 79 },
  { key: 'undertakers',    icon: Building2,       color: 'from-slate-400 to-slate-600',     providers: 14 },
  { key: 'caterers',       icon: UtensilsCrossed, color: 'from-orange-400 to-amber-500',    providers: 21 },
  { key: 'prayerServices', icon: BookOpen,        color: 'from-indigo-400 to-indigo-600',   providers: 9  },
  { key: 'funeralParlour', icon: Home,            color: 'from-teal-400 to-teal-600',       providers: 5  },
  { key: 'crematorium',    icon: Flame,           color: 'from-red-400 to-red-600',         providers: 2  },
  { key: 'canopy',         icon: Tent,            color: 'from-emerald-400 to-green-500',   providers: 3  },
  { key: 'burialServices', icon: Mountain,        color: 'from-lime-400 to-green-600',      providers: 6  },
  { key: 'photography',    icon: Camera,          color: 'from-cyan-400 to-cyan-600',       providers: 10 },
  { key: 'memorialParks',  icon: Trees,           color: 'from-green-400 to-emerald-600',   providers: 3  },
  { key: 'fengShui',       icon: Wind,            color: 'from-yellow-400 to-amber-500',    providers: 4  },
] as const

// ── Hero ──────────────────────────────────────────────────────────────────────

function HeroBanner() {
  const { t } = useTranslation()
  return (
    <div className="bg-gradient-to-r from-brand-secondary to-brand-primary text-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center gap-8">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Building2 size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {t('services.hero.heading')}
              </h1>
              <p className="text-white/80 text-sm mt-0.5">{t('services.hero.tagline')}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <a href="tel:+601234567890" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone size={14} />
              +60 12-345 6789
            </a>
            <a href="https://matieo.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Globe size={14} />
              www.matieo.com
            </a>
          </div>
        </div>

        {/* Right illustration */}
        <div className="hidden sm:flex items-end gap-3 shrink-0 opacity-90">
          {/* Simple stylised building illustration */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-8 bg-white/40 rounded-t-full" />
            <div className="w-12 h-16 bg-white/20 rounded-t-xl border border-white/30 flex items-end justify-center pb-1">
              <div className="w-4 h-6 bg-white/30 rounded-t-sm" />
            </div>
            <div className="w-14 h-3 bg-white/30 rounded" />
          </div>
          <div className="flex flex-col items-center gap-1 mb-4">
            <div className="relative">
              <div className="w-2 h-12 bg-white/50 rounded-t-full mx-auto" />
              <div className="w-16 h-20 bg-white/25 rounded-t-2xl border border-white/40 flex items-end justify-center pb-2">
                <div className="w-5 h-8 bg-white/35 rounded-t-sm" />
              </div>
            </div>
            <div className="w-18 h-3 bg-white/30 rounded" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-2 h-6 bg-white/40 rounded-t-full" />
            <div className="w-10 h-12 bg-white/20 rounded-t-xl border border-white/30 flex items-end justify-center pb-1">
              <div className="w-3 h-5 bg-white/30 rounded-t-sm" />
            </div>
            <div className="w-12 h-3 bg-white/30 rounded" />
          </div>
          {/* People silhouettes */}
          <div className="mb-3 flex items-end gap-1">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-4 h-4 rounded-full bg-white/50" />
              <div className="w-3 h-6 bg-white/40 rounded-sm" />
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-3 h-3 rounded-full bg-white/40" />
              <div className="w-2.5 h-5 bg-white/30 rounded-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Category card ─────────────────────────────────────────────────────────────

function CategoryCard({ categoryKey, icon: Icon, color, providers }: {
  categoryKey: string
  icon: React.ElementType
  color: string
  providers: number
}) {
  const { t } = useTranslation()
  return (
    <article className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group">
      {/* Thumbnail */}
      <div className={`h-32 bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon size={40} className="text-white/90 group-hover:scale-110 transition-transform duration-200" strokeWidth={1.5} />
      </div>
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 mb-1">
          {t(`services.category.${categoryKey}.name`)}
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3 line-clamp-2">
          {t(`services.category.${categoryKey}.description`)}
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
        to="/signup"
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return CATEGORIES
    return CATEGORIES.filter((c) =>
      t(`services.category.${c.key}.name`).toLowerCase().includes(q) ||
      t(`services.category.${c.key}.description`).toLowerCase().includes(q),
    )
  }, [search, t])

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

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((c) => (
                <CategoryCard
                  key={c.key}
                  categoryKey={c.key}
                  icon={c.icon}
                  color={c.color}
                  providers={c.providers}
                />
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
