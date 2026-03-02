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

<!-- New entries added below by Claude as decisions are made during development -->
