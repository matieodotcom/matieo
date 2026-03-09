# /build-api — Build a Backend API Route (MATIEO)

Build a new Node.js API route for: `$ARGUMENTS`

Parse argument as: `{METHOD} /api/{path} [{description}]`
Example: `/build-api POST /api/memorials/publish publish a memorial by ID`

## Steps

1. **Read the relevant controller file** if it exists, e.g. `backend/src/memorials/memorials.controller.ts`.

2. **Determine files to touch**:
   - `backend/src/{feature}/{feature}.routes.ts` — register the route
   - `backend/src/{feature}/{feature}.controller.ts` — handler function
   - `backend/src/{feature}/{feature}.service.ts` — business logic (if complex)

3. **Write the handler** following these patterns:
   - Auth middleware applied: `router.use(requireAuth)` at the top of the router
   - Extract `userId` from `req.user.id` (set by auth middleware)
   - Validate input with Zod before touching the DB
   - Return consistent error shape: `{ error: string, code?: string }`
   - HTTP status codes: 400 bad input, 401 unauth, 403 forbidden, 422 validation, 500 server

4. **Use Supabase service-role client** (backend only):
   - Import from `lib/supabaseAdmin.ts` — never use anon key in backend
   - NEVER expose service-role key in frontend

5. **Register the route** in the feature router and ensure it's mounted in `backend/src/app.ts`.

6. **Write tests** at `backend/src/__tests__/{feature}/{route}.test.ts`:
   - Use Jest + Supertest
   - Cover: 200 happy path, 401 unauthenticated, 400/422 bad input, 403 wrong owner

7. **Update `docs/pages/{related-page}.md`** — add the route to the Mutations or Queries table.

8. **Run backend tests** — `cd backend && npx jest {feature}` — must pass.

9. **Do NOT commit** — leave commit for the parent task.

## Rules
- NEVER skip auth middleware on protected routes
- NEVER use anon key on backend — service-role only
- NEVER return raw DB errors to the client — map to safe error messages
- NEVER skip input validation
