import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import MyObituariesPage from '@/pages/app/MyObituariesPage'
import { apiFetch } from '@/lib/apiClient'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
  }
})

beforeEach(() => {
  mockNavigate.mockReset()
  vi.resetAllMocks()
})

function mockObituary(overrides = {}) {
  return {
    id: 'obituary-id-123',
    created_by: 'test-user-id',
    creator_name: 'Test User',
    full_name: 'Jane Doe',
    date_of_birth: '1950-05-10',
    date_of_death: '2024-02-14',
    age_at_death: 73,
    gender: 'female' as const,
    race_ethnicity: 'Asian',
    country: 'Malaysia',
    state: 'Kuala Lumpur',
    place_of_death: 'Hospital',
    cause_of_passing: null,
    cause_of_passing_consented: false,
    profile_url: null,
    profile_cloudinary_public_id: null,
    cover_url: null,
    cover_cloudinary_public_id: null,
    death_cert_url: null,
    death_cert_cloudinary_public_id: null,
    biography: null,
    funeral_details: null,
    burial_details: null,
    contact_person: null,
    family_members: null,
    slug: 'jane-doe-2024',
    full_obituary_url: null,
    status: 'draft' as const,
    deleted_at: null,
    created_at: '2024-02-15T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z',
    ...overrides,
  }
}

describe('MyObituariesPage', () => {
  it('renders loading skeleton initially', () => {
    vi.mocked(apiFetch).mockReturnValue(new Promise(() => {})) // never resolves

    renderWithProviders(<MyObituariesPage />)
    // Should show skeletons (animate-pulse divs)
    const skeletons = document.querySelectorAll('.animate-pulse')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('renders page header', () => {
    vi.mocked(apiFetch).mockReturnValue(new Promise(() => {}))

    renderWithProviders(<MyObituariesPage />)
    expect(screen.getByText('My Obituaries')).toBeInTheDocument()
  })

  it('renders empty state when no obituaries', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      error: null,
    })

    renderWithProviders(<MyObituariesPage />)

    await waitFor(() => {
      expect(screen.getByText("You haven't created any obituaries yet")).toBeInTheDocument()
    })
  })

  it('renders obituary cards when data exists', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: [mockObituary({ status: 'published', slug: 'jane-doe-2024' })],
      total: 1,
      page: 1,
      limit: 12,
      error: null,
    })

    renderWithProviders(<MyObituariesPage />)

    await waitFor(() => {
      expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    })
  })

  it('renders Create Obituary button in empty state', async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 12,
      error: null,
    })

    renderWithProviders(<MyObituariesPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Create Obituary/ })).toBeInTheDocument()
    })
  })
})
