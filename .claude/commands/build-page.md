# /build-page — Build a New Page (MATIEO)

Build the page described in `$ARGUMENTS` following the full MATIEO page build order.

## Steps (execute in order, do not skip)

1. **Read the page spec** — check `docs/pages/$ARGUMENTS.md` if it exists; if not, create it from `docs/pages/_template.md`.

2. **Read `docs/CLAUDE.ref.md §PageBuildOrder`** — follow the exact build order defined there.

3. **Check Figma** — load the relevant Figma node for this page before writing any UI.

4. **Scaffold the file** at `frontend/src/pages/{scope}/{PageName}Page.tsx`.
   - Pure UI — no data logic in the page component itself.
   - Mobile-first Tailwind only. No inline styles.
   - Loading skeleton + error state + empty state — all three.
   - Semantic HTML. Every form field has `id` + `htmlFor`.

5. **Write hooks** in `frontend/src/hooks/use-{feature}.ts`.
   - All data fetching and mutations live here.
   - Use `lib/apiClient.ts` for Node API calls, `lib/supabase.ts` for direct DB reads.

6. **Register the route** in `frontend/src/router.tsx`.

7. **Write tests** in `frontend/src/__tests__/pages/{page-name}.test.tsx`.
   - Cover: renders correctly, loading state, error state, empty state, happy path interactions.

8. **Update docs** (non-negotiable before commit):
   - `docs/pages/{name}.md` — fill in all sections
   - `docs/CLAUDE.ref.md §Pages` — add row to pages table
   - `docs/CLAUDE.ref.md §Stack` — add any new hooks or lib files

9. **Run tests** — `npx vitest run` — all must pass.

10. **Commit** — `git add . → commit (feat(scope): build {page} page — N tests passing) → git push origin dev`

## Rules
- NEVER commit to main
- NEVER skip tests
- NEVER skip docs updates — same commit as code
