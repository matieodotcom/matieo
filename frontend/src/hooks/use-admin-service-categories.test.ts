import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { ReactNode } from 'react'

vi.mock('@/lib/apiClient', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/lib/apiClient'
import {
  useAdminServiceCategories,
  useAdminCreateServiceCategory,
  useAdminUpdateServiceCategory,
  useAdminDeleteServiceCategory,
} from './use-admin'

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}

beforeEach(() => vi.clearAllMocks())

describe('useAdminServiceCategories', () => {
  it('fetches paginated list', async () => {
    const mockData = { data: { items: [{ id: 'c1', name: 'Florists', slug: 'florists', is_active: true, sort_order: 1 }], total: 1, page: 1, limit: 20 } }
    vi.mocked(apiFetch).mockResolvedValue(mockData)
    const { result } = renderHook(() => useAdminServiceCategories(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.data.items).toHaveLength(1)
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/api/admin/service-categories?')
  })

  it('passes q filter in query string', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ data: { items: [], total: 0, page: 1, limit: 20 } })
    renderHook(() => useAdminServiceCategories({ q: 'florist' }), { wrapper: makeWrapper() })
    await waitFor(() => expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      expect.stringContaining('q=florist'),
    ))
  })
})

describe('useAdminCreateServiceCategory', () => {
  it('calls POST /api/admin/service-categories', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ data: { id: 'c2', name: 'New' }, error: null })
    const { result } = renderHook(() => useAdminCreateServiceCategory(), { wrapper: makeWrapper() })
    result.current.mutate({ name: 'New' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/admin/service-categories',
      expect.objectContaining({ method: 'POST' }),
    )
  })
})

describe('useAdminUpdateServiceCategory', () => {
  it('calls PATCH /api/admin/service-categories/:id', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ data: {}, error: null })
    const { result } = renderHook(() => useAdminUpdateServiceCategory(), { wrapper: makeWrapper() })
    result.current.mutate({ id: 'c1', name: 'Updated' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/admin/service-categories/c1',
      expect.objectContaining({ method: 'PATCH' }),
    )
  })
})

describe('useAdminDeleteServiceCategory', () => {
  it('calls DELETE /api/admin/service-categories/:id', async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined)
    const { result } = renderHook(() => useAdminDeleteServiceCategory(), { wrapper: makeWrapper() })
    result.current.mutate('c1')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/api/admin/service-categories/c1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
