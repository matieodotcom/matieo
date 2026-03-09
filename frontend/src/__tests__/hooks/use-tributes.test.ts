import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AllProviders } from '@/__tests__/utils'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

describe('useTributes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches from the correct URL', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: [], error: null })

    const { useTributes } = await import('@/hooks/use-tributes')
    const { result } = renderHook(() => useTributes('mem-123'), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/memorials/mem-123/tributes')
  })

  it('returns data from the response', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    const mockTributes = [
      {
        id: 'tribute-1',
        memorial_id: 'mem-123',
        user_id: 'user-1',
        author_name: 'Jane Smith',
        message: 'Forever in our hearts.',
        created_at: '2026-03-09T10:00:00Z',
      },
    ]
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: mockTributes, error: null })

    const { useTributes } = await import('@/hooks/use-tributes')
    const { result } = renderHook(() => useTributes('mem-123'), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toEqual(mockTributes)
  })

  it('does not fetch when memorialId is empty', async () => {
    const { apiFetch } = await import('@/lib/apiClient')

    const { useTributes } = await import('@/hooks/use-tributes')
    renderHook(() => useTributes(''), { wrapper: AllProviders })

    // Give React Query a tick to potentially fire
    await new Promise((r) => setTimeout(r, 50))
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
  })
})

describe('usePostTribute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls POST to the correct URL', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ data: [], error: null }) // useTributes query
      .mockResolvedValueOnce({ data: { id: 'new-tribute' }, error: null }) // mutation

    const { useTributes, usePostTribute } = await import('@/hooks/use-tributes')

    const { result } = renderHook(
      () => ({ tributes: useTributes('mem-123'), post: usePostTribute('mem-123') }),
      { wrapper: AllProviders },
    )

    await act(async () => {
      result.current.post.mutate('A heartfelt tribute')
    })

    await waitFor(() => expect(result.current.post.isSuccess).toBe(true))

    const postCall = vi.mocked(apiFetch).mock.calls.find(
      ([url, opts]) => url === '/api/memorials/mem-123/tributes' && (opts as RequestInit)?.method === 'POST',
    )
    expect(postCall).toBeDefined()
    expect(postCall![1]).toMatchObject({ method: 'POST', body: JSON.stringify({ message: 'A heartfelt tribute' }) })
  })
})
