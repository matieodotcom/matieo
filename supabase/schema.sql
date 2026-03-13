-- =============================================================
-- MATIEO — Full Schema Snapshot
-- Keep this file in sync with supabase/migrations/
-- Last updated: 2026-03-13 (service_categories + organization_services)
-- =============================================================

-- Migrations applied:
-- [x] 20260101_initial_schema.sql
-- [x] 20260303_add_location_to_memorials.sql
-- [x] 20260304_waitlist_subscribers.sql
-- [x] 20260304_create_memorial_additions.sql
-- [x] 20260305_add_cover_gradient.sql
-- [x] 20260306_add_creator_name_to_memorials.sql
-- [x] 20260309_create_obituaries.sql
-- [x] 20260309_create_tributes_condolences.sql
-- [x] 20260310_add_account_type_to_profiles.sql
-- [x] 20260311_create_notifications.sql
-- [x] 20260312_engagement.sql
-- [x] 20260313_service_categories_and_org_services.sql

-- See supabase/migrations/20260101_initial_schema.sql for the
-- full annotated DDL including RLS policies, triggers, and indexes.

-- Tables in this schema:
--   public.profiles               — User profiles (auto-created on sign-up)
--   public.memorials              — Digital memorials (core entity)
--   public.funeral_details        — Optional funeral info per memorial
--   public.burial_details         — Optional burial info per memorial
--   public.contact_persons        — Contact person for a memorial
--   public.family_members         — Surviving family list per memorial
--   public.memorial_photos        — Photo gallery per memorial (Cloudinary)
--   public.mortality_data         — Aggregate mortality statistics (read-only)
--   public.waitlist_subscribers   — Email follow-up subscribers (anon insert, no public read)
--   public.obituaries             — Obituaries (full obit with funeral/burial/family/contact jsonb)
--   public.tributes               — Community tributes per memorial (auth insert, public read)
--   public.condolences            — Community condolences per obituary (auth insert, public read)
--   public.memorial_likes         — Per-user likes on memorials (auth, toggleable)
--   public.obituary_likes         — Per-user likes on obituaries (auth, toggleable)
--   public.memorial_views         — Deduplicated view tracking for memorials (IP hash)
--   public.obituary_views         — Deduplicated view tracking for obituaries (IP hash)
--   public.service_categories     — Admin-managed funeral service categories
--   public.organization_services  — Service listings by organisation users

-- ── notifications ─────────────────────────────────────────────────────────────
CREATE TYPE public.notification_type AS ENUM (
  'tribute_posted',
  'condolence_posted',
  'memorial_published',
  'obituary_published'
);

CREATE TABLE public.notifications (
  id            uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid              NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          notification_type NOT NULL,
  title         text              NOT NULL,
  message       text              NOT NULL,
  resource_id   uuid,
  resource_slug text,
  is_read       boolean           NOT NULL DEFAULT false,
  read_at       timestamptz,
  created_at    timestamptz       NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_id      ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_is_read ON public.notifications(user_id, is_read);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);
-- Service role bypasses RLS — no INSERT policy needed.

-- ── engagement (20260312) ──────────────────────────────────────────────────────
-- Counter caches on parent tables (added via ALTER TABLE in migration)
-- ALTER TABLE public.memorials ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE public.memorials ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE public.obituaries ADD COLUMN like_count INTEGER NOT NULL DEFAULT 0;
-- ALTER TABLE public.obituaries ADD COLUMN view_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE public.memorial_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (memorial_id, user_id)
);
CREATE INDEX idx_memorial_likes_memorial_id ON public.memorial_likes(memorial_id);
CREATE INDEX idx_memorial_likes_user_id     ON public.memorial_likes(user_id);
ALTER TABLE public.memorial_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view memorial likes" ON public.memorial_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert own memorial like" ON public.memorial_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete own memorial like" ON public.memorial_likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.obituary_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (obituary_id, user_id)
);
CREATE INDEX idx_obituary_likes_obituary_id ON public.obituary_likes(obituary_id);
CREATE INDEX idx_obituary_likes_user_id     ON public.obituary_likes(user_id);
ALTER TABLE public.obituary_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view obituary likes" ON public.obituary_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert own obituary like" ON public.obituary_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can delete own obituary like" ON public.obituary_likes FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.memorial_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  ip_hash     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (memorial_id, ip_hash)
);
CREATE INDEX idx_memorial_views_memorial_id ON public.memorial_views(memorial_id);
ALTER TABLE public.memorial_views ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS — backend writes only.

CREATE TABLE public.obituary_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  ip_hash     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (obituary_id, ip_hash)
);
CREATE INDEX idx_obituary_views_obituary_id ON public.obituary_views(obituary_id);
ALTER TABLE public.obituary_views ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS — backend writes only.

-- ── service_categories (20260313) ─────────────────────────────────────────────

CREATE TABLE public.service_categories (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                        text        NOT NULL,
  description                 text,
  slug                        text        UNIQUE NOT NULL,
  icon                        text,
  image_cloudinary_public_id  text,
  image_url                   text,
  is_active                   boolean     NOT NULL DEFAULT true,
  sort_order                  integer     NOT NULL DEFAULT 0,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Public read (active only)
CREATE POLICY "public_read_active_service_categories"
  ON public.service_categories FOR SELECT
  USING (is_active = true);

-- ── organization_services (20260313) ──────────────────────────────────────────

CREATE TABLE public.organization_services (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id     uuid        NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
  name            text        NOT NULL,
  description     text,
  phone           text,
  email           text,
  website         text,
  address         text,
  city            text,
  country         text,
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_organization_services_updated_at
  BEFORE UPDATE ON public.organization_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.organization_services ENABLE ROW LEVEL SECURITY;

-- Public read (active only)
CREATE POLICY "public_read_active_org_services"
  ON public.organization_services FOR SELECT
  USING (is_active = true);

-- Authenticated org user: full CRUD on own listings
CREATE POLICY "org_user_manage_own_services"
  ON public.organization_services FOR ALL
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());
