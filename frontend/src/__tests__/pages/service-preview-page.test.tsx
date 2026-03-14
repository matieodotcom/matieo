import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import testI18n from '@/lib/i18n-test'
import ServicePreviewPage from '@/pages/app/ServicePreviewPage'
import type { ServicePreviewValues } from '@/pages/app/ServicePreviewPage'

let mockLocationState: { values: ServicePreviewValues; fromId?: string } | null = null

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
  return {
    ...actual,
    useLocation: () => ({ state: mockLocationState, pathname: '/dashboard/services/preview' }),
  }
})

function makeClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function renderPage() {
  return render(
    <I18nextProvider i18n={testI18n}>
      <MemoryRouter>
        <QueryClientProvider client={makeClient()}>
          <ServicePreviewPage />
        </QueryClientProvider>
      </MemoryRouter>
    </I18nextProvider>
  )
}

const baseValues: ServicePreviewValues = {
  name: 'Sunrise Funeral Home',
  phone: '+60 12-345 6789',
  email: 'contact@sunrise.com',
  website: 'https://sunrise.com',
  address: '123 Jalan Utama, Kuala Lumpur',
  city: 'Kuala Lumpur',
  country: 'Malaysia',
  about: 'We provide compassionate funeral services.',
  description: 'Trusted funeral home since 1990.',
  categoryName: 'Funeral Parlour',
  iconUrl: 'https://cdn.test/icon.jpg',
  galleryUrls: ['https://cdn.test/g1.jpg', 'https://cdn.test/g2.jpg'],
}

describe('ServicePreviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocationState = { values: baseValues }
  })

  it('redirects to create page when no state is present', () => {
    mockLocationState = null
    renderPage()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('renders the service name', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sunrise Funeral Home')
  })

  it('renders the category name badge', () => {
    renderPage()
    expect(screen.getAllByText('Funeral Parlour').length).toBeGreaterThan(0)
  })

  it('renders the description', () => {
    renderPage()
    expect(screen.getByText('Trusted funeral home since 1990.')).toBeInTheDocument()
  })

  it('renders the about text', () => {
    renderPage()
    expect(screen.getByText('We provide compassionate funeral services.')).toBeInTheDocument()
  })

  it('renders the phone number', () => {
    renderPage()
    expect(screen.getByText('+60 12-345 6789')).toBeInTheDocument()
  })

  it('renders the email', () => {
    renderPage()
    expect(screen.getByText('contact@sunrise.com')).toBeInTheDocument()
  })

  it('renders the website without protocol', () => {
    renderPage()
    expect(screen.getByText('sunrise.com')).toBeInTheDocument()
  })

  it('renders the address', () => {
    renderPage()
    expect(screen.getByText(/123 Jalan Utama/)).toBeInTheDocument()
  })

  it('renders gallery photos', () => {
    renderPage()
    expect(screen.getByRole('img', { name: 'Gallery photo 1' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Gallery photo 2' })).toBeInTheDocument()
  })

  it('shows no gallery message when gallery is empty', () => {
    mockLocationState = { values: { ...baseValues, galleryUrls: [] } }
    renderPage()
    expect(screen.getByText('No photos yet.')).toBeInTheDocument()
  })

  it('renders the icon image when iconUrl is provided', () => {
    renderPage()
    expect(screen.getByRole('img', { name: 'Sunrise Funeral Home' })).toBeInTheDocument()
  })

  it('shows initials when no iconUrl', () => {
    mockLocationState = { values: { ...baseValues, iconUrl: null } }
    renderPage()
    expect(screen.getByText('SU')).toBeInTheDocument()
  })

  it('Contact Us button is disabled in preview', () => {
    renderPage()
    const btn = screen.getByRole('button', { name: /Contact Us/i })
    expect(btn).toBeDisabled()
  })

  it('Post Comment button is disabled in preview', () => {
    renderPage()
    const btn = screen.getByRole('button', { name: /Post Comment/i })
    expect(btn).toBeDisabled()
  })

  it('comment textarea is disabled in preview', () => {
    renderPage()
    expect(screen.getByRole('textbox', { name: /Share your comment/i })).toBeDisabled()
  })

  it('does not show Contact Us button when no phone or email', () => {
    mockLocationState = { values: { ...baseValues, phone: '', email: '' } }
    renderPage()
    expect(screen.queryByRole('button', { name: /Contact Us/i })).not.toBeInTheDocument()
  })

  it('does not render about section when about is empty', () => {
    mockLocationState = { values: { ...baseValues, about: '' } }
    renderPage()
    expect(screen.queryByText('We provide compassionate funeral services.')).not.toBeInTheDocument()
  })
})
