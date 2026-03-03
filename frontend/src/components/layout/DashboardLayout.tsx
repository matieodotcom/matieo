import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import { ArrowLeft, BarChart2, Heart, ScrollText, Briefcase } from 'lucide-react'
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
  { label: 'Insights',  to: '/app/dashboard/insights',  icon: BarChart2  },
  { label: 'Memorials', to: '/app/dashboard/memorials', icon: Heart      },
  { label: 'Obituary',  to: '/app/dashboard/obituary',  icon: ScrollText },
  { label: 'Services',  to: '/app/dashboard/services',  icon: Briefcase  },
] as const

export function DashboardLayout() {
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
        {/* Left: Home back link */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={16} />
          Home
        </Link>

        {/* Centre: MATIEO logo */}
        <Link to="/app/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-tight">M</span>
          </div>
          <span className="text-brand-secondary font-bold text-lg tracking-tight">MATIEO</span>
        </Link>

        {/* Right: User avatar dropdown */}
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
      </header>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 h-full bg-white border-r border-neutral-100 pt-6 flex flex-col flex-shrink-0">
          <nav aria-label="Dashboard navigation">
            <ul className="flex flex-col gap-1 list-none px-0">
              {SIDEBAR_LINKS.map(({ label, to, icon: Icon }) => (
                <li key={label}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      [
                        'flex items-center gap-3 px-4 py-2.5 mx-3 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-brand-primaryLight text-brand-primary font-medium'
                          : 'text-neutral-600 hover:bg-neutral-50',
                      ].join(' ')
                    }
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
