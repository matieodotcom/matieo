import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

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
      data: { user: { identities: [{ id: '1' }] }, session: null },
      error: null,
    } as never)

    const { useSignUp } = await getModule()
    const { result } = renderHook(() => useSignUp())

    act(() => {
      result.current.form.setValue('firstName', 'Jane')
      result.current.form.setValue('lastName', 'Smith')
      result.current.form.setValue('email', 'jane@example.com')
      result.current.form.setValue('confirmEmail', 'jane@example.com')
      result.current.form.setValue('password', 'password123')
      result.current.form.setValue('confirmPassword', 'password123')
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
      result.current.form.setValue('firstName', 'Jane')
      result.current.form.setValue('lastName', 'Smith')
      result.current.form.setValue('email', 'jane@example.com')
      result.current.form.setValue('confirmEmail', 'jane@example.com')
      result.current.form.setValue('password', 'password123')
      result.current.form.setValue('confirmPassword', 'password123')
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

  it('sets error when email is already registered (empty identities)', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: { identities: [] }, session: null },
      error: null,
    } as never)

    const { useSignUp } = await getModule()
    const { result } = renderHook(() => useSignUp())

    act(() => {
      result.current.form.setValue('firstName', 'Jane')
      result.current.form.setValue('lastName', 'Smith')
      result.current.form.setValue('email', 'existing@example.com')
      result.current.form.setValue('confirmEmail', 'existing@example.com')
      result.current.form.setValue('password', 'password123')
      result.current.form.setValue('confirmPassword', 'password123')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    await waitFor(() => {
      expect(result.current.error).toBe(
        'An account with this email already exists. Please sign in instead.'
      )
    })
    expect(result.current.emailSent).toBe(false)
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('does not call supabase.auth.signUp when Zod validation fails', async () => {
    const { useSignUp } = await getModule()
    const { result } = renderHook(() => useSignUp())

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    expect(supabase.auth.signUp).not.toHaveBeenCalled()
  })

  it('passes full_name as firstName + lastName to supabase', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: { identities: [{ id: '1' }] }, session: null },
      error: null,
    } as never)

    const { useSignUp } = await getModule()
    const { result } = renderHook(() => useSignUp())

    act(() => {
      result.current.form.setValue('firstName', 'Jane')
      result.current.form.setValue('lastName', 'Smith')
      result.current.form.setValue('email', 'jane@example.com')
      result.current.form.setValue('confirmEmail', 'jane@example.com')
      result.current.form.setValue('password', 'password123')
      result.current.form.setValue('confirmPassword', 'password123')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    expect(supabase.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: { full_name: 'Jane Smith' },
        }),
      })
    )
  })
})

describe('useSignIn', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls signInWithPassword with email and password', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: {} as never, session: {} as never },
      error: null,
    })

    const { useSignIn } = await getModule()
    const { result } = renderHook(() => useSignIn())

    act(() => {
      result.current.form.setValue('email', 'jane@example.com')
      result.current.form.setValue('password', 'password123')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'password123',
    })
  })

  it('sets error state on wrong credentials (no toast)', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' } as never,
    })

    const { useSignIn } = await getModule()
    const { result } = renderHook(() => useSignIn())

    act(() => {
      result.current.form.setValue('email', 'jane@example.com')
      result.current.form.setValue('password', 'wrongpass')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Invalid login credentials')
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('does not call signInWithPassword when Zod validation fails', async () => {
    const { useSignIn } = await getModule()
    const { result } = renderHook(() => useSignIn())

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled()
  })

  it('isPending=false initially', async () => {
    const { useSignIn } = await getModule()
    const { result } = renderHook(() => useSignIn())
    expect(result.current.isPending).toBe(false)
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

describe('useForgotPassword', () => {
  beforeEach(() => vi.clearAllMocks())

  it('success → emailSent=true, no toast called', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
      data: {},
      error: null,
    } as never)

    const { useForgotPassword } = await getModule()
    const { result } = renderHook(() => useForgotPassword())

    act(() => {
      result.current.form.setValue('email', 'jane@example.com')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    await waitFor(() => {
      expect(result.current.emailSent).toBe(true)
    })
    expect(result.current.submittedEmail).toBe('jane@example.com')
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('auth error → sets error state', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValueOnce({
      data: {},
      error: { message: 'Email not found' } as never,
    })

    const { useForgotPassword } = await getModule()
    const { result } = renderHook(() => useForgotPassword())

    act(() => {
      result.current.form.setValue('email', 'jane@example.com')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Email not found')
    })
    expect(result.current.emailSent).toBe(false)
  })

  it('invalid email (Zod) → no supabase call', async () => {
    const { useForgotPassword } = await getModule()
    const { result } = renderHook(() => useForgotPassword())

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    expect(supabase.auth.resetPasswordForEmail).not.toHaveBeenCalled()
  })

  it('resend — calling resend() calls resetPasswordForEmail again', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: null,
    } as never)

    const { useForgotPassword } = await getModule()
    const { result } = renderHook(() => useForgotPassword())

    act(() => {
      result.current.form.setValue('email', 'jane@example.com')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    await waitFor(() => {
      expect(result.current.emailSent).toBe(true)
    })

    await act(async () => {
      await result.current.resend()
    })

    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledTimes(2)
  })
})

describe('useResetPassword', () => {
  beforeEach(() => vi.clearAllMocks())

  it('success → toast.success called and navigate invoked', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: {} as never },
      error: null,
    } as never)

    const { useResetPassword } = await getModule()
    const { result } = renderHook(() => useResetPassword())

    act(() => {
      result.current.form.setValue('password', 'newpassword1')
      result.current.form.setValue('confirmPassword', 'newpassword1')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Password updated successfully')
    })
  })

  it('auth error → error state set, no toast', async () => {
    vi.mocked(supabase.auth.updateUser).mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Auth session missing' } as never,
    } as never)

    const { useResetPassword } = await getModule()
    const { result } = renderHook(() => useResetPassword())

    act(() => {
      result.current.form.setValue('password', 'newpassword1')
      result.current.form.setValue('confirmPassword', 'newpassword1')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    await waitFor(() => {
      expect(result.current.error).toBe('Auth session missing')
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('Zod fail (short password) → no updateUser call', async () => {
    const { useResetPassword } = await getModule()
    const { result } = renderHook(() => useResetPassword())

    act(() => {
      result.current.form.setValue('password', 'short')
      result.current.form.setValue('confirmPassword', 'short')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    expect(supabase.auth.updateUser).not.toHaveBeenCalled()
  })

  it('Zod fail (passwords mismatch) → no updateUser call', async () => {
    const { useResetPassword } = await getModule()
    const { result } = renderHook(() => useResetPassword())

    act(() => {
      result.current.form.setValue('password', 'password123')
      result.current.form.setValue('confirmPassword', 'different456')
    })

    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as never)
    })

    expect(supabase.auth.updateUser).not.toHaveBeenCalled()
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
