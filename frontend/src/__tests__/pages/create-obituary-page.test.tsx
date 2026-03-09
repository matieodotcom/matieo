import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import CreateObituaryPage from '@/pages/app/CreateObituaryPage'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('@/lib/cloudinary', () => ({
  uploadToCloudinary: vi.fn(),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({}) }
})

beforeEach(() => {
  mockNavigate.mockReset()
  vi.resetAllMocks()
})

describe('CreateObituaryPage', () => {
  it('renders the page header', () => {
    renderWithProviders(<CreateObituaryPage />)
    expect(screen.getByText("Let's create an online obituary")).toBeInTheDocument()
  })

  it('renders all major form sections', () => {
    renderWithProviders(<CreateObituaryPage />)
    expect(screen.getByText('Photos')).toBeInTheDocument()
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Cause of Passing (Optional)')).toBeInTheDocument()
    expect(screen.getByText('Funeral/Prayers Details (Optional)')).toBeInTheDocument()
    expect(screen.getByText('Burial Details (Optional)')).toBeInTheDocument()
    expect(screen.getByText('Contact Person')).toBeInTheDocument()
    expect(screen.getByText('Family Members (Optional)')).toBeInTheDocument()
    expect(screen.getByText('Memorial Message (Optional)')).toBeInTheDocument()
    expect(screen.getByText('Death Certificate (Optional)')).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    renderWithProviders(<CreateObituaryPage />)
    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Biography/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone Number/)).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    renderWithProviders(<CreateObituaryPage />)
    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows validation errors for required fields on publish attempt', async () => {
    renderWithProviders(<CreateObituaryPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Publish' }))
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })
  })

  it('navigates to /dashboard/obituary when Cancel is clicked', async () => {
    renderWithProviders(<CreateObituaryPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/obituary')
  })

  it('shows char counter for biography', async () => {
    renderWithProviders(<CreateObituaryPage />)
    const bio = screen.getByLabelText(/Biography/)
    await userEvent.type(bio, 'Hello world')
    expect(screen.getByText(/11 \/ 4000/)).toBeInTheDocument()
  })

  it('adds a family member when + Add Family Member is clicked', async () => {
    renderWithProviders(<CreateObituaryPage />)
    const addBtn = screen.getByRole('button', { name: 'Add Family Member' })
    await userEvent.click(addBtn)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Remove family member' })).toBeInTheDocument()
    })
  })

  it('saves draft without required-field errors', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValue({ data: { id: '1', slug: 'test' }, error: null })

    renderWithProviders(<CreateObituaryPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Save as Draft' }))

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/api/obituaries',
        expect.objectContaining({ body: expect.stringContaining('"status":"draft"') }),
      )
    })
  })
})
