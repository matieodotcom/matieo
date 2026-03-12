import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import AdminCondolencesPage from '@/pages/admin/AdminCondolencesPage'

vi.mock('@/hooks/use-admin', () => ({
  useAdminCondolences:      vi.fn(),
  useAdminDeleteCondolence: vi.fn(),
}))

import { useAdminCondolences, useAdminDeleteCondolence } from '@/hooks/use-admin'

const mockPaginated = (items: unknown[]) => ({
  data: { items, total: items.length, page: 1, limit: 20 },
})

const cond1 = {
  id: 'c-1',
  obituary_id: 'obit-abc',
  author_name: 'Grace Lee',
  message: 'Our deepest condolences to the family.',
  created_at: '2024-01-01T00:00:00Z',
}

const cond2 = {
  id: 'c-2',
  obituary_id: 'obit-xyz',
  author_name: null,
  message: 'Sending love and strength.',
  created_at: '2024-02-01T00:00:00Z',
}

describe('AdminCondolencesPage', () => {
  beforeEach(() => {
    vi.mocked(useAdminCondolences).mockReturnValue({
      data: mockPaginated([cond1, cond2]) as never,
      isLoading: false,
      error: null,
    } as never)
    vi.mocked(useAdminDeleteCondolence).mockReturnValue({ mutate: vi.fn() } as never)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminCondolencesPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Condolences')
  })

  it('renders column headers', () => {
    renderWithProviders(<AdminCondolencesPage />)
    expect(screen.getByText('Author')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()
    expect(screen.getByText('Obituary ID')).toBeInTheDocument()
  })

  it('renders condolence rows', () => {
    renderWithProviders(<AdminCondolencesPage />)
    expect(screen.getByText('Grace Lee')).toBeInTheDocument()
    expect(screen.getByText('Anonymous')).toBeInTheDocument()
    expect(screen.getByText('Our deepest condolences to the family.')).toBeInTheDocument()
  })

  it('renders obituary IDs', () => {
    renderWithProviders(<AdminCondolencesPage />)
    expect(screen.getByText('obit-abc')).toBeInTheDocument()
  })

  it('renders delete buttons', () => {
    renderWithProviders(<AdminCondolencesPage />)
    expect(screen.getAllByRole('button', { name: /delete condolence/i })).toHaveLength(2)
  })

  it('renders loading skeletons', () => {
    vi.mocked(useAdminCondolences).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)
    const { container } = renderWithProviders(<AdminCondolencesPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders empty state', () => {
    vi.mocked(useAdminCondolences).mockReturnValue({
      data: mockPaginated([]) as never,
      isLoading: false,
      error: null,
    } as never)
    renderWithProviders(<AdminCondolencesPage />)
    expect(screen.getByText('No condolences found.')).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(useAdminCondolences).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
    } as never)
    renderWithProviders(<AdminCondolencesPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load condolences/i)
  })
})
