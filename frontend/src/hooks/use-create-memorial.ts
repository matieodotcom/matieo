import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '@/lib/apiClient'
import { toast } from '@/lib/toast'
import { useMemorialDraftStore } from '@/store/memorialDraftStore'
import type { PhotoValue } from '@/components/ui/PhotoUpload'
import type { MemorialRow } from '@/types/memorial'

// ── API types ─────────────────────────────────────────────────────────────────

interface MemorialApiPayload {
  full_name: string
  age_at_death?: number
  date_of_birth?: string
  date_of_death?: string
  gender?: string
  race_ethnicity?: string
  country?: string
  state?: string
  creator_relationship?: string
  quote?: string
  biography?: string
  tribute_message?: string
  cover_cloudinary_public_id?: string
  cover_url?: string
  cover_gradient?: string | null
  profile_cloudinary_public_id?: string
  profile_url?: string
  custom_slug?: string
  status: 'draft' | 'published'
  photos?: { cloudinary_public_id: string; cloudinary_url: string; sort_order: number }[]
}

interface MemorialApiResponse {
  data: { id: string; slug: string } | null
  error: string | null
}

interface SingleMemorialResponse {
  data: MemorialRow | null
  error: string | null
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateMemorial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: MemorialApiPayload) =>
      apiFetch<MemorialApiResponse>('/api/memorials', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'published' ? 'Memorial created!' : 'Draft saved')
      queryClient.invalidateQueries({ queryKey: ['my-memorials'] })
    },
  })
}

export function useUpdateMemorial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MemorialApiPayload }) =>
      apiFetch<MemorialApiResponse>(`/api/memorials/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      toast.success(variables.payload.status === 'published' ? 'Memorial updated!' : 'Draft saved')
      queryClient.invalidateQueries({ queryKey: ['my-memorials'] })
      queryClient.invalidateQueries({ queryKey: ['memorial', variables.id] })
    },
  })
}

export function useGetMemorial(id: string | undefined) {
  return useQuery({
    queryKey: ['memorial', id],
    queryFn: () => apiFetch<SingleMemorialResponse>(`/api/memorials/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  })
}

// ── Zod schemas ───────────────────────────────────────────────────────────────

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens')
  .min(3, 'At least 3 characters')
  .max(80, 'At most 80 characters')
  .optional()
  .or(z.literal(''))

const today = () => new Date().toISOString().split('T')[0]

const dateOfBirthField = z
  .string()
  .optional()
  .default('')
  .refine((s) => !s || !isNaN(new Date(s).getTime()), { message: 'Invalid date' })
  .refine((s) => !s || s < today(), { message: 'Date of birth must be in the past' })

const dateOfDeathField = z
  .string()
  .optional()
  .default('')
  .refine((s) => !s || !isNaN(new Date(s).getTime()), { message: 'Invalid date' })
  .refine((s) => !s || s <= today(), { message: 'Date of death cannot be in the future' })

function dateCrossValidation(
  data: { dateOfBirth?: string; dateOfDeath?: string },
  ctx: z.RefinementCtx,
) {
  if (data.dateOfBirth && data.dateOfDeath && data.dateOfDeath < data.dateOfBirth) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Date of death must be after date of birth',
      path: ['dateOfDeath'],
    })
  }
}

const draftBase = z.object({
  firstName: z.string().optional().default(''),
  lastName: z.string().optional().default(''),
  ageAtDeath: z.string().optional().default(''),
  dateOfBirth: dateOfBirthField,
  dateOfDeath: dateOfDeathField,
  gender: z.string().optional().default(''),
  raceEthnicity: z.string().optional().default(''),
  country: z.string().optional().default(''),
  state: z.string().optional().default(''),
  creatorRelationship: z.string().optional().default(''),
  quote: z.string().max(2000, 'Max 2000 characters').optional().default(''),
  biography: z.string().max(4000, 'Max 4000 characters').optional().default(''),
  tributeMessage: z.string().max(1500, 'Max 1500 characters').optional().default(''),
  slug: slugSchema,
  profilePhoto: z.custom<PhotoValue | null>().optional(),
  coverPhoto: z.custom<PhotoValue | null>().optional(),
  coverGradient: z.string().optional(),
  galleryPhotos: z.custom<PhotoValue[]>().optional(),
})

const publishBase = draftBase.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.string().min(1, 'Gender is required'),
  raceEthnicity: z.string().min(1, 'Race/ethnicity is required'),
  country: z.string().min(1, 'Country is required'),
  profilePhoto: z
    .custom<PhotoValue | null>()
    .refine((v) => v !== null && v !== undefined, { message: 'Memorial photo is required' }),
})

const draftSchema = draftBase.superRefine(dateCrossValidation)
const publishSchema = publishBase.superRefine(dateCrossValidation)

export type MemorialFormValues = z.infer<typeof draftSchema>

// ── Slug helpers ──────────────────────────────────────────────────────────────

export function sanitiseSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function deriveSlug(firstName: string, lastName: string, year?: string): string {
  const name = `${firstName} ${lastName}`.trim()
  if (!name) return ''
  const base = sanitiseSlug(name)
  return year ? `${base}-${year}` : base
}

// ── Row → form values ─────────────────────────────────────────────────────────

