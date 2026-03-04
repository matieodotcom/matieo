-- =============================================================
-- Migration: 20260304_create_memorial_additions.sql
-- Adds profile photo, country, state, relationship, and quote
-- fields to the memorials table for the Create Memorial form.
-- =============================================================

ALTER TABLE public.memorials
  ADD COLUMN IF NOT EXISTS profile_cloudinary_public_id text,
  ADD COLUMN IF NOT EXISTS profile_url                  text,
  ADD COLUMN IF NOT EXISTS country                      text,
  ADD COLUMN IF NOT EXISTS state                        text,
  ADD COLUMN IF NOT EXISTS creator_relationship         text,
  ADD COLUMN IF NOT EXISTS quote                        text;
