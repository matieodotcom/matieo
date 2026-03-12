import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import AdminObituariesPage from '@/pages/admin/AdminObituariesPage'

vi.mock('@/hooks/use-admin', () => ({
  useAdminObituaries:         vi.fn(),
  useAdminSetObituaryStatus:  vi.fn(),
  useAdminDeleteObituary:     vi.fn(),
}))

import { useAdminObituaries, useAdminSetObituaryStatus, useAdminDeleteObituary } from '@/hooks/use-admin'

const mockPaginated = (items: unknown[]) => ({
  data: { items, total: items.length, page: 1, limit: 20 },
})

const obit1 = {
  id: 'o-1',
  full_name: 'Mary Johnson',
  status: 'published',
  created_at: '2024-01-01T00:00:00Z',
  slug: 'mary-johnson-2024',
}

const obit2 = {
  id: 'o-2',
  full_name: 'Tom Brown',
  status: 'draft',
  created_at: '2024-02-01T00:00:00Z',
  slug: null,
}

describe('AdminObituariesPage', () => {
  beforeEach(() => {
    vi.mocked(useAdminObituaries).mockReturnValue({
      data: mockPaginated([obit1, obit2]) as never,
      isLoading: false,
      error: null,
    } as never)
    vi.mocked(useAdminSetObituaryStatus).mockReturnValue({ mutate: vi.fn() } as never)
    vi.mocked(useAdminDeleteObituary).mockReturnValue({ mutate: vi.fn() } as never)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminObituariesPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Obituaries')
  })

  it('renders obituary rows', () => {
    renderWithProviders(<AdminObituariesPage />)
    expect(screen.getByText('Mary Johnson')).toBeInTheDocument()
    expect(screen.getByText('Tom Brown')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    renderWithProviders(<AdminObituariesPage />)
    expect(screen.getByText('published')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('renders Unpublish button for published obituary', () => {
    renderWithProviders(<AdminObituariesPage />)
    expect(screen.getByText('Unpublish')).toBeInTheDocument()
  })

  it('renders Publish button for draft obituary', () => {
    renderWithProviders(<AdminObituariesPage />)
    expect(screen.getByText('Publish')).toBeInTheDocument()
  })

  it('renders delete buttons', () => {
    renderWithProviders(<AdminObituariesPage />)
    expect(screen.getAllByRole('button', { name: /delete obituary/i })).toHaveLength(2)
  })

  it('renders loading skeletons', () => {
    vi.mocked(useAdminObituaries).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)
    const { container } = renderWithProviders(<AdminObituariesPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders empty state', () => {
    vi.mocked(useAdminObituaries).mockReturnValue({
      data: mockPaginated([]) as never,
      isLoading: false,
      error: null,
    } as never)
    renderWithProviders(<AdminObituariesPage />)
    expect(screen.getByText('No obituaries found.')).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(useAdminObituaries).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
    } as never)
    renderWithProviders(<AdminObituariesPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load obituaries/i)
  })
})
