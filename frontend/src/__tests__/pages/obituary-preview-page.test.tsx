import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import testI18n from '@/lib/i18n-test'
import ObituaryPreviewPage from '@/pages/app/ObituaryPreviewPage'
import type { ObituaryFormValues } from '@/hooks/use-create-obituary'

let mockLocationState: { values: ObituaryFormValues } | null = null

vi.mock('react-router-dom', async (importActual) => {
  const actual = await importActual<typeof import('react-router-dom')>()
  return {
    ...actual,
    useLocation: () => ({ state: mockLocationState, pathname: '/dashboard/obituary/preview' }),
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
          <ObituaryPreviewPage />
        </QueryClientProvider>
      </MemoryRouter>
    </I18nextProvider>
  )
}

const baseValues: ObituaryFormValues = {
  firstName: 'Aisha',
  lastName: 'Bello',
  ageAtDeath: '72',
  dateOfBirth: '1953-06-10',
  dateOfDeath: '2025-12-01',
  gender: 'female',
  raceEthnicity: 'Nigerian',
  country: 'Nigeria',
  state: 'Lagos',
  causeOfPassing: 'Natural causes',
  causeOfPassingConsented: false,
  contactPersonName: 'Ibrahim Bello',
  contactPersonRelationship: 'Son',
  contactPersonPhone: '+234 801 234 5678',
  contactPersonEmail: 'ibrahim@example.com',
  familyMembers: [
    { name: 'Ibrahim Bello', relationship: 'Son' },
    { name: 'Fatima Bello', relationship: 'Daughter' },
  ],
  biography: 'Aisha was a devoted mother and community leader.',
  funeralName: 'Central Mosque Lagos',
  funeralLocation: 'Lagos Island',
  funeralDate: '2025-12-05',
  funeralTime: '10:00',
  funeralNote: 'All are welcome.',
  burialCenterName: 'Islamic Garden Cemetery',
  burialLocation: 'Ikoyi, Lagos',
  burialDate: '2025-12-05',
  burialTime: '14:00',
  burialNote: '',
  profilePhoto: { public_id: 'matieo/obit-profile-1', url: 'https://cdn.test/aisha.jpg' },
  coverPhoto: null,
  deathCertPhoto: null,
}

describe('ObituaryPreviewPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocationState = { values: baseValues }
  })

  it('redirects to create page when no state is present', () => {
    mockLocationState = null
    renderPage()
    expect(screen.queryByText('Aisha Bello')).not.toBeInTheDocument()
  })

  it('renders the full name from form values', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Aisha Bello')
  })

  it('renders the biography', () => {
    renderPage()
    expect(screen.getByText('Aisha was a devoted mother and community leader.')).toBeInTheDocument()
  })

  it('renders location (state + country)', () => {
    renderPage()
    expect(screen.getByText('Lagos, Nigeria')).toBeInTheDocument()
  })

  it('renders age', () => {
    renderPage()
    expect(screen.getByText(/Age: 72 years/)).toBeInTheDocument()
  })

  it('renders profile photo when present', () => {
    renderPage()
    const img = screen.getByRole('img', { name: 'Aisha Bello' })
    expect(img).toHaveAttribute('src', 'https://cdn.test/aisha.jpg')
  })

  it('renders gradient cover when no cover photo is set', () => {
    renderPage()
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

  it('renders family members section', () => {
    renderPage()
    expect(screen.getByText('Family Members')).toBeInTheDocument()
    expect(screen.getAllByText('Ibrahim Bello').length).toBeGreaterThan(0)
    expect(screen.getByText('Fatima Bello')).toBeInTheDocument()
  })

  it('hides family members section when none added', () => {
    mockLocationState = { values: { ...baseValues, familyMembers: [] } }
    renderPage()
    expect(screen.queryByText('Family Members')).not.toBeInTheDocument()
  })

  it('renders funeral details', () => {
    renderPage()
    expect(screen.getByText('Funeral / Prayer Service')).toBeInTheDocument()
    expect(screen.getByText('Central Mosque Lagos')).toBeInTheDocument()
    expect(screen.getByText('Lagos Island')).toBeInTheDocument()
    expect(screen.getByText('All are welcome.')).toBeInTheDocument()
  })

  it('hides funeral section when no funeral data', () => {
    mockLocationState = {
      values: {
        ...baseValues,
        funeralName: '',
        funeralLocation: '',
        funeralDate: '',
      },
    }
    renderPage()
    expect(screen.queryByText('Funeral / Prayer Service')).not.toBeInTheDocument()
  })

  it('renders burial details', () => {
    renderPage()
    expect(screen.getByText('Burial')).toBeInTheDocument()
    expect(screen.getByText('Islamic Garden Cemetery')).toBeInTheDocument()
    expect(screen.getByText('Ikoyi, Lagos')).toBeInTheDocument()
  })

  it('hides burial section when no burial data', () => {
    mockLocationState = {
      values: {
        ...baseValues,
        burialCenterName: '',
        burialLocation: '',
        burialDate: '',
      },
    }
    renderPage()
    expect(screen.queryByText('Burial')).not.toBeInTheDocument()
  })

  it('renders contact person section', () => {
    renderPage()
    expect(screen.getByText('Contact Person')).toBeInTheDocument()
    // Ibrahim appears in both family members and contact person
    expect(screen.getAllByText('Ibrahim Bello').length).toBeGreaterThan(0)
    expect(screen.getByText('+234 801 234 5678')).toBeInTheDocument()
    expect(screen.getByText('ibrahim@example.com')).toBeInTheDocument()
  })

  it('hides contact section when no contact data', () => {
    mockLocationState = {
      values: {
        ...baseValues,
        contactPersonName: '',
        contactPersonPhone: '',
        contactPersonEmail: '',
      },
    }
    renderPage()
    expect(screen.queryByText('Contact Person')).not.toBeInTheDocument()
  })

  it('does not show cause of passing (private field)', () => {
    renderPage()
    expect(screen.queryByText('Cause of Passing')).not.toBeInTheDocument()
    expect(screen.queryByText('Natural causes')).not.toBeInTheDocument()
  })

  it('shows placeholder when no name provided', () => {
    mockLocationState = { values: { ...baseValues, firstName: '', lastName: '' } }
    renderPage()
    expect(screen.getByText('No name provided')).toBeInTheDocument()
  })

  it('shows placeholder when no biography provided', () => {
    mockLocationState = { values: { ...baseValues, biography: '' } }
    renderPage()
    expect(screen.getByText('No biography added yet.')).toBeInTheDocument()
  })
})

describe('ObituaryPreviewPage — lightbox', () => {
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
    expect(img).toHaveAttribute('src', 'https://cdn.test/aisha.jpg')
  })

  it('profile photo lightbox has no prev/next arrows (single photo)', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view profile photo/i }))
    expect(screen.queryByRole('button', { name: /previous photo/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /next photo/i })).not.toBeInTheDocument()
  })

  it('close button closes the lightbox', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view profile photo/i }))
    await user.click(screen.getByRole('button', { name: /close photo viewer/i }))
    expect(screen.queryByRole('dialog', { name: /photo viewer/i })).not.toBeInTheDocument()
  })

  it('clicking overlay backdrop closes the lightbox', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view profile photo/i }))
    fireEvent.click(screen.getByRole('dialog', { name: /photo viewer/i }))
    expect(screen.queryByRole('dialog', { name: /photo viewer/i })).not.toBeInTheDocument()
  })

  it('Escape key closes the lightbox', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(screen.getByRole('button', { name: /view profile photo/i }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: /photo viewer/i })).not.toBeInTheDocument()
  })
})
