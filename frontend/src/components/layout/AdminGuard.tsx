import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProfile } from '@/hooks/use-profile'

export function AdminGuard() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
  const { data: profile, isLoading: profileLoading } = useProfile()

  if (isLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="h-8 w-8 animate-pulse rounded-full bg-brand-primaryLight" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
