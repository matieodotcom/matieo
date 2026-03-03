import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@supabase/supabase-js'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

const mockUser = {
  id: 'test-user-id',
  email: 'test@matieo.com',
  user_metadata: { full_name: 'Test User' },
} as unknown as User

const mockMemorialData = {
  data: [
    {
      id: 'mem-1',
      created_by: 'test-user-id',
      full_name: 'John Doe',
      date_of_birth: '1945-03-15',
      date_of_death: '2024-01-10',
      age_at_death: 78,
      gender: 'male',
      race_ethnicity: null,
      location: 'Kuala Lumpur',
      status: 'published',
      slug: 'john-doe-2024',
      cover_url: null,
      biography: null,
      tribute_message: null,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      deleted_at: null,
      cover_cloudinary_public_id: null,
      cause_of_death: null,
      full_memorial_url: null,
    },
    {
      id: 'mem-2',
      created_by: 'test-user-id',
      full_name: 'Jane Smith',
      date_of_birth: '1950-06-01',
      date_of_death: '2023-12-20',
      age_at_death: 73,
      gender: 'female',
      race_ethnicity: null,
      location: null,
      status: 'draft',
      slug: 'jane-smith-2023',
      cover_url: null,
      biography: null,
      tribute_message: null,
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-01-10T00:00:00Z',
      deleted_at: null,
      cover_cloudinary_public_id: null,
      cause_of_death: null,
      full_memorial_url: null,
    },
  ],
  total: 2,
  page: 1,
  limit: 12,
  error: null,
}

async function renderPage() {
  const { apiFetch } = await import('@/lib/apiClient')
  vi.mocked(apiFetch).mockResolvedValue(mockMemorialData)
  const { default: MyMemorialsPage } = await import('@/pages/app/MyMemorialsPage')
  return renderWithProviders(<MyMemorialsPage />, { initialRoute: '/dashboard/memorials' })
}

describe('MyMemorialsPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, session: {} as never, isLoading: false })
    vi.clearAllMocks()
  })

  it('renders "My Memorials" heading', async () => {
    await renderPage()
    expect(screen.getByRole('heading', { name: /my memorials/i })).toBeInTheDocument()
  })

  it('renders search input', async () => {
    await renderPage()
    expect(screen.getByRole('searchbox', { name: /search memorials/i })).toBeInTheDocument()
  })

  it('renders "Create Memorial" button', async () => {
    await renderPage()
    expect(screen.getByRole('button', { name: /create memorial/i })).toBeInTheDocument()
  })

  it('renders memorial cards when data is loaded', async () => {
    await renderPage()
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument())
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('shows skeleton cards while loading', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))
    const { default: MyMemorialsPage } = await import('@/pages/app/MyMemorialsPage')
    renderWithProviders(<MyMemorialsPage />)
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('shows empty state when no memorials exist', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ ...mockMemorialData, data: [], total: 0 })
    const { default: MyMemorialsPage } = await import('@/pages/app/MyMemorialsPage')
    renderWithProviders(<MyMemorialsPage />)
    await waitFor(() =>
      expect(screen.getByText(/haven't created any memorials/i)).toBeInTheDocument(),
    )
  })

  it('shows search empty state when no results match query', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ ...mockMemorialData, data: [], total: 0 })
    const { default: MyMemorialsPage } = await import('@/pages/app/MyMemorialsPage')
    renderWithProviders(<MyMemorialsPage />, { initialRoute: '/dashboard/memorials?q=xyz' })
    await waitFor(() => expect(screen.getByText(/no memorials match/i)).toBeInTheDocument())
  })

  it('shows error message when fetch fails', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Network error'))
    const { default: MyMemorialsPage } = await import('@/pages/app/MyMemorialsPage')
    renderWithProviders(<MyMemorialsPage />)
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
  })

  it('renders pagination when total > limit', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ ...mockMemorialData, total: 25 })
    const { default: MyMemorialsPage } = await import('@/pages/app/MyMemorialsPage')
    renderWithProviders(<MyMemorialsPage />)
    await waitFor(() =>
      expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument(),
    )
  })

  it('updates search input text', async () => {
    await renderPage()
    const input = screen.getByRole('searchbox', { name: /search memorials/i })
    await userEvent.type(input, 'john')
    expect(input).toHaveValue('john')
  })
})
