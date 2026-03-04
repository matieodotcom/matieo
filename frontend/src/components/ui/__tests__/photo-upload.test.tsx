import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils'
import { PhotoUpload, GalleryUpload } from '../PhotoUpload'
import { uploadToCloudinary } from '@/lib/cloudinary'

vi.mock('@/lib/cloudinary')
const mockUpload = vi.mocked(uploadToCloudinary)

beforeEach(() => {
  mockUpload.mockReset()
})

describe('PhotoUpload', () => {
  it('renders upload zone when no value', () => {
    renderWithProviders(
      <PhotoUpload label="Memorial Photo" value={null} onChange={vi.fn()} />,
    )
    expect(screen.getByText('Memorial Photo')).toBeInTheDocument()
    expect(screen.getByText('Click or drag to upload')).toBeInTheDocument()
  })

  it('shows preview image when value is set', () => {
    renderWithProviders(
      <PhotoUpload
        label="Memorial Photo"
        value={{ public_id: 'abc', url: 'https://example.com/photo.jpg' }}
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('img', { name: 'Memorial Photo' })).toBeInTheDocument()
  })

  it('calls onChange(null) when remove button is clicked', async () => {
    const onChange = vi.fn()
    renderWithProviders(
      <PhotoUpload
        label="Cover Photo"
        value={{ public_id: 'abc', url: 'https://example.com/photo.jpg' }}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remove Cover Photo' }))
    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('uploads file and calls onChange with result', async () => {
    mockUpload.mockResolvedValue({ public_id: 'new-id', secure_url: 'https://example.com/new.jpg' })
    const onChange = vi.fn()
    renderWithProviders(
      <PhotoUpload label="Memorial Photo" value={null} onChange={onChange} />,
    )

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)

    await waitFor(() => expect(onChange).toHaveBeenCalledWith({
      public_id: 'new-id',
      url: 'https://example.com/new.jpg',
    }))
  })

  it('shows error message when upload fails', async () => {
    mockUpload.mockRejectedValue(new Error('Upload failed'))
    renderWithProviders(
      <PhotoUpload label="Memorial Photo" value={null} onChange={vi.fn()} />,
    )

    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('Upload failed'),
    )
  })

  it('shows error when file exceeds max size', async () => {
    renderWithProviders(
      <PhotoUpload label="Test" value={null} onChange={vi.fn()} maxSizeMb={1} />,
    )
    // Create a mock 2MB file
    const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })
    Object.defineProperty(largeFile, 'size', { value: 2 * 1024 * 1024 })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, largeFile)
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('smaller than 1MB'),
    )
  })
})

describe('GalleryUpload', () => {
  it('renders add photo button when gallery is empty', () => {
    renderWithProviders(
      <GalleryUpload values={[]} onChange={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: 'Add photo' })).toBeInTheDocument()
    expect(screen.getByText('0 / 5 photos')).toBeInTheDocument()
  })

  it('removes a photo when × is clicked', async () => {
    const onChange = vi.fn()
    renderWithProviders(
      <GalleryUpload
        values={[
          { public_id: 'id1', url: 'https://example.com/1.jpg' },
          { public_id: 'id2', url: 'https://example.com/2.jpg' },
        ]}
        onChange={onChange}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo 1' }))
    expect(onChange).toHaveBeenCalledWith([{ public_id: 'id2', url: 'https://example.com/2.jpg' }])
  })

  it('hides add button when max photos reached', () => {
    renderWithProviders(
      <GalleryUpload
        values={Array.from({ length: 5 }, (_, i) => ({ public_id: `id${i}`, url: `https://example.com/${i}.jpg` }))}
        onChange={vi.fn()}
        max={5}
      />,
    )
    expect(screen.queryByRole('button', { name: 'Add photo' })).not.toBeInTheDocument()
  })
})
