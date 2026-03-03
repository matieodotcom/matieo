// Mirrors backend/src/types/memorial.types.ts — keep in sync when backend types change.

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

export interface MemorialsResponse {
  data: MemorialRow[]
  total: number
  page: number
  limit: number
  error: string | null
}
