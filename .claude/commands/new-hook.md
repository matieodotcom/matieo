# /new-hook — Scaffold a New Hook (MATIEO)

Scaffold a new React hook for: `$ARGUMENTS`

Parse the argument as: `{hookName} [{description}]`
Example: `/new-hook useMemorialStats fetch stats for a single memorial`

## Steps

1. **Determine the file path**: `frontend/src/hooks/use-{kebab-name}.ts`

2. **Determine the pattern** — query hook or mutation hook?
   - Fetches data → TanStack Query `useQuery`
   - Creates/updates/deletes → TanStack Query `useMutation`

3. **Scaffold the hook** following these rules:
   - Import `lib/apiClient.ts` for Node API calls
   - Import `lib/supabase.ts` for direct Supabase reads (authenticated, anon only)
   - TypeScript strict — no `any`, all return types explicit
   - Export a named function: `export function useXxx() { ... }`
   - Return shape: `{ data, isLoading, error, mutate? }`
   - Error handling: catch in hook, return error state — never `console.error` only

4. **Query key convention**:
   ```ts
   queryKey: ['entity-name']           // list
   queryKey: ['entity-name', id]       // single item
   queryKey: ['entity-name', 'action'] // scoped list
   ```

5. **Write the test** at `frontend/src/__tests__/hooks/use-{kebab-name}.test.ts`:
   - Cover: returns data on success, isLoading during fetch, sets error on failure
   - Use `renderHook` + `act` + `waitFor`
   - Mock via `__tests__/setup.ts` patterns

6. **Update `docs/CLAUDE.ref.md §Stack`** — add entry under "Frontend key lib files" (or "hooks" section if it exists).

7. **Run tests** — `npx vitest run hooks/use-{kebab-name}` — must pass.

8. **Do NOT commit** — leave commit for the parent task that uses this hook.

## Rules
- NEVER use `any` in TypeScript
- NEVER fetch in a page component — hook only
- NEVER call `apiFetch` without Bearer token handling (it's built in to `apiClient`)
