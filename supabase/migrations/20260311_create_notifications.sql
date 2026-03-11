-- Migration: create notifications table
-- Date: 2026-03-11

-- Notification type enum
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

-- Service role bypasses RLS by default — no INSERT policy needed for service role key.
