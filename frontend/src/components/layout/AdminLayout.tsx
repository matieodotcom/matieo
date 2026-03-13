import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Heart,
  ScrollText,
  MessageCircle,
  MessageSquare,
  Mail,
  Briefcase,
  Menu,
  Moon,
  Sun,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSignOut } from '@/hooks/use-auth'
import { useThemeStore } from '@/store/themeStore'
import { UserAvatar } from '@/components/ui/Avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu'

const ADMIN_NAV_LINKS = [
  { label: 'Overview',     to: '/admin',             icon: LayoutDashboard },
  { label: 'Users',        to: '/admin/users',       icon: Users           },
  { label: 'Memorials',    to: '/admin/memorials',   icon: Heart           },
  { label: 'Obituaries',   to: '/admin/obituaries',  icon: ScrollText      },
  { label: 'Tributes',     to: '/admin/tributes',    icon: MessageCircle   },
  { label: 'Condolences',  to: '/admin/condolences', icon: MessageSquare   },
  { label: 'Waitlist',          to: '/admin/waitlist',            icon: Mail      },
  { label: 'Service Categories', to: '/admin/service-categories', icon: Briefcase },
] as const

export function AdminLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const { signOut } = useSignOut()
  const isDark = useThemeStore((s) => s.isDark)
  const toggle = useThemeStore((s) => s.toggle)
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    if (window.matchMedia('(max-width: 1023px)').matches) {
      setIsOpen(false)
    }
  }, [pathname])

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? ''
  const avatarUrl = (user?.user_metadata?.avatar_url as string | undefined) ?? null

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0 z-50 relative">
        {/* Left: toggle */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
            className="text-neutral-600 dark:text-neutral-400 hover:text-brand-primary dark:hover:text-brand-primary p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Centre: MATIEO logo + Admin badge */}
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt="" className="w-8 h-8" aria-hidden="true" />
          <span className="text-brand-secondary dark:text-white font-bold text-lg tracking-tight">MATIEO</span>
          <span className="text-xs font-semibold bg-brand-primary text-white px-2 py-0.5 rounded-full">Admin</span>
        </Link>

        {/* Right: user avatar dropdown */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="User menu"
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-neutral-900"
              >
                <UserAvatar src={avatarUrl} name={displayName} size="md" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to="/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={signOut}>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile backdrop */}
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
        <aside
          className={[
            'fixed top-16 bottom-0 left-0 z-40 w-64',
            'lg:relative lg:inset-auto lg:z-auto',
            'flex-shrink-0 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 overflow-hidden',
            'transition-transform duration-300 ease-in-out lg:transition-[width]',
            isOpen
              ? 'translate-x-0 lg:w-64'
              : '-translate-x-full lg:w-16 lg:translate-x-0',
          ].join(' ')}
        >
          <div className="w-full h-full flex flex-col py-4">
            <p
              className={[
                'px-6 pb-3 text-[11px] font-semibold text-neutral-400 dark:text-neutral-600 uppercase tracking-widest whitespace-nowrap',
                'transition-opacity duration-200',
                isOpen ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            >
              Admin
            </p>

            <nav aria-label="Admin navigation" className="flex-1 px-2 overflow-y-auto">
              <ul className="flex flex-col gap-0.5 list-none">
                {ADMIN_NAV_LINKS.map(({ label, to, icon: Icon }) => (
                  <li key={label}>
                    <NavLink
                      to={to}
                      end={to === '/admin'}
                      title={label}
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
                        {label}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Dark mode toggle */}
            <div className="px-2 pt-2 mt-auto">
              <div className="mx-1 mb-2 h-px bg-neutral-100 dark:bg-neutral-800" />
              <button
                onClick={toggle}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
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
                  {isDark ? 'Light mode' : 'Dark mode'}
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
