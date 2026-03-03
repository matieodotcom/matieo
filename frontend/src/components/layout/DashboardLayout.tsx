import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import { ArrowLeft, BarChart2, Heart, ScrollText, Briefcase, Menu } from 'lucide-react'
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

const SIDEBAR_LINKS = [
  { label: 'Insights',  to: '/dashboard/insights',  icon: BarChart2  },
  { label: 'Memorials', to: '/dashboard/memorials', icon: Heart      },
  { label: 'Obituary',  to: '/dashboard/obituary',  icon: ScrollText },
  { label: 'Services',  to: '/dashboard/services',  icon: Briefcase  },
] as const

export function DashboardLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { signOut } = useSignOut()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
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
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-neutral-100 flex-shrink-0">
        {/* Left: toggle + home */}
        <div className="flex items-center gap-4">
          <button
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
            className="text-neutral-600 hover:text-brand-primary p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary"
          >
            <Menu size={20} />
          </button>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-brand-primary transition-colors"
          >
            <ArrowLeft size={15} />
            Home
          </Link>
        </div>

        {/* Centre: MATIEO logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">M</span>
          </div>
          <span className="text-brand-secondary font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        {/* Right: user avatar dropdown */}
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
              <Link to="/settings">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={signOut}>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Body: push sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Collapsible sidebar — width transitions so main collapses alongside it */}
        <aside
          className={[
            'flex-shrink-0 bg-white border-r border-neutral-100 overflow-hidden',
            'transition-[width] duration-300 ease-in-out',
            isOpen ? 'w-64' : 'w-0',
          ].join(' ')}
        >
          {/* Inner div always holds the full w-64 so content doesn't compress */}
          <div className="w-64 h-full flex flex-col py-4">
            <p className="px-6 pb-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">
              Navigate
            </p>
            <nav aria-label="Dashboard navigation" className="flex-1 px-3">
              <ul className="flex flex-col gap-0.5 list-none">
                {SIDEBAR_LINKS.map(({ label, to, icon: Icon }) => (
                  <li key={label}>
                    <NavLink
                      to={to}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        [
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors',
                          isActive
                            ? 'bg-brand-primaryLight text-brand-primary font-semibold'
                            : 'text-neutral-600 font-medium hover:bg-neutral-50 hover:text-neutral-900',
                        ].join(' ')
                      }
                    >
                      <Icon size={18} aria-hidden="true" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main — flex-1 fills remaining space as sidebar opens/closes */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
