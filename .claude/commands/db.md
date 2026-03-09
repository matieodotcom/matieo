# /db — Database Migration Workflow (MATIEO)

Run the full MATIEO database migration workflow for: `$ARGUMENTS`

## Steps (execute in order — no shortcuts)

1. **Audit existing tables** — call `mcp__supabase__list_tables()` before writing anything.

2. **Decide: extend existing or create new?**
   - Rule: extend existing tables whenever possible.
   - Only create a new table if the data is fundamentally a new entity.

3. **Write the migration file**:
   - Path: `supabase/migrations/YYYYMMDD_{description}.sql` (use today's date)
   - Include: `CREATE TABLE` or `ALTER TABLE`, all columns, constraints, indexes.
   - **Always add RLS + policies** — no exceptions:
     ```sql
     ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
     CREATE POLICY "..." ON {table} FOR SELECT USING (...);
     ```

4. **Apply to DEV** — call `mcp__supabase__execute_sql()` with the migration SQL.

5. **Verify** — query the table to confirm columns, RLS, and policies are correct.

6. **Update `supabase/schema.sql`** — keep the canonical schema file in sync.

7. **Update `docs/CLAUDE.ref.md §DB`** — add/update the table entry with columns and relationships.

8. **Generate updated TypeScript types** — call `mcp__supabase__generate_typescript_types()` and update `frontend/src/types/database.types.ts`.

9. **Write / update tests** for any hooks or routes that touch the changed table.

10. **Run tests** — `npx vitest run` — all must pass.

11. **Commit** — `git add . → commit (db(scope): description — N tests passing) → git push origin dev`

## Rules
- NEVER apply to PROD without DEV verification first
- NEVER skip RLS — every new table needs policies
- NEVER store images in Supabase — Cloudinary only
- NEVER expose SUPABASE_SERVICE_ROLE_KEY in frontend
