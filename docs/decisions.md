# docs/decisions.md — MATIEO Architecture Decisions

> Log every significant technical decision here as it's made.
> Claude checks this before making new architectural choices to avoid contradictions.
> Format: date · decision · why · alternatives considered.

---

## How to add an entry

```
## YYYY-MM-DD — Short title

**Decision:** What was decided.
**Why:** The reason — problem being solved or tradeoff being made.
**Alternatives considered:** What else was evaluated and why it was ruled out.
**Consequences:** What this means going forward (constraints it creates).
```

---

## 2026-01-01 — Node.js + TypeScript for main API

**Decision:** Use Node.js + TypeScript (not Python) for the primary backend API.
**Why:** Team is comfortable in JS/TS. Frontend is React/TS — same language reduces context switching. Supabase and Cloudinary SDKs are first-class in JS. Core API is a thin layer (auth, CRUD, signed uploads) — no heavy computation that would favour Python.
**Alternatives considered:** Python FastAPI for everything — ruled out because it would introduce Python for work that doesn't need ML capabilities, and the team's primary strength is JS/TS.
**Consequences:** ML/AI features live in a separate Python service. Node proxies to it. Any server-side computation that needs pandas/numpy/sklearn must go in the ML service, not the Node API.

---

## 2026-01-01 — Python FastAPI as separate ML microservice

**Decision:** Separate Python FastAPI service on Render for all ML/AI features, not embedded in Node API.
**Why:** Python has no peer for ML (scikit-learn, spaCy, HuggingFace). Keeping it separate means ML failures are isolated — core memorial features never break. It can be built and deployed independently when AI features are ready.
**Alternatives considered:** Running Python subprocess from Node — too fragile, hard to scale. Adding ML.js to Node — insufficient library ecosystem for mortality prediction and NLP.
**Consequences:** ML service must never be called directly from frontend. All ML requests go through Node API. `mlClient.ts` must always include timeout + graceful fallback.

---

## 2026-01-01 — Cloudinary for all image storage (not Supabase Storage)

**Decision:** All images (memorial photos, profile avatars, cover photos) stored in Cloudinary.
**Why:** Cloudinary provides on-the-fly image transformations (resize, crop, format conversion) without extra code. Supabase Storage lacks transformation pipeline. For a memorial platform, image quality and responsive delivery matter significantly.
**Alternatives considered:** Supabase Storage — simpler setup but no transforms. S3 — more control but more infrastructure to manage.
**Consequences:** Always store both `cloudinary_public_id` (for transforms) and `cloudinary_url` (for direct display). Frontend uses unsigned presets. Backend uses signed uploads for sensitive operations. Never store images directly in Supabase.

---

## 2026-01-01 — Supabase for auth + DB (not custom auth)

**Decision:** Use Supabase Auth + PostgreSQL with RLS for all authentication and data access control.
**Why:** Supabase Auth handles JWT issuance, session management, OAuth providers (Google), and password reset out of the box. RLS enforces data access rules at the DB level — even if API has a bug, users can't access other users' data.
**Alternatives considered:** Custom JWT auth with bcrypt — too much to maintain. Auth0 — additional vendor, cost, and integration complexity.
**Consequences:** RLS must be enabled on every table. Service role key lives in backend only — never frontend. Frontend uses anon key. All backend DB operations use service role via `lib/supabaseAdmin.ts`.

---

## 2026-01-01 — Vitest (not Jest) for frontend testing

**Decision:** Use Vitest for frontend unit/component tests.
**Why:** Vitest is native to Vite — same config, same transform pipeline, significantly faster than Jest for a Vite project. Shares the same `describe`/`it`/`expect` API so there's no learning curve.
**Alternatives considered:** Jest with jsdom — works but requires additional Vite transform config and runs slower.
**Consequences:** Backend stays on Jest (Node environment, no Vite). Frontend and backend have different test runners but identical assertion APIs.

---

## 2026-03-02 — useAuthListener pattern (singleton auth initializer in App.tsx)

**Decision:** Auth state initialization lives in a dedicated `AuthInitializer` component rendered once inside `QueryClientProvider` in `App.tsx`, not inside the router or any page.
**Why:** `onAuthStateChange` must subscribe exactly once for the lifetime of the app. Putting it in a page or hook that renders multiple times risks duplicate subscriptions. A null-returning component at the `App` level guarantees a single subscription regardless of routing.
**Alternatives considered:** Initializing in `router.tsx` loader — requires React Router v6.4+ data router and adds complexity. Putting it in `authStore` — stores should not have side effects (Zustand convention).
**Consequences:** `useAuthListener` must only be called from `AuthInitializer`. All other components read auth state via `useAuthStore` selectors. The `isLoading: true` default in `authStore` ensures UI waits for session before rendering auth-dependent content.

## 2026-03-03 — Server-side search + pagination for memorials list

**Decision:** Search and pagination on `GET /api/memorials` are handled server-side using Supabase `ilike` + `.range()`, returning `{ data, total, page, limit }`.
**Why:** Client-side filtering would require fetching all rows upfront, exposing the full dataset to the browser and not scaling as the memorial count grows. Server-side keeps payloads small and search fast regardless of table size.
**Alternatives considered:** Client-side filter on a full fetch — rejected (scale + exposure). Full-text search with `to_tsvector` — considered but overkill for a simple name search; `ilike` is sufficient and requires no extra DB config.
**Consequences:** All future list endpoints that need search should follow this pattern: accept `?q=&page=&limit=` query params, use `ilike` for text search, use `.range()` + `count: 'exact'` for pagination, return `total`/`page`/`limit` in response alongside `data`.

