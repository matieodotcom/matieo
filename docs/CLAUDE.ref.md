# CLAUDE.ref.md — MATIEO Reference

> **Load on demand — not on session start.**
> Read only the section relevant to your current task.
> Updated by Claude via self-maintenance protocol in CLAUDE.md.

**Sections:**
- [§Stack](#stack) — full tech stack
- [§Architecture](#architecture) — system diagram + structure
- [§DB](#db) — compact schema + relationships
- [§Design](#design) — tokens, patterns, Radix decision logic, component log
- [§Responsive](#responsive) — breakpoints, padding, grid, typography, mobile nav patterns
- [§ML](#ml) — ML service architecture + feature roadmap
- [§Environments](#environments) — env vars, Supabase, Cloudinary, Render, Hostinger setup
- [§Pages](#pages) — per-page build specs

---

## §ErrorHandling

### Toast library
Use `sonner` — lightweight, accessible, Tailwind-friendly.
```ts
// lib/toast.ts — single wrapper, import this everywhere
import { toast as sonnerToast } from 'sonner'

export const toast = {
  success: (msg: string) => sonnerToast.success(msg),
  error:   (msg: string) => sonnerToast.error(msg),
  info:    (msg: string) => sonnerToast.info(msg),
}
```
Add `<Toaster />` once in `App.tsx`. Never import sonner directly in components.

### When to toast vs inline error

| Situation | Pattern |
|-----------|---------|
| Successful create/update/delete | `toast.success("Memorial saved")` |
| Zod / form validation failure | Inline via `formState.errors.fieldName.message` |
| Network error on mutation | Inline error message near submit button |
| Auth error (wrong password) | Inline below form |
| 401 anywhere | Redirect to /signin — no toast |
| 500 / unexpected | Inline "Something went wrong" + retry button |
| ML service degraded | Silent — show fallback UI, no error shown to user |

### Hook error pattern
```ts
// Every mutation hook follows this shape:
const { mutate, isPending, error } = useMutation({
  mutationFn: createMemorial,
  onSuccess: () => {
    toast.success('Memorial created')
    queryClient.invalidateQueries({ queryKey: ['memorials'] })
  },
  onError: (err) => {
    // Don't toast — caller renders error.message inline
  },
})
// In UI: {error && <ErrorMessage message={error.message} />}
```

### `<ErrorMessage>` component
```tsx
// components/shared/ErrorMessage.tsx
export function ErrorMessage({ message }: { message: string }) {
  return (
    <p role="alert" className="text-sm text-red-500 mt-1">
      {message}
    </p>
  )
}
```

### API error shape (Node backend)
```ts
// All errors return this shape:
{ error: string, code?: string, details?: unknown }
// HTTP status:
// 400 Bad Request — malformed input
// 401 Unauthorized — missing or invalid token
// 403 Forbidden — RLS / ownership violation
// 422 Unprocessable — validation failed (includes field errors)
// 500 Internal — unexpected server error
```

---

## §Stack

**Frontend:** React 18, Vite 5, TypeScript, Radix UI, Tailwind CSS v3, React Hook Form + Zod, TanStack Query v5, Zustand v4, Lucide React, country-state-city, `@radix-ui/react-alert-dialog`, `react-day-picker` v9, `date-fns` v4, `i18next` + `react-i18next` + `i18next-browser-languagedetector`, `emoji-picker-react` (emoji input on tribute/condolence forms). Test: Vitest + RTL.

**Tributes & Condolences delete:** `DELETE /api/memorials/:id/tributes/:tributeId` and `DELETE /api/obituaries/:id/condolences/:condolenceId` — auth required, ownership verified (403 if not author, 404 if not found). Frontend: `useDeleteTribute` / `useDeleteCondolence` hooks; trash icon button rendered only when `post.user_id === user.id`.

**Supported locales:** `en` (default) · `ar` (RTL) · `ms` · `fr` · `es` · `hi`. Locale stored in `localStorage` via `localeStore`. `<html dir>` set to `rtl` for Arabic only.

**i18n rules — mandatory:**
1. Every new UI string → add key to **all** existing locale files simultaneously (`en` as source of truth, others translated or English placeholder).
2. Adding a new language → create `locales/{code}/translation.json` with **every existing key fully translated** (no placeholders). Register in `lib/i18n.ts` resources, add to `LocaleStore` type, add to `LanguageSwitcher.tsx` options, add `language.{code}` label to every existing locale file, set `dir='rtl'` in `localeStore.ts` if the language is RTL.

**Frontend key lib files:**
- `hooks/use-profile.ts` — `useProfile()` — fetches the current user's `profiles` row (id, full_name, email, avatar, role, dark_mode, account_type); React Query, enabled only when user is logged in
- `lib/supabase.ts` — Supabase singleton client (anon key, frontend only)
- `lib/apiClient.ts` — `apiFetch<T>(path, init?)` — authenticated fetch to Node API; reads Supabase JWT, attaches Bearer token, handles 401 redirect. **Use for ALL frontend→Node API calls. Never inline fetch with Bearer token.**
- `lib/toast.ts` — Sonner wrapper (success/error/info)
- `lib/queryClient.ts` — TanStack QueryClient singleton
- `lib/geo.ts` — `detectUserCountryCode()` (async, Cloudflare CDN trace, CORS-safe, falls back to `navigator.language` region), `buildCountryOptions(isoCode|null)` (full world list, detected country first), `buildStateOptions(countryName)` (dynamic states via `country-state-city`)
- `components/layout/ScrollToTop.tsx` — pathless root route element; calls `window.scrollTo({ top: 0, behavior: 'instant' })` on every pathname change, renders `<Outlet />`
- `hooks/use-delete-memorial.ts` — `useDeleteMemorial()` mutation: `DELETE /api/memorials/:id/permanent`, invalidates `['my-memorials']`, toasts on success
- `hooks/use-unpublish-memorial.ts` — `useUnpublishMemorial()` mutation: `POST /api/memorials/:id/unpublish`, sets status→draft, invalidates `['my-memorials']`, toasts on success
- `hooks/use-public-memorial.ts` — `usePublicMemorial(slug)` query: `GET /api/memorials/by-slug/:slug`, public (no auth), returns `{ data: MemorialRow }`
- `hooks/use-create-obituary.ts` — `useObituaryForm(id?)`, `useCreateObituary()`, `useUpdateObituary()`, `useGetObituary(id?)`, `sanitiseSlug`, `deriveSlug`; manages full obituary form state with draftSchema/publishSchema; integrates `useObituaryDraftStore` for draft persistence across preview navigation
- `hooks/use-my-obituaries.ts` — `useMyObitaries({q,page,limit})` query: `GET /api/obituaries/mine`
- `hooks/use-obituaries.ts` — `useObitaries({q,page,limit})` query: `GET /api/obituaries` (public)
- `hooks/use-delete-obituary.ts` — `useDeleteObituary()` mutation: `DELETE /api/obituaries/:id/permanent`, invalidates `['my-obituaries']`
- `hooks/use-unpublish-obituary.ts` — `useUnpublishObituary()` mutation: `POST /api/obituaries/:id/unpublish`, invalidates `['my-obituaries']`
- `hooks/use-tributes.ts` — `useTributes(memorialId)` query: `GET /api/memorials/:id/tributes`, public; `usePostTribute(memorialId)` mutation: `POST /api/memorials/:id/tributes`, auth required; invalidates `['tributes', id]`
- `hooks/use-condolences.ts` — `useCondolences(obituaryId)` query: `GET /api/obituaries/:id/condolences`, public; `usePostCondolence(obituaryId)` mutation: `POST /api/obituaries/:id/condolences`, auth required; invalidates `['condolences', id]`
- `hooks/use-memorial-engagement.ts` — `useTrackMemorialView(id)` effect: fire-and-forget `POST /api/memorials/:id/view` on mount (IP-deduplicated); `useLikeMemorial(id, slug)` mutation: `POST /api/memorials/:id/like` (auth required), updates `['memorial', slug]` cache with new `like_count`+`user_liked`
- `hooks/use-obituary-engagement.ts` — `useTrackObituaryView(id)` effect: fire-and-forget `POST /api/obituaries/:id/view` on mount (IP-deduplicated); `useLikeObituary(id, slug)` mutation: `POST /api/obituaries/:id/like` (auth required), updates `['public-obituary', slug]` cache
- `store/memorialDraftStore.ts` — Zustand store: `draft: MemorialFormValues | null`, `coverGradient: string`; `saveDraft(values, coverGradient)` / `clearDraft()`; persists memorial form across preview navigation
- `store/obituaryDraftStore.ts` — Zustand store: `draft: ObituaryFormValues | null`, `coverGradient: string`; `saveDraft(values, coverGradient)` / `clearDraft()`; persists obituary form across preview navigation
- `store/themeStore.ts` — Zustand dark-mode store (`isDark`, `toggle`, `init`). `toggle` flips state + writes `localStorage('theme')`. `init` reads localStorage → falls back to `window.matchMedia`. DOM class sync is handled reactively via `useLayoutEffect` in `ThemeInitializer` (App.tsx). `index.html` has a blocking inline script that applies `dark` class before React loads (prevents flash). Tailwind: `darkMode: 'class'` in `tailwind.config.ts`. Preference is **localStorage only** — not synced to Supabase.
- `config/policy-versions.ts` — `POLICY_VERSIONS` object (`terms`, `privacy`, `cookie` as `Date`). Pages format via `toLocaleDateString(i18n.language, { year, month, long, day })`. Update only this file when a policy date changes — no locale files needed.
- `lib/i18n.ts` — i18next init. Resources: 6 locale JSON files (`en`, `ar`, `ms`, `fr`, `es`, `hi`). `fallbackLng: 'en'`. `initImmediate: false` (sync for SSR compat). Side-effect import in `main.tsx` before anything else.
- `lib/i18n-test.ts` — minimal i18next instance for Vitest (en only, `initImmediate: false`). Used in `__tests__/utils.tsx` via `<I18nextProvider>`.
- `store/localeStore.ts` — Zustand + persist store: `locale: 'en'|'ar'|'ms'|'fr'|'es'|'hi'`, `setLocale(l)`. `setLocale` calls `i18n.changeLanguage`, sets `document.documentElement.lang`, sets `document.documentElement.dir` (`rtl` for `ar`, `ltr` for all others). Persisted as `matieo-locale` in localStorage. `index.html` has blocking inline script to set `dir`/`lang` before React hydrates (prevents RTL flash).
- `components/ui/LanguageSwitcher.tsx` — Radix DropdownMenu; shows flag emoji + language name; calls `useLocaleStore().setLocale(locale)`. Rendered in `Navbar.tsx` (desktop) and `DashboardLayout.tsx` (sidebar).
- `hooks/use-services.ts` — `usePublicServiceCategories()` query: `GET /api/services/categories` (public, returns categories with `service_count`); `useMyServices()`, `useCreateMyService()`, `useUpdateMyService()`, `useDeleteMyService()` — org user CRUD for `/api/services/my`
- `hooks/use-notifications.ts` — `useNotifications(userId)` query: `GET /api/notifications` + Supabase Realtime channel (`notifications:{userId}`) invalidates cache on INSERT; `useMarkNotificationRead`, `useMarkAllRead`, `useDeleteNotification` mutations. `useNotifications` is enabled only when `userId != null`.
- `components/shared/NotificationBell.tsx` — Bell icon with unread count badge; opens Radix Dialog slide-in-from-right panel listing notifications. Rendered in `Navbar.tsx` (authenticated branch) and `DashboardLayout.tsx` header. Returns null when not authenticated.

**Backend (Node):** Node 20 LTS, Express, TypeScript, Supabase JS SDK (service role), Cloudinary SDK, Resend (transactional email). Test: Jest + Supertest. Host: Render.
- `lib/emailClient.ts` — Resend singleton, `EMAIL_EVENTS` registry, `buildEmailHtml`, `getEmailForUser`, and all transactional send functions. Email trigger map → `docs/email-trigger-map.md`
- `lib/notificationsClient.ts` — `NOTIFICATION_TYPES` registry + `createNotification(params)` helper; inserts into `notifications` table via service role. Called fire-and-forget from tributes/condolences/memorials/obituaries controllers after res.json(). Self-notify guard applied in tribute/condolence IIFEs.
- **Resend MCP** configured in `.mcp.json` — use for testing/sending emails, domain verification, contact management. Requires `RESEND_API_KEY` in `.env.mcp`.

**ML Service (Python):** Python 3.11, FastAPI, scikit-learn, pandas, numpy, spaCy / HuggingFace. Test: pytest. Host: Render (separate service).

**E2E:** Playwright — critical flows only.

**Infra:** Supabase (PostgreSQL + Auth + RLS), Cloudinary (all images), Hostinger (frontend static), GitHub (repo + CI/CD).

---

## §Architecture

```
React (Hostinger)
  ├──→ Node API (Render) ──→ Python ML (Render, internal only)
  │         │                        │
  └─────────┴────────────────────────┘
                      ↓
              Supabase (shared DB)
```

**Key decisions:**
- Frontend never calls ML service directly — always via Node API
- ML failures never break core app — `mlClient.ts` has 10s timeout + fallback
- Both services use Supabase service role key (backend only)
- ML service built only when first AI feature is ready

**Project structure:**
```
matieo/
├── CLAUDE.md              ← Session directives (always loaded)
├── docs/CLAUDE.ref.md     ← This file (load on demand)
├── docs/pages/            ← Per-page specs (_template.md + one per built page)
├── frontend/src/
│   ├── router.tsx         ← All routes
│   ├── lib/               ← supabase.ts, api.ts, cloudinary.ts, queryClient.ts
│   ├── locales/en|ar|ms|fr|es|hi/translation.json  ← i18n strings (ALL 6 updated together)
│   ├── store/authStore.ts
│   ├── store/themeStore.ts
│   ├── store/localeStore.ts
│   ├── store/memorialDraftStore.ts
│   ├── store/obituaryDraftStore.ts
│   ├── hooks/             ← All data logic (useAuth, useMemorials, useInsights, useProfile)
│   ├── components/ui/     ← Avatar, Dialog, DropdownMenu, Sheet (Radix-based)
│   ├── components/layout/ ← Navbar.tsx, Footer.tsx, DashboardLayout.tsx
│   ├── components/auth/   ← SignInModal.tsx
│   ├── components/memorial/ ← MemorialCard.tsx
│   ├── components/shared/ ← ErrorMessage.tsx
│   └── pages/             ← landing/, auth/, app/, public/, legal/, features/, about/
├── backend/src/
│   ├── lib/supabaseAdmin.ts
│   ├── lib/mlClient.ts
│   ├── middleware/auth.middleware.ts
│   ├── routes/
│   └── controllers/
├── ml-service/src/
│   ├── main.py
│   ├── config.py
│   ├── routers/           ← health, predictions, clustering, nlp
│   ├── services/          ← mortality_predictor, cluster_service, nlp_service
│   └── models/schemas.py
└── supabase/
    ├── schema.sql         ← Current snapshot (always up to date)
    └── migrations/        ← YYYYMMDD_description.sql per change
```

---

## §DB

> Updated by Claude after every schema change. Supabase MCP `list_tables()` gives live state.

**Relationships:**
```
auth.users
  ├─1:1─ profiles
  ├─1:N─ memorials
  │           ├─1:1─ funeral_details
  │           ├─1:1─ burial_details
  │           ├─1:N─ contact_persons
  │           ├─1:N─ family_members
  │           ├─1:N─ memorial_photos
  │           └─1:N─ tributes
  │           ├─1:N─ memorial_likes  (auth, toggleable, unique per user)
  │           └─1:N─ memorial_views  (IP-hash deduplicated, service-role only)
  ├─1:N─ obituaries  (jsonb: funeral_details, burial_details, contact_person, family_members)
  │           ├─1:N─ condolences
  │           ├─1:N─ obituary_likes  (auth, toggleable, unique per user)
  │           └─1:N─ obituary_views  (IP-hash deduplicated, service-role only)
  └─1:N─ notifications

mortality_data  (standalone, admin-populated)

service_categories  (admin-managed)
  └─1:N─ organization_services (org user listings)
             └─N:1─ profiles (organization_id)
```

**Compact schema** — `col(type,constraint)`:

```
profiles
  id(uuid,pk→auth.users), full_name(text), email(text),
  avatar_cloudinary_public_id(text), avatar_url(text),
  role(text,default:user|admin|researcher), dark_mode(bool,default:false),
  account_type(text,NOT NULL,default:individual,CHECK:individual|organization),
  created_at(ts), updated_at(ts,trigger)
  RLS: owner read/update only

memorials
  id(uuid,pk), created_by(uuid,fk→auth.users), creator_name(text,denorm),
  full_name(text,req), age_at_death(int,req-for-publish), date_of_birth(date), date_of_death(date),
  gender(male|female|non-binary|prefer_not_to_say), race_ethnicity(text),
  location(text), cover_cloudinary_public_id(text), cover_url(text),
  cover_gradient(text), profile_cloudinary_public_id(text), profile_url(text),
  country(text), state(text), creator_relationship(text), quote(text),
  cause_of_death(text), biography(text), tribute_message(text),
  slug(text,unique), full_memorial_url(text),
  like_count(int,NOT NULL,default:0), view_count(int,NOT NULL,default:0),
  status(draft|published,default:draft), deleted_at(ts,soft-delete),
  created_at(ts), updated_at(ts,trigger)
  RLS: public→published only; owner→all
  IDX: created_by, slug, status
  Migrations: 20260303_add_location_to_memorials.sql, 20260304_create_memorial_additions.sql, 20260305_add_cover_gradient.sql, 20260306_add_creator_name_to_memorials.sql, 20260312_engagement.sql

funeral_details
  id(uuid,pk), memorial_id(uuid,fk→memorials,cascade),
  funeral_center_name(text), location(text), funeral_date(date),
  funeral_time(time), contact_person(text),
  created_at(ts), updated_at(ts,trigger)
  RLS: owner manage; public→published memorials

burial_details
  id(uuid,pk), memorial_id(uuid,fk→memorials,cascade),
  burial_center_name(text), location(text), burial_date(date),
  burial_time(time), contact_person(text),
  created_at(ts), updated_at(ts,trigger)
  RLS: same as funeral_details

contact_persons
  id(uuid,pk), memorial_id(uuid,fk→memorials,cascade),
  full_name(text), relationship(text), phone_number(text), email(text),
  created_at(ts)
  RLS: owner manage only

family_members
  id(uuid,pk), memorial_id(uuid,fk→memorials,cascade),
  full_name(text,req), relationship(text), sort_order(int,default:0),
  created_at(ts)
  RLS: owner manage; public→published memorials
  IDX: memorial_id

memorial_photos
  id(uuid,pk), memorial_id(uuid,fk→memorials,cascade),
  cloudinary_public_id(text,req), cloudinary_url(text,req),
  caption(text), sort_order(int,default:0),
  created_at(ts)
  RLS: owner manage; public→published memorials
  IDX: memorial_id

mortality_data
  id(uuid,pk), country(text,req), state_region(text), race_ethnicity(text),
  cause_of_death(text), age_group(text), gender(text),
  year(int,req), month(int,1-12), death_count(int,default:0),
  created_at(ts)
  RLS: authenticated read-only; write via service role only
  IDX: country, year, cause_of_death

waitlist_subscribers
  id(uuid,pk), name(text,req), email(text,req,unique), subscribed_at(ts)
  RLS: anyone can INSERT; no public SELECT (service role only)
  Migration: 20260304_waitlist_subscribers.sql

obituaries
  id(uuid,pk), created_by(uuid,fk→auth.users,nullable), creator_name(text,denorm),
  full_name(text,req), age_at_death(int,req-for-publish), date_of_birth(date), date_of_death(date),
  gender(male|female|non-binary|prefer_not_to_say), race_ethnicity(text),
  country(text), state(text), place_of_death(text),
  cause_of_passing(text,PRIVATE), cause_of_passing_consented(bool,default:false),
  profile_cloudinary_public_id(text), profile_url(text),
  cover_cloudinary_public_id(text), cover_url(text),
  death_cert_cloudinary_public_id(text,PRIVATE), death_cert_url(text,PRIVATE),
  biography(text),
  funeral_details(jsonb: {name,location,date,time,note}),
  burial_details(jsonb: {burial_center_name,location,burial_date,burial_time,note}),
  contact_person(jsonb: {name,relationship,phone,email}),
  family_members(jsonb: [{name,relationship}]),
  slug(text,unique), full_obituary_url(text),
  like_count(int,NOT NULL,default:0), view_count(int,NOT NULL,default:0),
  status(draft|published,default:draft), deleted_at(ts,soft-delete),
  created_at(ts), updated_at(ts,trigger)
  RLS: public→published only (cause_of_passing stripped by controller); owner→all
  IDX: created_by, slug, status
  Migration: 20260309_create_obituaries.sql
  NOTE: cause_of_passing + death_cert fields are NEVER returned by public endpoints (controller strips them)

tributes
  id(uuid,pk), memorial_id(uuid,fk→memorials,cascade),
  user_id(uuid,fk→auth.users,cascade), author_name(text,req),
  message(text,req,max:500), created_at(ts)
  RLS: public SELECT; authenticated INSERT (uid=user_id); owner DELETE
  IDX: memorial_id
  Migration: 20260309_create_tributes_condolences.sql

condolences
  id(uuid,pk), obituary_id(uuid,fk→obituaries,cascade),
  user_id(uuid,fk→auth.users,cascade), author_name(text,req),
  message(text,req,max:500), created_at(ts)
  RLS: public SELECT; authenticated INSERT (uid=user_id); owner DELETE
  IDX: obituary_id
  Migration: 20260309_create_tributes_condolences.sql

memorial_likes
  id(uuid,pk), memorial_id(uuid,fk→memorials,cascade),
  user_id(uuid,fk→auth.users,cascade), created_at(ts)
  UNIQUE: (memorial_id, user_id)
  RLS: public SELECT; authenticated INSERT (uid=user_id); authenticated DELETE (uid=user_id)
  IDX: memorial_id, user_id
  Counter cache: memorials.like_count incremented/decremented by controller (not DB trigger)
  Migration: 20260312_engagement.sql

obituary_likes
  id(uuid,pk), obituary_id(uuid,fk→obituaries,cascade),
  user_id(uuid,fk→auth.users,cascade), created_at(ts)
  UNIQUE: (obituary_id, user_id)
  RLS: public SELECT; authenticated INSERT (uid=user_id); authenticated DELETE (uid=user_id)
  IDX: obituary_id, user_id
  Counter cache: obituaries.like_count incremented/decremented by controller
  Migration: 20260312_engagement.sql

memorial_views
  id(uuid,pk), memorial_id(uuid,fk→memorials,cascade),
  ip_hash(text,req), created_at(ts)
  UNIQUE: (memorial_id, ip_hash)
  RLS: enabled — no public SELECT; service role only (backend writes)
  IDX: memorial_id
  Counter cache: memorials.view_count incremented by controller only on INSERT (not conflict)
  Migration: 20260312_engagement.sql

obituary_views
  id(uuid,pk), obituary_id(uuid,fk→obituaries,cascade),
  ip_hash(text,req), created_at(ts)
  UNIQUE: (obituary_id, ip_hash)
  RLS: enabled — no public SELECT; service role only (backend writes)
  IDX: obituary_id
  Counter cache: obituaries.view_count incremented by controller only on INSERT (not conflict)
  Migration: 20260312_engagement.sql

notifications
  id(uuid,pk), user_id(uuid,fk→auth.users,cascade),
  type(notification_type enum: tribute_posted|condolence_posted|memorial_published|obituary_published),
  title(text,req), message(text,req),
  resource_id(uuid,nullable), resource_slug(text,nullable),
  is_read(bool,default:false), read_at(ts,nullable),
  created_at(ts)
  RLS: owner SELECT/UPDATE/DELETE; INSERT via service role (bypasses RLS)
  IDX: user_id; (user_id, is_read)
  Migration: 20260311_create_notifications.sql

service_categories
  id(uuid,pk), name(text,req), description(text),
  slug(text,UNIQUE,req), icon(text), image_cloudinary_public_id(text), image_url(text),
  is_active(bool,default:true), sort_order(int,default:0),
  created_at(ts), updated_at(ts,trigger)
  RLS: public SELECT where is_active=true; admin write via service role
  Migration: 20260313_service_categories_and_org_services.sql

organization_services
  id(uuid,pk), organization_id(uuid,fk→profiles,cascade),
  category_id(uuid,fk→service_categories,RESTRICT),
  name(text,req), description(text), phone(text), email(text), website(text),
  address(text), city(text), country(text),
  is_active(bool,default:true), created_at(ts), updated_at(ts,trigger)
  RLS: public SELECT where is_active=true; org user full CRUD where organization_id=auth.uid()
  Migration: 20260313_service_categories_and_org_services.sql
```

**Migrations applied:**
- `20260101_initial_schema.sql` — all tables above
- `20260303_add_location_to_memorials.sql` — location column on memorials
- `20260304_waitlist_subscribers.sql` — waitlist_subscribers table
- `20260304_create_memorial_additions.sql` — profile_cloudinary_public_id, profile_url, country, state, creator_relationship, quote on memorials
- `20260305_add_cover_gradient.sql` — cover_gradient column on memorials
- `20260309_create_obituaries.sql` — obituaries table with jsonb sections, RLS, indexes
- `20260309_create_tributes_condolences.sql` — tributes + condolences tables, RLS, indexes
- `20260311_create_notifications.sql` — notifications table + notification_type enum + RLS
- `20260313_service_categories_and_org_services.sql` — service_categories + organization_services tables, RLS, 14 seeded categories

---

## §Design

### Typography
```ts
// tailwind.config.ts
fontFamily: {
  sans: ['Montserrat', 'sans-serif'],
}
```
Load via Google Fonts in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
```
`font-sans` is the default — applied globally via Tailwind's base styles. No per-component font classes needed.

### Colours
```ts
// tailwind.config.ts
brand: {
  primary:      '#3B5BFF',
  primaryHover: '#2D4AE0',
  primaryLight: '#EEF1FF',
  secondary:    '#1A1A2E',
}
```

### Layout contexts
- **Public** (Landing, Auth, `/memorials`): `<Navbar>` + content + `<Footer>`. No sidebar.
- **App** (all `/dashboard/*` routes): `DashboardLayout` — collapsible push sidebar + top navbar.

### DashboardLayout structure
```
┌─────────────────────────────────────────────┐
│  Top Navbar  h-16  bg-white  border-b        │  ← hamburger | ← Home | MATIEO logo | avatar
├──────────┬──────────────────────────────────┤
│ Sidebar  │                                   │
│ w-16/64  │   <Outlet />                      │
│ border-r │   p-8, overflow-y-auto            │
│  ──────  │                                   │
│ Insights │                                   │
│Memorials │                                   │
│ Obituary │                                   │
│ Services │                                   │
│ ──────── │                                   │
│ 🌙 Dark  │                                   │
└──────────┴──────────────────────────────────┘
```
- Sidebar width: `w-16` (collapsed, icons only) ↔ `w-64` (open, icons + labels). Toggled by hamburger in top navbar. Transition: `transition-[width] duration-300`.
- Icons: always visible, centered in fixed `w-12` span. Labels: `opacity-0`/`opacity-100` transition (no clipping).
- Dark mode toggle: bottom of sidebar. Moon icon → enables dark, Sun → disables. Uses `useThemeStore`.
- Auth guard: `if (!user) return <Navigate to="/signin" replace />` at top of component.

### Auth page layouts
- Sign In: left 45% white (form) / right 55% `bg-neutral-50` (product preview)
- Forgot Password: centered card, full-page white, logo top-center

### Core Tailwind patterns
```tsx
// Primary button
"bg-brand-primary hover:bg-brand-primaryHover text-white font-medium text-sm
 px-6 py-2.5 rounded-lg transition-colors
 disabled:bg-brand-primaryLight disabled:text-brand-primary disabled:cursor-not-allowed"

// Secondary button
"border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700
 font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"

// Input
"w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900
 placeholder:text-neutral-400 focus:outline-none focus:ring-2
 focus:ring-brand-primary focus:border-transparent transition"

// Input with left icon
"w-full border border-neutral-200 rounded-lg pl-9 pr-3 py-2.5 text-sm ..."
// wrap in: <div class="relative"> + <span class="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">

// Card
"bg-white rounded-xl border border-neutral-100 shadow-sm p-6"

// Form section (Create Memorial style)
"bg-white rounded-xl border border-neutral-100 p-6 space-y-4"
// Header: <Icon size={16} className="text-brand-primary" /> + text-sm font-semibold text-neutral-700

// Sidebar nav — active
"flex items-center gap-3 px-3 py-2.5 rounded-lg bg-brand-primary text-white text-sm font-medium"
// Sidebar nav — inactive
"flex items-center gap-3 px-3 py-2.5 rounded-lg text-neutral-500 hover:bg-neutral-50 text-sm font-medium"

// Loading skeleton
"animate-pulse bg-neutral-100 rounded-lg h-10 w-full"

// Empty state
<div class="text-center py-12">
  <Icon class="mx-auto text-neutral-300 mb-3" size={40} />
  <p class="text-neutral-500 text-sm">Label</p>
  <p class="text-neutral-400 text-xs mt-1">Helper text</p>
</div>
```

### Radix UI — decision logic

Ask: *"What is the core interaction pattern?"*

```
Overlays content?
  backdrop present?           → Dialog
  anchored, no backdrop?      → Popover
  hover/focus hint only?      → Tooltip

User picks from a list?
  replaces <select>?          → Select
  button-triggered, floating? → DropdownMenu
  multi-select?               → ContextMenu or Checkbox group
  switches between views?     → Tabs / NavigationMenu

Shows/hides content in place?
  one open at a time?         → Accordion
  independent toggle?         → Collapsible

Binary on/off?
  toggle switch look?         → Switch
  checkbox look?              → Checkbox

Displays a user/entity?
  image + text fallback?      → Avatar

Range value input?            → Slider
Top-level site nav?           → NavigationMenu
```

If unsure → `query-docs("radix-ui [name]")` via Context7 MCP.
If nothing fits → plain HTML + Tailwind + ARIA. Never force a bad primitive.

> Responsive patterns → §Responsive below

### Radix component log
> Add a row every time a new primitive is used in MATIEO for the first time. Never delete rows.

| `ui/` file | Primitive | Package | First used in |
|------------|-----------|---------|--------------|
| Dialog.tsx | Dialog | `@radix-ui/react-dialog` | SignInModal (Create Memorial flow) |
| Select.tsx | Select (combobox) | `@radix-ui/react-popover` | Create Memorial (personal info + gallery dropdowns) — inline-searchable; typing filters options in real time |
| DropdownMenu.tsx | DropdownMenu | `@radix-ui/react-dropdown-menu` | Navbar (user menu), LanguageSwitcher |
| LanguageSwitcher.tsx | DropdownMenu (via DropdownMenu.tsx) | — | Navbar + DashboardLayout — locale selection (en/ar/ms/fr/es/hi) |
| AlertDialog.tsx | AlertDialog | `@radix-ui/react-alert-dialog` | MyMemorialsPage (delete draft confirmation) |
| Switch.tsx | Switch | `@radix-ui/react-switch` | — |
| Tabs.tsx | Tabs | `@radix-ui/react-tabs` | — |
| Tooltip.tsx | Tooltip | `@radix-ui/react-tooltip` | — |
| Avatar.tsx | Avatar | `@radix-ui/react-avatar` | Navbar (user avatar) |
| Popover.tsx | Popover | `@radix-ui/react-popover` | DatePicker.tsx (standalone wrapper with Portal) |
| DatePicker.tsx | DatePicker | `react-day-picker` v9 + `date-fns` v4 | CreateMemorialPage (dateOfBirth / dateOfDeath) — YYYY-MM-DD string; `disableFuture` prop disables future days; custom `CalendarSelect` for fully-themed month/year dropdowns |
| EmojiPickerButton.tsx | Custom popover (no Radix) | `emoji-picker-react` | PublicMemorialPage (tribute input), PublicObituaryPage (condolence input) — `onEmojiSelect(emoji: string)` appends emoji to parent text state; closes on outside click |
| Badge.tsx | Pure HTML span (no Radix) | — | AdminOverviewPage, AdminUsersPage, AdminMemorialsPage, AdminObituariesPage — variants: default, success, warning, info, danger |

### Dark mode patterns
- Toggle: `darkMode: 'class'` in `tailwind.config.ts`. Class `dark` on `<html>` element.
- All components with dark variants prefix bg/text/border with `dark:`.
- Standard dark surface tokens:
  ```
  Page bg:       bg-neutral-50   dark:bg-neutral-950
  Card/panel bg: bg-white        dark:bg-neutral-900
  Border:        border-neutral-100  dark:border-neutral-800
  Body text:     text-neutral-900    dark:text-neutral-100
  Muted text:    text-neutral-500    dark:text-neutral-400
  Very muted:    text-neutral-400    dark:text-neutral-600
  Icon muted:    text-neutral-300    dark:text-neutral-700
  Hover bg:      hover:bg-neutral-50 dark:hover:bg-neutral-800
  ```
- Never write `dark:` variants without the corresponding light variant on the same element.

---

## §Responsive

### Breakpoints (Tailwind defaults)

| Prefix | Min-width | Target device |
|--------|-----------|---------------|
| _(none)_ | 0 | Mobile (320px+) |
| `sm:` | 640px | Large mobile / small tablet |
| `md:` | 768px | Tablet portrait |
| `lg:` | 1024px | Tablet landscape / small desktop |
| `xl:` | 1280px | Desktop |

### Mandatory padding — all pages & sections
```tsx
// Outer section container
"max-w-6xl mx-auto px-4 md:px-8"

// Auth full-width panels
"px-6 sm:px-10 md:px-16"   // split-panel form side (Sign In, Sign Up)
"px-4 sm:px-8"             // centered card pages (Forgot/Reset Password)
```

### Typography scaling — section headings
```tsx
// Large heading (h1 hero / h2 section)
"text-3xl sm:text-4xl lg:text-5xl"  // hero
"text-2xl sm:text-3xl lg:text-4xl"  // section h2

// Body / description — no scaling needed (text-lg reads fine at all widths)
```

### Grid patterns by column count
```tsx
// 2-column form grids (names, emails, passwords)
"grid grid-cols-1 sm:grid-cols-2 gap-3"

// 3-column feature/testimonial grids
"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"

// 3-column how-it-works / tutorial
"grid grid-cols-1 md:grid-cols-3 gap-8"

// 4-column stat cards
"grid grid-cols-2 lg:grid-cols-4 gap-6"
```

### Horizontal button/action rows
```tsx
// Button group that should stack on mobile
"flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"

// Inline trust signals / badges that wrap
"flex flex-wrap items-center justify-center gap-4 md:gap-8"
```

### Mobile nav pattern (Navbar)
- Hamburger `<button>` visible only at `< md` (`md:hidden`)
- Desktop `<nav>` links hidden at `< md` (`hidden md:flex`)
- Mobile panel: `id="mobile-nav"`, conditionally rendered, `md:hidden`
- Clicking a link in mobile panel sets `isMenuOpen(false)` to auto-close
- Hamburger `aria-label` toggles: "Open menu" / "Close menu"
- `aria-expanded` reflects open state for screen readers

### Checklist for every new page
```
[ ] All section containers: px-4 md:px-8
[ ] All h2 section headings: text-2xl sm:text-3xl lg:text-4xl
[ ] All multi-column grids: responsive breakpoints (see patterns above)
[ ] All horizontal button rows: flex-col sm:flex-row on mobile
[ ] No fixed widths (w-56, w-[340px]) without mobile override (w-full sm:w-56)
[ ] Footer still stacks correctly (test with new page content below it)
```

---

## §ML

**Architecture:** Node API proxies all ML requests to Python FastAPI service via internal Render URL. `mlClient.ts` enforces 10s timeout + graceful fallback on every call. ML service never called directly from frontend.

**Communication:** `POST/GET https://matieo-ml.onrender.com/{endpoint}` with `X-ML-Secret` header. Node API validates user JWT before proxying.

**Model storage:** Render persistent disk `/models/`. Format: `.pkl` (sklearn), `.pt` (PyTorch).

**Adding a new ML feature:**
```
1. Pydantic schema → ml-service/src/models/schemas.py
2. Service logic  → ml-service/src/services/
3. Router         → ml-service/src/routers/
4. TS types       → backend/src/types/ml.types.ts
5. Proxy method   → backend/src/lib/mlClient.ts (with timeout + fallback)
6. Node route     → expose if frontend needs it
7. Update roadmap below
```

**Feature roadmap:**

| Feature | Status | Node route | ML route |
|---------|--------|-----------|---------|
| Mortality trend prediction | Planned | `POST /api/insights/predict` | `POST /predictions/trend` |
| Cause-of-death clustering | Planned | `GET /api/insights/clusters` | `GET /clustering/causes` |
| Biography NLP | Planned | `POST /api/memorials/:id/analyze` | `POST /nlp/analyze` |

---

## §Environments

### Full environment map

| | Local | Dev (hosted) | Prod (hosted) |
|--|-------|-------------|---------------|
| **Frontend** | localhost:5173 | dev.matieo.com (Hostinger) | matieo.com (Hostinger) |
| **Node API** | localhost:3001 | matieo-api-dev.onrender.com | — (not yet) |
| **ML Service** | localhost:8000 | matieo-ml-dev.onrender.com | — (not yet) |
| **Supabase** | — | matieo-dev project | matieo-prod project |
| **Cloudinary** | — | matieo/dev/ prefix | matieo/prod/ prefix |
| **Git branch** | feature/* | dev | main |
| **Auto-deploy** | — | push to dev | push to main |

**Active Render services (free tier):**
- `matieo-api-dev` → dev Node API, branch: dev, auto-deploys on push to dev
- `matieo-ml-dev` → dev ML service, branch: dev, auto-deploys on push to dev
- Render auto-wires internal URL between the two services

**Commented out in render.yaml (uncomment when going to prod):**
- `matieo-api` → prod Node API, switch to free → starter when real users hit cold starts
- `matieo-ml` → prod ML service, requires starter plan + persistent disk

---

### GitHub Secrets required

| Secret | Used by |
|--------|---------|
| `DEV_SUPABASE_URL` | Frontend CI dev build, test-pr.yml |
| `DEV_SUPABASE_ANON_KEY` | Frontend CI dev build |
| `PROD_SUPABASE_URL` | Frontend CI prod build |
| `PROD_SUPABASE_ANON_KEY` | Frontend CI prod build |
| `CLOUDINARY_CLOUD_NAME` | Frontend CI (both envs) |
| `DEV_CLOUDINARY_UPLOAD_PRESET` | Frontend CI dev build |
| `PROD_CLOUDINARY_UPLOAD_PRESET` | Frontend CI prod build |
| `HOSTINGER_FTP_HOST` | GHA frontend deploy |
| `HOSTINGER_FTP_USER_DEV` | GHA dev deploy |
| `HOSTINGER_FTP_PASSWORD_DEV` | GHA dev deploy |
| `HOSTINGER_FTP_USER_PROD` | GHA prod deploy |
| `HOSTINGER_FTP_PASSWORD_PROD` | GHA prod deploy |

> Render env vars (Supabase service role key, Cloudinary API secret, ML secrets) are set directly in the Render dashboard — never in GitHub Secrets.

---

### 1. Supabase setup
1. Create two projects: `matieo-dev` and `matieo-prod`
2. Apply `supabase/migrations/` to dev first → verify → apply to prod
3. Get Personal Access Token at supabase.com/dashboard/account/tokens → paste into `.env.mcp`

---

### 2. Cloudinary setup
1. Create two unsigned upload presets: `matieo-dev-unsigned`, `matieo-prod-unsigned`
2. Set folder restriction on each: `matieo/dev/` and `matieo/prod/`
3. API Key + Secret → Render dashboard only, never GitHub Secrets or frontend

---

### 3. Render setup — 2 services via Blueprint (free tier)

Defined in `render.yaml`. Currently 2 active services on free tier.

**Active services:**

| Service | Branch | URL |
|---------|--------|-----|
| `matieo-api` | main | matieo-api.onrender.com |
| `matieo-api-dev` | dev | matieo-api-dev.onrender.com |

**ML services** are commented out in `render.yaml` — uncomment and upgrade to `plan: starter` when ML features are ready to build.

**Free tier limitations:**
- Services spin down after 15 min of inactivity — ~30-60s cold start on next request
- 750 free hours/month shared across both services
- No persistent disk (fine until ML features are built)

**When to upgrade:** Change `plan: free` → `plan: starter` in `render.yaml` for `matieo-api` when real users are hitting cold starts. Keep `matieo-api-dev` on free forever.

**One-time setup:**
1. Render dashboard → **New → Blueprint** → connect GitHub repo
2. Render detects `render.yaml` and creates all 4 services:

| Service | Branch | URL |
|---------|--------|-----|
| `matieo-api` | main | matieo-api.onrender.com |
| `matieo-ml` | main | matieo-ml.onrender.com |
| `matieo-api-dev` | dev | matieo-api-dev.onrender.com |
| `matieo-ml-dev` | dev | matieo-ml-dev.onrender.com |

3. For each service set `sync: false` env vars in Render dashboard → Environment:

**`matieo-api` (prod):**
| Var | Value |
|-----|-------|
| `SUPABASE_URL` | Prod Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Prod service role key |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | `https://matieo.com` |
| `ML_SERVICE_SECRET` | Run: `openssl rand -hex 32` — save this value |

**`matieo-ml` (prod):**
| Var | Value |
|-----|-------|
| `SUPABASE_URL` | Prod Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Prod service role key |
| `NODE_API_SECRET` | Same value as `matieo-api` ML_SERVICE_SECRET |

**`matieo-api-dev` (dev):**
| Var | Value |
|-----|-------|
| `SUPABASE_URL` | Dev Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev service role key |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | `https://dev.matieo.com` |
| `ML_SERVICE_SECRET` | Generate a separate secret for dev |

**`matieo-ml-dev` (dev):**
| Var | Value |
|-----|-------|
| `SUPABASE_URL` | Dev Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev service role key |
| `NODE_API_SECRET` | Same value as `matieo-api-dev` ML_SERVICE_SECRET |

**Auto-configured by Render — no action needed:**
- `ML_SERVICE_URL` in each API service → Render injects internal URL of its paired ML service
- `ALLOWED_ORIGINS` in each ML service → Render injects internal URL of its paired API service
- Auto-deploy on every push to `dev` (dev services) and `main` (prod services)
- Health check: Render polls `GET /health` on all 4 — rolls back deploy on failure

---

### 4. Hostinger setup
1. Create subdomain `dev.matieo.com` → point to `/public_html/dev/`
2. Prod `matieo.com` → `/public_html/`
3. Get FTP credentials for each → add to GitHub Secrets

---

### 5. MCP credentials
```bash
cp .env.mcp.example .env.mcp
# Fill in:
SUPABASE_ACCESS_TOKEN   # supabase.com/dashboard/account/tokens
GITHUB_PAT              # GitHub → Settings → Developer Settings → PAT (scopes: repo, workflow)
FIGMA_ACCESS_TOKEN      # Figma → Account Settings → Personal Access Tokens
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

**Claude Desktop:** Replace `~/Library/Application Support/Claude/claude_desktop_config.json` with `claude_desktop_config.json` from repo root → restart Claude Desktop.
**Claude Code:** Run `claude` from repo root — `.mcp.json` is auto-detected.
**Claude.ai:** Connect Supabase, Figma, Cloudinary, Context7 from the Tools menu.

---

## §Pages

> One entry per built page. Status tracked here.
> Full specs in `docs/pages/{name}.md` — load only when working on that page.

| Page | Route | Status | Spec file |
|------|-------|--------|-----------|
| Landing | `/` | ✅ Complete | docs/pages/landing.md |
| Features | `/features` | ✅ Complete | docs/pages/features.md |
| About | `/about` | ✅ Complete | docs/pages/about.md |
| Terms of Service | `/terms` | ✅ Complete | docs/pages/terms.md |
| Privacy Policy | `/privacy` | ✅ Complete | docs/pages/privacy.md |
| Cookie Policy | `/cookie-policy` | ✅ Complete | docs/pages/cookie-policy.md |
| Insights (public) | `/insights` | ✅ Complete | docs/pages/insights-public.md |
| Obituaries (public list) | `/obituary` | ✅ Complete | docs/pages/obituaries.md |
| Public Obituary | `/obituary/:slug` | ✅ Complete | docs/pages/obituaries.md | Auth-gated: unauthenticated visitors see blurred teaser + SignInModal gate |
| Services | `/services` | ✅ Complete | docs/pages/services.md | Public funeral services directory; 14 categories, search filter, provider CTA |
| Pricing (public) | `/pricing` | ✅ Complete | docs/pages/pricing.md |
| Sign In | `/signin` | ✅ Complete | docs/pages/auth.md |
| Sign Up | `/signup` | ✅ Complete | docs/pages/auth.md |
| Forgot Password | `/forgot-password` | ✅ Complete | docs/pages/auth.md |
| Reset Password | `/reset-password` | ✅ Complete | docs/pages/auth.md |
| Dashboard Home | `/dashboard` | ✅ Complete | docs/pages/dashboard.md |
| Dashboard Insights | `/dashboard/insights` | ⬜ Placeholder | docs/pages/dashboard.md |
| My Memorials | `/dashboard/memorials` | ✅ Complete | docs/pages/my-memorials.md |
| Create Memorial | `/dashboard/memorials/create` | ✅ Complete | docs/pages/create-memorial.md |
| Memorial Preview | `/dashboard/memorials/preview` | ✅ Complete | docs/pages/create-memorial.md |
| My Obituaries | `/dashboard/obituary` | ✅ Complete | docs/pages/my-obituaries.md |
| Create Obituary | `/dashboard/obituary/create` | ✅ Complete | docs/pages/create-obituary.md |
| Edit Obituary | `/dashboard/obituary/:id/edit` | ✅ Complete | docs/pages/create-obituary.md |
| Obituary Preview | `/dashboard/obituary/preview` | ✅ Complete | docs/pages/create-obituary.md |
| Dashboard Services | `/dashboard/services` | ✅ Complete | docs/pages/dashboard-services.md | Org-users only; CRUD service listings within admin-managed categories |
| View Memorials | `/memorials` | ✅ Complete | docs/pages/view-memorials.md |
| Edit Memorial | `/dashboard/memorials/:id/edit` | ⬜ Not started | docs/pages/create-memorial.md |
| Public Memorial | `/memorial/:slug` | ✅ Complete | docs/pages/public-memorial.md — auth-conditional header: Navbar when logged out, minimal back+avatar when logged in |
| Settings | `/settings` | ⬜ Not started | docs/pages/settings.md |
| Admin Overview | `/admin` | ✅ Complete | docs/pages/admin.md |
| Admin Users | `/admin/users` | ✅ Complete | docs/pages/admin.md |
| Admin Memorials | `/admin/memorials` | ✅ Complete | docs/pages/admin.md |
| Admin Obituaries | `/admin/obituaries` | ✅ Complete | docs/pages/admin.md |
| Admin Tributes | `/admin/tributes` | ✅ Complete | docs/pages/admin.md |
| Admin Condolences | `/admin/condolences` | ✅ Complete | docs/pages/admin.md |
| Admin Waitlist | `/admin/waitlist` | ✅ Complete | docs/pages/admin.md |
| Admin Service Categories | `/admin/service-categories` | ✅ Complete | docs/pages/admin-service-categories.md | Admin CRUD for funeral service categories; image upload via Cloudinary |

**Status key:** ⬜ Not started · 🔄 In progress · ✅ Complete

> When a page is complete, update status here and add `## Status: ✅ Complete` + `> Do not load spec unless editing this page.` to its spec file.

---

## §Patterns

### Authenticated API calls (frontend → Node backend)
Use `apiFetch<T>` from `@/lib/apiClient`. Never inline `fetch()` with a Bearer token.
```ts
import { apiFetch } from '@/lib/apiClient'
const data = await apiFetch<MyResponseType>('/api/some-endpoint')
```
Mock in tests: `vi.mock('@/lib/apiClient', () => ({ apiFetch: vi.fn() }))`

### Search + pagination URL state
Standard pattern for any list page with search:
- Controlled input → local `searchInput` state
- `useEffect` + 300ms `setTimeout` debounce → writes `?q=` to URL (resets `?page=`)
- `useSearchParams()` as the source of truth for `q` and `page`
- Hook receives `{ q, page }` derived from URL params
- `queryKey: ['entity', { q, page }]` — TanStack Query caches per combination
- `placeholderData: (prev) => prev` — keeps previous page visible while next page loads

### Server-side list endpoint pattern
```ts
// Controller: accept ?q=&page=&limit=
const { q = '', page = '1', limit = '12' } = req.query
const pageNum = Math.max(1, parseInt(page))
const limitNum = Math.min(50, parseInt(limit))
const offset = (pageNum - 1) * limitNum

// Authenticated list (own resources):
let query = supabaseAdmin.from('table')
  .select('*', { count: 'exact' })
  .eq('created_by', req.user.id)   // ← only user's own rows
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  .range(offset, offset + limitNum - 1)

// Public list (published resources only — no auth):
let query = supabaseAdmin.from('table')
  .select('*', { count: 'exact' })
  .eq('status', 'published')       // ← only published rows
  .is('deleted_at', null)
  .order('created_at', { ascending: false })
  .range(offset, offset + limitNum - 1)

if (q.trim()) query = query.ilike('search_col', `%${q.trim()}%`)

const { data, error, count } = await query
res.json({ data, total: count ?? 0, page: pageNum, limit: limitNum, error: null })
```

### Frontend type mirroring
Types shared between backend and frontend:
- Backend source of truth: `backend/src/types/{domain}.types.ts`
- Frontend mirror: `frontend/src/types/{domain}.ts`
- No runtime coupling — manually kept in sync when backend types change.

### MemorialCard component
Accepts a full `MemorialRow`. Import from `@/components/memorial/MemorialCard`.
Reuse on any page that lists memorials (dashboard, public gallery, search results).
Shows: cover photo/initials placeholder, name, date range, location (if set), status badge, "View Memorial →" link.

### Auth-gated CTA pattern
Used on any page where an action requires authentication (e.g., "Create Memorial" on landing page, `/memorials` public page).
```tsx
// In page component:
const user = useAuthStore((s) => s.user)
const navigate = useNavigate()
const [signInOpen, setSignInOpen] = useState(false)

const handleAuthAction = () => {
  if (user) {
    navigate('/dashboard/memorials/create')
  } else {
    setSignInOpen(true)
  }
}

// In JSX:
<button onClick={handleAuthAction}>Create Memorial</button>
<SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
```
`SignInModal` lives in `components/auth/SignInModal.tsx`. Import from `@/components/auth/SignInModal`.

### Conditional list controls pattern
On list pages, hide the search input and create button when the list is empty AND no search is active. Show them only when data exists or a search is in progress.
```ts
const showControls = total > 0 || !!q
```
Where `total` is the count from the API and `q` is the current search query from URL params. Prevents confusing empty search UI on a truly empty list.

### DashboardLayout auth guard
`DashboardLayout` handles its own auth check — do not wrap dashboard routes in a separate `PrivateRoute` component. Pattern:
```tsx
if (isLoading) return <LoadingSpinner />
if (!user) return <Navigate to="/signin" replace />
```

---

## §Accessibility

```
1. Semantic HTML — use <button>, <nav>, <main>, <section>, <label> correctly
2. Every input → explicit id + htmlFor on its label (no aria-label shortcuts for forms)
3. Every icon-only button → aria-label describing the action
4. Every image → meaningful alt text (or alt="" if decorative)
5. Radix primitives handle focus trapping and ARIA roles automatically — don't override
6. Tab order must follow visual order — avoid tabIndex > 0
7. Colour contrast — brand.primary #3B5BFF on white passes WCAG AA (verified)
8. Mobile touch targets — minimum 44×44px (h-11 w-11) for all interactive elements
```

---

## §PageBuildOrder

When building a new page, follow this sequence:

```
[ ] Figma MCP  → design context + variables + screenshot
[ ] Context7   → docs for each lib being used
[ ] ref.md     → check §Pages status, §DB schema
[ ] Decisions  → check docs/decisions.md for relevant past decisions
[ ] Supabase   → list_tables(), plan schema changes
[ ] Migration  → write + execute DEV → PROD
[ ] Ref update → schema.sql + CLAUDE.ref.md §DB
[ ] Backend    → route + controller if needed
[ ] Hook       → all data fetching/mutation
[ ] UI         → pixel-accurate, Tailwind + Radix + Montserrat, mobile-first
[ ] Wire       → hook → UI, all 3 states + error handling pattern
[ ] A11y       → semantic HTML, labels, alt text, aria (see §Accessibility)
[ ] Cloudinary → verify preset, wire upload
[ ] Route      → router.tsx entry
[ ] Tests      → hook + page + route — must pass before commit
[ ] E2E        → if critical flow
[ ] Page doc   → docs/pages/{name}.md
[ ] Self-check → full maintenance checklist in CLAUDE.md
[ ] Commit     → git add . → commit → push origin dev (automatic)
```

### SignInModal usage
`<SignInModal open={boolean} onClose={() => void}>` — Radix Dialog wrapping the sign-in form. Closes on successful sign-in (auth state listener triggers re-render). Used wherever an unauthenticated user triggers an auth-required action.