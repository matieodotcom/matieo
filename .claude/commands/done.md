# /done — Finish a Task (MATIEO)

Close out the current task: `$ARGUMENTS` (optional description override)

## Steps

1. **Run the self-maintenance checklist** (same as `/check`):
   - DB changed? → migrations + schema.sql + ref.md §DB
   - Page added? → router.tsx + page doc + ref.md §Pages
   - Component added? → ref.md §Radix log
   - lib/ file added? → ref.md §Stack entry
   - Architecture decision? → docs/decisions.md
   - Bug found? → docs/known-issues.md
   - Env var added? → .env.*.example

2. **Run full test suite** — `npx vitest run`
   - If any fail: fix them NOW, do not commit broken tests.

3. **Stage all changes** — `git add .`
   - Verify no `.env` files are staged (never commit secrets).

4. **Commit** with correct format:
   - `feat(scope): description — N tests passing`
   - Use `fix`, `db`, `test`, `chore`, `refactor`, or `docs` prefix as appropriate.
   - Scopes: `auth`, `memorial`, `insights`, `ml`, `backend`, `db`, `e2e`, `ci`
   - Include: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

5. **Push to dev** — `git push origin dev`
   - NEVER push to main.

6. **Confirm**:
   ```
   ✅ Committed to dev: "{commit message}"
   ✅ Pushed to origin/dev
   🚀 Auto-deploy triggered
   ```

## Rules
- NEVER commit to main
- NEVER commit with failing tests
- NEVER commit .env files
- Docs update is part of the SAME commit — never a follow-up
