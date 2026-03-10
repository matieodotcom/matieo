import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Heart,
  Building2,
  BarChart3,
  Shield,
  Users,
  Play,
  Star,
  Check,
  ArrowRight,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { SignInModal } from '@/components/auth/SignInModal'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { useAuthStore } from '@/store/authStore'
import { useWaitlist } from '@/hooks/use-waitlist'

// ── Feature icons (order matches landing.features keys) ───────────────────────

const FEATURE_ICONS = [FileText, Heart, Building2, BarChart3, Shield, Users] as const
const FEATURE_KEYS = ['obituary', 'memorials', 'services', 'insights', 'privacy', 'community'] as const

const HOW_IT_WORKS_KEYS = ['memorials', 'obituary', 'insights'] as const
const HOW_IT_WORKS_BG = [
  'bg-gradient-to-br from-rose-100 to-rose-200',
  'bg-gradient-to-br from-stone-200 to-stone-300',
  'bg-gradient-to-br from-neutral-700 to-neutral-900',
] as const

const STAT_KEYS = ['obituaries', 'memorials', 'insights', 'satisfaction'] as const

// ── Sections ─────────────────────────────────────────────────────────────────

function HeroSection({
  onCreateMemorial,
  onCreateObituary,
}: {
  onCreateMemorial: () => void
  onCreateObituary: () => void
}) {
  const { t } = useTranslation()
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50 to-brand-primaryLight/40 min-h-[680px] flex items-center">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-primaryLight/60 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/80 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 w-full">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/80 border border-brand-primaryLight rounded-full mb-7">
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"
            />
            <span className="text-sm text-brand-secondary font-medium">
              {t('landing.hero.trusted')}
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-brand-primary mb-6 whitespace-pre-line">
            {t('landing.hero.heading')}
          </h1>

          {/* Description */}
          <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-[480px]">
            {t('landing.hero.description')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-8 md:mb-10">
            <button
              onClick={onCreateMemorial}
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm px-7 py-3.5 rounded-lg transition-colors"
            >
              {t('landing.hero.createMemorial')}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button
              onClick={onCreateObituary}
              className="inline-flex items-center gap-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-sm px-7 py-3.5 rounded-lg transition-colors"
            >
              {t('landing.hero.createObituary')}
            </button>
          </div>

          {/* Social proof stats */}
          <div className="flex items-center gap-4 md:gap-6" aria-label="Platform stats">
            <div>
              <p className="text-xl font-semibold text-brand-secondary">{t('landing.hero.support247')}</p>
              <p className="text-sm text-neutral-500">{t('landing.hero.support')}</p>
            </div>
            <div aria-hidden="true" className="w-px h-10 bg-neutral-200" />
            <div>
              <p className="text-xl font-semibold text-brand-secondary">{t('landing.hero.secure100')}</p>
              <p className="text-sm text-neutral-500">{t('landing.hero.secure')}</p>
            </div>
          </div>
        </div>

        {/* Right column — product mockup */}
        <div className="w-[520px] flex-shrink-0 relative hidden lg:block" aria-hidden="true">
          <div className="relative">
            {/* Main tablet frame */}
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-neutral-100 px-4 py-2.5 flex items-center gap-2 border-b border-neutral-200">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 bg-white rounded text-xs text-neutral-400 px-3 py-1 mx-2 border border-neutral-200">
                  matieo.com/memorials
                </div>
              </div>

              {/* App UI */}
              <div className="flex h-64">
                {/* Sidebar */}
                <div className="w-14 bg-brand-secondary flex-shrink-0 flex flex-col items-center pt-5 gap-4">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-6 h-1.5 rounded ${i === 0 ? 'bg-white' : 'bg-white/25'}`}
                    />
                  ))}
                </div>

                {/* Content area */}
                <div className="flex-1 bg-neutral-50 p-4">
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    {[0, 1].map((i) => (
                      <div key={i} className="bg-white rounded-lg p-3 border border-neutral-100">
                        <div className="h-1.5 bg-neutral-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-brand-primaryLight rounded w-1/2 mb-1.5" />
                        <div className="h-1 bg-neutral-100 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bg-blue-100', 'bg-neutral-100', 'bg-blue-50'] as const).map((bg, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-lg overflow-hidden border border-neutral-100"
                      >
                        <div className={`h-14 ${bg}`} />
                        <div className="p-2">
                          <div className="h-1 bg-neutral-200 rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating profile card */}
            <div className="absolute -bottom-5 -right-5 bg-white rounded-xl shadow-lg border border-neutral-100 p-3.5 w-36">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex-shrink-0" />
                <div className="space-y-1">
                  <div className="h-1.5 bg-neutral-200 rounded w-16" />
                  <div className="h-1 bg-neutral-100 rounded w-10" />
                </div>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded mb-1" />
              <div className="h-1.5 bg-brand-primaryLight rounded w-3/4" />
            </div>

            {/* Badge overlay */}
            <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-md border border-neutral-100 p-2.5 flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check size={12} className="text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-neutral-700">{t('landing.hero.memorialPublished')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  const { t } = useTranslation()
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            {t('landing.features.heading')}
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            {t('landing.features.subheading')}
          </p>
        </div>

        {/* 3×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_KEYS.map((key, i) => {
            const Icon = FEATURE_ICONS[i]
            return (
              <div key={key} className="border border-neutral-200 rounded-xl p-6">
                <div className="w-14 h-14 border border-neutral-200 rounded-xl flex items-center justify-center mb-5">
                  <Icon size={28} className="text-neutral-700" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold text-stone-800 mb-3">{t(`landing.features.${key}.title`)}</h3>
                <p className="text-sm text-stone-600 leading-relaxed">{t(`landing.features.${key}.description`)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const { t } = useTranslation()
  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            {t('landing.howItWorks.heading')}
          </h2>
          <p className="text-lg text-slate-500">
            {t('landing.howItWorks.subheading')}
          </p>
        </div>

        {/* 3 tutorial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {HOW_IT_WORKS_KEYS.map((key, i) => {
            const title = t(`landing.howItWorks.${key}.title`)
            return (
              <div key={key}>
                {/* Circular thumbnail */}
                <div className="flex justify-center mb-6">
                  <div
                    className={`relative w-44 h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 rounded-full ${HOW_IT_WORKS_BG[i]} flex items-center justify-center overflow-hidden`}
                  >
                    <button
                      type="button"
                      aria-label={t('landing.howItWorks.playTutorial', { title })}
                      className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center shadow-lg hover:bg-brand-primaryHover transition-colors"
                    >
                      <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-stone-800 mb-2 text-center">{title}</h3>
                <p className="text-sm text-stone-600 leading-relaxed text-center">
                  {t(`landing.howItWorks.${key}.description`)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const { t } = useTranslation()
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            {t('landing.stats.heading')}
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            {t('landing.stats.subheading')}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STAT_KEYS.map((key) => (
            <div key={key} className="border border-neutral-200 rounded-xl p-6 text-center">
              <p className="text-3xl md:text-4xl font-normal text-brand-primary mb-2">
                {t(`landing.stats.${key}.value`)}
              </p>
              <p className="text-sm font-medium text-neutral-900 mb-1">
                {t(`landing.stats.${key}.label`)}
              </p>
              <p className="text-xs text-slate-400">{t(`landing.stats.${key}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const { t } = useTranslation()
  const items = t('landing.testimonials.items', { returnObjects: true }) as Array<{
    quote: string
    name: string
    role: string
  }>
  const initials = ['SC', 'MR', 'ET', 'JP', 'LA', 'DK']

  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-3">
            {t('landing.testimonials.heading')}
          </h2>
          <p className="text-lg text-slate-500">
            {t('landing.testimonials.subheading')}
          </p>
        </div>

        {/* 3×2 testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {items.map(({ quote, name, role }, idx) => (
            <article key={name} className="bg-white rounded-xl border border-neutral-200 p-6">
              {/* 5 stars */}
              <div className="flex gap-1 mb-4" aria-label={t('landing.testimonials.starsLabel')}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} size={16} fill="currentColor" className="text-yellow-400" />
                ))}
              </div>
              {/* Quote */}
              <blockquote className="text-sm text-slate-600 leading-relaxed mb-5">
                {quote}
              </blockquote>
              {/* Author */}
              <footer className="flex items-center gap-3">
                <div
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full bg-brand-primaryLight flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-xs font-semibold text-brand-primary">{initials[idx]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">{name}</p>
                  <p className="text-xs text-slate-400">{role}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>

        {/* Rating summary */}
        <div className="flex items-center justify-center gap-2">
          <Star size={20} fill="currentColor" className="text-yellow-400" aria-hidden="true" />
          <p className="text-sm text-slate-500">{t('landing.testimonials.rating')}</p>
        </div>
      </div>
    </section>
  )
}

