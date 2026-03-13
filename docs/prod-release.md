# MATIEO — Production Release Tracker

> Living document. Update status badges as items are completed.
> Last updated: 2026-03-13 | Test count: 765 | Branch: `dev`

---

## Progress Summary

| Section | Done | Total | Progress |
|---------|------|-------|----------|
| 🔴 Blockers | 0 | 3 | ░░░░░░░░░░ 0% |
| 🟡 Important | 0 | 4 | ░░░░░░░░░░ 0% |
| 🟢 Phase 2 | 1 | 6 | ██░░░░░░░░ 17% |
| ✅ Infrastructure | 0 | 7 | ░░░░░░░░░░ 0% |

---

## 🔴 Blockers — Must fix before any prod deploy

| # | Status | Item | Files |
|---|--------|------|-------|
| B1 | ⬜ TODO | **Edit Memorial page** — users cannot edit a memorial after creating it | `frontend/src/pages/app/` · `backend/src/routes/memorials.routes.ts` · `backend/src/controllers/memorials.controller.ts` |
| B2 | ⬜ TODO | **Missing locale keys** — `auth.resetPassword.invalidLink*` keys present in `en` only, missing from 5 other files | `frontend/src/locales/ar/translation.json` · `ms/` · `fr/` · `es/` · `hi/translation.json` |
| B3 | ⬜ TODO | **User Settings page** — no profile editing UI (display name, avatar, password) | `frontend/src/pages/app/settings.tsx` (new) · `frontend/src/router.tsx` |

---

## 🟡 Important — Should be done for a clean v1 launch

| # | Status | Item | Files |
|---|--------|------|-------|
| I1 | ⬜ TODO | **E2E tests** — only 1 Playwright spec; auth flow, create-memorial flow, and dashboard uncovered | `e2e/tests/auth.spec.ts` · `e2e/tests/create-memorial.spec.ts` · `e2e/tests/dashboard.spec.ts` |
| I2 | ⬜ TODO | **React error boundary** — no top-level fallback for render crashes | `frontend/src/components/shared/ErrorBoundary.tsx` (new) · `frontend/src/main.tsx` |
| I3 | ⬜ TODO | **Request logging** — backend only logs to console; no structured observability in prod | `backend/src/middleware/request-logger.ts` (new) or Sentry integration |
| I4 | ⬜ TODO | **Admin locale keys** — admin section strings missing from non-EN locale files | `frontend/src/locales/ar/translation.json` · `ms/` · `fr/` · `es/` · `hi/translation.json` |

---

## 🟢 Phase 2 — Post-launch backlog

| # | Status | Item |
|---|--------|------|
| P1 | ⬜ TODO | **Dashboard Insights page** (`/dashboard/insights`) — mortality data visualisation |
| P2 | ✅ Done | **Dashboard Services page** (`/dashboard/services`) — funeral/related services directory + Admin service categories CRUD (`/admin/service-categories`) |
| P3 | ⬜ TODO | **ML service** — Python FastAPI mortality prediction (model, endpoints, Node proxy) |
| P4 | ⬜ TODO | **Backend lint script** — add ESLint config + CI gate for backend code |
| P5 | ⬜ TODO | **Translation quality pass** — native-speaker review of ar, ms, fr, es, hi locale files |
| P6 | ⬜ TODO | **Sentry / error tracking** — structured error capture with stack traces in production |

---

## ✅ Infrastructure — One-time prod verification checklist

| # | Status | Item |
|---|--------|------|
| V1 | ⬜ TODO | Supabase **prod** project created (separate from dev) and all migrations applied |
| V2 | ⬜ TODO | Render **prod** service deployed and health-check passing |
| V3 | ⬜ TODO | Hostinger domain + SSL certificate active and pointing to Render |
| V4 | ⬜ TODO | Cloudinary **prod** upload preset created and tested |
| V5 | ⬜ TODO | Resend **prod** domain verified + sending email in prod env confirmed |
| V6 | ⬜ TODO | GitHub Actions **prod** workflow (`frontend-prod.yml`) triggered on `main` push and green |
| V7 | ⬜ TODO | All prod env vars set in CI/Render secrets (no `.env` files in repo) |

---

## 📊 Feature Matrix

| Feature | Backend | Frontend | Tests | Locale | Status |
|---------|---------|----------|-------|--------|--------|
| Auth (sign up / sign in / reset) | ✅ | ✅ | ✅ | ✅ | **Done** |
| Create Memorial | ✅ | ✅ | ✅ | ✅ | **Done** |
| **Edit Memorial** | ⬜ | ⬜ | ⬜ | ⬜ | **Blocker B1** |
| Public Memorial page | ✅ | ✅ | ✅ | ✅ | **Done** |
| Public Obituary page | ✅ | ✅ | ✅ | ✅ | **Done** |
| Likes & Views | ✅ | ✅ | ✅ | ✅ | **Done** |
| Share | ✅ | ✅ | ✅ | ✅ | **Done** |
| Dashboard (memorials list) | ✅ | ✅ | ✅ | ✅ | **Done** |
| **User Settings** | ⬜ | ⬜ | ⬜ | ⬜ | **Blocker B3** |
| Admin Panel | ✅ | ✅ | ✅ | 🔶 | **Locale gap I4** |
| Insights page | ⬜ | ⬜ | ⬜ | ⬜ | Phase 2 P1 |
| Services page | ⬜ | ⬜ | ⬜ | ⬜ | Phase 2 P2 |
| ML predictions | ⬜ | ⬜ | ⬜ | ⬜ | Phase 2 P3 |
| E2E coverage | — | — | 🔶 | — | **Important I1** |
| Error boundary | — | ⬜ | ⬜ | — | **Important I2** |

> 🔶 = partial / gap identified

---

## How to update this document

When you complete an item:
1. Change `⬜ TODO` → `✅ Done` (or `🔄 In progress` while working)
2. Update the **Progress Summary** table counts and bar
3. Update the **Feature Matrix** row(s)
4. Update "Last updated" date and test count at the top

This document is part of the self-maintenance protocol in `CLAUDE.md` — update it as part of every task that closes a tracked item.
