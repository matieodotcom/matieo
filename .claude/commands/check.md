# /check — Self-Maintenance Checklist (MATIEO)

Run the MATIEO self-maintenance checklist against current changes before committing.

## Process

1. Run `git diff --name-only HEAD` to see all changed files.
2. For each changed file, check the relevant items below.
3. Report ✅ or ❌ for each applicable item.
4. Fix any ❌ items before committing.

## Checklist

```
[ ] DB changed?
    → supabase/migrations/YYYYMMDD_x.sql written
    → supabase/schema.sql updated
    → docs/CLAUDE.ref.md §DB updated

[ ] Page added or renamed?
    → frontend/src/router.tsx updated
    → docs/pages/{name}.md created or renamed
    → docs/CLAUDE.ref.md §Pages table updated

[ ] Page doc orphaned?
    → old docs/pages/{name}.md deleted or renamed

[ ] UI component added (ui/ directory)?
    → docs/CLAUDE.ref.md §Radix log updated

[ ] lib/ file added?
    → docs/CLAUDE.ref.md §Stack "Frontend key lib files" entry added

[ ] Package installed?
    → docs/CLAUDE.ref.md §Stack deps line updated

[ ] Architecture decision made?
    → docs/decisions.md entry added

[ ] Bug or limitation found?
    → docs/known-issues.md entry added

[ ] Feature built?
    → Tests written AND passing (npx vitest run)

[ ] Env var added?
    → .env.*.example updated

[ ] All of the above done?
    → git add . → commit → git push origin dev
```

## Output format

List each applicable item with ✅ (done) or ❌ (missing).
For any ❌, fix it immediately then re-run this checklist.
Only report "ready to commit" when all applicable items are ✅.
