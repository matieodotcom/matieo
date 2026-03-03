-- Add location column to memorials
-- Used to display city/country on memorial cards in the View Memorials page.

ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS location text;
