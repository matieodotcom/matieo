-- =============================================================
-- MATIEO — Full Schema Snapshot
-- Keep this file in sync with supabase/migrations/
-- Last updated: 2026-03-04 (add waitlist_subscribers)
-- =============================================================

-- Migrations applied:
-- [x] 20260101_initial_schema.sql
-- [x] 20260303_add_location_to_memorials.sql
-- [x] 20260304_waitlist_subscribers.sql

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