function CTASection({
  onCreateMemorial,
  onCreateObituary,
}: {
  onCreateMemorial: () => void
  onCreateObituary: () => void
}) {
  const { t } = useTranslation()
  const ctaItems = ['noFees', 'cancelAnytime', 'getSupport'] as const

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-brand-secondary to-brand-primary py-24">
      {/* Decorative circles matching Figma */}
      <div
        aria-hidden="true"
        className="absolute left-1/4 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-white/5 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute right-1/4 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#8EC5FF]/20 pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white mb-5">
          {t('landing.cta.heading')}
        </h2>
        <p className="text-lg text-blue-100 max-w-xl mx-auto mb-10 leading-relaxed">
          {t('landing.cta.subheading')}
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
          <button
            onClick={onCreateObituary}
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-brand-primary font-medium px-7 py-4 rounded-lg transition-colors"
          >
            {t('landing.cta.createObituary')}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <button
            onClick={onCreateMemorial}
            className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-medium px-7 py-4 rounded-lg transition-colors"
          >
            {t('landing.cta.createMemorial')}
          </button>
        </div>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-blue-100">
          {ctaItems.map((key) => (
            <div key={key} className="flex items-center gap-2">
              <Check size={16} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />
              <span>{t(`landing.cta.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function WaitlistSection() {
  const { t } = useTranslation()
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const { submit, isPending, isSuccess, isError, errorMessage } = useWaitlist()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = nameRef.current?.value.trim() ?? ''
    const email = emailRef.current?.value.trim() ?? ''
    if (name && email) {
      submit({ name, email })
    }
  }

  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="max-w-[672px]">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            {t('landing.waitlist.heading')}
          </h2>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
            {t('landing.waitlist.subheading')}
          </p>

          {isSuccess ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Check size={18} className="text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-neutral-700">
                {t('landing.waitlist.success')}
              </p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div>
                  <label htmlFor="waitlist-name" className="sr-only">
                    {t('landing.waitlist.nameLabel')}
                  </label>
                  <input
                    ref={nameRef}
                    id="waitlist-name"
                    type="text"
                    placeholder={t('landing.waitlist.namePlaceholder')}
                    required
                    disabled={isPending}
                    className="h-[50px] border border-neutral-300 rounded-lg px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white w-full sm:w-56 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label htmlFor="waitlist-email" className="sr-only">
                    {t('landing.waitlist.emailLabel')}
                  </label>
                  <input
                    ref={emailRef}
                    id="waitlist-email"
                    type="email"
                    placeholder={t('landing.waitlist.emailPlaceholder')}
                    required
                    disabled={isPending}
                    className="h-[50px] border border-neutral-300 rounded-lg px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white w-full sm:w-56 disabled:opacity-60"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isPending}
                  className="h-[50px] bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm px-7 rounded-lg transition-colors sm:flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isPending ? t('landing.waitlist.submitting') : t('landing.waitlist.submit')}
                </button>
              </form>
              {isError && errorMessage && (
                <div className="mt-3">
                  <ErrorMessage message={errorMessage} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const navigate = useNavigate()
  const [signInOpen, setSignInOpen] = useState(false)
  const [signInDest, setSignInDest] = useState('/dashboard/memorials/create')

  function handleCreateMemorial() {
    if (user) {
      navigate('/dashboard/memorials/create')
    } else {
      setSignInDest('/dashboard/memorials/create')
      setSignInOpen(true)
    }
  }

  function handleCreateObituary() {
    if (user) {
      navigate('/dashboard/obituary/create')
    } else {
      setSignInDest('/dashboard/obituary/create')
      setSignInOpen(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col dark:bg-neutral-950">
      <Navbar />
      <main className="flex-1">
        <HeroSection onCreateMemorial={handleCreateMemorial} onCreateObituary={handleCreateObituary} />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection onCreateMemorial={handleCreateMemorial} onCreateObituary={handleCreateObituary} />
        {!isLoading && user === null && <WaitlistSection />}
      </main>
      <Footer />
      <SignInModal
        open={signInOpen}
        onOpenChange={setSignInOpen}
        onSuccess={() => navigate(signInDest)}
      />
    </div>
  )
}
