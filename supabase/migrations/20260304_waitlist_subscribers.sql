-- Migration: 20260304_waitlist_subscribers
-- Adds waitlist_subscribers table for email follow-up mechanism

CREATE TABLE waitlist_subscribers (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text        NOT NULL,
  email         text        NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  CONSTRAINT waitlist_subscribers_email_key UNIQUE (email)
);

ALTER TABLE waitlist_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) can subscribe
CREATE POLICY "Anyone can subscribe"
  ON waitlist_subscribers FOR INSERT
  WITH CHECK (true);
-- No public SELECT — only service role can read
