// Mirrors backend/src/types/obituary.types.ts — keep in sync when backend types change.

export interface FuneralDetails {
  name?: string
  location?: string
  date?: string
  time?: string
  note?: string
}

export interface BurialDetails {
  burial_center_name?: string
  location?: string
  burial_date?: string
  burial_time?: string
  note?: string
}

export interface ContactPerson {
  name?: string
  relationship?: string
  phone?: string
  email?: string
}

export interface FamilyMember {
  name: string
  relationship?: string
}

export interface ObituaryRow {
  id: string
  created_by: string | null
  creator_name: string | null
  full_name: string
  age_at_death: number | null
  date_of_birth: string | null
  date_of_death: string | null
  gender: 'male' | 'female' | 'non-binary' | 'prefer_not_to_say' | null
  race_ethnicity: string | null
  country: string | null
  state: string | null
  place_of_death: string | null
  cause_of_passing: string | null
  cause_of_passing_consented: boolean
  profile_cloudinary_public_id: string | null
  profile_url: string | null
  cover_cloudinary_public_id: string | null
  cover_url: string | null
  death_cert_cloudinary_public_id: string | null
  death_cert_url: string | null
  biography: string | null
  funeral_details: FuneralDetails | null
  burial_details: BurialDetails | null
  contact_person: ContactPerson | null
  family_members: FamilyMember[] | null
  slug: string | null
  full_obituary_url: string | null
  status: 'draft' | 'published'
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export interface ObituariesResponse {
  data: ObituaryRow[]
  total: number
  page: number
  limit: number
  error: string | null
}
