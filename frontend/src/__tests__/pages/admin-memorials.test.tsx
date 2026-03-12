import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import AdminMemorialsPage from '@/pages/admin/AdminMemorialsPage'

vi.mock('@/hooks/use-admin', () => ({
  useAdminMemorials:         vi.fn(),
  useAdminSetMemorialStatus: vi.fn(),
  useAdminDeleteMemorial:    vi.fn(),
}))

import { useAdminMemorials, useAdminSetMemorialStatus, useAdminDeleteMemorial } from '@/hooks/use-admin'

const mockPaginated = (items: unknown[]) => ({
  data: { items, total: items.length, page: 1, limit: 20 },
})

const memorial1 = {
  id: 'm-1',
  full_name: 'John Doe',
  status: 'published',
  created_at: '2024-01-01T00:00:00Z',
  slug: 'john-doe-2024',
  creator_name: 'Test User',
}

const memorial2 = {
  id: 'm-2',
  full_name: 'Jane Smith',
  status: 'draft',
  created_at: '2024-02-01T00:00:00Z',
  slug: null,
  creator_name: null,
}

describe('AdminMemorialsPage', () => {
  beforeEach(() => {
    vi.mocked(useAdminMemorials).mockReturnValue({
      data: mockPaginated([memorial1, memorial2]) as never,
      isLoading: false,
      error: null,
    } as never)
    vi.mocked(useAdminSetMemorialStatus).mockReturnValue({ mutate: vi.fn() } as never)
    vi.mocked(useAdminDeleteMemorial).mockReturnValue({ mutate: vi.fn() } as never)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminMemorialsPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Memorials')
  })

  it('renders memorial rows', () => {
    renderWithProviders(<AdminMemorialsPage />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('renders status badges', () => {
    renderWithProviders(<AdminMemorialsPage />)
    expect(screen.getByText('published')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('renders Unpublish button for published memorial', () => {
    renderWithProviders(<AdminMemorialsPage />)
    expect(screen.getByText('Unpublish')).toBeInTheDocument()
  })

  it('renders Publish button for draft memorial', () => {
    renderWithProviders(<AdminMemorialsPage />)
    expect(screen.getByText('Publish')).toBeInTheDocument()
  })

  it('renders delete buttons', () => {
    renderWithProviders(<AdminMemorialsPage />)
    expect(screen.getAllByRole('button', { name: /delete memorial/i })).toHaveLength(2)
  })

  it('renders loading skeletons', () => {
    vi.mocked(useAdminMemorials).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)
    const { container } = renderWithProviders(<AdminMemorialsPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders empty state', () => {
    vi.mocked(useAdminMemorials).mockReturnValue({
      data: mockPaginated([]) as never,
      isLoading: false,
      error: null,
    } as never)
    renderWithProviders(<AdminMemorialsPage />)
    expect(screen.getByText('No memorials found.')).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(useAdminMemorials).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
    } as never)
    renderWithProviders(<AdminMemorialsPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load memorials/i)
  })
})
