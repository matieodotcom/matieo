import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import FeaturesPage from '@/pages/features/FeaturesPage'
import { useAuthStore } from '@/store/authStore'

function renderPage() {
  return renderWithProviders(<FeaturesPage />)
}

describe('FeaturesPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    vi.clearAllMocks()
  })

  it('renders the page heading', () => {
    renderPage()
    expect(
      screen.getByRole('heading', { name: /powerful features for every need/i }),
    ).toBeInTheDocument()
  })

  it('renders the hero subtitle', () => {
    renderPage()
    expect(screen.getByText(/from comprehensive mortality insights/i)).toBeInTheDocument()
  })

  it('renders all 4 main feature headings', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /obituary management/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /digital memorials/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /advanced insights/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /funeral services/i })).toBeInTheDocument()
  })

  it('renders bullet points for each main feature', () => {
    renderPage()
    expect(screen.getByText('Easy-to-use obituary editor')).toBeInTheDocument()
    expect(screen.getByText('Customizable memorial pages')).toBeInTheDocument()
    expect(screen.getByText('Interactive charts and graphs')).toBeInTheDocument()
    expect(screen.getByText('Verified local service providers')).toBeInTheDocument()
  })

  it('renders the "And Much More" section heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /and much more/i })).toBeInTheDocument()
  })

  it('renders all 6 "And Much More" feature titles', () => {
    renderPage()
    expect(screen.getByText('Global Coverage')).toBeInTheDocument()
    expect(screen.getByText('Advanced Search')).toBeInTheDocument()
    expect(screen.getByText('Privacy First')).toBeInTheDocument()
    expect(screen.getByText('Mobile-Friendly')).toBeInTheDocument()
    expect(screen.getByText('API Integration')).toBeInTheDocument()
    expect(screen.getByText('Cloud Storage')).toBeInTheDocument()
  })

  it('renders the CTA "Get Started Today" heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /get started today/i })).toBeInTheDocument()
  })

  it('renders "Create Obituary" CTA link pointing to /signup', () => {
    renderPage()
    const links = screen.getAllByRole('link', { name: /create obituary/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', '/signup')
  })

  it('renders "Learn More" CTA link pointing to /signup', () => {
    renderPage()
    const link = screen.getByRole('link', { name: /learn more/i })
    expect(link).toHaveAttribute('href', '/signup')
  })

  it('renders trust signals in CTA', () => {
    renderPage()
    expect(screen.getByText('No hidden fees')).toBeInTheDocument()
    expect(screen.getByText('Cancel anytime')).toBeInTheDocument()
    expect(screen.getByText('Get support')).toBeInTheDocument()
  })

  it('renders the Navbar with MATIEO logo', () => {
    renderPage()
    expect(screen.getAllByText('MATIEO').length).toBeGreaterThan(0)
  })

  it('renders the Footer', () => {
    renderPage()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
