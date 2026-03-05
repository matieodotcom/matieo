import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PhotoUpload } from '@/components/ui/PhotoUpload'
import type { PhotoValue } from '@/components/ui/PhotoUpload'

vi.mock('@/lib/cloudinary', () => ({
  uploadToCloudinary: vi.fn(),
}))

const mockPhoto: PhotoValue = {
  public_id: 'matieo/test-photo',
  url: 'https://res.cloudinary.com/test/image/upload/matieo/test-photo.jpg',
}

describe('PhotoUpload', () => {
  const defaultProps = {
    label: 'Memorial Photo',
    hint: 'Recommended 360×360px, up to 10MB',
    value: null,
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders label and hint', () => {
    render(<PhotoUpload {...defaultProps} />)
    expect(screen.getByText('Memorial Photo')).toBeInTheDocument()
    expect(screen.getByText('Recommended 360×360px, up to 10MB')).toBeInTheDocument()
  })

  it('shows upload area when value is null', () => {
    render(<PhotoUpload {...defaultProps} />)
    expect(screen.getByText('Click or drag to upload')).toBeInTheDocument()
  })

  it('shows uploaded image when value is set', () => {
    render(<PhotoUpload {...defaultProps} value={mockPhoto} />)
    const img = screen.getByRole('img', { name: 'Memorial Photo' })
    expect(img).toHaveAttribute('src', mockPhoto.url)
    expect(screen.queryByText('Click or drag to upload')).not.toBeInTheDocument()
  })

  it('calls onChange with null when remove button is clicked', () => {
    const onChange = vi.fn()
    render(<PhotoUpload {...defaultProps} value={mockPhoto} onChange={onChange} />)
    const removeBtn = screen.getByRole('button', { name: /remove memorial photo/i })
    fireEvent.click(removeBtn)
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('renders external error message when error prop is provided', () => {
    render(<PhotoUpload {...defaultProps} error="Memorial photo is required" />)
    expect(screen.getByText('Memorial photo is required')).toBeInTheDocument()
  })

  it('does not render external error when error prop is absent', () => {
    render(<PhotoUpload {...defaultProps} />)
    // The only alert should not exist (no upload error yet, no external error)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not render external error when value is set', () => {
    render(<PhotoUpload {...defaultProps} value={mockPhoto} error={undefined} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows upload error after failed upload', async () => {
    const { uploadToCloudinary } = await import('@/lib/cloudinary')
    vi.mocked(uploadToCloudinary).mockRejectedValueOnce(new Error('Upload failed'))

    render(<PhotoUpload {...defaultProps} />)

    const uploadArea = screen.getByRole('button')
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Upload failed')
    })
  })
})
