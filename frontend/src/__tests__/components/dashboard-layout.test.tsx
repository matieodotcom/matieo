import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@supabase/supabase-js'

const mockUser = {
  id: 'test-user-id',
  email: 'test@matieo.com',
  user_metadata: { full_name: 'Jane Smith', avatar_url: null },
} as unknown as User

function renderLayout(initialRoute = '/dashboard') {
  return renderWithProviders(<DashboardLayout />, { initialRoute })
}

describe('DashboardLayout — authenticated', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, session: {} as never, isLoading: false })
    vi.clearAllMocks()
  })

  it('renders "Toggle navigation" button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: 'Toggle navigation' })).toBeInTheDocument()
  })

  it('toggle button starts collapsed (aria-expanded false)', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: 'Toggle navigation' }))
      .toHaveAttribute('aria-expanded', 'false')
  })

  it('clicking toggle sets aria-expanded to true', async () => {
    renderLayout()
    await userEvent.click(screen.getByRole('button', { name: 'Toggle navigation' }))
    expect(screen.getByRole('button', { name: 'Toggle navigation' }))
      .toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking toggle again collapses sidebar (aria-expanded false)', async () => {
    renderLayout()
    const btn = screen.getByRole('button', { name: 'Toggle navigation' })
    await userEvent.click(btn)
    await userEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('renders Home back link', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
  })

  it('renders user avatar button', () => {
    renderLayout()
    expect(screen.getByRole('button', { name: /user menu/i })).toBeInTheDocument()
  })

  it('renders all nav labels in the sidebar', () => {
    renderLayout()
    expect(screen.getByText('Insights')).toBeInTheDocument()
    expect(screen.getByText('Memorials')).toBeInTheDocument()
    expect(screen.getByText('Obituary')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
  })

  it('Insights link points to /dashboard/insights', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /insights/i }))
      .toHaveAttribute('href', '/dashboard/insights')
  })

  it('Memorials link points to /dashboard/memorials', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /memorials/i }))
      .toHaveAttribute('href', '/dashboard/memorials')
  })

  it('Obituary link points to /dashboard/obituary', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /obituary/i }))
      .toHaveAttribute('href', '/dashboard/obituary')
  })

  it('Services link points to /dashboard/services', () => {
    renderLayout()
    expect(screen.getByRole('link', { name: /services/i }))
      .toHaveAttribute('href', '/dashboard/services')
  })
})

describe('DashboardLayout — unauthenticated', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    vi.clearAllMocks()
  })

  it('redirects to /signin when not authenticated', () => {
    renderLayout()
    expect(screen.queryByRole('button', { name: 'Toggle navigation' })).not.toBeInTheDocument()
  })
})
