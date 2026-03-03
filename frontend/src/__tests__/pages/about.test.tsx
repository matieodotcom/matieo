import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils'
import AboutPage from '@/pages/about/AboutPage'
import { useAuthStore } from '@/store/authStore'

function renderPage() {
  return renderWithProviders(<AboutPage />)
}

describe('AboutPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    vi.clearAllMocks()
  })

  it('renders the hero heading', () => {
    renderPage()
    expect(
      screen.getByRole('heading', {
        name: /building a better way to honor lives and understand mortality/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders the hero subtitle', () => {
    renderPage()
    expect(screen.getByText(/matieo was born from a simple belief/i)).toBeInTheDocument()
  })

  it('renders the mission heading', () => {
    renderPage()
    expect(
      screen.getByRole('heading', {
        name: /honoring lives through comprehensive memorial and funeral services/i,
      }),
    ).toBeInTheDocument()
  })

  it('renders the "Our Mission" badge', () => {
    renderPage()
    expect(screen.getByText('Our Mission')).toBeInTheDocument()
  })

  it('renders all 4 mission pillar labels', () => {
    renderPage()
    expect(screen.getByText(/^Obituary:/)).toBeInTheDocument()
    expect(screen.getByText(/^Digital Memorials:/)).toBeInTheDocument()
    expect(screen.getByText(/^Funeral Services:/)).toBeInTheDocument()
    expect(screen.getByText(/^Insights:/)).toBeInTheDocument()
  })

  it('renders all 4 stats', () => {
    renderPage()
    expect(screen.getByText('50K+')).toBeInTheDocument()
    expect(screen.getByText('2.5M+')).toBeInTheDocument()
    expect(screen.getByText('190+')).toBeInTheDocument()
    expect(screen.getByText('99.9%')).toBeInTheDocument()
  })

  it('renders stat labels', () => {
    renderPage()
    expect(screen.getByText('Obituaries Created')).toBeInTheDocument()
    expect(screen.getByText('Memorials Created')).toBeInTheDocument()
    expect(screen.getByText('Countries Covered')).toBeInTheDocument()
    expect(screen.getByText('Uptime')).toBeInTheDocument()
  })

  it('renders the "Our Values" section heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /our values/i })).toBeInTheDocument()
  })

  it('renders all 4 value titles', () => {
    renderPage()
    expect(screen.getByText('Compassion First')).toBeInTheDocument()
    expect(screen.getByText('Accuracy & Integrity')).toBeInTheDocument()
    expect(screen.getByText('Community Driven')).toBeInTheDocument()
    expect(screen.getByText('Continuous Innovation')).toBeInTheDocument()
  })

  it('renders the "Our Journey" section heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /our journey/i })).toBeInTheDocument()
  })

  it('renders both journey milestones', () => {
    renderPage()
    expect(screen.getByText('2026')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('MATIEO Founded')).toBeInTheDocument()
    expect(screen.getByText('Growing Worldwide')).toBeInTheDocument()
  })

  it('renders the "Meet Our Team" section heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /meet our team/i })).toBeInTheDocument()
  })

  it('renders both team members', () => {
    renderPage()
    expect(screen.getByText('Shariff Saim')).toBeInTheDocument()
    expect(screen.getByText('Avinash Kumar')).toBeInTheDocument()
  })

  it('renders team member roles', () => {
    renderPage()
    expect(screen.getByText('Co-founder & Product')).toBeInTheDocument()
    expect(screen.getByText('Co-founder & Engineering')).toBeInTheDocument()
  })

  it('renders the CTA "Get Started Today" heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /get started today/i })).toBeInTheDocument()
  })

  it('renders "Create Memorial" CTA link pointing to /signup', () => {
    renderPage()
    const link = screen.getByRole('link', { name: /create memorial/i })
    expect(link).toHaveAttribute('href', '/signup')
  })

  it('renders the Navbar', () => {
    renderPage()
    expect(screen.getAllByText('MATIEO').length).toBeGreaterThan(0)
  })

  it('renders the Footer', () => {
    renderPage()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
