import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import LandingPage from '@/pages/landing/LandingPage'
import FeaturesPage from '@/pages/features/FeaturesPage'
import AboutPage from '@/pages/about/AboutPage'
import InsightsPage from '@/pages/public/InsightsPage'
import ObituaryPage from '@/pages/public/ObituaryPage'
import PricingPage from '@/pages/public/PricingPage'
import TermsPage from '@/pages/legal/TermsPage'
import PrivacyPage from '@/pages/legal/PrivacyPage'
import ViewMemorialsPage from '@/pages/app/ViewMemorialsPage'
import SignInPage from '@/pages/auth/SignInPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import DashboardPage from '@/pages/app/DashboardPage'
import MyMemorialsPage from '@/pages/app/MyMemorialsPage'
import CreateMemorialPage from '@/pages/app/CreateMemorialPage'
import MemorialPreviewPage from '@/pages/app/MemorialPreviewPage'
import PublicMemorialPage from '@/pages/public/PublicMemorialPage'

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
  {
    element: <ScrollToTop />,
    children: [
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

      // Public Insights, Obituary, Pricing
      {
        path: '/insights',
        element: <InsightsPage />,
      },
      {
        path: '/obituary',
        element: <ObituaryPage />,
      },
      {
        path: '/pricing',
        element: <PricingPage />,
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
        element: <PublicMemorialPage />,
      },

      // Authenticated
      {
        path: '/dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true,                     element: <DashboardPage /> },
          { path: 'insights',                element: <Placeholder name="Insights" /> },
          { path: 'memorials',               element: <MyMemorialsPage /> },
          { path: 'memorials/create',        element: <CreateMemorialPage /> },
          { path: 'memorials/:id/edit',      element: <CreateMemorialPage /> },
          { path: 'memorials/preview',       element: <MemorialPreviewPage /> },
          { path: 'obituary',                element: <Placeholder name="Obituary" /> },
          { path: 'services',                element: <Placeholder name="Services" /> },
        ],
      },
      {
        path: '/settings',
        element: <Placeholder name="Settings" />,
      },

      // Fallback
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
