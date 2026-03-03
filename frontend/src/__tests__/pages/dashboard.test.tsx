import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import DashboardPage from '@/pages/app/DashboardPage'
import { useAuthStore } from '@/store/authStore'
import { mockUser } from '@/__tests__/utils'
import type { User } from '@supabase/supabase-js'

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

  it('renders "Services" card', () => {
    renderDashboard()
    expect(screen.getByText('Services')).toBeInTheDocument()
  })
})
