import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '@/lib/apiClient'
import { toast } from '@/lib/toast'
import type { PhotoValue } from '@/components/ui/PhotoUpload'
import type { ObituaryRow } from '@/types/obituary'

// ── API types ─────────────────────────────────────────────────────────────────

interface ObituaryApiPayload {
  full_name: string
  age_at_death?: number
  date_of_birth?: string
  date_of_death?: string
  gender?: string
  race_ethnicity?: string
  country?: string
  state?: string
  place_of_death?: string
  cause_of_passing?: string
  cause_of_passing_consented?: boolean
  profile_cloudinary_public_id?: string | null
  profile_url?: string | null
  cover_cloudinary_public_id?: string | null
  cover_url?: string | null
  death_cert_cloudinary_public_id?: string | null
  death_cert_url?: string | null
  biography?: string
  funeral_details?: {
    name?: string
    location?: string
    date?: string
    time?: string
    note?: string
  }
  burial_details?: {
    burial_center_name?: string
    location?: string
    burial_date?: string
    burial_time?: string
    note?: string
  }
  contact_person?: {
    name?: string
    relationship?: string
    phone?: string
    email?: string
  }
  family_members?: { name: string; relationship?: string }[]
  custom_slug?: string
  status: 'draft' | 'published'
}

interface ObituaryApiResponse {
  data: { id: string; slug: string } | null
  error: string | null
}

interface SingleObituaryResponse {
  data: ObituaryRow | null
  error: string | null
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateObituary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ObituaryApiPayload) =>
      apiFetch<ObituaryApiResponse>('/api/obituaries', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'published' ? 'Obituary published!' : 'Draft saved')
      queryClient.invalidateQueries({ queryKey: ['my-obituaries'] })
    },
  })
}

