import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { toast } from '@/lib/toast'

export function useUnpublishMemorial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/memorials/${id}/unpublish`, { method: 'POST' }),
    onSuccess: () => {
      toast.success('Memorial moved to drafts')
      queryClient.invalidateQueries({ queryKey: ['my-memorials'] })
    },
  })
}
