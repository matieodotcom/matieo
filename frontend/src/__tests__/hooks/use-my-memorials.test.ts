import { renderHook, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { AllProviders } from '../utils'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

const mockData = {
  data: [
    {
      id: 'memorial-id-123',
      created_by: 'test-user-id',
      full_name: 'Jane Smith',
      date_of_birth: '1950-06-01',
      date_of_death: '2023-12-20',
      age_at_death: 73,
      gender: 'female',
      race_ethnicity: null,
      location: 'London, UK',
      status: 'draft',
      slug: 'jane-smith-2023',
      cover_url: null,
      biography: null,
      tribute_message: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
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

describe('useMyMemorials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user memorials on successful fetch', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockData)

    const { useMyMemorials } = await import('@/hooks/use-my-memorials')
    const { result } = renderHook(() => useMyMemorials(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data[0].full_name).toBe('Jane Smith')
    expect(result.current.data?.total).toBe(1)
  })

  it('calls /api/memorials/mine endpoint', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockData)

    const { useMyMemorials } = await import('@/hooks/use-my-memorials')
    renderHook(() => useMyMemorials(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(vi.mocked(apiFetch)).toHaveBeenCalled())
    const url = vi.mocked(apiFetch).mock.calls[0][0] as string
    expect(url).toContain('/api/memorials/mine')
  })

  it('passes q param in the request URL', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce({ ...mockData, data: [] })

    const { useMyMemorials } = await import('@/hooks/use-my-memorials')
    renderHook(() => useMyMemorials({ q: 'jane' }), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(vi.mocked(apiFetch)).toHaveBeenCalled())
    const url = vi.mocked(apiFetch).mock.calls[0][0] as string
    expect(url).toContain('q=jane')
  })

  it('does not include q param when search is empty', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockResolvedValueOnce(mockData)

    const { useMyMemorials } = await import('@/hooks/use-my-memorials')
    renderHook(() => useMyMemorials({ q: '' }), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(vi.mocked(apiFetch)).toHaveBeenCalled())
    const url = vi.mocked(apiFetch).mock.calls[0][0] as string
    expect(url).not.toContain('q=')
  })

  it('sets isError when fetch fails', async () => {
    const { apiFetch } = await import('@/lib/apiClient')
    vi.mocked(apiFetch).mockRejectedValueOnce(new Error('Unauthorized'))

    const { useMyMemorials } = await import('@/hooks/use-my-memorials')
    const { result } = renderHook(() => useMyMemorials(), {
      wrapper: ({ children }) => AllProviders({ children }),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
