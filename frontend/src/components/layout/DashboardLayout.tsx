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
        {/* Sidebar — collapses to icon-only strip, never fully hidden */}
        <aside
          className={[
            'flex-shrink-0 bg-white border-r border-neutral-100 overflow-hidden',
            'transition-[width] duration-300 ease-in-out',
            isOpen ? 'w-64' : 'w-16',
          ].join(' ')}
        >
          <div className="w-full h-full flex flex-col py-4">
            {/* Section label — fade out when collapsed */}
            <p
              className={[
                'px-6 pb-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-widest whitespace-nowrap',
                'transition-opacity duration-200',
                isOpen ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            >
              Navigate
            </p>
            <nav aria-label="Dashboard navigation" className="flex-1 px-2">
              <ul className="flex flex-col gap-0.5 list-none">
                {SIDEBAR_LINKS.map(({ label, to, icon: Icon }) => (
                  <li key={label}>
                    <NavLink
                      to={to}
                      title={label}
                      className={({ isActive }) =>
                        [
                          'flex items-center py-3 text-sm transition-colors rounded-xl overflow-hidden',
                          isActive
                            ? 'bg-brand-primaryLight text-brand-primary font-semibold'
                            : 'text-neutral-600 font-medium hover:bg-neutral-50 hover:text-neutral-900',
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
