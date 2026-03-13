-- Migration: service_categories + organization_services
-- Date: 2026-03-13

-- ── service_categories ────────────────────────────────────────────────────────

CREATE TABLE public.service_categories (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name                        text        NOT NULL,
  description                 text,
  slug                        text        UNIQUE NOT NULL,
  icon                        text,
  image_cloudinary_public_id  text,
  image_url                   text,
  is_active                   boolean     NOT NULL DEFAULT true,
  sort_order                  integer     NOT NULL DEFAULT 0,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_service_categories_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- Public read (active only)
CREATE POLICY "public_read_active_service_categories"
  ON public.service_categories FOR SELECT
  USING (is_active = true);

-- ── organization_services ─────────────────────────────────────────────────────

CREATE TABLE public.organization_services (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_id     uuid        NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
  name            text        NOT NULL,
  description     text,
  phone           text,
  email           text,
  website         text,
  address         text,
  city            text,
  country         text,
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_organization_services_updated_at
  BEFORE UPDATE ON public.organization_services
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.organization_services ENABLE ROW LEVEL SECURITY;

-- Public read (active only)
CREATE POLICY "public_read_active_org_services"
  ON public.organization_services FOR SELECT
  USING (is_active = true);

-- Authenticated org user: full CRUD on own listings
CREATE POLICY "org_user_manage_own_services"
  ON public.organization_services FOR ALL
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- ── Seed 14 categories ────────────────────────────────────────────────────────

INSERT INTO public.service_categories (name, slug, description, icon, sort_order) VALUES
  ('Florists',            'florists',        'Beautiful floral arrangements and sympathy flowers for services.',      'Flower2',         1),
  ('Casket & Urn Sellers','casketUrn',       'Quality caskets and cremation urns for every tradition.',              'Package',         2),
  ('Transportation',      'transportation',  'Professional funeral transportation services.',                        'Car',             3),
  ('Counselling',         'counselling',     'Grief counselling and bereavement support services.',                  'HeartHandshake',  4),
  ('Funeral Undertakers', 'undertakers',     'Compassionate funeral directors for planning services.',               'Building2',       5),
  ('Caterers',            'caterers',        'Catering services for memorial and funeral gatherings.',               'UtensilsCrossed', 6),
  ('Prayer Services',     'prayerServices',  'Religious and spiritual services to honour the deceased.',             'BookOpen',        7),
  ('Funeral Parlour',     'funeralParlour',  'Dedicated funeral homes and viewing facilities.',                     'Home',            8),
  ('Crematorium',         'crematorium',     'Professional cremation services and facilities.',                      'Flame',           9),
  ('Canopy',              'canopy',          'Canopy and marquee rental for outdoor ceremonies.',                    'Tent',            10),
  ('Burial Services',     'burialServices',  'Full burial services and cemetery arrangements.',                     'Mountain',        11),
  ('Photography',         'photography',     'Respectful memorial photography and videography.',                    'Camera',          12),
  ('Memorial Parks',      'memorialParks',   'Peaceful memorial parks and garden of remembrance.',                  'Trees',           13),
  ('Feng Shui',           'fengShui',        'Traditional feng shui consultation for burial sites.',                'Wind',            14);
