import { Link } from 'react-router-dom'
import { Heart, Shield, Users, Zap, Check, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

// ── Static (non-translatable) data ───────────────────────────────────────────

const STAT_VALUES = ['50K+', '2.5M+', '190+', '99.9%'] as const

const VALUE_ICONS = [Heart, Shield, Users, Zap] as const

const TEAM_EXTRA = [
  { initials: 'SS', avatarBg: 'bg-blue-500' },
  { initials: 'AK', avatarBg: 'bg-brand-primary' },
] as const

const MILESTONE_FILLED = [false, true] as const

// ── Mission image mockup ──────────────────────────────────────────────────────

function MissionVisual({ caption }: { caption: string }) {
  return (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-neutral-800 to-brand-secondary rounded-2xl overflow-hidden relative">
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 w-48 h-48 bg-brand-primary/20 rounded-full pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-8 -left-8 w-36 h-36 bg-blue-400/10 rounded-full pointer-events-none"
      />
      <div className="relative h-full flex flex-col items-center justify-center p-8 gap-5">
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {([0, 1, 2, 3, 4, 5] as const).map((i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20" />
              <div className="h-1.5 bg-white/25 rounded w-full" />
              <div className="h-1 bg-white/15 rounded w-3/4" />
            </div>
          ))}
        </div>
        <p className="text-white/40 text-xs text-center tracking-wide">{caption}</p>
      </div>
    </div>
  )
}

// ── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
  const { t } = useTranslation()
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20 text-center">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-brand-primary leading-tight mb-6">
          {t('about.hero.heading')}
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
          {t('about.hero.subheading')}
        </p>
      </div>
    </section>
  )
}

function MissionSection() {
  const { t } = useTranslation()
  const pillars = t('about.mission.pillars', { returnObjects: true }) as Array<{
    label: string
    text: string
  }>
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-xs font-medium text-emerald-700">{t('about.mission.badge')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-5">
            {t('about.mission.heading')}
          </h2>

          <p className="text-base text-slate-500 leading-relaxed mb-7">
            {t('about.mission.subheading')}
          </p>

          <ul className="space-y-4">
            {pillars.map(({ label, text }) => (
              <li key={label} className="flex items-start gap-3">
                <Check
                  size={16}
                  className="text-emerald-500 mt-0.5 flex-shrink-0"
                  aria-hidden="true"
                />
                <p className="text-sm text-stone-600 leading-relaxed">
                  <span className="font-semibold text-neutral-800">{label}: </span>
                  {text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full md:w-[440px] lg:w-[480px] flex-shrink-0">
          <MissionVisual caption={t('about.mission.teamCaption')} />
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const { t } = useTranslation()
  const stats = t('about.stats', { returnObjects: true }) as Array<{
    value: string
    label: string
  }>
  return (
    <section className="border-t border-b border-neutral-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-4xl md:text-5xl font-normal text-brand-primary mb-2">{value}</p>
              <p className="text-sm font-medium text-neutral-600">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ValuesSection() {
  const { t } = useTranslation()
  const items = t('about.values.items', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            {t('about.values.heading')}
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
            {t('about.values.subheading')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map(({ title, description }, i) => {
            const Icon = VALUE_ICONS[i]
            return (
              <div key={title} className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-brand-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function JourneySection() {
  const { t } = useTranslation()
  const milestones = t('about.journey.milestones', { returnObjects: true }) as Array<{
    year: string
    label: string
    description: string
  }>
  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            {t('about.journey.heading')}
          </h2>
          <p className="text-lg text-slate-500">{t('about.journey.subheading')}</p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div
            aria-hidden="true"
            className="absolute top-3 left-0 right-0 h-0.5 bg-neutral-300"
          />
          <div
            aria-hidden="true"
            className="absolute top-3 left-0 w-[65%] h-0.5 bg-brand-primary"
          />

          <div className="flex justify-between">
            {milestones.map(({ year, label, description }, i) => (
              <div key={year} className="flex flex-col items-center max-w-[200px]">
                <div
                  aria-hidden="true"
                  className={`w-6 h-6 rounded-full border-2 z-10 mb-5 ${
                    MILESTONE_FILLED[i]
                      ? 'bg-brand-primary border-brand-primary'
                      : 'bg-white border-neutral-300'
                  }`}
                />
                <p className="text-sm font-bold text-neutral-900 mb-1">{year}</p>
                <p className="text-xs font-semibold text-brand-primary mb-2">{label}</p>
                <p className="text-xs text-slate-500 text-center leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TeamSection() {
  const { t } = useTranslation()
  const members = t('about.team.members', { returnObjects: true }) as Array<{
    name: string
    role: string
    description: string
  }>
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            {t('about.team.heading')}
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">{t('about.team.subheading')}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {members.map(({ name, role, description }, i) => {
            const { initials, avatarBg } = TEAM_EXTRA[i]
            return (
              <div
                key={name}
                className="bg-white rounded-xl border border-neutral-200 p-8 text-center w-full sm:max-w-xs"
              >
                <div
                  className={`w-20 h-20 rounded-full ${avatarBg} flex items-center justify-center mx-auto mb-5`}
                >
                  <span className="text-white text-2xl font-bold">{initials}</span>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">{name}</h3>
                <p className="text-sm text-brand-primary font-medium mb-4">{role}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  const { t } = useTranslation()
  const perks = [
    t('landing.cta.noFees'),
    t('landing.cta.cancelAnytime'),
    t('landing.cta.getSupport'),
  ]
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-brand-secondary to-brand-primary py-24">
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
          {t('about.cta.heading')}
        </h2>
        <p className="text-lg text-blue-100 max-w-xl mx-auto mb-10 leading-relaxed">
          {t('about.cta.subheading')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-brand-primary font-medium px-7 py-4 rounded-lg transition-colors"
          >
            {t('about.cta.createMemorial')}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-medium px-7 py-4 rounded-lg transition-colors"
          >
            {t('about.cta.createObituary')}
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-blue-100">
          {perks.map((label) => (
            <div key={label} className="flex items-center gap-2">
              <Check size={16} className="text-emerald-400 flex-shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <MissionSection />
        <StatsSection />
        <ValuesSection />
        <JourneySection />
        <TeamSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
