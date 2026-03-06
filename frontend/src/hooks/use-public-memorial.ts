import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import type { MemorialRow } from '@/types/memorial'

interface PublicMemorialResponse {
  data: MemorialRow
  error: string | null
}

export function usePublicMemorial(slug: string) {
  return useQuery<PublicMemorialResponse>({
    queryKey: ['memorial', slug],
    queryFn: () => apiFetch<PublicMemorialResponse>(`/api/memorials/by-slug/${slug}`),
    staleTime: 60_000,
    retry: false,
  })
}
