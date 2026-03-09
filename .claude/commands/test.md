# /test — Run Tests (MATIEO)

Run the MATIEO test suite for: `$ARGUMENTS`

## Behaviour

**No arguments** → run the full frontend Vitest suite:
```
npx vitest run
```
Report: total passing, total failing, any failures with file + test name.

**With a pattern** (e.g. `/test memorial`) → run matching tests only:
```
npx vitest run $ARGUMENTS
```

**With `--watch`** → run in watch mode:
```
npx vitest $ARGUMENTS
```

## After running

- If **all pass**: report `✅ N tests passing` and proceed.
- If **any fail**:
  1. Show the failing test name, file, and error message.
  2. Diagnose the root cause — do NOT retry the same test blindly.
  3. Fix the issue in source or test file.
  4. Re-run until all pass.
  5. Only then proceed to commit.

## Test layers available

| Layer | Command |
|-------|---------|
| Frontend (Vitest + RTL) | `npx vitest run` |
| Backend (Jest + Supertest) | `cd backend && npx jest` |
| ML (pytest) | `cd ml && python -m pytest` |
| E2E (Playwright) | `npx playwright test` |

Default (no layer specified) → frontend.
