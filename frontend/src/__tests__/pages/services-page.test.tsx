import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import ServicesPage from '@/pages/public/ServicesPage'

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
  return { ...actual, useParams: () => ({}) }
})

function renderPage() {
  return renderWithProviders(<ServicesPage />, { initialRoute: '/services' })
}

describe('ServicesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders the hero heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders the Funeral Services section heading', () => {
    renderPage()
    expect(screen.getByText('Funeral Services')).toBeInTheDocument()
  })

  it('renders all 14 category cards', () => {
    renderPage()
    expect(screen.getByText('Florists')).toBeInTheDocument()
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

  it('renders provider counts', () => {
    renderPage()
    expect(screen.getByText('73 Providers')).toBeInTheDocument()
    expect(screen.getByText('79 Providers')).toBeInTheDocument()
  })

  it('renders the search input', () => {
    renderPage()
    expect(screen.getByPlaceholderText(/search services/i)).toBeInTheDocument()
  })

  it('filters categories by search query', async () => {
    const user = userEvent.setup()
    renderPage()
    const input = screen.getByPlaceholderText(/search services/i)
    await user.type(input, 'florist')
    expect(screen.getByText('Florists')).toBeInTheDocument()
    expect(screen.queryByText('Crematorium')).not.toBeInTheDocument()
  })

  it('shows no-results message when search yields nothing', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(screen.getByPlaceholderText(/search services/i), 'xyznotexist')
    expect(screen.getByText(/no services match/i)).toBeInTheDocument()
  })

  it('renders the List Your Services CTA heading', () => {
    renderPage()
    expect(screen.getByText('List Your Services')).toBeInTheDocument()
  })

  it('renders the Sign Up as a Service Provider link', () => {
    renderPage()
    expect(screen.getByRole('link', { name: /sign up as a service provider/i })).toHaveAttribute('href', '/signup')
  })
})
