import type { Request } from 'express'

// ── DB row types ─────────────────────────────────────────────────────────────

export interface MemorialRow {
  id: string
  created_by: string
  full_name: string
  age_at_death: number | null
  date_of_birth: string | null
  date_of_death: string | null
  gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | null
  race_ethnicity: string | null
  location: string | null
  cover_cloudinary_public_id: string | null
  cover_url: string | null
  profile_cloudinary_public_id: string | null
  profile_url: string | null
  country: string | null
  state: string | null
  creator_relationship: string | null
  quote: string | null
  cause_of_death: string | null
  biography: string | null
  tribute_message: string | null
  slug: string | null
  full_memorial_url: string | null
  cover_gradient: string | null
  status: 'draft' | 'published'
  deleted_at: string | null
  created_at: string
  updated_at: string
}

// ── Payload types ─────────────────────────────────────────────────────────────

export interface PhotoPayload {
  cloudinary_public_id: string
  cloudinary_url: string
  caption?: string
  sort_order?: number
}

export interface CreateMemorialPayload {
  full_name: string
  age_at_death?: number
  date_of_birth?: string
  date_of_death?: string
  gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say'
  race_ethnicity?: string
  location?: string
  country?: string
  state?: string
  creator_relationship?: string
  quote?: string
  cause_of_death?: string
  biography?: string
  tribute_message?: string
  cover_cloudinary_public_id?: string
  cover_url?: string
  cover_gradient?: string | null
  profile_cloudinary_public_id?: string
  profile_url?: string
  custom_slug?: string
  status?: 'draft' | 'published'
  photos?: PhotoPayload[]
}

export interface UpdateMemorialPayload {
  full_name?: string
  age_at_death?: number
  date_of_birth?: string
  date_of_death?: string
  gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say'
  race_ethnicity?: string
  location?: string
  country?: string
  state?: string
  creator_relationship?: string
  quote?: string
  cause_of_death?: string
  biography?: string
  tribute_message?: string
  cover_cloudinary_public_id?: string
  cover_url?: string
  cover_gradient?: string | null
  profile_cloudinary_public_id?: string
  profile_url?: string
  status?: 'draft' | 'published'
  photos?: PhotoPayload[]
}

// ── Generic API response ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// ── Express augmentation ──────────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string
  email: string | undefined
  role: string
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser
}
