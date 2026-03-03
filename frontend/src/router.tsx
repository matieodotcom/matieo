import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/landing/LandingPage'
import FeaturesPage from '@/pages/features/FeaturesPage'
import AboutPage from '@/pages/about/AboutPage'
import TermsPage from '@/pages/legal/TermsPage'
import PrivacyPage from '@/pages/legal/PrivacyPage'
import ViewMemorialsPage from '@/pages/app/ViewMemorialsPage'
import SignInPage from '@/pages/auth/SignInPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

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
    element: <SignInPage />,
  },
  {
    path: '/signup',
    element: <SignUpPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  // Features
  {
    path: '/features',
    element: <FeaturesPage />,
  },

  // About
  {
    path: '/about',
    element: <AboutPage />,
  },

  // Legal
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/privacy',
    element: <PrivacyPage />,
  },

  // Public memorial browsing + individual pages
  {
    path: '/memorials',
    element: <ViewMemorialsPage />,
  },
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
