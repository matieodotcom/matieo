import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import CreateMemorialPage from '@/pages/app/CreateMemorialPage'

vi.mock('@/lib/apiClient', () => ({ apiFetch: vi.fn() }))
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('@/store/memorialDraftStore', () => ({
  useMemorialDraftStore: (
    sel: (s: { draft: null; saveDraft: () => void; clearDraft: () => void }) => unknown,
  ) => sel({ draft: null, saveDraft: vi.fn(), clearDraft: vi.fn() }),
}))
vi.mock('@/lib/geo', () => ({
  buildCountryOptions: () => [],
  buildStateOptions: () => [],
  detectUserCountryCode: () => Promise.resolve(null),
}))

function renderPage() {
  return renderWithProviders(<CreateMemorialPage />, {
    initialRoute: '/dashboard/memorials/create',
  })
}

describe('CoverPhotoField', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows "Cover Background" label in upload section', () => {
    renderPage()
    expect(screen.getAllByText('Cover Background').length).toBeGreaterThan(0)
  })

  it('shows upload box with "Click or drag to upload / select gradient" in empty state', () => {
    renderPage()
    expect(
      screen.getByText('Click or drag to upload / select gradient'),
    ).toBeInTheDocument()
  })

  it('shows gradient preview after clicking a preset', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Ocean Blue' }))

    expect(
      screen.queryByText('Click or drag to upload / select gradient'),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear gradient' })).toBeInTheDocument()
  })

  it('shows upload box again after clicking X on gradient preview', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Ocean Blue' }))
    await user.click(screen.getByRole('button', { name: 'Clear gradient' }))

    expect(
      screen.getByText('Click or drag to upload / select gradient'),
    ).toBeInTheDocument()
  })

  it('gradient picker section is still visible after clicking X on gradient preview', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Ocean Blue' }))
    await user.click(screen.getByRole('button', { name: 'Clear gradient' }))

    expect(screen.getByRole('button', { name: 'Presets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom Gradient' })).toBeInTheDocument()
  })

  it('X on gradient preview does not clear the gradient form value (picker stays selected)', async () => {
    const user = userEvent.setup()
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Ocean Blue' }))
    await user.click(screen.getByRole('button', { name: 'Clear gradient' }))

    expect(screen.getByRole('button', { name: 'Ocean Blue' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('gradient picker is hidden when coverPhoto is set', async () => {
    const user = userEvent.setup()
    renderPage()

    // Presets should be visible initially (no photo)
    expect(screen.getByRole('button', { name: 'Presets' })).toBeInTheDocument()

    // Simulate photo upload via the hidden file input
    const { uploadToCloudinary } = await import('@/lib/cloudinary')
    vi.mocked(uploadToCloudinary).mockResolvedValueOnce({
      public_id: 'matieo/cover-test',
      secure_url: 'https://res.cloudinary.com/test/image/upload/matieo/cover-test.jpg',
    } as never)

    // Find the cover photo upload area (second file input — first is profile photo)
    const inputs = document.querySelectorAll('input[type="file"]')
    const coverInput = inputs[1] as HTMLInputElement
    const file = new File(['img'], 'cover.jpg', { type: 'image/jpeg' })
    Object.defineProperty(coverInput, 'files', { value: [file] })

    const { fireEvent } = await import('@testing-library/react')
    fireEvent.change(coverInput)

    await screen.findByRole('img', { name: 'Cover Background' })

    expect(screen.queryByRole('button', { name: 'Presets' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Custom Gradient' })).not.toBeInTheDocument()
  })
})
