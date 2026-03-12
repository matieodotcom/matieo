import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import AdminTributesPage from '@/pages/admin/AdminTributesPage'

vi.mock('@/hooks/use-admin', () => ({
  useAdminTributes:      vi.fn(),
  useAdminDeleteTribute: vi.fn(),
}))

import { useAdminTributes, useAdminDeleteTribute } from '@/hooks/use-admin'

const mockPaginated = (items: unknown[]) => ({
  data: { items, total: items.length, page: 1, limit: 20 },
})

const tribute1 = {
  id: 't-1',
  memorial_id: 'mem-abc',
  author_name: 'Sarah Connor',
  content: 'A wonderful person who touched many lives.',
  created_at: '2024-01-01T00:00:00Z',
}

const tribute2 = {
  id: 't-2',
  memorial_id: 'mem-xyz',
  author_name: null,
  content: 'Rest in peace.',
  created_at: '2024-02-01T00:00:00Z',
}

describe('AdminTributesPage', () => {
  beforeEach(() => {
    vi.mocked(useAdminTributes).mockReturnValue({
      data: mockPaginated([tribute1, tribute2]) as never,
      isLoading: false,
      error: null,
    } as never)
    vi.mocked(useAdminDeleteTribute).mockReturnValue({ mutate: vi.fn() } as never)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminTributesPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Tributes')
  })

  it('renders column headers', () => {
    renderWithProviders(<AdminTributesPage />)
    expect(screen.getByText('Author')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Memorial ID')).toBeInTheDocument()
  })

  it('renders tribute rows', () => {
    renderWithProviders(<AdminTributesPage />)
    expect(screen.getByText('Sarah Connor')).toBeInTheDocument()
    expect(screen.getByText('Anonymous')).toBeInTheDocument()
    expect(screen.getByText('A wonderful person who touched many lives.')).toBeInTheDocument()
  })

  it('renders memorial IDs', () => {
    renderWithProviders(<AdminTributesPage />)
    expect(screen.getByText('mem-abc')).toBeInTheDocument()
  })

  it('renders delete buttons', () => {
    renderWithProviders(<AdminTributesPage />)
    expect(screen.getAllByRole('button', { name: /delete tribute/i })).toHaveLength(2)
  })

  it('renders loading skeletons', () => {
    vi.mocked(useAdminTributes).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)
    const { container } = renderWithProviders(<AdminTributesPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders empty state', () => {
    vi.mocked(useAdminTributes).mockReturnValue({
      data: mockPaginated([]) as never,
      isLoading: false,
      error: null,
    } as never)
    renderWithProviders(<AdminTributesPage />)
    expect(screen.getByText('No tributes found.')).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(useAdminTributes).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
    } as never)
    renderWithProviders(<AdminTributesPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load tributes/i)
  })
})
