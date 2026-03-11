import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import type { TributeRow } from '@/types/tribute'

interface TributesResponse {
  data: TributeRow[]
  error: string | null
}

export function useTributes(memorialId: string) {
  return useQuery<TributesResponse>({
    queryKey: ['tributes', memorialId],
    queryFn: () => apiFetch<TributesResponse>(`/api/memorials/${memorialId}/tributes`),
    enabled: !!memorialId,
    staleTime: 30_000,
  })
}

export function usePostTribute(memorialId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (message: string) =>
      apiFetch(`/api/memorials/${memorialId}/tributes`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tributes', memorialId] }),
  })
}

export function useDeleteTribute(memorialId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (tributeId: string) =>
      apiFetch(`/api/memorials/${memorialId}/tributes/${tributeId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tributes', memorialId] }),
  })
}
