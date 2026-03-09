import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { toast } from '@/lib/toast'

export function useDeleteObituary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/obituaries/${id}/permanent`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Draft deleted')
      queryClient.invalidateQueries({ queryKey: ['my-obituaries'] })
    },
  })
}
