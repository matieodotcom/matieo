// Mirrors backend/src/types/memorial.types.ts — keep in sync when backend types change.

export interface MemorialPhoto {
  id: string
  memorial_id: string
  cloudinary_public_id: string
  cloudinary_url: string
  caption: string | null
  sort_order: number
  created_at: string
}

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
  memorial_photos?: MemorialPhoto[]
}

export interface MemorialsResponse {
  data: MemorialRow[]
  total: number
  page: number
  limit: number
  error: string | null
}
