import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'

interface ViewResponse {
  data: { view_count: number }
  error: string | null
}

interface LikeResponse {
  data: { like_count: number; user_liked: boolean }
  error: string | null
}

/**
 * Fire-and-forget view tracking on mount.
 * Does nothing if id is empty.
 */
export function useTrackObituaryView(id: string) {
  useEffect(() => {
    if (!id) return
    apiFetch<ViewResponse>(`/api/obituaries/${id}/view`, { method: 'POST' }).catch(() => {
      // Silently ignore — view tracking is non-critical
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
}

/**
 * Like toggle mutation.
 * Optimistically updates the ['public-obituary', slug] query cache.
 */
export function useLikeObituary(id: string, slug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiFetch<LikeResponse>(`/api/obituaries/${id}/like`, { method: 'POST' }),
    onSuccess: (res) => {
      queryClient.setQueryData<{ data: { like_count: number; user_liked: boolean } }>(
        ['public-obituary', slug],
        (old) => {
          if (!old?.data) return old
          return {
            ...old,
            data: {
              ...old.data,
              like_count: res.data.like_count,
              user_liked: res.data.user_liked,
            },
          }
        },
      )
    },
  })
}
