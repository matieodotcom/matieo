import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/store/authStore'

// We need react-router for useSignOut
vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

// Import hooks after mocks are set up
const getModule = () => import('@/hooks/use-auth')

describe('useAuthListener', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, session: null, isLoading: true })
    vi.clearAllMocks()
  })

  it('calls getSession on mount and sets store', async () => {
    const mockUser = { id: 'u1', email: 'a@b.com', user_metadata: {} }
    const mockSession = { user: mockUser, access_token: 'tok' }
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession as never },
      error: null,
    })

    const { useAuthListener } = await getModule()
    renderHook(() => useAuthListener())

    await waitFor(() => {
      expect(supabase.auth.getSession).toHaveBeenCalledOnce()
    })
  })

  it('sets isLoading=false after session resolves', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const { useAuthListener } = await getModule()
    renderHook(() => useAuthListener())

    await waitFor(() => {
      expect(useAuthStore.getState().isLoading).toBe(false)
    })
  })

  it('subscribes to onAuthStateChange and unsubscribes on unmount', async () => {
    const unsubscribe = vi.fn()
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValueOnce({
      data: { subscription: { unsubscribe } },
    } as never)
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const { useAuthListener } = await getModule()
    const { unmount } = renderHook(() => useAuthListener())
    unmount()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('updates user/session on SIGNED_IN event', async () => {
    const mockUser = { id: 'u1', email: 'a@b.com', user_metadata: {} }
    const mockSession = { user: mockUser, access_token: 'tok' }
    let capturedCallback: ((event: string, session: unknown) => void) | null = null

    vi.mocked(supabase.auth.onAuthStateChange).mockImplementationOnce((cb) => {
      capturedCallback = cb as never
      return { data: { subscription: { unsubscribe: vi.fn() } } } as never
    })
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null,
    })

    const { useAuthListener } = await getModule()
    renderHook(() => useAuthListener())

    act(() => {
      capturedCallback?.('SIGNED_IN', mockSession)
    })

    await waitFor(() => {
      expect(useAuthStore.getState().user?.id).toBe('u1')
    })
  })
})

describe('useSignUp', () => {
  beforeEach(() => vi.clearAllMocks())

  it('emailSent=false initially', async () => {
    const { useSignUp } = await getModule()
    const { result } = renderHook(() => useSignUp())
    expect(result.current.emailSent).toBe(false)
  })

  it('sets emailSent=true and calls toast on success', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: null,
    } as never)

    const { useSignUp } = await getModule()
    const { result } = renderHook(() => useSignUp())

    act(() => {
      result.current.form.setValue('fullName', 'Jane Smith')
      result.current.form.setValue('email', 'jane@example.com')
      result.current.form.setValue('password', 'password123')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    await waitFor(() => {
      expect(result.current.emailSent).toBe(true)
    })
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('jane@example.com')
    )
  })

  it('sets error state on auth error (no toast)', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered' } as never,
    })

    const { useSignUp } = await getModule()
    const { result } = renderHook(() => useSignUp())

    act(() => {
      result.current.form.setValue('fullName', 'Jane Smith')
      result.current.form.setValue('email', 'jane@example.com')
      result.current.form.setValue('password', 'password123')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    await waitFor(() => {
      expect(result.current.error).toBe('User already registered')
    })
    expect(toast.success).not.toHaveBeenCalled()
    expect(result.current.emailSent).toBe(false)
  })

  it('does not call supabase.auth.signUp when Zod validation fails', async () => {
    const { useSignUp } = await getModule()
    const { result } = renderHook(() => useSignUp())

    // Submit with empty values (defaults) — Zod should reject
    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })
})

describe('useGoogleAuth', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls signInWithOAuth with google provider', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://google.com' },
      error: null,
    } as never)

    const { useGoogleAuth } = await getModule()
    const { result } = renderHook(() => useGoogleAuth())

    await act(async () => {
      await result.current.handleGoogleAuth()
    })

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' })
    )
  })

  it('passes redirectTo in options', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
      data: { provider: 'google', url: 'https://google.com' },
      error: null,
    } as never)

    const { useGoogleAuth } = await getModule()
    const { result } = renderHook(() => useGoogleAuth())

    await act(async () => {
      await result.current.handleGoogleAuth()
    })

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ redirectTo: expect.any(String) }),
      })
    )
  })

  it('sets error state on auth error', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
      data: { provider: 'google', url: null },
      error: { message: 'OAuth failed' } as never,
    } as never)

    const { useGoogleAuth } = await getModule()
    const { result } = renderHook(() => useGoogleAuth())

    await act(async () => {
      await result.current.handleGoogleAuth()
    })

    expect(result.current.error).toBe('OAuth failed')
  })
})

describe('useSignOut', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: { id: 'u1' } as never, session: {} as never })
    vi.clearAllMocks()
  })

  it('calls supabase.auth.signOut', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null })

    const { useSignOut } = await getModule()
    const { result } = renderHook(() => useSignOut())

    await act(async () => {
      await result.current.signOut()
    })

    expect(supabase.auth.signOut).toHaveBeenCalledOnce()
  })

  it('clears auth store after sign out', async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null })

    const { useSignOut } = await getModule()
    const { result } = renderHook(() => useSignOut())

    await act(async () => {
      await result.current.signOut()
    })

    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().session).toBeNull()
  })
})
