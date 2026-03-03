import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSignOut } from '@/hooks/use-auth'
import { UserAvatar } from '@/components/ui/Avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu'

const NAV_LINKS = [
  { label: 'Memorials', to: '/memorials' },
  { label: 'Obituary', to: '/obituary' },
  { label: 'Insights', to: '/app/analytics' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
] as const

function AuthActions() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { signOut } = useSignOut()

  if (isLoading) return <div className="w-24" />

  if (user) {
    const displayName = user.user_metadata?.full_name ?? user.email ?? ''
    const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null

    return (
      <div className="flex items-center gap-4">
        <Link
          to="/app/dashboard"
          className="text-sm font-medium text-stone-600 hover:text-brand-primary transition-colors"
        >
          Dashboard
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="User menu"
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
            >
              <UserAvatar src={avatarUrl} name={displayName} size="md" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem asChild>
              <Link to="/app/settings">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut}>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
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
  )
}

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const user = useAuthStore((s) => s.user)

  return (
    <div className="sticky top-0 z-50 bg-white">
      <header className="border-b border-neutral-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Left side: hamburger (mobile only) + logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden text-neutral-600 hover:text-brand-primary p-1 transition-colors"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold tracking-tight">M</span>
              </div>
              <span className="text-brand-secondary font-bold text-lg tracking-tight">MATIEO</span>
            </Link>
          </div>

          {/* Nav links — desktop */}
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

          {/* Right side: auth actions */}
          <AuthActions />
        </div>
      </header>

      {/* Mobile nav panel */}
      {isMenuOpen && (
        <div id="mobile-nav" className="md:hidden border-b border-neutral-100 bg-white">
          <nav aria-label="Mobile navigation">
            <ul className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1 list-none">
              {user && (
                <li>
                  <Link
                    to="/app/dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-stone-600 hover:text-brand-primary transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
              )}
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2 text-sm text-stone-600 hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
