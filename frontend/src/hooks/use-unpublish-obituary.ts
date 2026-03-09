import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { toast } from '@/lib/toast'

export function useUnpublishObituary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/obituaries/${id}/unpublish`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Obituary moved to drafts')
      queryClient.invalidateQueries({ queryKey: ['my-obituaries'] })
    },
  })
}
