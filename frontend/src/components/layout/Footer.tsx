import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const SOCIAL_LINKS = [
  { key: 'facebook' as const, Icon: Facebook, href: '#' },
  { key: 'twitter' as const, Icon: Twitter, href: '#' },
  { key: 'instagram' as const, Icon: Instagram, href: '#' },
  { key: 'linkedin' as const, Icon: Linkedin, href: '#' },
]

export function Footer() {
  const { t } = useTranslation()

  const FOOTER_COLUMNS = [
    {
      heading: t('footer.columns.product'),
      links: [
        { label: t('footer.product.memorials'), to: '/memorials' },
        { label: t('footer.product.obituary'), to: '/obituary' },
        { label: t('footer.product.insights'), to: '/insights' },
        { label: t('footer.product.pricing'), to: '/pricing' },
      ],
    },
    {
      heading: t('footer.columns.company'),
      links: [
        { label: t('footer.company.about'), to: '/about' },
        { label: t('footer.company.blog'), to: '/blog' },
        { label: t('footer.company.careers'), to: '/careers' },
        { label: t('footer.company.contact'), to: '/contact' },
      ],
    },
    {
      heading: t('footer.columns.resources'),
      links: [
        { label: t('footer.resources.documentation'), to: '/docs' },
        { label: t('footer.resources.api'), to: '/api' },
        { label: t('footer.resources.support'), to: '/support' },
        { label: t('footer.resources.privacy'), to: '/privacy' },
      ],
    },
  ]

  const LEGAL_LINKS = [
    { label: t('footer.legal.privacyPolicy'), to: '/privacy' },
    { label: t('footer.legal.termsOfService'), to: '/terms' },
    { label: t('footer.legal.cookiePolicy'), to: '/cookie-policy' },
  ]

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
              {t('footer.tagline')}
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ key, Icon, href }) => (
                <a
                  key={key}
                  href={href}
                  aria-label={t(`footer.social.${key}`)}
                  className="w-10 h-10 rounded-full bg-[#1E2939] flex items-center justify-center text-[#99A1AF] hover:text-white hover:bg-[#2a3546] transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
            {FOOTER_COLUMNS.map(({ heading, links }) => (
              <div key={heading}>
                <h3 className="text-white text-sm font-semibold mb-5">{heading}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.to}>
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
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-8">
          <p className="text-sm text-[#99A1AF]">{t('footer.copyright')}</p>
          <div className="flex flex-wrap gap-4 md:gap-6">
            {LEGAL_LINKS.map(({ label, to }) => (
              <Link key={to} to={to} className="text-sm text-[#99A1AF] hover:text-white transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
