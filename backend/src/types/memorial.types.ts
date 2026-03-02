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
  cover_cloudinary_public_id: string | null
  cover_url: string | null
  cause_of_death: string | null
  biography: string | null
  tribute_message: string | null
  slug: string | null
  full_memorial_url: string | null
  status: 'draft' | 'published'
  deleted_at: string | null
  created_at: string
  updated_at: string
}

// ── Payload types ─────────────────────────────────────────────────────────────

export interface CreateMemorialPayload {
  full_name: string
  age_at_death?: number
  date_of_birth?: string
  date_of_death?: string
  gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say'
  race_ethnicity?: string
  cause_of_death?: string
  biography?: string
  tribute_message?: string
  cover_cloudinary_public_id?: string
  cover_url?: string
}

export interface UpdateMemorialPayload {
  full_name?: string
  age_at_death?: number
  date_of_birth?: string
  date_of_death?: string
  gender?: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say'
  race_ethnicity?: string
  cause_of_death?: string
  biography?: string
  tribute_message?: string
  cover_cloudinary_public_id?: string
  cover_url?: string
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
