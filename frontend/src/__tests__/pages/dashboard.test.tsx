import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import DashboardPage from '@/pages/app/DashboardPage'
import { useAuthStore } from '@/store/authStore'
import { mockUser, mockProfile } from '@/__tests__/utils'
import type { User } from '@supabase/supabase-js'

vi.mock('@/hooks/use-profile', () => ({
  useProfile: vi.fn(),
}))

import { useProfile } from '@/hooks/use-profile'

function renderDashboard() {
  return renderWithProviders(<DashboardPage />)
}

describe('DashboardPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: mockUser() as unknown as User,
      session: {} as never,
      isLoading: false,
    })
    vi.mocked(useProfile).mockReturnValue({
      data: mockProfile() as never,
      isLoading: false,
      error: null,
    } as never)
    vi.clearAllMocks()
  })

  it('renders "Welcome back" in heading', () => {
    renderDashboard()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/welcome back/i)
  })

  it('renders first name from user metadata', () => {
    renderDashboard()
    // mockUser full_name is "Test User" → first name "Test"
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Test')
  })

  it('renders "Create Memorial" card', () => {
    renderDashboard()
    expect(screen.getByText('Create Memorial')).toBeInTheDocument()
  })

  it('renders "Browse Memorials" card', () => {
    renderDashboard()
    expect(screen.getByText('Browse Memorials')).toBeInTheDocument()
  })

  it('renders "Insights" card', () => {
    renderDashboard()
    expect(screen.getByText('Insights')).toBeInTheDocument()
  })

  it('hides "Services" card for individual users', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: mockProfile({ account_type: 'individual' }) as never,
      isLoading: false,
      error: null,
    } as never)
    renderDashboard()
    expect(screen.queryByText('Services')).not.toBeInTheDocument()
  })

  it('shows "Services" card for organization users', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: mockProfile({ account_type: 'organization' }) as never,
      isLoading: false,
      error: null,
    } as never)
    renderDashboard()
    expect(screen.getByText('Services')).toBeInTheDocument()
  })

  it('hides "Services" card while profile is loading', () => {
    vi.mocked(useProfile).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)
    renderDashboard()
    expect(screen.queryByText('Services')).not.toBeInTheDocument()
  })
})
