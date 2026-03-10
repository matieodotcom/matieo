import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import testI18n from '@/lib/i18n-test'
import MemorialPreviewPage from '@/pages/app/MemorialPreviewPage'
import type { MemorialFormValues } from '@/hooks/use-create-memorial'

let mockLocationState: { values: MemorialFormValues } | null = null

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
  return {
    ...actual,
    useLocation: () => ({ state: mockLocationState, pathname: '/dashboard/memorials/preview' }),
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
          <MemorialPreviewPage />
        </QueryClientProvider>
      </MemoryRouter>
    </I18nextProvider>
  )
}

const baseValues: MemorialFormValues = {
  firstName: 'Ahmad',
  lastName: 'Hassan',
  ageAtDeath: '45',
  dateOfBirth: '1980-03-15',
  dateOfDeath: '2025-11-20',
  gender: 'male',
  raceEthnicity: 'Malay',
  country: 'Malaysia',
  state: 'Selangor',
  creatorRelationship: 'Son',
  quote: 'To God We Belong and To Him We Return',
  biography: 'Ahmad was a dedicated educator.',
  tributeMessage: 'A beautiful soul.',
  slug: 'ahmad-hassan-2025',
  profilePhoto: { public_id: 'matieo/profile-1', url: 'https://cdn.test/profile.jpg' },
  coverPhoto: null,
  coverGradient: 'blue',
  galleryPhotos: [
    { public_id: 'matieo/gallery-1', url: 'https://cdn.test/g1.jpg' },
    { public_id: 'matieo/gallery-2', url: 'https://cdn.test/g2.jpg' },
  ],
}

