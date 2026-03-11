export interface NotificationRow {
  id:            string
  user_id:       string
  type:          'tribute_posted' | 'condolence_posted' | 'memorial_published' | 'obituary_published'
  title:         string
  message:       string
  resource_id:   string | null
  resource_slug: string | null
  is_read:       boolean
  read_at:       string | null
  created_at:    string
}

export interface NotificationsResponse {
  data:  NotificationRow[]
  total: number
  page:  number
  limit: number
  error: string | null
}
