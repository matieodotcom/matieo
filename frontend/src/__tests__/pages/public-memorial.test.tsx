import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'

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

const mockMemorialResponse = {
  data: {
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
    profile_url: 'https://cdn.test/profile.jpg',
    profile_cloudinary_public_id: null,
    country: 'Malaysia',
    state: 'Kuala Lumpur',
    creator_relationship: 'Son',
    quote: 'To live in hearts we leave behind is not to die.',
    cause_of_death: null,
    biography: 'A kind and devoted father.',
    tribute_message: 'We will always love you.',
    full_memorial_url: 'https://matieo.com/memorial/john-doe-2024',
    cover_gradient: 'blue',
    deleted_at: null,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    memorial_photos: [
      {
        id: 'photo-1',
        memorial_id: 'mem-1',
        cloudinary_public_id: 'matieo/g1',
        cloudinary_url: 'https://cdn.test/g1.jpg',
        caption: null,
        sort_order: 0,
        created_at: '2024-01-15T00:00:00Z',
      },
      {
        id: 'photo-2',
        memorial_id: 'mem-1',
        cloudinary_public_id: 'matieo/g2',
        cloudinary_url: 'https://cdn.test/g2.jpg',
        caption: 'Family photo',
        sort_order: 1,
        created_at: '2024-01-15T00:00:00Z',
      },
    ],
  },
  error: null,
}

function renderPage() {
  return renderWithProviders(<PublicMemorialPage />, { initialRoute: '/memorial/john-doe-2024' })
}

describe('PublicMemorialPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading skeleton while fetching', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockImplementation(() => new Promise(() => {}))
    const { container } = renderPage()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders full name after load', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Doe'))
  })

  it('renders location', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() => expect(screen.getByText('Kuala Lumpur, Malaysia')).toBeInTheDocument())
  })

  it('renders age', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() => expect(screen.getByText(/Age: 78 years/)).toBeInTheDocument())
  })

  it('renders quote', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/To live in hearts/)).toBeInTheDocument(),
    )
  })

  it('renders biography', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() => expect(screen.getByText('A kind and devoted father.')).toBeInTheDocument())
  })

  it('renders gallery photos', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() =>
      expect(screen.getByRole('img', { name: 'Gallery photo 1' })).toBeInTheDocument(),
    )
    expect(screen.getByRole('img', { name: 'Family photo' })).toBeInTheDocument()
  })

  it('renders tribute message', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() =>
      expect(screen.getByText('We will always love you.')).toBeInTheDocument(),
    )
  })

  it('shows 404 state when memorial not found', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Memorial not found'))
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/Memorial not found/i)).toBeInTheDocument(),
    )
  })

  it('shows error state on generic failure', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Network error'))
    renderPage()
    await waitFor(() =>
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument(),
    )
  })

  it('opens lightbox when gallery photo clicked', async () => {
    const user = userEvent.setup()
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() => screen.getByRole('button', { name: /view gallery photo 1/i }))
    await user.click(screen.getByRole('button', { name: /view gallery photo 1/i }))
    expect(screen.getByRole('dialog', { name: /photo viewer/i })).toBeInTheDocument()
  })

  it('opens lightbox when profile photo clicked', async () => {
    const user = userEvent.setup()
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() => screen.getByRole('button', { name: /view profile photo/i }))
    await user.click(screen.getByRole('button', { name: /view profile photo/i }))
    expect(screen.getByRole('dialog', { name: /photo viewer/i })).toBeInTheDocument()
  })

  it('calls /api/memorials/by-slug/:slug endpoint', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialResponse)
    renderPage()
    await waitFor(() => expect(vi.mocked(apiFetch)).toHaveBeenCalled())
    expect(vi.mocked(apiFetch).mock.calls[0][0]).toContain('/api/memorials/by-slug/john-doe-2024')
  })
})
