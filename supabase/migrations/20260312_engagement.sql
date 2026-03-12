-- =============================================================
-- 20260312_engagement.sql
-- Adds like/view counter caches to memorials and obituaries,
-- and creates deduplicated like/view tracking tables.
-- =============================================================

-- ── Counter cache columns ──────────────────────────────────────────────────────

ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.memorials ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.obituaries ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.obituaries ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

-- ── memorial_likes ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.memorial_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (memorial_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memorial_likes_memorial_id ON public.memorial_likes(memorial_id);
CREATE INDEX IF NOT EXISTS idx_memorial_likes_user_id     ON public.memorial_likes(user_id);

ALTER TABLE public.memorial_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view memorial likes"
  ON public.memorial_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert own memorial like"
  ON public.memorial_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own memorial like"
  ON public.memorial_likes FOR DELETE USING (auth.uid() = user_id);

-- ── obituary_likes ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.obituary_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (obituary_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_obituary_likes_obituary_id ON public.obituary_likes(obituary_id);
CREATE INDEX IF NOT EXISTS idx_obituary_likes_user_id     ON public.obituary_likes(user_id);

ALTER TABLE public.obituary_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view obituary likes"
  ON public.obituary_likes FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert own obituary like"
  ON public.obituary_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete own obituary like"
  ON public.obituary_likes FOR DELETE USING (auth.uid() = user_id);

-- ── memorial_views ────────────────────────────────────────────────────────────
-- No direct public SELECT — view counts are cached on the parent row.
-- Inserts are performed via service role (backend), bypassing RLS.

CREATE TABLE IF NOT EXISTS public.memorial_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  ip_hash     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (memorial_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_memorial_views_memorial_id ON public.memorial_views(memorial_id);

ALTER TABLE public.memorial_views ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS — no policies needed for backend writes.

-- ── obituary_views ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.obituary_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obituary_id UUID NOT NULL REFERENCES public.obituaries(id) ON DELETE CASCADE,
  ip_hash     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (obituary_id, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_obituary_views_obituary_id ON public.obituary_views(obituary_id);

ALTER TABLE public.obituary_views ENABLE ROW LEVEL SECURITY;
-- Service role bypasses RLS — no policies needed for backend writes.
