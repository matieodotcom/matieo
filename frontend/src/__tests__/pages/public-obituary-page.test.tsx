import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockUser } from '@/__tests__/utils'
import { useAuthStore } from '@/store/authStore'
import type { User } from '@supabase/supabase-js'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
  return { ...actual, useParams: () => ({ slug: 'jane-doe-2024' }) }
})

import PublicObituaryPage from '@/pages/public/PublicObituaryPage'

const mockObituary = {
  id: 'obit-1',
  created_by: 'user-1',
  full_name: 'Jane Doe',
  first_name: 'Jane',
  last_name: 'Doe',
  date_of_birth: '1950-06-01',
  date_of_death: '2024-02-20',
  age_at_death: 73,
  gender: 'female',
  race_ethnicity: 'Malay',
  state: 'Selangor',
  country: 'Malaysia',
  status: 'published',
  slug: 'jane-doe-2024',
  cover_url: null,
  profile_url: null,
  biography: 'A beloved mother and grandmother.',
  funeral_details: null,
  burial_details: null,
  family_members: [],
  contact_person: {
    name: 'John Doe',
    relationship: 'Son',
    phone: '+60123456789',
    email: 'john@example.com',
  },
  created_at: '2024-02-25T00:00:00Z',
  updated_at: '2024-02-25T00:00:00Z',
}

const mockCondolences = [
  {
    id: 'condolence-1',
    obituary_id: 'obit-1',
    user_id: 'user-2',
    author_name: 'Alice Wong',
    message: 'Our deepest condolences to the family.',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
  },
]

function renderPage() {
  return renderWithProviders(<PublicObituaryPage />, { initialRoute: '/obituary/jane-doe-2024' })
}

describe('PublicObituaryPage — Condolences section', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useAuthStore.setState({ user: null, session: null, isLoading: false })
  })

  it('shows loading skeleton while fetching', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))
    const { container } = renderPage()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders 404 for unknown slug', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Obituary not found'))
    renderPage()
    await waitFor(() => expect(screen.getByText(/Obituary not found/i)).toBeInTheDocument())
  })

  it('renders obituary full name', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ data: mockObituary, error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Jane Doe'),
    )
  })

  it('renders biography section', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ data: mockObituary, error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('A beloved mother and grandmother.')).toBeInTheDocument(),
    )
  })

  it('renders contact person section', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ data: mockObituary, error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('John Doe')).toBeInTheDocument(),
    )
  })

  describe('logged out', () => {
    it('shows "Sign in" prompt instead of form', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockObituary, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() =>
        expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument(),
      )
      expect(screen.queryByRole('textbox', { name: /write a condolence/i })).not.toBeInTheDocument()
    })

    it('shows empty condolences message when no condolences', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockObituary, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() =>
        expect(screen.getByText(/Be the first to leave a condolence/i)).toBeInTheDocument(),
      )
    })
  })

  describe('logged in', () => {
    beforeEach(() => {
      useAuthStore.setState({
        user: mockUser() as unknown as User,
        session: {} as never,
        isLoading: false,
      })
    })

    it('shows textarea and Post Condolence button', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockObituary, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() =>
        expect(screen.getByLabelText(/write a condolence/i)).toBeInTheDocument(),
      )
      expect(screen.getByRole('button', { name: /post condolence/i })).toBeInTheDocument()
    })

    it('Post Condolence button is disabled when textarea is empty', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockObituary, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() => screen.getByLabelText(/write a condolence/i))
      expect(screen.getByRole('button', { name: /post condolence/i })).toBeDisabled()
    })

    it('enables Post Condolence button when text is entered', async () => {
      const user = userEvent.setup()
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockObituary, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() => screen.getByLabelText(/write a condolence/i))
      await user.type(screen.getByLabelText(/write a condolence/i), 'Our thoughts are with you')
      expect(screen.getByRole('button', { name: /post condolence/i })).not.toBeDisabled()
    })

    it('calls POST on submit', async () => {
      const user = userEvent.setup()
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockObituary, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
        .mockResolvedValueOnce({ data: { id: 'new-condolence' }, error: null })
        .mockResolvedValueOnce({ data: [], error: null })

      renderPage()
      await waitFor(() => screen.getByLabelText(/write a condolence/i))

      await user.type(screen.getByLabelText(/write a condolence/i), 'Our sincere condolences')
      await user.click(screen.getByRole('button', { name: /post condolence/i }))

      await waitFor(() => {
        const postCall = vi.mocked(apiFetch).mock.calls.find(
          ([url, opts]) => url === '/api/obituaries/obit-1/condolences' && (opts as RequestInit)?.method === 'POST',
        )
        expect(postCall).toBeDefined()
      })
    })

    it('renders list of condolences with author name and time', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch).mockImplementation((url: string) =>
        Promise.resolve(
          (url as string).includes('/condolences')
            ? { data: mockCondolences, error: null }
            : { data: mockObituary, error: null },
        ),
      )
      renderPage()
      await waitFor(
        () => expect(screen.getByText('Alice Wong')).toBeInTheDocument(),
        { timeout: 3000 },
      )
      expect(screen.getByText('Our deepest condolences to the family.')).toBeInTheDocument()
      expect(screen.getByText('3h ago')).toBeInTheDocument()
    })

    it('shows Condolences count in heading', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch).mockImplementation((url: string) =>
        Promise.resolve(
          (url as string).includes('/condolences')
            ? { data: mockCondolences, error: null }
            : { data: mockObituary, error: null },
        ),
      )
      renderPage()
      await waitFor(
        () => expect(screen.getByText('Condolences (1)')).toBeInTheDocument(),
        { timeout: 3000 },
      )
    })
  })
})
