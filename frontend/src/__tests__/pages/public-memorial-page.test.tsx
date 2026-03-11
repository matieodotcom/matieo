import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
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
  return { ...actual, useParams: () => ({ slug: 'john-doe-2024' }) }
})

import PublicMemorialPage from '@/pages/public/PublicMemorialPage'

const mockMemorial = {
  id: 'mem-1',
  created_by: 'user-1',
  full_name: 'John Doe',
  date_of_birth: '1945-03-15',
  date_of_death: '2024-01-10',
  age_at_death: 78,
  gender: 'male',
  race_ethnicity: null,
  location: 'Kuala Lumpur, Malaysia',
  status: 'published',
  slug: 'john-doe-2024',
  cover_url: null,
  cover_cloudinary_public_id: null,
  cover_gradient: 'blue',
  profile_url: null,
  profile_cloudinary_public_id: null,
  country: 'Malaysia',
  state: 'Kuala Lumpur',
  creator_relationship: null,
  quote: null,
  cause_of_death: null,
  biography: 'A kind and devoted father.',
  tribute_message: null,
  full_memorial_url: null,
  deleted_at: null,
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  memorial_photos: [],
}

const mockTributes = [
  {
    id: 'tribute-1',
    memorial_id: 'mem-1',
    user_id: 'user-2',
    author_name: 'Jane Smith',
    message: 'Forever in our hearts.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
  },
]

function renderPage() {
  return renderWithProviders(<PublicMemorialPage />, { initialRoute: '/memorial/john-doe-2024' })
}

