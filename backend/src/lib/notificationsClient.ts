/**
 * backend/src/lib/notificationsClient.ts
 * Creates in-app notifications via supabaseAdmin (service role — bypasses RLS).
 *
 * NOTIFICATION_TYPES is the single source of truth for all notification event types.
 */
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const NOTIFICATION_TYPES = {
  TRIBUTE_POSTED:     'tribute_posted',
  CONDOLENCE_POSTED:  'condolence_posted',
  MEMORIAL_PUBLISHED: 'memorial_published',
  OBITUARY_PUBLISHED: 'obituary_published',
} as const satisfies Record<string, string>

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]

interface CreateNotificationParams {
  userId:       string
  type:         NotificationType
  title:        string
  message:      string
  resourceId?:  string
  resourceSlug?: string
}

export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const { error } = await supabaseAdmin.from('notifications').insert({
    user_id:       params.userId,
    type:          params.type,
    title:         params.title,
    message:       params.message,
    resource_id:   params.resourceId   ?? null,
    resource_slug: params.resourceSlug ?? null,
  })
  if (error) throw error
}
