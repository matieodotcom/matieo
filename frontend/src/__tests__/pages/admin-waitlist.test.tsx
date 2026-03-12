import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import AdminWaitlistPage from '@/pages/admin/AdminWaitlistPage'

vi.mock('@/hooks/use-admin', () => ({
  useAdminWaitlist: vi.fn(),
}))

import { useAdminWaitlist } from '@/hooks/use-admin'

const mockPaginated = (items: unknown[]) => ({
  data: { items, total: items.length, page: 1, limit: 20 },
})

const entry1 = {
  id: 'w-1',
  email: 'alice@example.com',
  name: 'Alice',
  subscribed_at: '2024-01-01T00:00:00Z',
}

const entry2 = {
  id: 'w-2',
  email: 'bob@example.com',
  name: null,
  subscribed_at: '2024-02-01T00:00:00Z',
}

describe('AdminWaitlistPage', () => {
  beforeEach(() => {
    vi.mocked(useAdminWaitlist).mockReturnValue({
      data: mockPaginated([entry1, entry2]) as never,
      isLoading: false,
      error: null,
    } as never)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminWaitlistPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Waitlist')
  })

  it('renders column headers', () => {
    renderWithProviders(<AdminWaitlistPage />)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Joined')).toBeInTheDocument()
  })

  it('renders waitlist entries', () => {
    renderWithProviders(<AdminWaitlistPage />)
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders em dash for null name', () => {
    renderWithProviders(<AdminWaitlistPage />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders total count', () => {
    renderWithProviders(<AdminWaitlistPage />)
    expect(screen.getByText(/2 entries total/i)).toBeInTheDocument()
  })

  it('renders no total count when empty', () => {
    vi.mocked(useAdminWaitlist).mockReturnValue({
      data: mockPaginated([]) as never,
      isLoading: false,
      error: null,
    } as never)
    renderWithProviders(<AdminWaitlistPage />)
    expect(screen.queryByText(/entries total/i)).not.toBeInTheDocument()
  })

  it('renders loading skeletons', () => {
    vi.mocked(useAdminWaitlist).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)
    const { container } = renderWithProviders(<AdminWaitlistPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders empty state', () => {
    vi.mocked(useAdminWaitlist).mockReturnValue({
      data: mockPaginated([]) as never,
      isLoading: false,
      error: null,
    } as never)
    renderWithProviders(<AdminWaitlistPage />)
    expect(screen.getByText('No waitlist entries found.')).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(useAdminWaitlist).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
    } as never)
    renderWithProviders(<AdminWaitlistPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load waitlist/i)
  })
})
