import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import type { CondolenceRow } from '@/types/tribute'

interface CondolencesResponse {
  data: CondolenceRow[]
  error: string | null
}

export function useCondolences(obituaryId: string) {
  return useQuery<CondolencesResponse>({
    queryKey: ['condolences', obituaryId],
    queryFn: () => apiFetch<CondolencesResponse>(`/api/obituaries/${obituaryId}/condolences`),
    enabled: !!obituaryId,
    staleTime: 30_000,
  })
}

export function usePostCondolence(obituaryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (message: string) =>
      apiFetch(`/api/obituaries/${obituaryId}/condolences`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['condolences', obituaryId] }),
  })
}

export function useDeleteCondolence(obituaryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (condolenceId: string) =>
      apiFetch(`/api/obituaries/${obituaryId}/condolences/${condolenceId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['condolences', obituaryId] }),
  })
}
