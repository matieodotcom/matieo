import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import CreateMemorialPage from '../CreateMemorialPage'

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

describe('CreateMemorialPage', () => {
  it('renders the page header', () => {
    renderWithProviders(<CreateMemorialPage />)
    expect(screen.getByText('Create a Memorial')).toBeInTheDocument()
  })

  it('renders all major sections', () => {
    renderWithProviders(<CreateMemorialPage />)
    expect(screen.getByText('Photos')).toBeInTheDocument()
    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Memorial Quote')).toBeInTheDocument()
    expect(screen.getByText('Memorial Message')).toBeInTheDocument()
    expect(screen.getByText('Photo Gallery')).toBeInTheDocument()
    expect(screen.getByText('Create Memorial Web Address')).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    renderWithProviders(<CreateMemorialPage />)
    expect(screen.getByLabelText(/First Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Biography/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Tribute Message/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Quote/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Memorial URL/)).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    renderWithProviders(<CreateMemorialPage />)
    expect(screen.getByRole('button', { name: 'Save as Draft' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Memorial/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows validation errors for required fields on publish attempt', async () => {
    renderWithProviders(<CreateMemorialPage />)
    await userEvent.click(screen.getByRole('button', { name: /Create Memorial/ }))
    await waitFor(() => {
      expect(screen.getByText('First name is required')).toBeInTheDocument()
    })
  })

  it('auto-derives slug from first and last name', async () => {
    renderWithProviders(<CreateMemorialPage />)
    const firstNameInput = screen.getByLabelText(/First Name/)
    const lastNameInput = screen.getByLabelText(/Last Name/)
    const slugInput = screen.getByLabelText(/Memorial URL/)

    await userEvent.type(firstNameInput, 'John')
    await userEvent.type(lastNameInput, 'Doe')

    await waitFor(() => {
      expect((slugInput as HTMLInputElement).value).toContain('john-doe')
    })
  })

  it('navigates to memorials when Cancel is clicked', async () => {
    renderWithProviders(<CreateMemorialPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/memorials')
  })

  it('saves draft without required-field errors', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValue({ data: { id: '1', slug: 'test' }, error: null })

    renderWithProviders(<CreateMemorialPage />)
    await userEvent.click(screen.getByRole('button', { name: 'Save as Draft' }))

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        '/api/memorials',
        expect.objectContaining({ body: expect.stringContaining('"status":"draft"') }),
      )
    })
  })

  it('shows char counter for biography', async () => {
    renderWithProviders(<CreateMemorialPage />)
    const bio = screen.getByLabelText(/Biography/)
    await userEvent.type(bio, 'Hello world')
    expect(screen.getByText(/11 \/ 4000/)).toBeInTheDocument()
  })

  it('shows URL preview with slug', async () => {
    renderWithProviders(<CreateMemorialPage />)
    const slugInput = screen.getByLabelText(/Memorial URL/)
    await userEvent.clear(slugInput)
    await userEvent.type(slugInput, 'my-memorial')
    await waitFor(() => {
      expect(screen.getByText(/Preview:.*my-memorial/)).toBeInTheDocument()
    })
  })
})
