# /debug — Debug an Issue (MATIEO)

Diagnose and fix the issue described in: `$ARGUMENTS`

## Process

1. **Reproduce first** — understand exactly when and where the issue occurs before touching any code.

2. **Locate the source**:
   - UI bug → read the page component + relevant hook
   - API error → read the route handler + controller
   - DB issue → run `mcp__supabase__execute_sql()` to inspect data directly
   - Test failure → read the test + the file it's testing side by side

3. **Check known issues** — read `docs/known-issues.md` to see if this is already documented.

4. **Form a hypothesis** — write down the suspected root cause before making changes.

5. **Fix the root cause** — do NOT:
   - Work around the symptom
   - Add `try/catch` that silently swallows errors
   - Use `// @ts-ignore` or cast to `any`
   - Retry the same broken call in a loop

6. **Verify the fix**:
   - Run the specific test: `npx vitest run {pattern}`
   - Run the full suite: `npx vitest run`
   - All must pass.

7. **Document if it's a recurring pattern** — add to `docs/known-issues.md` if others might hit this.

8. **Commit via `/done`**.

## Common MATIEO gotchas

| Symptom | Check |
|---------|-------|
| Supabase returns `null` unexpectedly | RLS policy blocking the read — check policies |
| Photo not uploading | Cloudinary preset name — verify with `VITE_CLOUDINARY_UPLOAD_PRESET` |
| Auth state lost on refresh | `useAuthListener` only in `AuthInitializer`, not in pages |
| Type error on DB row | Run `mcp__supabase__generate_typescript_types()` and update `database.types.ts` |
| Toast firing on validation error | Should be inline — move to `formState.errors` |
| Test mock not applying | Dynamic import needed: `const getModule = () => import('@/hooks/...')` |
