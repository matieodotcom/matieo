import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart2, Heart, ScrollText, Briefcase, Menu, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/store/authStore'
import { useSignOut } from '@/hooks/use-auth'
import { useThemeStore } from '@/store/themeStore'
import { UserAvatar } from '@/components/ui/Avatar'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu'

const SIDEBAR_LINK_KEYS = [
  { key: 'sidebar.insights',  to: '/dashboard/insights',  icon: BarChart2  },
  { key: 'sidebar.memorials', to: '/dashboard/memorials', icon: Heart      },
  { key: 'sidebar.obituary',  to: '/dashboard/obituary',  icon: ScrollText },
  { key: 'sidebar.services',  to: '/dashboard/services',  icon: Briefcase  },
] as const

export function DashboardLayout() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { signOut } = useSignOut()
  const isDark = useThemeStore((s) => s.isDark)
  const toggle = useThemeStore((s) => s.toggle)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isPreview =
    pathname === '/dashboard/memorials/preview' ||
    pathname === '/dashboard/obituary/preview'
  const isCreateOrEdit =
    pathname === '/dashboard/memorials/create' ||
    /^\/dashboard\/memorials\/[^/]+\/edit$/.test(pathname)
  const isObituaryCreateOrEdit =
    pathname === '/dashboard/obituary/create' ||
    /^\/dashboard\/obituary\/[^/]+\/edit$/.test(pathname)
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  // Close drawer on mobile when navigating
  useEffect(() => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setIsOpen(false)
    }
  }, [pathname])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="h-8 w-8 animate-pulse rounded-full bg-brand-primaryLight" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  const displayName = user.user_metadata?.full_name ?? user.email ?? ''
  const avatarUrl = (user.user_metadata?.avatar_url as string | undefined) ?? null

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0 z-50 relative">
        {/* Left: toggle + back link */}
        <div className="flex items-center gap-3">
          <button
            aria-label={t('layout.toggleNav')}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
            className="text-neutral-600 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <Menu size={20} />
          </button>
          {isPreview ? (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">{t('layout.backToEditing')}</span>
            </button>
          ) : isCreateOrEdit ? (
            <Link
              to="/dashboard/memorials"
              className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">{t('layout.myMemorials')}</span>
            </Link>
          ) : isObituaryCreateOrEdit ? (
            <Link
              to="/dashboard/obituary"
              className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">{t('layout.myObituaries')}</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">{t('layout.home')}</span>
            </Link>
          )}
        </div>

        {/* Centre: MATIEO logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-8 h-8" aria-hidden="true" />
          <span className="text-brand-secondary dark:text-white font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        {/* Right: language switcher + user avatar dropdown */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={t('nav.userMenu')}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
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
      </header>

      {/* Mobile backdrop — closes drawer on outside tap */}
      {isOpen && (
        <div
          data-testid="sidebar-backdrop"
          className="fixed inset-0 z-30 bg-neutral-950/50 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar
            Mobile/tablet : fixed overlay drawer (slides in from left, z-40)
            Desktop (lg+) : inline push sidebar (width transition) */}
        <aside
          className={[
            // Mobile: fixed overlay below the header
            'fixed top-16 bottom-0 left-0 z-40 w-64',
            // Desktop: back to normal inline flow
            'lg:relative lg:inset-auto lg:z-auto',
            'flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 overflow-hidden',
            // Mobile uses translate; desktop uses width
            'transition-transform duration-300 ease-in-out lg:transition-[width]',
            isOpen
              ? 'translate-x-0 lg:w-64'
              : '-translate-x-full lg:w-16 lg:translate-x-0',
          ].join(' ')}
        >
          <div className="w-full h-full flex flex-col py-4">
            {/* Section label — fade out when collapsed */}
            <p
              className={[
                'px-6 pb-3 text-[11px] font-semibold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest whitespace-nowrap',
                'transition-opacity duration-200',
                isOpen ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            >
              {t('layout.navigate')}
            </p>

            <nav aria-label="Dashboard navigation" className="flex-1 px-2 overflow-y-auto">
              <ul className="flex flex-col gap-0.5 list-none">
                {SIDEBAR_LINK_KEYS.map(({ key, to, icon: Icon }) => (
                  <li key={key}>
                    <NavLink
                      to={to}
                      title={t(key)}
                      className={({ isActive }) =>
                        [
                          'flex items-center py-3 text-sm transition-colors rounded-xl overflow-hidden',
                          isActive
                            ? 'bg-brand-primaryLight dark:bg-brand-primary/20 text-brand-primary font-semibold'
                            : 'text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100',
                        ].join(' ')
                      }
                    >
                      <span className="w-12 flex-shrink-0 flex items-center justify-center">
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span
                        className={[
                          'whitespace-nowrap pr-4 transition-opacity duration-200',
                          isOpen ? 'opacity-100' : 'opacity-0',
                        ].join(' ')}
                      >
                        {t(key)}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Dark mode toggle — bottom of sidebar */}
            <div className="px-2 pt-2 mt-auto">
              <div className="mx-1 mb-2 h-px bg-neutral-100 dark:bg-neutral-800" />
              <button
                onClick={toggle}
                title={isDark ? t('layout.switchToLight') : t('layout.switchToDark')}
                className="flex items-center py-3 w-full text-sm transition-colors rounded-xl overflow-hidden text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <span className="w-12 flex-shrink-0 flex items-center justify-center">
                  {isDark
                    ? <Sun size={18} aria-hidden="true" />
                    : <Moon size={18} aria-hidden="true" />}
                </span>
                <span
                  className={[
                    'whitespace-nowrap pr-4 transition-opacity duration-200',
                    isOpen ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                >
                  {isDark ? t('layout.lightMode') : t('layout.darkMode')}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
