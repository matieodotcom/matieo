import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage'

vi.mock('@/hooks/use-admin', () => ({
  useAdminStats: vi.fn(),
}))

import { useAdminStats } from '@/hooks/use-admin'

const mockStats = {
  data: {
    users:       { total: 120, admins: 3, researchers: 15 },
    memorials:   { total: 80, published: 60, draft: 20 },
    obituaries:  { total: 45, published: 30, draft: 15 },
    tributes:    { total: 200 },
    condolences: { total: 150 },
    waitlist:    { total: 500 },
  },
}

describe('AdminOverviewPage', () => {
  beforeEach(() => {
    vi.mocked(useAdminStats).mockReturnValue({
      data: mockStats as never,
      isLoading: false,
      error: null,
    } as never)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminOverviewPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Overview')
  })

  it('renders 6 stat labels', () => {
    renderWithProviders(<AdminOverviewPage />)
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Memorials')).toBeInTheDocument()
    expect(screen.getByText('Obituaries')).toBeInTheDocument()
    expect(screen.getByText('Tributes')).toBeInTheDocument()
    expect(screen.getByText('Condolences')).toBeInTheDocument()
    expect(screen.getByText('Waitlist')).toBeInTheDocument()
  })

  it('renders total counts', () => {
    renderWithProviders(<AdminOverviewPage />)
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('renders sub-stats (admins, researchers)', () => {
    renderWithProviders(<AdminOverviewPage />)
    expect(screen.getByText('admins')).toBeInTheDocument()
    expect(screen.getByText('researchers')).toBeInTheDocument()
  })

  it('renders loading skeletons when isLoading', () => {
    vi.mocked(useAdminStats).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)
    const { container } = renderWithProviders(<AdminOverviewPage />)
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(6)
  })

  it('renders error message on failure', () => {
    vi.mocked(useAdminStats).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
    } as never)
    renderWithProviders(<AdminOverviewPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load stats/i)
  })
})
