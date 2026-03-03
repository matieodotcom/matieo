import { Link } from 'react-router-dom'
import { Heart, Shield, Users, Zap, Check, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

// ── Data ─────────────────────────────────────────────────────────────────────

const MISSION_PILLARS = [
  {
    label: 'Obituary',
    text: 'We provide families with an elegant obituary editor to share life stories, celebrate milestones, and arrange dignified farewells through beautifully crafted digital obituaries.',
  },
  {
    label: 'Digital Memorials',
    text: 'Our digital memorial platform allows every family to create lasting, vibrant memorial pages and tributes that can be shared and preserved for generations to come.',
  },
  {
    label: 'Funeral Services',
    text: 'We connect families with trusted funeral service providers, offering a comprehensive directory of professional services including venue arrangements and bereavement support.',
  },
  {
    label: 'Insights',
    text: 'We empower researchers and policy-makers with comprehensive mortality data and insights to drive better understanding in public health and demographic trends.',
  },
] as const

const STATS = [
  { value: '50K+', label: 'Obituaries Created' },
  { value: '2.5M+', label: 'Memorials Created' },
  { value: '190+', label: 'Countries Covered' },
  { value: '99.9%', label: 'Uptime' },
] as const

const VALUES = [
  {
    Icon: Heart,
    title: 'Compassion First',
    description:
      'Our commitment to the genuine nature of our work shapes how we approach every interaction and decision we make.',
  },
  {
    Icon: Shield,
    title: 'Accuracy & Integrity',
    description:
      'Our commitment to data accuracy and ethical standards guides everything we do, from the data we collect to the tools we build.',
  },
  {
    Icon: Users,
    title: 'Community Driven',
    description:
      'Our platform evolves around feedback from the families and researchers we serve. Their needs define our roadmap.',
  },
  {
    Icon: Zap,
    title: 'Continuous Innovation',
    description:
      "We're constantly improving our platform to better serve the world's evolving needs in memorial care and mortality research.",
  },
] as const

const MILESTONES = [
  {
    year: '2026',
    label: 'MATIEO Founded',
    description: 'Born from a simple belief that every life deserves to be remembered.',
    filled: false,
  },
  {
    year: 'Today',
    label: 'Growing Worldwide',
    description: 'Serving 50,000+ active users and continuing to innovate for the future.',
    filled: true,
  },
] as const

const TEAM = [
  {
    initials: 'SS',
    name: 'Shariff Saim',
    role: 'Co-founder & Product',
    description:
      'Product designer with a passion for creating meaningful user experiences that put people first, making MATIEO accessible and compassionate for every family.',
    avatarBg: 'bg-blue-500',
  },
  {
    initials: 'AK',
    name: 'Avinash Kumar',
    role: 'Co-founder & Engineering',
    description:
      "Passionate about using technology to drive positive impact, building the technical foundation that powers MATIEO's platform and data infrastructure.",
    avatarBg: 'bg-brand-primary',
  },
] as const

// ── Mission image mockup ──────────────────────────────────────────────────────

function MissionVisual() {
  return (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-neutral-800 to-brand-secondary rounded-2xl overflow-hidden relative">
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="absolute -top-10 -right-10 w-48 h-48 bg-brand-primary/20 rounded-full pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-8 -left-8 w-36 h-36 bg-blue-400/10 rounded-full pointer-events-none"
      />

      {/* Team card grid */}
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
        <p className="text-white/40 text-xs text-center tracking-wide">
          Our team, dedicated to every family
        </p>
      </div>
    </div>
  )
}

// ── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20 text-center">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-brand-primary leading-tight mb-6">
          Building a Better Way to Honor Lives and Understand Mortality
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
          MATIEO was born from a simple belief that every life deserves to be remembered, and that
          mortality data should be accessible, accurate, and meaningful.
        </p>
      </div>
    </section>
  )
}

function MissionSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-xs font-medium text-emerald-700">Our Mission</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-5">
            Honoring Lives Through Comprehensive Memorial and Funeral Services
          </h2>

          <p className="text-base text-slate-500 leading-relaxed mb-7">
            MATIEO is dedicated to creating a comprehensive platform that honors lives through four
            core pillars: dignified obituaries, meaningful digital memorials, compassionate funeral
            services, and powerful insights analytics.
          </p>

          <ul className="space-y-4">
            {MISSION_PILLARS.map(({ label, text }) => (
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

        {/* Visual */}
        <div className="w-full md:w-[440px] lg:w-[480px] flex-shrink-0">
          <MissionVisual />
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="border-t border-b border-neutral-100 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
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
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            Our Values
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
            These core principles guide our decisions and shape our culture.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VALUES.map(({ Icon, title, description }) => (
            <div key={title} className="bg-white rounded-xl border border-neutral-200 p-6">
              <div className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center mb-4">
                <Icon size={18} className="text-brand-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function JourneySection() {
  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            Our Journey
          </h2>
          <p className="text-lg text-slate-500">
            From a simple idea to serving thousands worldwide.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-2xl mx-auto">
          {/* Track */}
          <div
            aria-hidden="true"
            className="absolute top-3 left-0 right-0 h-0.5 bg-neutral-300"
          />
          {/* Progress */}
          <div
            aria-hidden="true"
            className="absolute top-3 left-0 w-[65%] h-0.5 bg-brand-primary"
          />

          <div className="flex justify-between">
            {MILESTONES.map(({ year, label, description, filled }) => (
              <div key={year} className="flex flex-col items-center max-w-[200px]">
                {/* Dot */}
                <div
                  aria-hidden="true"
                  className={`w-6 h-6 rounded-full border-2 z-10 mb-5 ${
                    filled
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
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
            The passionate people behind MATIEO, dedicated to serving our global community.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {TEAM.map(({ initials, name, role, description, avatarBg }) => (
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
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
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
          Get Started Today
        </h2>
        <p className="text-lg text-blue-100 max-w-xl mx-auto mb-10 leading-relaxed">
          Join thousands of families and researchers who trust MATIEO to preserve memories and
          understand life and loss.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-brand-primary font-medium px-7 py-4 rounded-lg transition-colors"
          >
            Create Memorial
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-medium px-7 py-4 rounded-lg transition-colors"
          >
            Create Obituary
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-blue-100">
          {(['No hidden fees', 'Cancel anytime', 'Get support'] as const).map((label) => (
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