function rowToFormValues(row: MemorialRow): Partial<MemorialFormValues> {
  const nameParts = row.full_name.split(' ')
  const firstName = nameParts[0] ?? ''
  const lastName = nameParts.slice(1).join(' ')

  return {
    firstName,
    lastName,
    ageAtDeath: row.age_at_death != null ? String(row.age_at_death) : '',
    dateOfBirth: row.date_of_birth ?? '',
    dateOfDeath: row.date_of_death ?? '',
    gender: row.gender ?? '',
    raceEthnicity: row.race_ethnicity ?? '',
    country: row.country ?? '',
    state: row.state ?? '',
    creatorRelationship: row.creator_relationship ?? '',
    quote: row.quote ?? '',
    biography: row.biography ?? '',
    tributeMessage: row.tribute_message ?? '',
    slug: row.slug ?? '',
    profilePhoto:
      row.profile_url && row.profile_cloudinary_public_id
        ? { public_id: row.profile_cloudinary_public_id, url: row.profile_url }
        : null,
    coverPhoto:
      row.cover_url && row.cover_cloudinary_public_id
        ? { public_id: row.cover_cloudinary_public_id, url: row.cover_url }
        : null,
    coverGradient: row.cover_gradient ?? 'blue',
    galleryPhotos: (row.memorial_photos ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((p) => ({ public_id: p.cloudinary_public_id, url: p.cloudinary_url })),
  }
}

// ── Combined form hook ────────────────────────────────────────────────────────

export function useMemorialForm(memorialId?: string) {
  const navigate = useNavigate()
  const isEdit = !!memorialId

  const createMutation = useCreateMemorial()
  const updateMutation = useUpdateMemorial()
  const { data: existingMemorial, isPending: isFetching } = useGetMemorial(memorialId)
  const isLoading = isEdit && isFetching

  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error ?? updateMutation.error

  const draft = useMemorialDraftStore((s) => s.draft)
  const clearDraft = useMemorialDraftStore((s) => s.clearDraft)

  // Track whether a draft was present at mount time so we don't overwrite it
  // with server data when in edit mode
  const restoredFromDraft = useRef(!!draft)

  const form = useForm<MemorialFormValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: draft ?? {
      firstName: '',
      lastName: '',
      ageAtDeath: '',
      dateOfBirth: '',
      dateOfDeath: '',
      gender: '',
      raceEthnicity: '',
      country: '',
      state: '',
      creatorRelationship: '',
      quote: '',
      biography: '',
      tributeMessage: '',
      slug: '',
      profilePhoto: null,
      coverPhoto: null,
      coverGradient: 'blue',
      galleryPhotos: [],
    },
  })

  // Clear the draft from the store once consumed (form has already picked it up via defaultValues)
  useEffect(() => {
    if (restoredFromDraft.current) {
      clearDraft()
    }
  }, [clearDraft])

  // Pre-populate form when editing an existing memorial — skip if draft was restored
  useEffect(() => {
    if (existingMemorial && !restoredFromDraft.current) {
      form.reset(rowToFormValues(existingMemorial))
    }
  }, [existingMemorial, form])

  function buildPayload(values: MemorialFormValues, status: 'draft' | 'published'): MemorialApiPayload {
    const fullName = `${values.firstName ?? ''} ${values.lastName ?? ''}`.trim() || 'Untitled'
    const year = values.dateOfDeath ? new Date(values.dateOfDeath).getFullYear().toString() : undefined
    const autoSlug = deriveSlug(values.firstName ?? '', values.lastName ?? '', year)

    return {
      full_name: fullName,
      age_at_death: values.ageAtDeath ? parseInt(values.ageAtDeath) : undefined,
      date_of_birth: values.dateOfBirth || undefined,
      date_of_death: values.dateOfDeath || undefined,
      gender: values.gender || undefined,
      race_ethnicity: values.raceEthnicity || undefined,
      country: values.country || undefined,
      state: values.state || undefined,
      creator_relationship: values.creatorRelationship || undefined,
      quote: values.quote || undefined,
      biography: values.biography || undefined,
      tribute_message: values.tributeMessage || undefined,
      cover_cloudinary_public_id: values.coverPhoto?.public_id,
      cover_url: values.coverPhoto?.url,
      cover_gradient: values.coverPhoto ? null : (values.coverGradient ?? 'blue'),
      profile_cloudinary_public_id: values.profilePhoto?.public_id,
      profile_url: values.profilePhoto?.url,
      custom_slug: values.slug || autoSlug || undefined,
      status,
      photos: (values.galleryPhotos ?? []).map((p, i) => ({
        cloudinary_public_id: p.public_id,
        cloudinary_url: p.url,
        sort_order: i,
      })),
    }
  }

  async function submit(payload: MemorialApiPayload) {
    if (isEdit && memorialId) {
      await updateMutation.mutateAsync({ id: memorialId, payload })
    } else {
      await createMutation.mutateAsync(payload)
    }
  }

  async function onSaveDraft() {
    const values = form.getValues()
    const parsed = draftSchema.safeParse(values)
    if (!parsed.success) {
      form.trigger()
      return
    }
    try {
      await submit(buildPayload(parsed.data, 'draft'))
      navigate('/dashboard/memorials')
    } catch {
      // error rendered inline
    }
  }

  async function onPublish(values: MemorialFormValues) {
    const result = publishSchema.safeParse(values)
    if (!result.success) {
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof MemorialFormValues
        form.setError(field, { message: e.message })
      })
      return
    }
    try {
      await submit(buildPayload(result.data, 'published'))
      navigate('/dashboard/memorials')
    } catch {
      // error rendered inline
    }
  }

  return { form, onSaveDraft, onPublish, isPending, isLoading, isEdit, error }
}
