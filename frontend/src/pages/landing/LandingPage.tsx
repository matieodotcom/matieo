import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
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
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    Icon: FileText,
    title: 'Obituary',
    description:
      'Create an Obituary to honor your loved one. Share their story, celebrate their life, and leave a lasting tribute for friends and family to cherish.',
  },
  {
    Icon: Heart,
    title: 'Digital Memorials',
    description:
      'Create beautiful, lasting tributes for your loved ones. Share memories, photos, and stories with family and friends worldwide.',
  },
  {
    Icon: Building2,
    title: 'Funeral Services',
    description:
      'Connect with trusted funeral service providers for arrangements, locations, and community support during a difficult time.',
  },
  {
    Icon: BarChart3,
    title: 'Insights',
    description:
      'Powerful visualization tools help you understand trends, patterns, and insights from mortality data.',
  },
  {
    Icon: Shield,
    title: 'Privacy & Security',
    description:
      'Your data is protected with enterprise-grade encryption. We never share your information without your consent.',
  },
  {
    Icon: Users,
    title: 'Community Support',
    description:
      'Join thousands of families and researchers. Share experiences, find support, and contribute to our collective knowledge.',
  },
] as const

const HOW_IT_WORKS = [
  {
    title: 'Memorials',
    description:
      'Discover how to build a beautiful digital memorial to preserve cherished memories.',
    bgClass: 'bg-gradient-to-br from-rose-100 to-rose-200',
  },
  {
    title: 'Obituary',
    description:
      "Learn how to create a meaningful obituary that honors your loved one's life and legacy.",
    bgClass: 'bg-gradient-to-br from-stone-200 to-stone-300',
  },
  {
    title: 'Insights',
    description:
      'Explore powerful analytics tools that provide comprehensive mortality insights and research.',
    bgClass: 'bg-gradient-to-br from-neutral-700 to-neutral-900',
  },
] as const

const STATS = [
  { value: '500K+', label: 'Obituaries Created', description: 'Honoring lives with meaningful tributes' },
  { value: '2.5M+', label: 'Digital Memorials', description: 'Preserving memories for generations' },
  { value: '1B+', label: 'Insights', description: 'Comprehensive mortality insights' },
  { value: '99.9%', label: 'User Satisfaction', description: 'Trusted by most families' },
] as const

const TESTIMONIALS = [
  {
    quote:
      '"MATIEO\'s comprehensive database has been invaluable for our mortality research. The depth of data and ease of access has significantly accelerated our work."',
    name: 'Dr. Sarah Chen',
    role: 'Disease Researcher',
    initials: 'SC',
  },
  {
    quote:
      '"Creating a memorial for my father was a beautiful experience. The platform made it easy to share memories and connect with family across the world."',
    name: 'Michael Rodriguez',
    role: 'Family Member',
    initials: 'MR',
  },
  {
    quote:
      '"The historical data and search capabilities are outstanding. I\'ve been able to trace family histories spanning multiple generations with remarkable ease."',
    name: 'Emma Thompson',
    role: 'Genealogist',
    initials: 'ET',
  },
  {
    quote:
      '"We use MATIEO for our hospital system\'s reporting needs. The real-time data and intuitive dashboard have transformed how we analyze patient outcomes."',
    name: 'Jordan Park',
    role: 'Healthcare Administrator',
    initials: 'JP',
  },
  {
    quote:
      '"The support we received during a difficult time was exceptional. MATIEO truly understands the needs of grieving families and provides thoughtful tools."',
    name: 'Lisa Anderson',
    role: 'Family Member',
    initials: 'LA',
  },
  {
    quote:
      '"The API integration was seamless, and the data quality is consistently excellent. Our analytics platform has greatly benefited from this partnership."',
    name: 'David Kim',
    role: 'Data Engineer',
    initials: 'DK',
  },
] as const

// ── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
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

      <div className="relative max-w-6xl mx-auto px-8 py-20 flex items-center gap-16 w-full">
        {/* Left column */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50/80 border border-brand-primaryLight rounded-full mb-7">
            <span
              aria-hidden="true"
              className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"
            />
            <span className="text-sm text-brand-secondary font-medium">
              Trusted by 30,000+ Families
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl font-normal leading-tight text-brand-primary mb-6">
            Honoring Lives,
            <br />
            Preserving
            <br />
            Memories
          </h1>

          {/* Description */}
          <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-[480px]">
            We help families and loved ones to create dignified obituaries and digital memorials,
            preserving stories, photos, and tributes—while respectfully contributing to broader
            insights that help us understand life and loss.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 mb-10">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm px-7 py-3.5 rounded-lg transition-colors"
            >
              Create Memorial
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 font-medium text-sm px-7 py-3.5 rounded-lg transition-colors"
            >
              Create Obituary
            </Link>
          </div>

          {/* Social proof stats */}
          <div className="flex items-center gap-6" aria-label="Platform stats">
            <div>
              <p className="text-xl font-semibold text-brand-secondary">24/7</p>
              <p className="text-sm text-neutral-500">Support</p>
            </div>
            <div aria-hidden="true" className="w-px h-10 bg-neutral-200" />
            <div>
              <p className="text-xl font-semibold text-brand-secondary">100%</p>
              <p className="text-sm text-neutral-500">Secure</p>
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
                  matieo.com/app/memorials
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
              <span className="text-xs font-medium text-neutral-700">Memorial Published</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-neutral-900 mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Create heartfelt Obituaries, preserve memories with Digital Memorials, and explore
            comprehensive Insights—all in one powerful platform.
          </p>
        </div>

        {/* 3×2 grid */}
        <div className="grid grid-cols-3 gap-6">
          {FEATURES.map(({ Icon, title, description }) => (
            <div key={title} className="border border-neutral-200 rounded-xl p-6">
              <div className="w-14 h-14 border border-neutral-200 rounded-xl flex items-center justify-center mb-5">
                <Icon size={28} className="text-neutral-700" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-3">{title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorksSection() {
  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-neutral-900 mb-4">How It Works</h2>
          <p className="text-lg text-slate-500">
            Watch our step-by-step video guides to learn how to use MATIEO's powerful features.
          </p>
        </div>

        {/* 3 tutorial cards */}
        <div className="grid grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ title, description, bgClass }) => (
            <div key={title}>
              {/* Circular thumbnail */}
              <div className="flex justify-center mb-6">
                <div
                  className={`relative w-64 h-64 rounded-full ${bgClass} flex items-center justify-center overflow-hidden`}
                >
                  <button
                    type="button"
                    aria-label={`Play ${title} tutorial`}
                    className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center shadow-lg hover:bg-brand-primaryHover transition-colors"
                  >
                    <Play size={16} className="text-white ml-0.5" fill="currentColor" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2 text-center">{title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed text-center">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-neutral-900 mb-4">Trusted by Thousands</h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
            Our platform serves families, researchers, and organizations with reliable data and
            compassionate services.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-6">
          {STATS.map(({ value, label, description }) => (
            <div key={label} className="border border-neutral-200 rounded-xl p-6 text-center">
              <p className="text-4xl font-normal text-brand-primary mb-2">{value}</p>
              <p className="text-sm font-medium text-neutral-900 mb-1">{label}</p>
              <p className="text-xs text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-neutral-900 mb-3">What Our Users Say</h2>
          <p className="text-lg text-slate-500">
            Join thousands of satisfied families, researchers, and organizations who trust MATIEO.
          </p>
        </div>

        {/* 3×2 testimonial grid */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          {TESTIMONIALS.map(({ quote, name, role, initials }) => (
            <article key={name} className="bg-white rounded-xl border border-neutral-200 p-6">
              {/* 5 stars */}
              <div className="flex gap-1 mb-4" aria-label="5 out of 5 stars">
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
                  <span className="text-xs font-semibold text-brand-primary">{initials}</span>
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
          <p className="text-sm text-slate-500">4.9 out of 5 stars from 12,000+ reviews</p>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
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

      <div className="relative max-w-6xl mx-auto px-8 text-center">
        <h2 className="text-4xl font-normal text-white mb-5">Get Started Today</h2>
        <p className="text-lg text-blue-100 max-w-xl mx-auto mb-10 leading-relaxed">
          Create meaningful Obituaries, build lasting Digital Memorials, Funeral Services &amp;
          connect with loved ones, and explore powerful Insights—all in one platform.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-white hover:bg-blue-50 text-brand-primary font-medium px-7 py-4 rounded-lg transition-colors"
          >
            Create Obituary
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-medium px-7 py-4 rounded-lg transition-colors"
          >
            Create Memorial
          </Link>
        </div>

        {/* Trust signals */}
        <div className="flex items-center justify-center gap-8 text-sm text-blue-100">
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

function WaitlistSection() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-8">
        <div className="max-w-[672px]">
          <h2 className="text-4xl font-normal text-neutral-900 mb-4">
            Not Ready To Sign Up Yet?
          </h2>
          <p className="text-lg text-slate-500 mb-8 leading-relaxed">
            Stay connected with us! Follow our journey and get updates on new features, stories,
            and insights delivered to your email.
          </p>

          {submitted ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Check size={18} className="text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-neutral-700">
                You&apos;re in! We&apos;ll keep you updated on MATIEO news.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <div>
                <label htmlFor="waitlist-name" className="sr-only">
                  Your name
                </label>
                <input
                  id="waitlist-name"
                  type="text"
                  placeholder="Enter your name"
                  required
                  className="h-[50px] border border-neutral-300 rounded-lg px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white w-56"
                />
              </div>
              <div>
                <label htmlFor="waitlist-email" className="sr-only">
                  Your email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="h-[50px] border border-neutral-300 rounded-lg px-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent bg-white w-56"
                />
              </div>
              <button
                type="submit"
                className="h-[50px] bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm px-7 rounded-lg transition-colors flex-shrink-0"
              >
                Follow Us
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  )
}
