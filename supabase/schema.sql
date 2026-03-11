-- =============================================================
-- MATIEO — Full Schema Snapshot
-- Keep this file in sync with supabase/migrations/
-- Last updated: 2026-03-11 (create notifications table)
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