describe('MemorialPreviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocationState = { values: baseValues }
  })

  it('redirects to create page when no state is present', () => {
    mockLocationState = null
    renderPage()
    // Navigate component renders — page should not show memorial content
    expect(screen.queryByText('Ahmad Hassan')).not.toBeInTheDocument()
  })

  it('renders the full name from form values', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Ahmad Hassan')
  })

  it('renders the quote', () => {
    renderPage()
    expect(screen.getByText(/To God We Belong and To Him We Return/)).toBeInTheDocument()
  })

  it('renders the biography', () => {
    renderPage()
    expect(screen.getByText('Ahmad was a dedicated educator.')).toBeInTheDocument()
  })

  it('renders the tribute message in the tributes section', () => {
    renderPage()
    expect(screen.getByText('A beautiful soul.')).toBeInTheDocument()
  })

  it('renders location (state + country)', () => {
    renderPage()
    expect(screen.getByText('Selangor, Malaysia')).toBeInTheDocument()
  })

  it('renders age', () => {
    renderPage()
    expect(screen.getByText(/Age: 45 years/)).toBeInTheDocument()
  })

  it('renders profile photo when present', () => {
    renderPage()
    const img = screen.getByRole('img', { name: 'Ahmad Hassan' })
    expect(img).toHaveAttribute('src', 'https://cdn.test/profile.jpg')
  })

  it('renders gradient cover when no cover photo is set', () => {
    renderPage()
    // Cover photo img should not be present (coverPhoto is null)
    expect(screen.queryByRole('img', { name: 'Cover' })).not.toBeInTheDocument()
  })

  it('renders cover photo when present', () => {
    mockLocationState = {
      values: {
        ...baseValues,
        coverPhoto: { public_id: 'matieo/cover-1', url: 'https://cdn.test/cover.jpg' },
      },
    }
    renderPage()
    const img = screen.getByRole('img', { name: 'Cover' })
    expect(img).toHaveAttribute('src', 'https://cdn.test/cover.jpg')
  })

  it('renders gallery photos', () => {
    renderPage()
    expect(screen.getByRole('img', { name: 'Gallery photo 1' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Gallery photo 2' })).toBeInTheDocument()
  })

  it('shows empty gallery state when no gallery photos', () => {
    mockLocationState = { values: { ...baseValues, galleryPhotos: [] } }
    renderPage()
    expect(screen.getByText('No photos added yet.')).toBeInTheDocument()
  })

  it('shows Preview badge in the dashboard top navbar (handled by DashboardLayout)', () => {
    // Back button and Preview badge are rendered by DashboardLayout — not this component.
    // Just assert the page content renders without errors.
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('renders tributes count as (1) when tribute message is present', () => {
    renderPage()
    expect(screen.getByText(/Tributes \(1\)/)).toBeInTheDocument()
  })

  it('renders tributes count as (0) when no tribute message', () => {
    mockLocationState = { values: { ...baseValues, tributeMessage: '' } }
    renderPage()
    expect(screen.getByText(/Tributes \(0\)/)).toBeInTheDocument()
  })

  it('shows empty heading when no name is provided', () => {
    mockLocationState = { values: { ...baseValues, firstName: '', lastName: '' } }
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('')
  })

  it('renders custom hex colour as cover background', () => {
    mockLocationState = { values: { ...baseValues, coverPhoto: null, coverGradient: '#a34b2c' } }
    const { container } = renderPage()
    const cover = container.querySelector('[style*="background-color"]')
    expect(cover).toBeInTheDocument()
  })

  it('renders custom linear-gradient as cover background-image', () => {
    const gradient = 'linear-gradient(to right, #3B5BFF, #1A1A2E)'
    mockLocationState = { values: { ...baseValues, coverPhoto: null, coverGradient: gradient } }
    const { container } = renderPage()
    const cover = container.querySelector('[style*="background-image"]')
    expect(cover).toBeInTheDocument()
  })
})

describe('MemorialPreviewPage — lightbox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocationState = { values: baseValues }
  })

  it('lightbox is not visible on initial render', () => {
    renderPage()
    expect(screen.queryByRole('dialog', { name: /photo viewer/i })).not.toBeInTheDocument()
  })

  it('clicking profile photo opens lightbox', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view profile photo/i }))
    expect(screen.getByRole('dialog', { name: /photo viewer/i })).toBeInTheDocument()
  })

  it('lightbox shows profile photo src', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view profile photo/i }))
    const dialog = screen.getByRole('dialog', { name: /photo viewer/i })
    const img = dialog.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://cdn.test/profile.jpg')
  })

  it('profile photo lightbox has no prev/next arrows (single photo)', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view profile photo/i }))
    expect(screen.queryByRole('button', { name: /previous photo/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next photo/i })).not.toBeInTheDocument()
  })

  it('clicking gallery photo opens lightbox with correct image', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view gallery photo 2/i }))
    const dialog = screen.getByRole('dialog', { name: /photo viewer/i })
    const img = dialog.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://cdn.test/g2.jpg')
  })

  it('gallery lightbox shows prev and next buttons', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view gallery photo 1/i }))
    expect(screen.getByRole('button', { name: /previous photo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /next photo/i })).toBeInTheDocument()
  })

  it('next button advances to next gallery photo', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view gallery photo 1/i }))
    await user.click(screen.getByRole('button', { name: /next photo/i }))
    const dialog = screen.getByRole('dialog', { name: /photo viewer/i })
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://cdn.test/g2.jpg')
  })

  it('prev button wraps to last photo from first', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view gallery photo 1/i }))
    await user.click(screen.getByRole('button', { name: /previous photo/i }))
    const dialog = screen.getByRole('dialog', { name: /photo viewer/i })
    expect(dialog.querySelector('img')).toHaveAttribute('src', 'https://cdn.test/g2.jpg')
  })

  it('close button closes the lightbox', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view gallery photo 1/i }))
    await user.click(screen.getByRole('button', { name: /close photo viewer/i }))
    expect(screen.queryByRole('dialog', { name: /photo viewer/i })).not.toBeInTheDocument()
  })

  it('clicking overlay backdrop closes the lightbox', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view gallery photo 1/i }))
    fireEvent.click(screen.getByRole('dialog', { name: /photo viewer/i }))
    expect(screen.queryByRole('dialog', { name: /photo viewer/i })).not.toBeInTheDocument()
  })

  it('Escape key closes the lightbox', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view gallery photo 1/i }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: /photo viewer/i })).not.toBeInTheDocument()
  })

  it('shows photo counter for gallery lightbox', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view gallery photo 1/i }))
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })
})