---

## 2026-03-03 — `apiClient.ts` as the standard frontend→backend bridge

**Decision:** All frontend calls to the Node API go through `lib/apiClient.ts` (`apiFetch<T>`), never via raw `fetch()` with inline Bearer tokens.
**Why:** The helper centralises JWT retrieval (from Supabase session), Authorization header attachment, 401 handling (sign out + redirect to /signin), and error normalisation. Without it, each call site would duplicate this logic and risk inconsistency.
**Alternatives considered:** Axios interceptors — heavier dependency. Supabase client directly (bypassing Node API) — breaks the BE requirement and bypasses backend business logic.
**Consequences:** Any new authenticated API call in the frontend must import `apiFetch` from `@/lib/apiClient`. Never call `fetch()` directly with a Bearer token. The helper must be mocked in all frontend tests that call the backend.

---

## 2026-03-03 — Memorials list is public; route is `/memorials` not `/app/memorials`

**Decision:** The memorials listing page at `/memorials` is publicly accessible (no login required). The backend `GET /api/memorials` calls `listPublished()` which returns only `status = 'published'` memorials. The "Create Memorial" button is conditionally rendered only for authenticated users.
**Why:** Memorial pages are about honoring and sharing loved ones — they should be discoverable by anyone without forcing an account wall. A logged-in user who wants to create a memorial can still do so via the visible Create button.
**Alternatives considered:** Keeping the auth gate and redirecting to sign-in — rejected because it prevents public browsing and sharing. Showing all memorials (including drafts) publicly — rejected for privacy; only published memorials are shown.
**Consequences:** `GET /api/memorials` no longer requires a Bearer token. The authenticated `list()` controller (returns own memorials) is still present for future use in a dashboard view. Any future list endpoint that should be public should follow the `listPublished()` pattern: filter by `status = 'published'`, no `created_by` filter, no `requireAuth` on the route.

<!-- New entries added below by Claude as decisions are made during development -->

## 2026-03-10 — i18next for multi-language support (en/ar/ms/fr/es)

**Decision:** Use `i18next` + `react-i18next` + `i18next-browser-languagedetector` for internationalisation. 5 supported locales: English (default), Arabic (RTL), Malay, French, Spanish. Locale stored in `localStorage` via a Zustand `localeStore`. No URL prefix changes (`/en/`, `/ar/`). Only `dir`/`lang` on `<html>` changes for RTL.
**Why:** i18next is the most mature i18n library for React with a huge ecosystem. Flat JSON locale files (`locales/*/translation.json`) are human-readable and easy for translators. localStorage persistence avoids round-trips and works offline. URL-prefix-free design keeps React Router flat and avoids refactoring all links.
**Alternatives considered:** `react-intl` (FormatJS) — heavier, ICU message format requires more ceremony. URL-based locale switching — would require updating every `<Link>` and `navigate()` call across 22 pages. `Lingui` — excellent but less ecosystem support than i18next.
**Consequences:**
- Every new UI string MUST be added to all existing locale JSON files simultaneously (`en` as source of truth, others as English placeholders until translated).
- Adding a new language requires: creating `locales/{code}/translation.json` with EVERY existing key fully translated (no English placeholders allowed for a new locale), registering it in `lib/i18n.ts`, adding the type to `localeStore.ts`, adding the option to `LanguageSwitcher.tsx`, adding a `language.{code}` label to every existing locale file, and setting `dir='rtl'` in `localeStore.ts` if the language is RTL.
- Non-English translations for existing locales are filled in Phase 3 (dedicated translation pass).
- Arabic triggers `dir="rtl"` on `<html>` — components must use Tailwind `rtl:` variants for directional layouts.
- Legal pages (Terms, Privacy) keep prose in English by design — only headings/labels are translated (legal text requires jurisdictional review before translation).

## 2026-03-05 — Backend owns Cloudinary cleanup on memorial hard-delete

**Decision:** When a draft memorial is permanently deleted, the backend (`permanentDelete` controller) fetches all Cloudinary public_ids (cover, profile, gallery photos), calls `cloudinary.uploader.destroy()` in parallel with `Promise.allSettled`, then hard-deletes the DB row regardless of Cloudinary results.
**Why:** Cloudinary cleanup is best-effort — a failed destroy would orphan a file but should never block the user from deleting their memorial. Centralizing cleanup in the backend prevents the frontend from needing Cloudinary credentials and ensures it happens even if called from non-browser clients. `Promise.allSettled` guarantees all destroys are attempted, and failures are logged server-side.
**Alternatives considered:** Frontend calls Cloudinary destroy before calling the delete API — rejected because it exposes API credentials and creates race conditions. Queuing cleanup in a background job — overkill for current scale.
**Consequences:** `DELETE /api/memorials/:id/permanent` is the only way to hard-delete a draft. Soft-delete (`DELETE /:id`) remains for other use cases. Only `status = 'draft'` memorials can be permanently deleted — published memorials return 403.
