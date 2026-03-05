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

## COMMIT FORMAT

```
feat(scope):  new feature          → feat(memorial): add photo gallery upload
fix(scope):   bug fix              → fix(auth): handle expired token redirect
db(scope):    schema change        → db(memorials): add slug uniqueness index
test(scope):  tests only           → test(useMemorials): add error state coverage
chore(scope): config/deps/tooling  → chore(deps): upgrade tanstack-query to v5.1
refactor:     no behaviour change  → refactor(memorial-form): extract family member hook
docs:         documentation only   → docs(decisions): add Cloudinary over Supabase rationale
```

Scope = affected module: `auth`, `memorial`, `insights`, `ml`, `backend`, `db`, `e2e`, `ci`

---

## ACCESSIBILITY

```
1. Semantic HTML — use <button>, <nav>, <main>, <section>, <label> correctly
2. Every input → explicit id + htmlFor on its label (no aria-label shortcuts for forms)
3. Every icon-only button → aria-label describing the action
4. Every image → meaningful alt text (or alt="" if decorative)
5. Radix primitives handle focus trapping and ARIA roles automatically — don't override
6. Tab order must follow visual order — avoid tabIndex > 0
7. Colour contrast — brand.primary #3B5BFF on white passes WCAG AA (verified)
```

---

## PAGE BUILD ORDER

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
[ ] UI         → pixel-accurate, Tailwind + Radix + Montserrat
[ ] Wire       → hook → UI, all 3 states + error handling pattern
[ ] A11y       → semantic HTML, labels, alt text, aria where needed
[ ] Cloudinary → verify preset, wire upload
[ ] Route      → router.tsx entry
[ ] Tests      → hook + page + route — must pass before commit
[ ] E2E        → if critical flow
[ ] Page doc   → docs/pages/{name}.md
[ ] Self-check → full maintenance checklist above
[ ] Commit     → git add . → commit → push origin dev (automatic)
```

---

## GIT WORKFLOW — AUTOMATIC, NO PROMPTING NEEDED

Claude handles all git operations automatically at the end of every task.

```
NEVER commit to main — dev branch only
NEVER ask the user whether to commit — always commit when task is complete
NEVER leave uncommitted work at the end of a session
```

**Every task follows this exact flow:**
```
1. Check current branch → if not dev, switch to dev
2. Build the feature
3. Run tests → must pass before committing
4. git add .
5. git commit -m "type(scope): description" (follow commit format below)
6. git push origin dev
7. Confirm push succeeded in response to user
```

**Commit message format:**
```
feat(scope):     new page or feature
fix(scope):      bug fix
test(scope):     tests only
db(scope):       schema or migration change
chore(scope):    config, deps, tooling
refactor(scope): no behaviour change
docs:            documentation only
```

**Scope = affected area:** `landing`, `auth`, `memorial`, `insights`, `backend`, `ml`, `db`, `e2e`, `ci`

**Example commit messages:**
```
feat(auth): add Sign In, Sign Up, Forgot Password pages — 47 tests passing
feat(memorial): add Create Memorial page with photo upload — 38 tests passing
db(memorials): add slug index and cause_of_death column
fix(auth): handle expired token redirect to /signin
```

**After every commit Claude must confirm:**
```
✅ Committed to dev: "feat(landing): ..."
✅ Pushed to origin/dev
🚀 Auto-deploy to dev.matieo.com triggered
```

---

## FILE LIFECYCLE — NO MANUAL CLEANUP NEEDED

Claude manages file lifecycle automatically:
- **Completed pages** → Claude adds `## Status: ✅ Complete` + load guard to page spec. File stays, never auto-loaded.
- **Renamed pages** → Claude renames the spec file + updates `§Pages` table in ref.md.
- **Deleted features** → Claude removes the spec file + cleans router.tsx + updates ref.md.
- **Migrations** → Never deleted. Permanent historical record.
- **`__tests__/utils.ts` factories** → Updated in-place when models change.
- **Orphaned docs** → Self-check catches them every task close.

You should never need to manually delete any project file.

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
```

---

> **Stack, design tokens, schema, Radix logic, ML architecture, env setup, error patterns → `docs/CLAUDE.ref.md`**
> **Past architecture decisions → `docs/decisions.md`**
> **Known bugs and limitations → `docs/known-issues.md`**