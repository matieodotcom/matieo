import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/landing/LandingPage'

// ── Placeholder page component ───────────────────────────────────────────────
function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-brand-secondary">{name}</h1>
        <p className="mt-2 text-sm text-neutral-400">Page not yet implemented</p>
      </div>
    </div>
  )
}

// ── Routes ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // Public
  {
    path: '/',
    element: <LandingPage />,
  },

  // Auth
  {
    path: '/signin',
    element: <Placeholder name="Sign In" />,
  },
  {
    path: '/signup',
    element: <Placeholder name="Sign Up" />,
  },
  {
    path: '/forgot-password',
    element: <Placeholder name="Forgot Password" />,
  },

  // Public memorial
  {
    path: '/memorial/:slug',
    element: <Placeholder name="Public Memorial" />,
  },

  // App (authenticated)
  {
    path: '/app',
    element: <Navigate to="/app/analytics" replace />,
  },
  {
    path: '/app/analytics',
    element: <Placeholder name="Analytics Dashboard" />,
  },
  {
    path: '/app/memorials',
    element: <Placeholder name="View Memorials" />,
  },
  {
    path: '/app/memorials/create',
    element: <Placeholder name="Create Memorial" />,
  },
  {
    path: '/app/memorials/:id/edit',
    element: <Placeholder name="Edit Memorial" />,
  },
  {
    path: '/app/settings',
    element: <Placeholder name="Settings" />,
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
