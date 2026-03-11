import { renderHook, waitFor, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AllProviders } from '../utils'

// Unmock the real hooks so we test the actual implementation
vi.unmock('@/hooks/use-notifications')

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

// Supabase channel mock is already set up in global setup; supabase.channel is mocked
vi.mock('@/lib/supabase', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on:        vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
    auth: { onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }) },
  },
}))

const SAMPLE_RESPONSE = {
  data: [
    {
      id: 'notif-1', user_id: 'user-id', type: 'tribute_posted',
      title: 'New tribute', message: 'Someone left a tribute',
      resource_id: 'mem-1', resource_slug: 'john-doe-2024',
      is_read: false, read_at: null, created_at: new Date().toISOString(),
    },
    {
      id: 'notif-2', user_id: 'user-id', type: 'memorial_published',
      title: 'Memorial published', message: 'Your memorial is live',
      resource_id: 'mem-2', resource_slug: 'jane-doe-2024',
      is_read: true, read_at: new Date().toISOString(), created_at: new Date().toISOString(),
    },
  ],
  total: 2, page: 1, limit: 20, error: null,
}

describe('useNotifications', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('fetches from /api/notifications when userId provided', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(SAMPLE_RESPONSE)

    const { useNotifications } = await import('@/hooks/use-notifications')
    const { result } = renderHook(() => useNotifications('user-id'), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/notifications')
    expect(result.current.data?.data).toHaveLength(2)
  })

  it('does not fetch when userId is null', async () => {
    const { apiFetch } = await import('@/lib/apiClient')

    const { useNotifications } = await import('@/hooks/use-notifications')
    renderHook(() => useNotifications(null), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    // Wait a tick — no fetch should fire
    await act(async () => {})
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
  })

  it('returns correct unread count', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(SAMPLE_RESPONSE)

    const { useNotifications } = await import('@/hooks/use-notifications')
    const { result } = renderHook(() => useNotifications('user-id'), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const unread = result.current.data?.data.filter((n) => !n.is_read).length
    expect(unread).toBe(1)
  })
})

describe('useMarkAllRead', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('calls PATCH /api/notifications/read-all', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(SAMPLE_RESPONSE)  // for list query
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { updated: true }, error: null })

    const { useMarkAllRead } = await import('@/hooks/use-notifications')
    const { result } = renderHook(() => useMarkAllRead('user-id'), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await act(async () => { result.current.mutate() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calls = vi.mocked(apiFetch).mock.calls
    const patchCall = calls.find((c) => c[0] === '/api/notifications/read-all')
    expect(patchCall).toBeDefined()
    expect((patchCall?.[1] as RequestInit)?.method).toBe('PATCH')
  })
})

describe('useDeleteNotification', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('calls DELETE /api/notifications/:id', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(SAMPLE_RESPONSE)  // for list query
    vi.mocked(apiFetch).mockResolvedValueOnce({ data: { id: 'notif-1' }, error: null })

    const { useDeleteNotification } = await import('@/hooks/use-notifications')
    const { result } = renderHook(() => useDeleteNotification('user-id'), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await act(async () => { result.current.mutate('notif-1') })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calls = vi.mocked(apiFetch).mock.calls
    const deleteCall = calls.find((c) => c[0] === '/api/notifications/notif-1')
    expect(deleteCall).toBeDefined()
    expect((deleteCall?.[1] as RequestInit)?.method).toBe('DELETE')
  })
})
