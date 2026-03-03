import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AllProviders } from '../utils'

// Mock apiFetch before importing the hook
vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

const mockMemorialData = {
  data: [
    {
      id: 'memorial-id-123',
      created_by: 'test-user-id',
      full_name: 'John Doe',
      date_of_birth: '1945-03-15',
      date_of_death: '2024-01-10',
      age_at_death: 78,
      gender: 'male',
      race_ethnicity: 'Caucasian',
      location: 'Kuala Lumpur, Malaysia',
      status: 'published',
      slug: 'john-doe-2024',
      cover_url: null,
      biography: null,
      tribute_message: null,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z',
      deleted_at: null,
      cover_cloudinary_public_id: null,
      cause_of_death: null,
      full_memorial_url: null,
    },
  ],
  total: 1,
  page: 1,
  limit: 12,
  error: null,
}

describe('useMemorials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns memorials data on successful fetch', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialData)

    const { useMemorials } = await import('@/hooks/use-memorials')
    const { result } = renderHook(() => useMemorials(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].full_name).toBe('John Doe')
    expect(result.current.data?.total).toBe(1)
  })

  it('passes q param in the request URL', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ ...mockMemorialData, data: [] })

    const { useMemorials } = await import('@/hooks/use-memorials')
    renderHook(() => useMemorials({ q: 'john' }), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(vi.mocked(apiFetch)).toHaveBeenCalled())
    const url = vi.mocked(apiFetch).mock.calls[0][0] as string
    expect(url).toContain('q=john')
  })

  it('passes page param in the request URL', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialData)

    const { useMemorials } = await import('@/hooks/use-memorials')
    renderHook(() => useMemorials({ page: 3 }), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(vi.mocked(apiFetch)).toHaveBeenCalled())
    const url = vi.mocked(apiFetch).mock.calls[0][0] as string
    expect(url).toContain('page=3')
  })

  it('does not include q param when search is empty', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockMemorialData)

    const { useMemorials } = await import('@/hooks/use-memorials')
    renderHook(() => useMemorials({ q: '' }), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(vi.mocked(apiFetch)).toHaveBeenCalled())
    const url = vi.mocked(apiFetch).mock.calls[0][0] as string
    expect(url).not.toContain('q=')
  })

  it('sets isError when fetch fails', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Network error'))

    const { useMemorials } = await import('@/hooks/use-memorials')
    const { result } = renderHook(() => useMemorials(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('uses unique queryKey per q+page combination', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValue(mockMemorialData)

    const { useMemorials } = await import('@/hooks/use-memorials')
    const { result: r1 } = renderHook(() => useMemorials({ q: 'alice', page: 1 }), {
      wrapper: ({ children }) => AllProviders({ children }),
    })
    const { result: r2 } = renderHook(() => useMemorials({ q: 'bob', page: 1 }), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(r1.current.isSuccess).toBe(true))
    await waitFor(() => expect(r2.current.isSuccess).toBe(true))
    // Both hooks made separate calls (different query keys)
    expect(vi.mocked(apiFetch).mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})
