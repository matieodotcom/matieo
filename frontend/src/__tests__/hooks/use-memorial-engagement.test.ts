import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AllProviders } from '@/__tests__/utils'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

// Mock supabase so the apiClient import doesn't break
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}))

describe('useTrackMemorialView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls POST /api/memorials/:id/view on mount when id provided', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { view_count: 1 }, error: null })

    const { useTrackMemorialView } = await import('@/hooks/use-memorial-engagement')
    renderHook(() => useTrackMemorialView('mem-123'), { wrapper: AllProviders })

    await waitFor(() =>
      expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
        '/api/memorials/mem-123/view',
        { method: 'POST' },
      ),
    )
  })

  it('does not call apiFetch when id is empty', async () => {
    const { apiFetch } = await import('@/lib/apiClient')

    const { useTrackMemorialView } = await import('@/hooks/use-memorial-engagement')
    renderHook(() => useTrackMemorialView(''), { wrapper: AllProviders })

    await new Promise((r) => setTimeout(r, 50))
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
  })
})

describe('useLikeMemorial', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls POST /api/memorials/:id/like on mutate', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({
      data: { like_count: 1, user_liked: true },
      error: null,
    })

    const { useLikeMemorial } = await import('@/hooks/use-memorial-engagement')
    const { result } = renderHook(
      () => useLikeMemorial('mem-123', 'john-doe-2024'),
      { wrapper: AllProviders },
    )

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/memorials/mem-123/like',
      { method: 'POST' },
    )
  })

  it('exposes like_count and user_liked from response', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({
      data: { like_count: 5, user_liked: false },
      error: null,
    })

    const { useLikeMemorial } = await import('@/hooks/use-memorial-engagement')
    const { result } = renderHook(
      () => useLikeMemorial('mem-123', 'john-doe-2024'),
      { wrapper: AllProviders },
    )

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.like_count).toBe(5)
    expect(result.current.data?.data.user_liked).toBe(false)
  })
})
