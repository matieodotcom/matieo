import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'
import { supabase } from '@/lib/supabase'
import type { NotificationsResponse } from '@/types/notification'

export function useNotifications(userId: string | null) {
  const qc = useQueryClient()

  const query = useQuery<NotificationsResponse>({
    queryKey:       ['notifications', userId],
    queryFn:        () => apiFetch<NotificationsResponse>('/api/notifications'),
    enabled:        !!userId,
    staleTime:      30_000,
    refetchInterval: 60_000,
  })

  // Realtime subscription — invalidate on INSERT so badge updates live
  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => { qc.invalidateQueries({ queryKey: ['notifications', userId] }) },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, qc])

  return query
}

export function useMarkNotificationRead(userId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', userId] }),
  })
}

export function useMarkAllRead(userId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch('/api/notifications/read-all', { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', userId] }),
  })
}

export function useDeleteNotification(userId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/notifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', userId] }),
  })
}
