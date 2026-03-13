import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/apiClient'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  icon: string | null
  image_url: string | null
  description: string | null
  sort_order: number
  service_count: number
}

export interface OrganisationService {
  id: string
  organization_id: string
  category_id: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  country: string | null
  is_active: boolean
  created_at: string
  service_categories?: Pick<ServiceCategory, 'id' | 'name' | 'slug' | 'icon'> | null
}

export interface CreateServicePayload {
  category_id: string
  name: string
  description?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  city?: string
  country?: string
  is_active?: boolean
}

export interface UpdateServicePayload extends Partial<CreateServicePayload> {}

// ── Hooks ─────────────────────────────────────────────────────────────────────

export function usePublicServiceCategories() {
  return useQuery<{ data: ServiceCategory[]; error: null }>({
    queryKey: ['services', 'categories'],
    queryFn: () => apiFetch('/api/services/categories'),
    staleTime: 60_000,
  })
}

export function useMyServices() {
  return useQuery<{ data: OrganisationService[]; error: null }>({
    queryKey: ['services', 'my'],
    queryFn: () => apiFetch('/api/services/my'),
  })
}

export function useCreateMyService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateServicePayload) =>
      apiFetch('/api/services/my', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services', 'my'] }) },
  })
}

export function useUpdateMyService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & UpdateServicePayload) =>
      apiFetch(`/api/services/my/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services', 'my'] }) },
  })
}

export function useDeleteMyService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/services/my/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services', 'my'] }) },
  })
}
