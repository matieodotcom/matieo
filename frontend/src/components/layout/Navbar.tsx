import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useSignOut } from '@/hooks/use-auth'
import { UserAvatar } from '@/components/ui/Avatar'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu'

const NAV_LINK_KEYS = [
  { key: 'nav.memorials', to: '/memorials' },
  { key: 'nav.obituary', to: '/obituary' },
  { key: 'nav.insights', to: '/insights' },
  { key: 'nav.features', to: '/features' },
  { key: 'nav.pricing', to: '/pricing' },
  { key: 'nav.about', to: '/about' },
] as const

const DASHBOARD_LINK_KEY = { key: 'nav.dashboard', to: '/dashboard' } as const

function AuthActions() {
  const { t } = useTranslation()
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { signOut } = useSignOut()

  if (isLoading) return <div className="w-24" />

  if (user) {
    const displayName = user.user_metadata?.full_name ?? user.email ?? ''
    const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null

    return (
      <div className="flex items-center gap-2">
        <LanguageSwitcher compact />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label={t('nav.userMenu')}
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
            >
              <UserAvatar src={avatarUrl} name={displayName} size="md" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/settings">{t('nav.profile')}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">{t('nav.settings')}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut}>{t('nav.signOut')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <LanguageSwitcher compact />
      <Link
        to="/signin"
        className="text-sm text-stone-600 dark:text-neutral-400 font-medium hover:text-brand-primary transition-colors"
      >
        {t('nav.signIn')}
      </Link>
      <Link
        to="/signup"
        className="bg-brand-primary hover:bg-brand-primaryHover text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {t('nav.signUp')}
      </Link>
    </div>
  )
}

export function Navbar() {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = useAuthStore((s) => s.user)

  const visibleLinkKeys = user ? [DASHBOARD_LINK_KEY, ...NAV_LINK_KEYS] : [...NAV_LINK_KEYS]

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-neutral-900">
      <header className="border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Left side: hamburger (mobile only) + logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden text-neutral-600 dark:text-neutral-400 hover:text-brand-primary p-1 transition-colors"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img src="/logo.png" alt="" className="w-8 h-8" aria-hidden="true" />
              <span className="text-brand-secondary dark:text-white font-bold text-lg tracking-tight">MATIEO</span>
            </Link>
          </div>

          {/* Nav links — desktop */}
          <nav aria-label="Main navigation">
            <ul className="hidden md:flex items-center gap-8 list-none">
              {visibleLinkKeys.map((link) => (
                <li key={link.key}>
                  <NavLink
                    to={link.to}
                    end
                    className={({ isActive }) =>
                      `text-sm transition-colors ${
                        isActive
                          ? 'text-brand-primary font-medium'
                          : 'text-stone-600 dark:text-neutral-400 hover:text-brand-primary'
                      }`
                    }
                  >
                    {t(link.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right side: auth actions */}
          <AuthActions />
        </div>
      </header>

      {/* Mobile nav panel */}
      {isMenuOpen && (
        <div id="mobile-nav" className="md:hidden border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <nav aria-label="Mobile navigation">
            <ul className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1 list-none">
              {visibleLinkKeys.map((link) => (
                <li key={link.key}>
                  <NavLink
                    to={link.to}
                    end
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `block py-2 text-sm transition-colors ${
                        isActive
                          ? 'text-brand-primary font-medium'
                          : 'text-stone-600 dark:text-neutral-400 hover:text-brand-primary'
                      }`
                    }
                  >
                    {t(link.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
