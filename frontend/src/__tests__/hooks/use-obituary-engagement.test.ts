import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AllProviders } from '@/__tests__/utils'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}))

describe('useTrackObituaryView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls POST /api/obituaries/:id/view on mount when id provided', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { view_count: 1 }, error: null })

    const { useTrackObituaryView } = await import('@/hooks/use-obituary-engagement')
    renderHook(() => useTrackObituaryView('obit-456'), { wrapper: AllProviders })

    await waitFor(() =>
      expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
        '/api/obituaries/obit-456/view',
        { method: 'POST' },
      ),
    )
  })

  it('does not call apiFetch when id is empty', async () => {
    const { apiFetch } = await import('@/lib/apiClient')

    const { useTrackObituaryView } = await import('@/hooks/use-obituary-engagement')
    renderHook(() => useTrackObituaryView(''), { wrapper: AllProviders })

    await new Promise((r) => setTimeout(r, 50))
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
  })
})

describe('useLikeObituary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls POST /api/obituaries/:id/like on mutate', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({
      data: { like_count: 2, user_liked: true },
      error: null,
    })

    const { useLikeObituary } = await import('@/hooks/use-obituary-engagement')
    const { result } = renderHook(
      () => useLikeObituary('obit-456', 'jane-smith-2025'),
      { wrapper: AllProviders },
    )

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/obituaries/obit-456/like',
      { method: 'POST' },
    )
  })

  it('exposes like_count and user_liked from response', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({
      data: { like_count: 0, user_liked: false },
      error: null,
    })

    const { useLikeObituary } = await import('@/hooks/use-obituary-engagement')
    const { result } = renderHook(
      () => useLikeObituary('obit-456', 'jane-smith-2025'),
      { wrapper: AllProviders },
    )

    await act(async () => {
      result.current.mutate()
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.like_count).toBe(0)
    expect(result.current.data?.data.user_liked).toBe(false)
  })
})
