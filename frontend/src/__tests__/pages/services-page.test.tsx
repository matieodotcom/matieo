import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import ServicesPage from '@/pages/public/ServicesPage'

import * as apiClient from '@/lib/apiClient'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
  return { ...actual, useParams: () => ({}) }
})

const MOCK_CATEGORIES = [
  { id: '1',  slug: 'florists',       name: 'Florists',            service_count: 73, is_active: true, sort_order: 1,  icon: 'Flower2',         description: null, image_url: null },
  { id: '2',  slug: 'casketUrn',      name: 'Casket & Urn Sellers', service_count: 79, is_active: true, sort_order: 2,  icon: 'Package',         description: null, image_url: null },
  { id: '3',  slug: 'transportation', name: 'Transportation',      service_count: 12, is_active: true, sort_order: 3,  icon: 'Car',             description: null, image_url: null },
  { id: '4',  slug: 'counselling',    name: 'Counselling',         service_count: 8,  is_active: true, sort_order: 4,  icon: 'HeartHandshake',  description: null, image_url: null },
  { id: '5',  slug: 'undertakers',    name: 'Funeral Undertakers', service_count: 25, is_active: true, sort_order: 5,  icon: 'Building2',       description: null, image_url: null },
  { id: '6',  slug: 'caterers',       name: 'Caterers',            service_count: 15, is_active: true, sort_order: 6,  icon: 'UtensilsCrossed', description: null, image_url: null },
  { id: '7',  slug: 'prayerServices', name: 'Prayer Services',     service_count: 30, is_active: true, sort_order: 7,  icon: 'BookOpen',        description: null, image_url: null },
  { id: '8',  slug: 'funeralParlour', name: 'Funeral Parlour',     service_count: 18, is_active: true, sort_order: 8,  icon: 'Home',            description: null, image_url: null },
  { id: '9',  slug: 'crematorium',    name: 'Crematorium',         service_count: 6,  is_active: true, sort_order: 9,  icon: 'Flame',           description: null, image_url: null },
  { id: '10', slug: 'canopy',         name: 'Canopy',              service_count: 22, is_active: true, sort_order: 10, icon: 'Tent',            description: null, image_url: null },
  { id: '11', slug: 'burialServices', name: 'Burial Services',     service_count: 40, is_active: true, sort_order: 11, icon: 'Mountain',        description: null, image_url: null },
  { id: '12', slug: 'photography',    name: 'Photography',         service_count: 11, is_active: true, sort_order: 12, icon: 'Camera',          description: null, image_url: null },
  { id: '13', slug: 'memorialParks',  name: 'Memorial Parks',      service_count: 5,  is_active: true, sort_order: 13, icon: 'Trees',           description: null, image_url: null },
  { id: '14', slug: 'fengShui',       name: 'Feng Shui',           service_count: 9,  is_active: true, sort_order: 14, icon: 'Wind',            description: null, image_url: null },
]

function renderPage() {
  return renderWithProviders(<ServicesPage />, { initialRoute: '/services' })
}

describe('ServicesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(apiClient.apiFetch).mockResolvedValue({ data: MOCK_CATEGORIES })
  })

  it('renders the hero heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the Funeral Services section heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 2, name: /funeral services/i })).toBeInTheDocument()
  })

  it('renders all 14 category cards', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('Florists')).toBeInTheDocument())
    expect(screen.getByText('Casket & Urn Sellers')).toBeInTheDocument()
    expect(screen.getByText('Transportation')).toBeInTheDocument()
    expect(screen.getByText('Counselling')).toBeInTheDocument()
    expect(screen.getByText('Funeral Undertakers')).toBeInTheDocument()
    expect(screen.getByText('Caterers')).toBeInTheDocument()
    expect(screen.getByText('Prayer Services')).toBeInTheDocument()
    expect(screen.getByText('Funeral Parlour')).toBeInTheDocument()
    expect(screen.getByText('Crematorium')).toBeInTheDocument()
    expect(screen.getByText('Canopy')).toBeInTheDocument()
    expect(screen.getByText('Burial Services')).toBeInTheDocument()
    expect(screen.getByText('Photography')).toBeInTheDocument()
    expect(screen.getByText('Memorial Parks')).toBeInTheDocument()
    expect(screen.getByText('Feng Shui')).toBeInTheDocument()
  })

  it('renders provider counts', async () => {
    renderPage()
    await waitFor(() => expect(screen.getByText('73 Providers')).toBeInTheDocument())
    expect(screen.getByText('79 Providers')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/search services/i)).toBeInTheDocument()
  })

  it('filters categories by search query', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Florists')).toBeInTheDocument())
    const input = screen.getByPlaceholderText(/search services/i)
    await user.type(input, 'florist')
    expect(screen.getByText('Florists')).toBeInTheDocument()
    expect(screen.queryByText('Crematorium')).not.toBeInTheDocument()
  })

  it('shows no-results message when search yields nothing', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(screen.getByText('Florists')).toBeInTheDocument())
    await user.type(screen.getByPlaceholderText(/search services/i), 'xyznotexist')
    expect(screen.getByText(/no services match/i)).toBeInTheDocument()
  })

  it('renders the List Your Services CTA heading', () => {
    renderPage()
    expect(screen.getByText('List Your Services')).toBeInTheDocument()
  })

  it('renders Sign Up as a Service Provider links pointing to /signup?type=organization', () => {
    renderPage()
    const links = screen.getAllByRole('link', { name: /sign up as a service provider/i })
    expect(links.length).toBeGreaterThanOrEqual(1)
    links.forEach((link) => expect(link).toHaveAttribute('href', '/signup?type=organization'))
  })
})
