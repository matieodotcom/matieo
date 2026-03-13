import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
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
