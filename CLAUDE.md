# CLAUDE.md — MATIEO

> Read fully before any code, DB, or architecture decision.
> Details on stack, design, schema, environments, ML → `docs/CLAUDE.ref.md` (load only the section needed).

---

## PROJECT
MATIEO — Mortality Insights and Memorial Platform.
Brand: Blue `#3B5BFF`. Two user modes: memorial creation (families) + mortality insights (researchers).

---

## MCP TOOLS — ALWAYS USE FIRST

| Tool | When | Call |
|------|------|------|
| Supabase | Before any DB work | `list_tables()` → then `execute_sql()` |
| Figma | Before any UI work | `get_design_context(url)` + `get_variable_defs(url)` |
| Cloudinary | Before any upload UI | Verify preset exists |
| Context7 | Before any library API | `query-docs("lib-name")` |
| Resend | Before any email work | Use MCP to send/test emails, manage domains/contacts |

---

## TODO LIST — MANDATORY FOR EVERY TASK

At the start of every task, use `TaskCreate` to create a todo list breaking the work into steps.
Update each task to `in_progress` when starting it, `completed` when done.
Never begin implementation without a todo list in place first.

---

## SELF-MAINTENANCE — NON-NEGOTIABLE

Every task is incomplete until affected files are updated.

| Changed | Update |
|---------|--------|
| DB table/column | `supabase/migrations/YYYYMMDD_x.sql` + `supabase/schema.sql` + `docs/CLAUDE.ref.md §DB` |
| Page added | `frontend/src/router.tsx` + `docs/pages/{name}.md` + `docs/CLAUDE.ref.md §Pages` status |
| Page renamed/deleted | Delete or rename its `docs/pages/{name}.md` + update `§Pages` table |
| API route | `docs/pages/{name}.md` |
| UI component (`ui/`) | `docs/CLAUDE.ref.md §Radix log` |
| ML feature | `docs/CLAUDE.ref.md §ML roadmap` |
| Env var | `.env.*.example` |
| Stack/deps | `docs/CLAUDE.ref.md §Stack` + `package.json` / `requirements.txt` |
| New `lib/` file | `docs/CLAUDE.ref.md §Stack` — add entry under "Frontend key lib files" |
| Architecture decision made | `docs/decisions.md` |
| Bug or limitation found | `docs/known-issues.md` |
| **New UI string added anywhere** | **`frontend/src/locales/en/translation.json` (source of truth) + same key in `ar`, `ms`, `fr`, `es`, `hi` translation.json — ALL 6 files every time, no exceptions** |
| **New language added** | **Create `frontend/src/locales/{code}/translation.json` with EVERY existing key fully translated — no English placeholders. Register in `lib/i18n.ts` resources. Add locale type to `localeStore.ts`. Add option to `LanguageSwitcher.tsx`. Add `language.{code}` entry to all existing locale files. Set `dir="rtl"` in `localeStore.ts` if RTL.** |
| **Policy content or date changed** | **`frontend/src/config/policy-versions.ts` — update the date only. No locale files needed.** |

**Self-check before closing any task:**
```
[ ] DB changed?              → migration + schema.sql + ref.md §DB updated
[ ] Page added/renamed?      → router.tsx + page doc + ref.md §Pages updated
[ ] Page doc orphaned?       → deleted or renamed to match
[ ] Component added?         → ref.md §Radix log updated
[ ] lib/ file added?         → ref.md §Stack "Frontend key lib files" entry added
[ ] Package installed?       → ref.md §Stack deps line updated
[ ] Architecture decision?   → docs/decisions.md entry added
[ ] Bug/limitation found?    → docs/known-issues.md entry added
[ ] Feature built?           → tests written and passing
[ ] UI string added?         → key added to ALL 6 locale files (en + ar + ms + fr + es + hi)
[ ] New language added?      → ALL existing keys translated + registered in i18n.ts + localeStore + LanguageSwitcher + language.{code} in every locale file
[ ] Policy date changed?     → update src/config/policy-versions.ts only
[ ] Anything changed?        → relevant .env.example + ref.md updated
[ ] All of the above done?   → commit + push to dev (automatic, no prompting)
```

---

## TESTING — SAME TASK, NEVER DEFERRED

| Layer | Tool | Write tests for |
|-------|------|----------------|
| Frontend | Vitest + RTL | Every hook, page, ui/ component |
| Backend | Jest + Supertest | Every route, middleware, controller |
| ML | pytest | Every endpoint + service |
| E2E | Playwright | Critical flows only (auth, create memorial, dashboard) |

Mocks in `__tests__/setup.ts`. Factories in `__tests__/utils.ts`. Coverage gates enforced in CI.

---

## DB RULES

```
1. list_tables()              → know what exists before touching anything
2. Extend existing > create new
3. Write supabase/migrations/YYYYMMDD_description.sql
4. execute_sql() DEV → verify → execute_sql() PROD
5. Update supabase/schema.sql + docs/CLAUDE.ref.md §DB
6. RLS + policies on every new table — no exceptions
```

