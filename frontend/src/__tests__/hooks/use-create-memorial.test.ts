import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AllProviders } from '@/__tests__/utils'

// Must mock apiFetch before importing the hook
vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const getModule = () => import('@/hooks/use-create-memorial')

describe('useMemorialForm — buildPayload null photo fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends profile_cloudinary_public_id: null when profilePhoto is removed', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>
    mockApiFetch.mockResolvedValue({ data: { id: 'new-id', slug: 'test-slug' }, error: null })

    const { useMemorialForm } = await getModule()
    const { result } = renderHook(() => useMemorialForm(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await act(async () => {
      result.current.form.setValue('firstName', 'John')
      result.current.form.setValue('lastName', 'Doe')
      result.current.form.setValue('profilePhoto', null)
    })

    await act(async () => {
      await result.current.onSaveDraft()
    })

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled())

    const [, options] = mockApiFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(options.body as string)

    // Must be explicitly null (not omitted) so Supabase clears the column
    expect(body).toHaveProperty('profile_cloudinary_public_id', null)
    expect(body).toHaveProperty('profile_url', null)
  })

  it('sends cover_cloudinary_public_id: null when coverPhoto is removed', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>
    mockApiFetch.mockResolvedValue({ data: { id: 'new-id', slug: 'test-slug' }, error: null })

    const { useMemorialForm } = await getModule()
    const { result } = renderHook(() => useMemorialForm(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await act(async () => {
      result.current.form.setValue('firstName', 'Jane')
      result.current.form.setValue('lastName', 'Doe')
      result.current.form.setValue('coverPhoto', null)
    })

    await act(async () => {
      await result.current.onSaveDraft()
    })

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled())

    const [, options] = mockApiFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(options.body as string)

    expect(body).toHaveProperty('cover_cloudinary_public_id', null)
    expect(body).toHaveProperty('cover_url', null)
  })

  it('sends photo public_id and url when profilePhoto is set', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    const mockApiFetch = apiFetch as ReturnType<typeof vi.fn>
    mockApiFetch.mockResolvedValue({ data: { id: 'new-id', slug: 'test-slug' }, error: null })

    const { useMemorialForm } = await getModule()
    const { result } = renderHook(() => useMemorialForm(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await act(async () => {
      result.current.form.setValue('firstName', 'John')
      result.current.form.setValue('lastName', 'Doe')
      result.current.form.setValue('profilePhoto', {
        public_id: 'matieo/user/abc123',
        url: 'https://res.cloudinary.com/test/image/upload/abc123.jpg',
      })
    })

    await act(async () => {
      await result.current.onSaveDraft()
    })

    await waitFor(() => expect(mockApiFetch).toHaveBeenCalled())

    const [, options] = mockApiFetch.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(options.body as string)

    expect(body.profile_cloudinary_public_id).toBe('matieo/user/abc123')
    expect(body.profile_url).toBe('https://res.cloudinary.com/test/image/upload/abc123.jpg')
  })
})
