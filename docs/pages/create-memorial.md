## Status: ✅ Complete

# Create Memorial Page

**Route:** `/dashboard/memorials/create`
**File:** `frontend/src/pages/app/CreateMemorialPage.tsx`
**Auth:** Required (inside DashboardLayout)

---

## Purpose
Allows authenticated users to create a new digital memorial. Supports saving a draft at any time (no required fields) or publishing with required-field validation.

---

## Sections

| Section | Description |
|---------|-------------|
| Photos | Profile photo (360×360) + Cover photo (1216×282), up to 10MB each |
| Personal Information | First/Last name, Age, DOB, DOD, Gender, Race/Ethnicity, Country, State, Creator relationship |
| Memorial Quote | Free-text quote, max 2000 chars |
| Memorial Message | Biography (4000 chars) + Tribute message (1500 chars) |
| Photo Gallery | Up to 5 gallery photos via GalleryUpload |
| Web Address | Editable slug, auto-derived from name + death year, env-aware URL preview |

---

## Form Behaviour

- **Save as Draft**: No required fields — submits with `status: 'draft'`; only char-limit Zod errors block it
- **Create Memorial**: Requires `firstName`, `lastName`, `gender`, `raceEthnicity`, `country` — inline errors shown per field
- **Slug**: Auto-derived as `{firstName}-{lastName}-{deathYear}` when name/date changes; user can override; sanitised on every keystroke (lowercase, hyphens)
- **State dropdown**: Shown with Malaysia's 13 states + 3 FTs only when country = Malaysia; disabled otherwise

---

## URL Preview

| `VITE_APP_ENV` | Domain |
|---|---|
| `production` | `https://matieo.com` |
| `development` | `https://dev.matieo.com` |
| (local / unset) | `http://localhost:5173` |

---

## API

`POST /api/memorials` — accepts `custom_slug` + `photos[]` in payload

---

## Hook

`frontend/src/hooks/use-create-memorial.ts`
Exports: `useCreateMemorial()`, `useMemorialForm()`, `sanitiseSlug()`, `deriveSlug()`

---

## New Components

| Component | File |
|-----------|------|
| `Select` | `components/ui/Select.tsx` — Radix Select wrapper |
| `PhotoUpload` | `components/ui/PhotoUpload.tsx` — single photo upload + preview |
| `GalleryUpload` | `components/ui/PhotoUpload.tsx` — multi-photo gallery (max 5) |

---

## Tests

| File | Tests |
|------|-------|
| `components/ui/__tests__/select.test.tsx` | 5 tests |
| `components/ui/__tests__/photo-upload.test.tsx` | 8 tests |
| `hooks/__tests__/use-create-memorial.test.ts` | 7 tests |
| `pages/app/__tests__/create-memorial-page.test.tsx` | 9 tests |
| `backend/src/__tests__/memorials.controller.test.ts` | 7 tests |

---

## DB Changes

Migration: `supabase/migrations/20260304_create_memorial_additions.sql`

New columns on `memorials`:
- `profile_cloudinary_public_id` (text)
- `profile_url` (text)
- `country` (text)
- `state` (text)
- `creator_relationship` (text)
- `quote` (text)
