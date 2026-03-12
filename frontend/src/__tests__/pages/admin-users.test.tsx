import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'

vi.mock('@/hooks/use-admin', () => ({
  useAdminUsers:       vi.fn(),
  useAdminSetUserRole: vi.fn(),
}))

import { useAdminUsers, useAdminSetUserRole } from '@/hooks/use-admin'

const mockPaginated = (items: unknown[]) => ({
  data: { items, total: items.length, page: 1, limit: 20 },
})

const user1 = {
  id: 'u-1',
  full_name: 'Alice Admin',
  email: 'alice@example.com',
  role: 'admin',
  account_type: 'individual',
  created_at: '2024-01-01T00:00:00Z',
}

const user2 = {
  id: 'u-2',
  full_name: 'Bob User',
  email: 'bob@example.com',
  role: 'user',
  account_type: 'organization',
  created_at: '2024-02-01T00:00:00Z',
}

describe('AdminUsersPage', () => {
  beforeEach(() => {
    vi.mocked(useAdminUsers).mockReturnValue({
      data: mockPaginated([user1, user2]) as never,
      isLoading: false,
      error: null,
    } as never)
    vi.mocked(useAdminSetUserRole).mockReturnValue({
      mutate: vi.fn(),
    } as never)
  })

  it('renders page heading', () => {
    renderWithProviders(<AdminUsersPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Users')
  })

  it('renders table column headers', () => {
    renderWithProviders(<AdminUsersPage />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Role')).toBeInTheDocument()
  })

  it('renders user rows', () => {
    renderWithProviders(<AdminUsersPage />)
    expect(screen.getByText('Alice Admin')).toBeInTheDocument()
    expect(screen.getByText('Bob User')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })

  it('renders role badges', () => {
    renderWithProviders(<AdminUsersPage />)
    expect(screen.getByText('admin')).toBeInTheDocument()
    expect(screen.getByText('user')).toBeInTheDocument()
  })

  it('renders loading skeleton rows', () => {
    vi.mocked(useAdminUsers).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as never)
    const { container } = renderWithProviders(<AdminUsersPage />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('renders empty state when no users', () => {
    vi.mocked(useAdminUsers).mockReturnValue({
      data: mockPaginated([]) as never,
      isLoading: false,
      error: null,
    } as never)
    renderWithProviders(<AdminUsersPage />)
    expect(screen.getByText('No users found.')).toBeInTheDocument()
  })

  it('renders error message on failure', () => {
    vi.mocked(useAdminUsers).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('fail'),
    } as never)
    renderWithProviders(<AdminUsersPage />)
    expect(screen.getByRole('alert')).toHaveTextContent(/failed to load users/i)
  })

  it('renders search input', () => {
    renderWithProviders(<AdminUsersPage />)
    expect(screen.getByPlaceholderText(/search name or email/i)).toBeInTheDocument()
  })
})
