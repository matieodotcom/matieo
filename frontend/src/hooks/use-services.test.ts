import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'

// Mock apiFetch
vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/lib/apiClient'
import {
  usePublicServiceCategories,
  useMyServices,
  useCreateMyService,
  useUpdateMyService,
  useDeleteMyService,
  useServiceCategory,
  useServiceProvider,
  useServiceProviderComments,
  useCreateProviderComment,
} from './use-services'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => vi.clearAllMocks())

describe('usePublicServiceCategories', () => {
  it('fetches and returns categories', async () => {
    const mockData = { data: [{ id: 'c1', name: 'Florists', slug: 'florists', service_count: 3 }], error: null }
    vi.mocked(apiFetch).mockResolvedValue(mockData)
    const { result } = renderHook(() => usePublicServiceCategories(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/services/categories')
  })
})

describe('useMyServices', () => {
  it('fetches org user service listings', async () => {
    const mockData = { data: [{ id: 's1', name: 'My Flowers', category_id: 'c1', is_active: true }], error: null }
    vi.mocked(apiFetch).mockResolvedValue(mockData)
    const { result } = renderHook(() => useMyServices(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/services/my')
  })
})

describe('useCreateMyService', () => {
  it('calls POST /api/services/my', async () => {
    const mockResult = { data: { id: 's2', name: 'New Svc' }, error: null }
    vi.mocked(apiFetch).mockResolvedValue(mockResult)
    const { result } = renderHook(() => useCreateMyService(), { wrapper: makeWrapper() })
    result.current.mutate({ category_id: 'c1', name: 'New Svc' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/services/my',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

describe('useUpdateMyService', () => {
  it('calls PATCH /api/services/my/:id', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ data: {}, error: null })
    const { result } = renderHook(() => useUpdateMyService(), { wrapper: makeWrapper() })
    result.current.mutate({ id: 's1', name: 'Updated' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/services/my/s1',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})

describe('useDeleteMyService', () => {
  it('calls DELETE /api/services/my/:id', async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined)
    const { result } = renderHook(() => useDeleteMyService(), { wrapper: makeWrapper() })
    result.current.mutate('s1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/services/my/s1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

// ── New hooks ──────────────────────────────────────────────────────────────────

describe('useServiceCategory', () => {
  it('fetches category with providers by slug', async () => {
    const mockData = {
      data: {
        category: { id: 'c1', name: 'Florists', slug: 'florists', service_count: 2 },
        providers: [
          { id: 's1', name: 'Rose Shop', city: 'KL', country: 'Malaysia' },
          { id: 's2', name: 'Lily Garden', city: 'PJ', country: 'Malaysia' },
        ],
        total: 2,
      },
      error: null,
    }
    vi.mocked(apiFetch).mockResolvedValue(mockData)
    const { result } = renderHook(() => useServiceCategory('florists'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.providers).toHaveLength(2)
    expect(result.current.data?.data.category.slug).toBe('florists')
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/services/categories/florists')
  })

  it('does not fetch when slug is empty', () => {
    const { result } = renderHook(() => useServiceCategory(''), { wrapper: makeWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
  })
})

describe('useServiceProvider', () => {
  it('fetches a single provider by id', async () => {
    const mockData = {
      data: { id: 's1', name: 'Rose Shop', city: 'KL', country: 'Malaysia', gallery_urls: [] },
      error: null,
    }
    vi.mocked(apiFetch).mockResolvedValue(mockData)
    const { result } = renderHook(() => useServiceProvider('s1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.name).toBe('Rose Shop')
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/services/providers/s1')
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useServiceProvider(''), { wrapper: makeWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
  })
})

describe('useServiceProviderComments', () => {
  it('fetches comments for a provider', async () => {
    const mockData = {
      data: [
        { id: 'cm1', service_id: 's1', user_id: 'u1', content: 'Great service', created_at: '2026-01-01', profiles: { full_name: 'Ali' } },
      ],
      error: null,
    }
    vi.mocked(apiFetch).mockResolvedValue(mockData)
    const { result } = renderHook(() => useServiceProviderComments('s1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].content).toBe('Great service')
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/services/providers/s1/comments')
  })

  it('does not fetch when id is empty', () => {
    const { result } = renderHook(() => useServiceProviderComments(''), { wrapper: makeWrapper() })
    expect(result.current.fetchStatus).toBe('idle')
    expect(vi.mocked(apiFetch)).not.toHaveBeenCalled()
  })
})

describe('useCreateProviderComment', () => {
  it('posts a comment to the provider', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ data: { id: 'cm2', content: 'Nice' }, error: null })
    const { result } = renderHook(() => useCreateProviderComment('s1'), { wrapper: makeWrapper() })
    act(() => { result.current.mutate('Nice') })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/services/providers/s1/comments',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ content: 'Nice' }) }),
    )
  })
})
