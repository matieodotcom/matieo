import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import type { MemorialsResponse } from '@/types/memorial'

interface MemorialsParams {
  q?: string
  page?: number
  limit?: number
}

export function useMemorials({ q = '', page = 1, limit = 12 }: MemorialsParams = {}) {
  const params = new URLSearchParams()
  if (q.trim()) params.set('q', q.trim())
  params.set('page', String(page))
  params.set('limit', String(limit))

  return useQuery<MemorialsResponse>({
    queryKey: ['memorials', { q, page, limit }],
    queryFn: () => apiFetch<MemorialsResponse>(`/api/memorials?${params.toString()}`),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })
}
