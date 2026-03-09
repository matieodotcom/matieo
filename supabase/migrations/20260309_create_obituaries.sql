-- =============================================================
-- 20260309_create_obituaries.sql
-- Creates the obituaries table for the obituary feature.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.obituaries (
  id                                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by                          uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  creator_name                        text,
  -- Personal
  full_name                           text NOT NULL,
  age_at_death                        integer,
  date_of_birth                       date,
  date_of_death                       date,
  gender                              text CHECK (gender IN ('male','female','non-binary','prefer_not_to_say')),
  race_ethnicity                      text,
  country                             text,
  state                               text,
  place_of_death                      text,
  -- Private (never shown publicly)
  cause_of_passing                    text,
  cause_of_passing_consented          boolean DEFAULT false,
  -- Photos
  profile_cloudinary_public_id        text,
  profile_url                         text,
  cover_cloudinary_public_id          text,
  cover_url                           text,
  -- Death certificate (private)
  death_cert_cloudinary_public_id     text,
  death_cert_url                      text,
  -- Content
  biography                           text,
  -- Optional complex sections (stored as jsonb)
  funeral_details                     jsonb,   -- { name, location, date, time, note }
  burial_details                      jsonb,   -- { burial_center_name, location, burial_date, burial_time, note }
  contact_person                      jsonb,   -- { name, relationship, phone, email }
  family_members                      jsonb,   -- [{ name, relationship }]
  -- Status
  slug                                text UNIQUE,
  full_obituary_url                   text,
  status                              text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  deleted_at                          timestamptz,
  created_at                          timestamptz DEFAULT now() NOT NULL,
  updated_at                          timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_obituaries_created_by ON public.obituaries(created_by);
CREATE INDEX IF NOT EXISTS idx_obituaries_slug ON public.obituaries(slug);
CREATE INDEX IF NOT EXISTS idx_obituaries_status ON public.obituaries(status);

-- Updated_at trigger (reuse same pattern)
CREATE TRIGGER set_obituaries_updated_at
  BEFORE UPDATE ON public.obituaries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.obituaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published obituaries"
  ON public.obituaries FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Owner can manage own obituaries"
  ON public.obituaries FOR ALL USING (auth.uid() = created_by);
