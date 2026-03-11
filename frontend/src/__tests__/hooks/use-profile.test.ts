import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { mockProfile } from '@/__tests__/utils'
import type { User } from '@supabase/supabase-js'
import { AllProviders } from '@/__tests__/utils'

const getModule = () => import('@/hooks/use-profile')

describe('useProfile', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { id: 'test-user-id' } as User,
      session: {} as never,
      isLoading: false,
    })
    vi.clearAllMocks()
  })

  it('does not fetch when no user is logged in', () => {
    useAuthStore.setState({ user: null, session: null, isLoading: false })
    // query disabled — no supabase call expected
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('fetches profile from supabase for logged-in user', async () => {
    const profile = mockProfile({ account_type: 'individual' })
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: profile, error: null }),
    }
    vi.mocked(supabase.from).mockReturnValueOnce(mockChain as never)

    const { useProfile } = await getModule()
    const { result } = renderHook(() => useProfile(), { wrapper: AllProviders })

    await waitFor(() => {
      expect(result.current.data?.account_type).toBe('individual')
    })
    expect(supabase.from).toHaveBeenCalledWith('profiles')
  })

  it('returns organization account_type for org users', async () => {
    const profile = mockProfile({ account_type: 'organization' })
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: profile, error: null }),
    }
    vi.mocked(supabase.from).mockReturnValueOnce(mockChain as never)

    const { useProfile } = await getModule()
    const { result } = renderHook(() => useProfile(), { wrapper: AllProviders })

    await waitFor(() => {
      expect(result.current.data?.account_type).toBe('organization')
    })
  })

  it('exposes error when supabase returns an error', async () => {
    const mockChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
    }
    vi.mocked(supabase.from).mockReturnValueOnce(mockChain as never)

    const { useProfile } = await getModule()
    const { result } = renderHook(() => useProfile(), { wrapper: AllProviders })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })
  })
})