describe('PublicMemorialPage — Tributes section', () => {
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
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Memorial not found'))
    renderPage()
    await waitFor(() => expect(screen.getByText(/Memorial not found/i)).toBeInTheDocument())
  })

  it('renders memorial name after load', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ data: mockMemorial, error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Doe'),
    )
  })

  it('renders biography', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ data: mockMemorial, error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('A kind and devoted father.')).toBeInTheDocument(),
    )
  })

  it('renders gallery empty state when no photos', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ data: mockMemorial, error: null })
      .mockResolvedValueOnce({ data: [], error: null })
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('No photos added yet.')).toBeInTheDocument(),
    )
  })

  describe('logged out', () => {
    it('shows "Sign in" button instead of form', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockMemorial, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument(),
      )
      expect(screen.queryByRole('textbox', { name: /write a tribute/i })).not.toBeInTheDocument()
    })

    it('opens sign-in modal when "Sign in" button is clicked', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockMemorial, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() => screen.getByRole('button', { name: /^sign in$/i }))
      fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
    })

    it('shows empty tributes message when no tributes', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockMemorial, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() =>
        expect(screen.getByText(/Be the first to leave a tribute/i)).toBeInTheDocument(),
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

    it('shows textarea and Post Tribute button', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockMemorial, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() =>
        expect(screen.getByLabelText(/write a tribute/i)).toBeInTheDocument(),
      )
      expect(screen.getByRole('button', { name: /post tribute/i })).toBeInTheDocument()
    })

    it('Post Tribute button is disabled when textarea is empty', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockMemorial, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() => screen.getByLabelText(/write a tribute/i))
      expect(screen.getByRole('button', { name: /post tribute/i })).toBeDisabled()
    })

    it('enables Post Tribute button when text is entered', async () => {
      const user = userEvent.setup()
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockMemorial, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() => screen.getByLabelText(/write a tribute/i))
      await user.type(screen.getByLabelText(/write a tribute/i), 'A tribute message')
      expect(screen.getByRole('button', { name: /post tribute/i })).not.toBeDisabled()
    })

    it('calls POST and clears textarea on success', async () => {
      const user = userEvent.setup()
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockMemorial, error: null })
        .mockResolvedValueOnce({ data: [], error: null }) // initial tributes fetch
        .mockResolvedValueOnce({ data: { id: 'new-tribute' }, error: null }) // POST
        .mockResolvedValueOnce({ data: [], error: null }) // invalidate refetch

      renderPage()
      await waitFor(() => screen.getByLabelText(/write a tribute/i))

      const textarea = screen.getByLabelText(/write a tribute/i)
      await user.type(textarea, 'A heartfelt tribute')
      await user.click(screen.getByRole('button', { name: /post tribute/i }))

      await waitFor(() => {
        const postCall = vi.mocked(apiFetch).mock.calls.find(
          ([url, opts]) => url === '/api/memorials/mem-1/tributes' && (opts as RequestInit)?.method === 'POST',
        )
        expect(postCall).toBeDefined()
      })
    })

    it('renders list of tributes with author name and time', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch).mockImplementation((url: string) =>
        Promise.resolve(
          (url as string).includes('/tributes')
            ? { data: mockTributes, error: null }
            : { data: mockMemorial, error: null },
        ),
      )
      renderPage()
      await waitFor(
        () => expect(screen.getByText('Jane Smith')).toBeInTheDocument(),
        { timeout: 3000 },
      )
      expect(screen.getByText('Forever in our hearts.')).toBeInTheDocument()
      expect(screen.getByText('2h ago')).toBeInTheDocument()
    })

    it('shows Tributes count in heading', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch).mockImplementation((url: string) =>
        Promise.resolve(
          (url as string).includes('/tributes')
            ? { data: mockTributes, error: null }
            : { data: mockMemorial, error: null },
        ),
      )
      renderPage()
      await waitFor(
        () => expect(screen.getByText('Tributes (1)')).toBeInTheDocument(),
        { timeout: 3000 },
      )
    })

    it('renders emoji button when logged in', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockMemorial, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() => screen.getByLabelText(/write a tribute/i))
      expect(screen.getByRole('button', { name: /insert emoji/i })).toBeInTheDocument()
    })

    it('appends emoji to tribute text when emoji selected', async () => {
      const user = userEvent.setup()
      const { apiFetch } = await import('@/lib/apiClient')
      vi.mocked(apiFetch)
        .mockResolvedValueOnce({ data: mockMemorial, error: null })
        .mockResolvedValueOnce({ data: [], error: null })
      renderPage()
      await waitFor(() => screen.getByLabelText(/write a tribute/i))

      // Type some text then click emoji button to open picker, then click mock picker to insert emoji
      await user.type(screen.getByLabelText(/write a tribute/i), 'Hello')
      await user.click(screen.getByRole('button', { name: /insert emoji/i }))
      await user.click(screen.getByText('mock-emoji-picker'))

      expect((screen.getByLabelText(/write a tribute/i) as HTMLTextAreaElement).value).toBe('Hello😊')
    })

    it('shows delete button only on own tributes (not others)', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      const ownTribute = { ...mockTributes[0], user_id: mockUser().id }
      const otherTribute = { id: 'tribute-2', memorial_id: 'mem-1', user_id: 'other-user', author_name: 'Bob', message: 'Hi', created_at: new Date().toISOString() }
      vi.mocked(apiFetch).mockImplementation((url: string) =>
        Promise.resolve(
          (url as string).includes('/tributes')
            ? { data: [ownTribute, otherTribute], error: null }
            : { data: mockMemorial, error: null },
        ),
      )
      renderPage()
      await waitFor(() => expect(screen.getByText('Jane Smith')).toBeInTheDocument(), { timeout: 3000 })
      // Only one delete button (for own post)
      expect(screen.getAllByRole('button', { name: /delete tribute/i })).toHaveLength(1)
    })

    it('shows delete button on all tributes when user is the page owner', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      // logged-in user is the memorial creator
      const pageOwnerMemorial = { ...mockMemorial, created_by: mockUser().id }
      const tribute1 = { ...mockTributes[0], user_id: 'user-a' }
      const tribute2 = { id: 'tribute-2', memorial_id: 'mem-1', user_id: 'user-b', author_name: 'Bob', message: 'Hi', created_at: new Date().toISOString() }
      vi.mocked(apiFetch).mockImplementation((url: string) =>
        Promise.resolve(
          (url as string).includes('/tributes')
            ? { data: [tribute1, tribute2], error: null }
            : { data: pageOwnerMemorial, error: null },
        ),
      )
      renderPage()
      await waitFor(() => expect(screen.getByText('Jane Smith')).toBeInTheDocument(), { timeout: 3000 })
      expect(screen.getAllByRole('button', { name: /delete tribute/i })).toHaveLength(2)
    })

    it('calls DELETE when delete tribute button clicked', async () => {
      const user = userEvent.setup()
      const { apiFetch } = await import('@/lib/apiClient')
      const ownTribute = { ...mockTributes[0], user_id: mockUser().id }
      vi.mocked(apiFetch).mockImplementation((url: string, opts?: RequestInit) => {
        if ((opts as RequestInit)?.method === 'DELETE') return Promise.resolve({ data: { id: ownTribute.id }, error: null })
        if ((url as string).includes('/tributes')) return Promise.resolve({ data: [ownTribute], error: null })
        return Promise.resolve({ data: mockMemorial, error: null })
      })
      renderPage()
      await waitFor(() => screen.getByRole('button', { name: /delete tribute/i }), { timeout: 3000 })
      await user.click(screen.getByRole('button', { name: /delete tribute/i }))
      await waitFor(() => {
        const deleteCall = vi.mocked(apiFetch).mock.calls.find(
          ([url, opts]) => (url as string).includes('/tributes/') && (opts as RequestInit)?.method === 'DELETE',
        )
        expect(deleteCall).toBeDefined()
      })
    })

    it('shows only 10 tributes initially when more than 10 exist', async () => {
      const { apiFetch } = await import('@/lib/apiClient')
      const manyTributes = Array.from({ length: 12 }, (_, i) => ({
        id: `tribute-${i}`,
        memorial_id: 'mem-1',
        user_id: 'user-2',
        author_name: `Author ${i}`,
        message: `Message ${i}`,
        created_at: new Date().toISOString(),
      }))
      vi.mocked(apiFetch).mockImplementation((url: string) =>
        Promise.resolve(
          (url as string).includes('/tributes')
            ? { data: manyTributes, error: null }
            : { data: mockMemorial, error: null },
        ),
      )
      renderPage()
      await waitFor(() => expect(screen.getByText('Author 0')).toBeInTheDocument(), { timeout: 3000 })
      // Only first 10 should be visible
      expect(screen.getByText('Author 9')).toBeInTheDocument()
      expect(screen.queryByText('Author 10')).not.toBeInTheDocument()
      expect(screen.queryByText('Author 11')).not.toBeInTheDocument()
    })
  })
})
