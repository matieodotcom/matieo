-- Add account_type column to profiles and update handle_new_user trigger
-- Migration: 20260310_add_account_type_to_profiles

-- 1. Add column (NOT NULL with default so existing rows backfill to 'individual')
ALTER TABLE public.profiles
  ADD COLUMN account_type text NOT NULL DEFAULT 'individual'
  CHECK (account_type IN ('individual', 'organization'));

-- 2. Update the handle_new_user trigger to read account_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, account_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'individual')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name    = EXCLUDED.full_name,
    email        = EXCLUDED.email,
    account_type = COALESCE(EXCLUDED.account_type, profiles.account_type);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
