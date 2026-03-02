import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Memorials', to: '/app/memorials' },
  { label: 'Obituary', to: '/obituary' },
  { label: 'Insights', to: '/app/analytics' },
  { label: 'Features', to: '/#features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
] as const

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-100">
      <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">M</span>
          </div>
          <span className="text-brand-secondary font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        {/* Nav links */}
        <nav aria-label="Main navigation">
          <ul className="hidden md:flex items-center gap-8 list-none">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  className="text-sm text-stone-600 hover:text-brand-primary transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-4">
          <Link
            to="/signin"
            className="text-sm text-stone-600 font-medium hover:text-brand-primary transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  )
}
