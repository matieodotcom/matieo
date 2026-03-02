import { Link } from 'react-router-dom'
import {
  FileText,
  Heart,
  BarChart3,
  Building2,
  Globe,
  Search,
  Shield,
  Smartphone,
  Code2,
  Cloud,
  Check,
  ArrowRight,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

// ── Data ─────────────────────────────────────────────────────────────────────

const MAIN_FEATURES = [
  {
    Icon: FileText,
    title: 'Obituary Management',
    description:
      'Create, manage, and share meaningful obituaries with our intuitive platform designed to honor lives and preserve legacies.',
    bullets: [
      'Easy-to-use obituary editor',
      'Professional print-ready layouts',
      'Multimedia photo integration',
      'Nationwide publishing options',
    ],
    reverse: false,
  },
  {
    Icon: Heart,
    title: 'Digital Memorials',
    description:
      'Create beautiful, lasting tributes for your loved ones. Share memories, photos, and stories with family and friends worldwide.',
    bullets: [
      'Customizable memorial pages',
      'Photo and video galleries',
      'Guest book and condolences',
      'Privacy controls and sharing options',
    ],
    reverse: true,
  },
  {
    Icon: BarChart3,
    title: 'Advanced Insights',
    description:
      'Powerful visualization and analysis tools to understand mortality data and patterns across demographics and regions.',
    bullets: [
      'Interactive charts and graphs',
      'Trend analysis and forecasting',
      'Demographic breakdowns',
      'Comparative analysis across regions',
    ],
    reverse: false,
  },
  {
    Icon: Building2,
    title: 'Funeral Services',
    description:
      'Connect with trusted funeral service providers and make comfortable arrangements during this most difficult time. Our comprehensive network helps you find compassionate care and support.',
    bullets: [
      'Verified local service providers',
      'Complete online arrangement planning',
      'Direct connections with funeral directors',
      'Grief support and bereavement resources',
    ],
    reverse: true,
  },
] as const

const MORE_FEATURES = [
  { Icon: Globe, title: 'Global Coverage', description: 'Data spanning countries and regions worldwide' },
  { Icon: Search, title: 'Advanced Search', description: 'Powerful search across all memorial records' },
  { Icon: Shield, title: 'Privacy First', description: 'Enterprise-grade security protecting your data' },
  { Icon: Smartphone, title: 'Mobile-Friendly', description: 'Full-featured experience on any device' },
  { Icon: Code2, title: 'API Integration', description: 'Connect your systems with our robust API' },
  { Icon: Cloud, title: 'Cloud Storage', description: 'Secure, reliable storage for all your media' },
] as const

// ── Feature image mockups ─────────────────────────────────────────────────────

function ObituaryVisual() {
  return (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-md border border-neutral-100 p-5 w-full max-w-xs">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-neutral-100">
          <div className="w-7 h-7 rounded-lg bg-brand-primaryLight flex items-center justify-center flex-shrink-0">
            <FileText size={13} className="text-brand-primary" />
          </div>
          <div className="space-y-1.5">
            <div className="h-2 bg-neutral-800 rounded w-28" />
            <div className="h-1.5 bg-neutral-200 rounded w-16" />
          </div>
        </div>
        <div className="space-y-1.5 mb-3">
          {([100, 90, 75, 100, 85] as const).map((w, i) => (
            <div key={i} className="h-1.5 bg-neutral-200 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="h-16 bg-neutral-100 rounded-lg mb-3 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-neutral-200" />
        </div>
        <div className="space-y-1.5">
          {([90, 70] as const).map((w, i) => (
            <div key={i} className="h-1.5 bg-neutral-200 rounded" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MemorialsVisual() {
  return (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-blue-50 to-brand-primaryLight/60 rounded-2xl flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-md border border-neutral-100 overflow-hidden w-full max-w-xs">
        <div className="h-20 bg-gradient-to-r from-brand-primary to-blue-400 relative">
          <div className="absolute -bottom-4 left-4 w-10 h-10 rounded-full border-2 border-white bg-brand-primaryLight shadow-md" />
        </div>
        <div className="pt-7 px-4 pb-4">
          <div className="h-2.5 bg-neutral-800 rounded w-28 mb-1.5" />
          <div className="h-1.5 bg-neutral-300 rounded w-20 mb-3" />
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {(['bg-blue-100', 'bg-neutral-100', 'bg-brand-primaryLight'] as const).map((bg, i) => (
              <div key={i} className={`${bg} rounded-lg h-12`} />
            ))}
          </div>
          <div className="h-6 bg-brand-primaryLight rounded-lg flex items-center justify-center">
            <div className="h-1.5 bg-brand-primary/30 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

function InsightsVisual() {
  const BAR_HEIGHTS = [40, 65, 45, 80, 55, 90, 70] as const
  return (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-neutral-800 to-brand-secondary rounded-2xl flex items-center justify-center p-8">
      <div className="bg-white/10 rounded-xl border border-white/20 p-4 w-full max-w-xs">
        <div className="flex items-end gap-1.5 h-24 mb-3 px-1">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t"
              style={{
                height: `${h}%`,
                backgroundColor: i === 5 ? '#3B5BFF' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
        <div className="flex gap-1 mb-3">
          {([0, 1, 2, 3, 4, 5, 6] as const).map((i) => (
            <div key={i} className="h-1.5 bg-white/20 rounded flex-1" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['↑ 12%', '2.5M', '99.9%'] as const).map((val, i) => (
            <div key={i} className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-white text-xs font-semibold">{val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FuneralVisual() {
  return (
    <div className="w-full aspect-[4/3] bg-gradient-to-br from-rose-50 to-stone-100 rounded-2xl flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-md border border-neutral-100 p-5 w-full max-w-xs">
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-rose-400" />
          </div>
          <div>
            <div className="h-2 bg-neutral-800 rounded w-24 mb-1.5" />
            <div className="h-1.5 bg-neutral-200 rounded w-16" />
          </div>
        </div>
        {([80, 65, 75] as const).map((w, i) => (
          <div key={i} className="flex items-center gap-2 mb-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <div className="h-1.5 bg-neutral-200 rounded" style={{ width: `${w}%` }} />
          </div>
        ))}
        <div className="h-7 bg-brand-primaryLight rounded-lg mt-3 flex items-center justify-center">
          <div className="h-1.5 bg-brand-primary/30 rounded w-20" />
        </div>
      </div>
    </div>
  )
}

const FEATURE_VISUALS = [ObituaryVisual, MemorialsVisual, InsightsVisual, FuneralVisual]

// ── Sections ─────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <section className="bg-gradient-to-b from-blue-50 to-white py-20 text-center">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primaryLight border border-brand-primaryLight rounded-full mb-6">
          <span className="text-sm text-brand-primary font-medium">All Features</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-brand-primary leading-tight mb-6">
          Powerful Features for Every Need
        </h1>
        <p className="text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
          From comprehensive mortality insights to complete memorial options, MATIEO provides
          everything you need in one compassionate platform.
        </p>
      </div>
    </section>
  )
}

function MainFeaturesSection() {
  return (
    <section className="bg-white">
      {MAIN_FEATURES.map(({ Icon, title, description, bullets, reverse }, index) => {
        const Visual = FEATURE_VISUALS[index]
        return (
          <div key={title} className={`py-16 md:py-24 ${index > 0 ? 'border-t border-neutral-100' : ''}`}>
            <div
              className={`max-w-6xl mx-auto px-4 md:px-8 flex flex-col ${
                reverse ? 'md:flex-row-reverse' : 'md:flex-row'
              } items-center gap-10 lg:gap-20`}
            >
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-neutral-200 mb-5">
                  <Icon size={22} className="text-neutral-700" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-neutral-900 mb-4">{title}</h2>
                <p className="text-base text-slate-500 leading-relaxed mb-6">{description}</p>
                <ul className="space-y-3">
                  {bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <Check
                        size={16}
                        className="text-emerald-500 mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-stone-600">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual */}
              <div className="w-full md:w-[440px] lg:w-[500px] flex-shrink-0">
                <Visual />
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}

function MoreFeaturesSection() {
  return (
    <section className="py-24 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-neutral-900 mb-4">
            And Much More
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            Discover all the features that make MATIEO your most comprehensive platform for
            mortality insights and memorial creation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MORE_FEATURES.map(({ Icon, title, description }) => (
            <div key={title} className="bg-white rounded-xl border border-neutral-200 p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-neutral-700" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-1">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
              </div>
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
          Join thousands of families, researchers, and organizations who trust MATIEO to preserve
          memories and understand life and loss.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
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
            Learn More
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

export default function FeaturesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <MainFeaturesSection />
        <MoreFeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
