import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'

// Types
export interface AdminStats {
  users:       { total: number; admins: number; researchers: number }
  memorials:   { total: number; published: number; draft: number }
  obituaries:  { total: number; published: number; draft: number }
  tributes:    { total: number }
  condolences: { total: number }
  waitlist:    { total: number }
}

export interface AdminUser {
  id: string
  full_name: string | null
  email: string | null
  role: string
  account_type: string
  created_at: string
}

export interface AdminMemorial {
  id: string
  full_name: string
  status: string
  created_at: string
  slug: string | null
  creator_name: string | null
}

export interface AdminObituary {
  id: string
  full_name: string
  status: string
  created_at: string
  slug: string | null
}

export interface AdminTribute {
  id: string
  memorial_id: string
  author_name: string | null
  content: string
  created_at: string
}

export interface AdminCondolence {
  id: string
  obituary_id: string
  author_name: string | null
  message: string
  created_at: string
}

export interface AdminWaitlistEntry {
  id: string
  email: string
  name: string | null
  subscribed_at: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

// Hooks
export function useAdminStats() {
  return useQuery<{ data: AdminStats }>({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiFetch('/api/admin/stats'),
  })
}

export function useAdminUsers(filters?: { page?: number; search?: string; role?: string }) {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.search) params.set('search', filters.search)
  if (filters?.role) params.set('role', filters.role)
  return useQuery<{ data: PaginatedResponse<AdminUser> }>({
    queryKey: ['admin', 'users', filters],
    queryFn: () => apiFetch(`/api/admin/users?${params}`),
  })
}

export function useAdminSetUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiFetch(`/api/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }) },
  })
}

export function useAdminMemorials(filters?: { page?: number; status?: string }) {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.status) params.set('status', filters.status)
  return useQuery<{ data: PaginatedResponse<AdminMemorial> }>({
    queryKey: ['admin', 'memorials', filters],
    queryFn: () => apiFetch(`/api/admin/memorials?${params}`),
  })
}

export function useAdminSetMemorialStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/api/admin/memorials/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'memorials'] }) },
  })
}

export function useAdminDeleteMemorial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/memorials/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'memorials'] }) },
  })
}

export function useAdminObituaries(filters?: { page?: number; status?: string }) {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', String(filters.page))
  if (filters?.status) params.set('status', filters.status)
  return useQuery<{ data: PaginatedResponse<AdminObituary> }>({
    queryKey: ['admin', 'obituaries', filters],
    queryFn: () => apiFetch(`/api/admin/obituaries?${params}`),
  })
}

export function useAdminSetObituaryStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/api/admin/obituaries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'obituaries'] }) },
  })
}

export function useAdminDeleteObituary() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/obituaries/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'obituaries'] }) },
  })
}

export function useAdminTributes(filters?: { page?: number }) {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', String(filters.page))
  return useQuery<{ data: PaginatedResponse<AdminTribute> }>({
    queryKey: ['admin', 'tributes', filters],
    queryFn: () => apiFetch(`/api/admin/tributes?${params}`),
  })
}

export function useAdminDeleteTribute() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/tributes/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'tributes'] }) },
  })
}

export function useAdminCondolences(filters?: { page?: number }) {
  const params = new URLSearchParams()
  if (filters?.page) params.set('page', String(filters.page))
  return useQuery<{ data: PaginatedResponse<AdminCondolence> }>({
    queryKey: ['admin', 'condolences', filters],
    queryFn: () => apiFetch(`/api/admin/condolences?${params}`),
  })
}

export function useAdminDeleteCondolence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/condolences/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'condolences'] }) },
  })
}

export function useAdminWaitlist() {
  return useQuery<{ data: PaginatedResponse<AdminWaitlistEntry> }>({
    queryKey: ['admin', 'waitlist'],
    queryFn: () => apiFetch('/api/admin/waitlist'),
  })
}
