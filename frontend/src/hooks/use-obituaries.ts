import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import type { ObituariesResponse } from '@/types/obituary'

interface ObituariesParams {
  q?: string
  page?: number
  limit?: number
}

export function useObitaries({ q = '', page = 1, limit = 12 }: ObituariesParams = {}) {
  const params = new URLSearchParams()
  if (q.trim()) params.set('q', q.trim())
  params.set('page', String(page))
  params.set('limit', String(limit))

  return useQuery<ObituariesResponse>({
    queryKey: ['obituaries', { q, page, limit }],
    queryFn: () => apiFetch<ObituariesResponse>(`/api/obituaries?${params.toString()}`),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}
