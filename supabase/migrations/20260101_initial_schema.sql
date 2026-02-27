-- =============================================================
-- Migration: 20260101_initial_schema.sql
-- Description: Initial MATIEO schema — profiles, memorials,
--              family_members, memorial_photos, mortality_data
-- =============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================
-- HELPER: updated_at trigger function
-- =============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================
-- TABLE: profiles
-- Auto-created on first sign-up via trigger on auth.users
-- =============================================================
create table if not exists public.profiles (
  id                  uuid primary key references auth.users(id) on delete cascade,
  full_name           text,
  email               text,
  avatar_cloudinary_public_id text,
  avatar_url          text,
  role                text not null default 'user' check (role in ('user', 'admin', 'researcher')),
  dark_mode           boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger: auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- =============================================================
-- TABLE: memorials
-- Core table for digital memorials
-- =============================================================
create table if not exists public.memorials (
  id                        uuid primary key default gen_random_uuid(),
  created_by                uuid not null references auth.users(id) on delete cascade,

  -- Personal Information
  full_name                 text not null,
  age_at_death              integer,
  date_of_birth             date,
  date_of_death             date,
  gender                    text check (gender in ('male', 'female', 'non-binary', 'prefer_not_to_say')),
  race_ethnicity            text,

  -- Cover photo (Cloudinary)
  cover_cloudinary_public_id text,
  cover_url                 text,

  -- Cause of death
  cause_of_death            text,

  -- Memorial Message
  biography                 text,
  tribute_message           text,

  -- Custom URL
  slug                      text unique,
  full_memorial_url         text,         -- e.g., https://matieo.com/memorial/slug

  -- Status
  status                    text not null default 'draft' check (status in ('draft', 'published')),

  -- Soft delete
  deleted_at                timestamptz,

  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table public.memorials enable row level security;

create policy "Public can view published memorials"
  on public.memorials for select
  using (status = 'published' and deleted_at is null);

create policy "Owners can view their own memorials"
  on public.memorials for select
  using (auth.uid() = created_by);

create policy "Owners can insert memorials"
  on public.memorials for insert
  with check (auth.uid() = created_by);

create policy "Owners can update their memorials"
  on public.memorials for update
  using (auth.uid() = created_by);

create policy "Owners can delete (soft) their memorials"
  on public.memorials for update
  using (auth.uid() = created_by);

create trigger memorials_updated_at
  before update on public.memorials
  for each row execute function public.handle_updated_at();

create index idx_memorials_created_by on public.memorials(created_by);
create index idx_memorials_slug on public.memorials(slug);
create index idx_memorials_status on public.memorials(status);

-- =============================================================
-- TABLE: funeral_details
-- Funeral service info (optional, attached to a memorial)
-- =============================================================
create table if not exists public.funeral_details (
  id                  uuid primary key default gen_random_uuid(),
  memorial_id         uuid not null references public.memorials(id) on delete cascade,
  funeral_center_name text,
  location            text,
  funeral_date        date,
  funeral_time        time,
  contact_person      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.funeral_details enable row level security;

create policy "Memorial owners can manage funeral details"
  on public.funeral_details for all
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.created_by = auth.uid()
    )
  );

create policy "Public can view funeral details for published memorials"
  on public.funeral_details for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.status = 'published' and m.deleted_at is null
    )
  );

create trigger funeral_details_updated_at
  before update on public.funeral_details
  for each row execute function public.handle_updated_at();

-- =============================================================
-- TABLE: burial_details
-- Burial service info (optional, attached to a memorial)
-- =============================================================
create table if not exists public.burial_details (
  id                  uuid primary key default gen_random_uuid(),
  memorial_id         uuid not null references public.memorials(id) on delete cascade,
  burial_center_name  text,
  location            text,
  burial_date         date,
  burial_time         time,
  contact_person      text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.burial_details enable row level security;

create policy "Memorial owners can manage burial details"
  on public.burial_details for all
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.created_by = auth.uid()
    )
  );

create policy "Public can view burial details for published memorials"
  on public.burial_details for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.status = 'published' and m.deleted_at is null
    )
  );

create trigger burial_details_updated_at
  before update on public.burial_details
  for each row execute function public.handle_updated_at();

-- =============================================================
-- TABLE: contact_persons
-- Primary contact for a memorial
-- =============================================================
create table if not exists public.contact_persons (
  id              uuid primary key default gen_random_uuid(),
  memorial_id     uuid not null references public.memorials(id) on delete cascade,
  full_name       text,
  relationship    text,
  phone_number    text,
  email           text,
  created_at      timestamptz not null default now()
);

alter table public.contact_persons enable row level security;

create policy "Memorial owners can manage contact persons"
  on public.contact_persons for all
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.created_by = auth.uid()
    )
  );

-- =============================================================
-- TABLE: family_members
-- Surviving family members list on a memorial
-- =============================================================
create table if not exists public.family_members (
  id              uuid primary key default gen_random_uuid(),
  memorial_id     uuid not null references public.memorials(id) on delete cascade,
  full_name       text not null,
  relationship    text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.family_members enable row level security;

create policy "Memorial owners can manage family members"
  on public.family_members for all
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.created_by = auth.uid()
    )
  );

create policy "Public can view family members for published memorials"
  on public.family_members for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.status = 'published' and m.deleted_at is null
    )
  );

create index idx_family_members_memorial_id on public.family_members(memorial_id);

-- =============================================================
-- TABLE: memorial_photos
-- Photo gallery for a memorial
-- =============================================================
create table if not exists public.memorial_photos (
  id                          uuid primary key default gen_random_uuid(),
  memorial_id                 uuid not null references public.memorials(id) on delete cascade,
  cloudinary_public_id        text not null,
  cloudinary_url              text not null,
  caption                     text,
  sort_order                  integer not null default 0,
  created_at                  timestamptz not null default now()
);

alter table public.memorial_photos enable row level security;

create policy "Memorial owners can manage photos"
  on public.memorial_photos for all
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.created_by = auth.uid()
    )
  );

create policy "Public can view photos for published memorials"
  on public.memorial_photos for select
  using (
    exists (
      select 1 from public.memorials m
      where m.id = memorial_id and m.status = 'published' and m.deleted_at is null
    )
  );

create index idx_memorial_photos_memorial_id on public.memorial_photos(memorial_id);

-- =============================================================
-- TABLE: mortality_data
-- Pre-populated aggregate mortality statistics for insights
-- (imported from external datasets, not user-generated)
-- =============================================================
create table if not exists public.mortality_data (
  id              uuid primary key default gen_random_uuid(),
  country         text not null,
  state_region    text,
  race_ethnicity  text,
  cause_of_death  text,
  age_group       text,          -- e.g., '65-75', '0-14'
  gender          text,
  year            integer not null,
  month           integer,       -- 1-12, null if annual aggregate
  death_count     integer not null default 0,
  created_at      timestamptz not null default now()
);

alter table public.mortality_data enable row level security;

-- Mortality data is read-only for all authenticated users
create policy "Authenticated users can read mortality data"
  on public.mortality_data for select
  to authenticated
  using (true);

create index idx_mortality_data_country on public.mortality_data(country);
create index idx_mortality_data_year on public.mortality_data(year);
create index idx_mortality_data_cause on public.mortality_data(cause_of_death);
