import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@supabase/supabase-js'

const mockUser = {
  id: 'test-user-id',
  email: 'test@matieo.com',
  user_metadata: { full_name: 'Jane Smith', avatar_url: null },
} as unknown as User

function renderLayout(initialRoute = '/app/dashboard') {
  return renderWithProviders(<DashboardLayout />, { initialRoute })
}

describe('DashboardLayout — authenticated', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, session: {} as never, isLoading: false })
    vi.clearAllMocks()
  })

  it('renders all sidebar labels', () => {
    renderLayout()
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getByText('Memorials')).toBeInTheDocument()
    expect(screen.getByText('Obituary')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
  })

  it('renders Home back link', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
  })

  it('renders user avatar button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
  })

  it('Insights sidebar link points to /app/dashboard/insights', () => {
    renderLayout()
    const link = screen.getByRole('link', { name: /insights/i })
    expect(link).toHaveAttribute('href', '/app/dashboard/insights')
  })

  it('Memorials sidebar link points to /app/dashboard/memorials', () => {
    renderLayout()
    const link = screen.getByRole('link', { name: /memorials/i })
    expect(link).toHaveAttribute('href', '/app/dashboard/memorials')
  })

  it('Obituary sidebar link points to /app/dashboard/obituary', () => {
    renderLayout()
    const link = screen.getByRole('link', { name: /obituary/i })
    expect(link).toHaveAttribute('href', '/app/dashboard/obituary')
  })

  it('Services sidebar link points to /app/dashboard/services', () => {
    renderLayout()
    const link = screen.getByRole('link', { name: /services/i })
    expect(link).toHaveAttribute('href', '/app/dashboard/services')
  })
})

describe('DashboardLayout — unauthenticated', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    vi.clearAllMocks()
  })

  it('redirects to /signin when not authenticated', () => {
    renderLayout()
    // After redirect the sidebar content should not be visible
    expect(screen.queryByRole('navigation', { name: /dashboard navigation/i })).not.toBeInTheDocument()
  })
})
