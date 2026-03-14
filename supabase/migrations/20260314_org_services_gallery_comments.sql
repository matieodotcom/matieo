-- Add new columns to organization_services
ALTER TABLE organization_services
  ADD COLUMN IF NOT EXISTS icon_public_id      text,
  ADD COLUMN IF NOT EXISTS icon_url            text,
  ADD COLUMN IF NOT EXISTS gallery_public_ids  jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery_urls        jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS about               text,
  ADD COLUMN IF NOT EXISTS is_draft            boolean DEFAULT false;

-- New table for service provider comments
CREATE TABLE IF NOT EXISTS service_provider_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id  uuid NOT NULL REFERENCES organization_services(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE service_provider_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read comments"
  ON service_provider_comments FOR SELECT USING (true);

CREATE POLICY "auth users can comment"
  ON service_provider_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own comments"
  ON service_provider_comments FOR DELETE
  USING (auth.uid() = user_id);