---

## UI RULES

```
1. Figma MCP first — never guess layout, spacing, or colour
2. Tailwind only — no inline styles, no CSS modules
3. Font: Montserrat via font-sans (already configured)
4. Radix UI for all interactive primitives — decision logic in ref.md §Radix
5. All data logic in hooks/ — pages and components are pure UI
6. Always: loading skeleton + error state + empty state
7. Supabase client only via lib/supabase.ts — never instantiate inline
8. Every form field needs id + htmlFor pairing — no exceptions
9. Semantic HTML always — div is last resort for interactive elements
10. Mobile-first responsive design — EVERY page and component must work on mobile (≥ 320px), tablet (≥ 768px), and desktop (≥ 1024px)
    - Use Tailwind responsive prefixes: base → sm:640 → md:768 → lg:1024 → xl:1280
    - Padding/spacing: p-4 sm:p-6 lg:p-8 pattern — never hardcode desktop-only padding
    - Overlays/drawers (sidebars, modals): fixed overlay on mobile, inline on desktop (lg:relative lg:inset-auto)
    - Touch targets: minimum 44×44px (h-11 w-11) for all interactive elements on mobile
    - Stacked layout on mobile, side-by-side on md/lg where appropriate
```

---

## ERROR HANDLING

```
API errors    → catch in hook → set error state → display via <ErrorMessage> component
Form errors   → Zod schema → React Hook Form formState.errors → field-level messages
Toast alerts  → success mutations only (create, update, delete confirmations)
              → use toast() from lib/toast.ts (wrapper around chosen library)
              → NEVER toast on validation errors — show inline instead
Network/auth  → 401 → clear auth store → redirect /signin
              → 500 → show generic "Something went wrong" + retry button
ML errors     → Node API returns fallback → UI shows degraded state, not an error
```

For full error patterns and toast API → `docs/CLAUDE.ref.md §ErrorHandling`

---

## NAMING CONVENTIONS

```
Files         → kebab-case: memorial-card.tsx, use-memorials.ts
Components    → PascalCase: MemorialCard, CreateMemorialForm
Hooks         → camelCase + use prefix: useMemorials, useAuth, useInsights
Types         → PascalCase + suffix: MemorialRow, CreateMemorialPayload, ApiResponse<T>
DB tables     → snake_case plural: memorials, family_members
DB columns    → snake_case: full_name, date_of_birth, cloudinary_public_id
Routes (URL)  → kebab-case: /app/memorials, /app/create-memorial
Routes (file) → {name}.routes.ts, {name}.controller.ts
Tests         → same name as file + .test: memorial-card.test.tsx
Constants     → SCREAMING_SNAKE: MAX_PHOTO_COUNT, SLUG_MAX_LENGTH
```

---

## GIT WORKFLOW — AUTOMATIC, NO PROMPTING NEEDED

```
NEVER commit to main — dev branch only
NEVER ask the user whether to commit — always commit when task is complete
NEVER leave uncommitted work at the end of a session
```

Flow: check branch → build → tests pass → `git add .` → commit → `git push origin dev` → confirm.

Commit format: `feat(scope): description — N tests passing`
Scopes: `auth`, `memorial`, `insights`, `ml`, `backend`, `db`, `e2e`, `ci`
Types: `feat` `fix` `db` `test` `chore` `refactor` `docs`

After every push confirm:
```
✅ Committed to dev: "..."   ✅ Pushed to origin/dev   🚀 Auto-deploy triggered
```

---

## HARD RULES

```
NEVER  commit .env files                   → only .env.*.example
NEVER  expose SUPABASE_SERVICE_ROLE_KEY    → backend only
NEVER  skip RLS on new tables              → always + policies
NEVER  store images in Supabase            → Cloudinary only
NEVER  instantiate Supabase inline         → lib/supabase.ts only
NEVER  use `any` in TypeScript             → always type properly
NEVER  let ML failure break core app       → timeout + fallback in mlClient
NEVER  skip tests                          → part of the task
NEVER  toast on validation errors          → inline field errors only
NEVER  use div for interactive elements    → semantic HTML first
NEVER  skip id/htmlFor on form fields      → accessibility non-negotiable
NEVER  finish without updating docs        → self-maintenance checklist
NEVER  leave orphaned docs behind          → rename/delete with the feature
NEVER  navigate to /signin for user-triggered actions → show <SignInModal> instead
       (route guards like DashboardLayout and post-auth redirects are the only valid
        cases for navigate('/signin') or <Navigate to="/signin">)
```

---

> **Stack, design tokens, schema, Radix logic, ML architecture, env setup, error patterns → `docs/CLAUDE.ref.md`**
> **Accessibility rules → `docs/CLAUDE.ref.md §Accessibility`**
> **Page build checklist → `docs/CLAUDE.ref.md §PageBuildOrder`**
> **Past architecture decisions → `docs/decisions.md`**
> **Known bugs and limitations → `docs/known-issues.md`**