export function useUpdateObituary() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ObituaryApiPayload }) =>
      apiFetch<ObituaryApiResponse>(`/api/obituaries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      toast.success(variables.payload.status === 'published' ? 'Obituary updated!' : 'Draft saved')
      queryClient.invalidateQueries({ queryKey: ['my-obituaries'] })
      queryClient.invalidateQueries({ queryKey: ['obituary', variables.id] })
    },
  })
}

export function useGetObituary(id: string | undefined) {
  return useQuery({
    queryKey: ['obituary', id],
    queryFn: () => apiFetch<SingleObituaryResponse>(`/api/obituaries/${id}`),
    enabled: !!id,
    select: (res) => res.data,
  })
}

// ── Zod schemas ───────────────────────────────────────────────────────────────

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

const familyMemberSchema = z.object({
  name: z.string().optional().default(''),
  relationship: z.string().optional().default(''),
})

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
  placeOfDeath: z.string().optional().default(''),
  causeOfPassing: z.string().optional().default(''),
  causeOfPassingConsented: z.boolean().optional().default(false),
  // Contact person
  contactPersonName: z.string().optional().default(''),
  contactPersonRelationship: z.string().optional().default(''),
  contactPersonPhone: z.string().optional().default(''),
  contactPersonEmail: z.string().email('Invalid email').optional().or(z.literal('')).default(''),
  // Family members
  familyMembers: z.array(familyMemberSchema).optional().default([]),
  // Biography
  biography: z.string().max(4000, 'Max 4000 characters').optional().default(''),
  // Funeral details
  funeralName: z.string().optional().default(''),
  funeralLocation: z.string().optional().default(''),
  funeralDate: z.string().optional().default(''),
  funeralTime: z.string().optional().default(''),
  funeralNote: z.string().optional().default(''),
  // Burial details
  burialCenterName: z.string().optional().default(''),
  burialLocation: z.string().optional().default(''),
  burialDate: z.string().optional().default(''),
  burialTime: z.string().optional().default(''),
  burialNote: z.string().optional().default(''),
  // Photos
  profilePhoto: z.custom<PhotoValue | null>().optional(),
  coverPhoto: z.custom<PhotoValue | null>().optional(),
  deathCertPhoto: z.custom<PhotoValue | null>().optional(),
})

const publishBase = draftBase.extend({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.string().min(1, 'Gender is required'),
  raceEthnicity: z.string().min(1, 'Race/ethnicity is required'),
  country: z.string().min(1, 'Country is required'),
  contactPersonName: z.string().min(1, 'Contact person name is required'),
  contactPersonRelationship: z.string().min(1, 'Relationship is required'),
  contactPersonPhone: z.string().min(1, 'Phone number is required'),
  profilePhoto: z
    .custom<PhotoValue | null>()
    .refine((v) => v !== null && v !== undefined, { message: 'Obituary photo is required' }),
})

const draftSchema = draftBase.superRefine(dateCrossValidation)
const publishSchema = publishBase.superRefine(dateCrossValidation)

export type ObituaryFormValues = z.infer<typeof draftSchema>

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

function rowToFormValues(row: ObituaryRow): Partial<ObituaryFormValues> {
  const nameParts = row.full_name?.split(' ') ?? []
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
    placeOfDeath: row.place_of_death ?? '',
    causeOfPassing: row.cause_of_passing ?? '',
    causeOfPassingConsented: row.cause_of_passing_consented ?? false,
    contactPersonName: row.contact_person?.name ?? '',
    contactPersonRelationship: row.contact_person?.relationship ?? '',
    contactPersonPhone: row.contact_person?.phone ?? '',
    contactPersonEmail: row.contact_person?.email ?? '',
    familyMembers: (row.family_members ?? []).map((m) => ({
      name: m.name ?? '',
      relationship: m.relationship ?? '',
    })),
    biography: row.biography ?? '',
    funeralName: row.funeral_details?.name ?? '',
    funeralLocation: row.funeral_details?.location ?? '',
    funeralDate: row.funeral_details?.date ?? '',
    funeralTime: row.funeral_details?.time ?? '',
    funeralNote: row.funeral_details?.note ?? '',
    burialCenterName: row.burial_details?.burial_center_name ?? '',
    burialLocation: row.burial_details?.location ?? '',
    burialDate: row.burial_details?.burial_date ?? '',
    burialTime: row.burial_details?.burial_time ?? '',
    burialNote: row.burial_details?.note ?? '',
    profilePhoto:
      row.profile_url && row.profile_cloudinary_public_id
        ? { public_id: row.profile_cloudinary_public_id, url: row.profile_url }
        : null,
    coverPhoto:
      row.cover_url && row.cover_cloudinary_public_id
        ? { public_id: row.cover_cloudinary_public_id, url: row.cover_url }
        : null,
    deathCertPhoto:
      row.death_cert_url && row.death_cert_cloudinary_public_id
        ? { public_id: row.death_cert_cloudinary_public_id, url: row.death_cert_url }
        : null,
  }
}

// ── Build API payload ─────────────────────────────────────────────────────────

function buildPayload(values: ObituaryFormValues, status: 'draft' | 'published'): ObituaryApiPayload {
  const fullName = `${values.firstName ?? ''} ${values.lastName ?? ''}`.trim()
  const year = values.dateOfDeath ? new Date(values.dateOfDeath).getFullYear().toString() : undefined
  const autoSlug = deriveSlug(values.firstName ?? '', values.lastName ?? '', year)

  const funeralDetails =
    values.funeralName || values.funeralLocation || values.funeralDate || values.funeralTime || values.funeralNote
      ? {
          name: values.funeralName || undefined,
          location: values.funeralLocation || undefined,
          date: values.funeralDate || undefined,
          time: values.funeralTime || undefined,
          note: values.funeralNote || undefined,
        }
      : undefined

  const burialDetails =
    values.burialCenterName || values.burialLocation || values.burialDate || values.burialTime || values.burialNote
      ? {
          burial_center_name: values.burialCenterName || undefined,
          location: values.burialLocation || undefined,
          burial_date: values.burialDate || undefined,
          burial_time: values.burialTime || undefined,
          note: values.burialNote || undefined,
        }
      : undefined

  const contactPerson =
    values.contactPersonName || values.contactPersonPhone
      ? {
          name: values.contactPersonName || undefined,
          relationship: values.contactPersonRelationship || undefined,
          phone: values.contactPersonPhone || undefined,
          email: values.contactPersonEmail || undefined,
        }
      : undefined

  const familyMembers = (values.familyMembers ?? [])
    .filter((m) => m.name?.trim())
    .map((m) => ({ name: m.name, relationship: m.relationship || undefined }))

  return {
    full_name: fullName,
    age_at_death: values.ageAtDeath ? parseInt(values.ageAtDeath) : undefined,
    date_of_birth: values.dateOfBirth || undefined,
    date_of_death: values.dateOfDeath || undefined,
    gender: values.gender || undefined,
    race_ethnicity: values.raceEthnicity || undefined,
    country: values.country || undefined,
    state: values.state || undefined,
    place_of_death: values.placeOfDeath || undefined,
    cause_of_passing: values.causeOfPassing || undefined,
    cause_of_passing_consented: values.causeOfPassingConsented ?? false,
    profile_cloudinary_public_id: values.profilePhoto?.public_id ?? null,
    profile_url: values.profilePhoto?.url ?? null,
    cover_cloudinary_public_id: values.coverPhoto?.public_id ?? null,
    cover_url: values.coverPhoto?.url ?? null,
    death_cert_cloudinary_public_id: values.deathCertPhoto?.public_id ?? null,
    death_cert_url: values.deathCertPhoto?.url ?? null,
    biography: values.biography || undefined,
    funeral_details: funeralDetails,
    burial_details: burialDetails,
    contact_person: contactPerson,
    family_members: familyMembers.length > 0 ? familyMembers : undefined,
    custom_slug: autoSlug || undefined,
    status,
  }
}

// ── Combined form hook ────────────────────────────────────────────────────────

export function useObituaryForm(obituaryId?: string) {
  const navigate = useNavigate()
  const isEdit = !!obituaryId

  const createMutation = useCreateObituary()
  const updateMutation = useUpdateObituary()
  const { data: existingObituary, isPending: isFetching } = useGetObituary(obituaryId)
  const isLoading = isEdit && isFetching

  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error ?? updateMutation.error

  const form = useForm<ObituaryFormValues>({
    resolver: zodResolver(draftSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      ageAtDeath: '',
      dateOfBirth: '',
      dateOfDeath: '',
      gender: '',
      raceEthnicity: '',
      country: '',
      state: '',
      placeOfDeath: '',
      causeOfPassing: '',
      causeOfPassingConsented: false,
      contactPersonName: '',
      contactPersonRelationship: '',
      contactPersonPhone: '',
      contactPersonEmail: '',
      familyMembers: [],
      biography: '',
      funeralName: '',
      funeralLocation: '',
      funeralDate: '',
      funeralTime: '',
      funeralNote: '',
      burialCenterName: '',
      burialLocation: '',
      burialDate: '',
      burialTime: '',
      burialNote: '',
      profilePhoto: null,
      coverPhoto: null,
      deathCertPhoto: null,
    },
  })

  const familyMembersField = useFieldArray({
    control: form.control,
    name: 'familyMembers',
  })

  // Pre-populate form when editing an existing obituary
  useEffect(() => {
    if (existingObituary) {
      form.reset(rowToFormValues(existingObituary))
    }
  }, [existingObituary, form])

  async function submit(payload: ObituaryApiPayload) {
    if (isEdit && obituaryId) {
      await updateMutation.mutateAsync({ id: obituaryId, payload })
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
      navigate('/dashboard/obituary')
    } catch {
      // error rendered inline
    }
  }

  async function onPublish(values: ObituaryFormValues) {
    const result = publishSchema.safeParse(values)
    if (!result.success) {
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof ObituaryFormValues
        form.setError(field, { message: e.message })
      })
      return
    }
    try {
      await submit(buildPayload(result.data, 'published'))
      navigate('/dashboard/obituary')
    } catch {
      // error rendered inline
    }
  }

  return { form, familyMembersField, onSaveDraft, onPublish, isPending, isLoading, isEdit, error }
}
