import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AllProviders } from '@/__tests__/utils'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

describe('useCondolences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches from the correct URL', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: [], error: null })

    const { useCondolences } = await import('@/hooks/use-condolences')
    const { result } = renderHook(() => useCondolences('obit-456'), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/obituaries/obit-456/condolences')
  })

  it('returns data from the response', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    const mockCondolences = [
      {
        id: 'condolence-1',
        obituary_id: 'obit-456',
        user_id: 'user-2',
        author_name: 'John Smith',
        message: 'Our deepest condolences.',
        created_at: '2026-03-09T11:00:00Z',
      },
    ]
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: mockCondolences, error: null })

    const { useCondolences } = await import('@/hooks/use-condolences')
    const { result } = renderHook(() => useCondolences('obit-456'), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toEqual(mockCondolences)
  })

  it('does not fetch when obituaryId is empty', async () => {
    const { apiFetch } = await import('@/lib/apiClient')

    const { useCondolences } = await import('@/hooks/use-condolences')
    renderHook(() => useCondolences(''), { wrapper: AllProviders })

    await new Promise((r) => setTimeout(r, 50))
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
  })
})

describe('usePostCondolence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls POST to the correct URL', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({ data: [], error: null }) // useCondolences query
      .mockResolvedValueOnce({ data: { id: 'new-condolence' }, error: null }) // mutation

    const { useCondolences, usePostCondolence } = await import('@/hooks/use-condolences')

    const { result } = renderHook(
      () => ({ condolences: useCondolences('obit-456'), post: usePostCondolence('obit-456') }),
      { wrapper: AllProviders },
    )

    await act(async () => {
      result.current.post.mutate('Our sincere condolences')
    })

    await waitFor(() => expect(result.current.post.isSuccess).toBe(true))

    const postCall = vi.mocked(apiFetch).mock.calls.find(
      ([url, opts]) => url === '/api/obituaries/obit-456/condolences' && (opts as RequestInit)?.method === 'POST',
    )
    expect(postCall).toBeDefined()
    expect(postCall![1]).toMatchObject({ method: 'POST', body: JSON.stringify({ message: 'Our sincere condolences' }) })
  })
})
