import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AllProviders } from '../utils'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('useDeleteMemorial', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls DELETE /api/memorials/:id/permanent', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { id: 'mem-1' }, error: null })

    const { useDeleteMemorial } = await import('@/hooks/use-delete-memorial')
    const { result } = renderHook(() => useDeleteMemorial(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await act(async () => {
      result.current.mutate('mem-1')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/memorials/mem-1/permanent',
      { method: 'DELETE' },
    )
  })

  it('calls toast.success on success', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { id: 'mem-1' }, error: null })

    const { toast } = await import('@/lib/toast')
    const { useDeleteMemorial } = await import('@/hooks/use-delete-memorial')
    const { result } = renderHook(() => useDeleteMemorial(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await act(async () => {
      result.current.mutate('mem-1')
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(toast.success)).toHaveBeenCalledWith('Draft deleted')
  })

  it('exposes error when request fails', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Forbidden'))

    const { useDeleteMemorial } = await import('@/hooks/use-delete-memorial')
    const { result } = renderHook(() => useDeleteMemorial(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await act(async () => {
      result.current.mutate('mem-1')
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Forbidden')
  })
})
