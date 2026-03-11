# docs/known-issues.md — MATIEO Known Issues & Limitations

> Claude logs bugs, limitations, and TODOs here as they're discovered during development.
> Check this before building related features — don't duplicate workarounds.
> Resolve entries by fixing the issue and marking ✅, or noting "won't fix" with reason.

---

## How to add an entry

```
## [STATUS] Short title
**Discovered:** YYYY-MM-DD · **Affects:** file or feature
**Description:** What the issue is and when it manifests.
**Workaround:** Current workaround if any.
**Fix:** What the proper fix is (or "won't fix: reason").
```

Status: 🔴 Open · 🟡 Has workaround · ✅ Fixed · ⚪ Won't fix

---

## Setup Issues

*None yet — log issues here as they're discovered during initial setup.*

---

## Frontend

*None yet.*

---

## Backend

*None yet.*

---

## ML Service

*None yet.*

---

## Database / Supabase

## ✅ obituaries.created_by is nullable — silent notification failure
**Discovered:** 2026-03-11 · **Affects:** `condolences.controller.ts`, `obituaries.controller.ts`, any future code that reads `obituary.created_by`
**Description:** `obituaries.created_by` is defined as `uuid REFERENCES auth.users(id) ON DELETE SET NULL` — nullable by design. If the obituary creator's account is deleted, `created_by` becomes null. Code that passes `obituary.created_by` directly to `createNotification({ userId })` would attempt to insert with `user_id = null`, violating the `NOT NULL` constraint on `notifications.user_id` and throwing silently (IIFE swallows the error).
**Workaround:** None needed after fix.
**Fix:** Added `if (!obituary || !obituary.created_by) return` guard before any notification or email call in condolence/obituary controllers. Also added outer `.catch()` on all post-response IIFEs so errors are logged rather than swallowed silently.

---

## Infrastructure / CI

*None yet.*

---

<!-- Claude adds entries here as issues are discovered. Format above. -->
