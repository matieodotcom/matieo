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
  icon_public_id?: string
  icon_url?: string
  gallery_public_ids: string[]
  gallery_urls: string[]
  about?: string
  is_draft: boolean
}

export interface ServiceProviderComment {
  id: string
  service_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: { full_name: string }
}

export interface CategoryWithProviders {
  category: ServiceCategory
  providers: OrganisationService[]
  total: number
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
  icon_public_id?: string
  icon_url?: string
  gallery_public_ids?: string[]
  gallery_urls?: string[]
  about?: string
  is_draft?: boolean
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

export function useServiceCategory(slug: string) {
  return useQuery<{ data: CategoryWithProviders; error: null }>({
    queryKey: ['services', 'categories', slug],
    queryFn: () => apiFetch(`/api/services/categories/${slug}`),
    enabled: !!slug,
  })
}

export function useServiceProvider(id: string) {
  return useQuery<{ data: OrganisationService; error: null }>({
    queryKey: ['services', 'providers', id],
    queryFn: () => apiFetch(`/api/services/providers/${id}`),
    enabled: !!id,
  })
}

export function useServiceProviderComments(id: string) {
  return useQuery<{ data: ServiceProviderComment[]; error: null }>({
    queryKey: ['services', 'providers', id, 'comments'],
    queryFn: () => apiFetch(`/api/services/providers/${id}/comments`),
    enabled: !!id,
  })
}

export function useCreateProviderComment(serviceId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      apiFetch(`/api/services/providers/${serviceId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['services', 'providers', serviceId, 'comments'] })
    },
  })
}

export function useMyServices() {
  return useQuery<{ data: OrganisationService[]; error: null }>({
    queryKey: ['services', 'my'],
    queryFn: () => apiFetch('/api/services/my'),
  })
}

export function useMyService(id: string) {
  const { data, ...rest } = useMyServices()
  const service = data?.data?.find((s) => s.id === id) ?? null
  return { data: service, ...rest }
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
