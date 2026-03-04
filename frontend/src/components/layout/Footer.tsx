import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

const FOOTER_LINKS = {
  Product: [
    { label: 'Memorials', to: '/memorials' },
    { label: 'Obituary', to: '/obituary' },
    { label: 'Insights', to: '/insights' },
    { label: 'Pricing', to: '/pricing' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Blog', to: '/blog' },
    { label: 'Careers', to: '/careers' },
    { label: 'Contact', to: '/contact' },
  ],
  Resources: [
    { label: 'Documentation', to: '/docs' },
    { label: 'API', to: '/api' },
    { label: 'Support', to: '/support' },
    { label: 'Privacy', to: '/privacy' },
  ],
} as const

const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '#' },
] as const

const SOCIAL_LINKS = [
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: Twitter, href: '#', label: 'Twitter' },
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Linkedin, href: '#', label: 'LinkedIn' },
] as const

export function Footer() {
  return (
    <footer className="bg-brand-secondary">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-8">
        {/* Top — brand + link columns */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 pb-12 border-b border-white/10">
          {/* Brand column */}
          <div className="w-full md:w-[280px] md:flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <img src="/logo.png" alt="" className="w-8 h-8" aria-hidden="true" />
              <span className="text-white font-bold text-lg tracking-tight">MATIEO</span>
            </Link>
            <p className="text-sm text-[#99A1AF] leading-relaxed mb-6 max-w-[300px]">
              We help families and loved ones to create dignified obituaries and digital
              memorials, preserving stories, photos, and tributes that honor their legacy.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-[#1E2939] flex items-center justify-center text-[#99A1AF] hover:text-white hover:bg-[#2a3546] transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            {(Object.entries(FOOTER_LINKS) as [string, readonly { label: string; to: string }[]][]).map(
              ([column, links]) => (
                <div key={column}>
                  <h3 className="text-white text-sm font-semibold mb-5">{column}</h3>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="text-sm text-[#99A1AF] hover:text-white transition-colors"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-8">
          <p className="text-sm text-[#99A1AF]">© 2026 MATIEO. All rights reserved.</p>
          <div className="flex flex-wrap gap-4 md:gap-6">
            {LEGAL_LINKS.map(({ label, to }) => (
              <Link key={label} to={to} className="text-sm text-[#99A1AF] hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
