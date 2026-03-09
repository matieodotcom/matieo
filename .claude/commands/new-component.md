# /new-component — Scaffold a New Component (MATIEO)

Scaffold a new React component for: `$ARGUMENTS`

Parse argument as: `{ComponentName} [{description}]`
Example: `/new-component MemorialCard card shown in the public memorial grid`

## Steps

1. **Determine the file path**:
   - Shared/reusable UI primitive → `frontend/src/components/ui/{component-name}.tsx`
   - Feature-specific → `frontend/src/components/{feature}/{component-name}.tsx`
   - Layout element → `frontend/src/components/layout/{component-name}.tsx`

2. **Check Figma** for the component design before writing any UI.

3. **Scaffold the component** following these rules:
   - Props interface: `interface {ComponentName}Props { ... }` — typed strictly, no `any`
   - Pure UI — no data fetching, no hooks calls (other than UI hooks like `useState`)
   - Tailwind only — no inline styles, no CSS modules
   - Mobile-first — works at 320px, 768px, 1024px
   - Touch targets ≥ 44×44px (`h-11 w-11` minimum) for interactive elements
   - Semantic HTML — `button`, `article`, `section`, etc. not `div` for interactive elements
   - Accessible — ARIA labels where needed, proper roles, keyboard navigable

4. **If it uses a Radix primitive** — check `docs/CLAUDE.ref.md §Radix` decision logic first.

5. **Write the test** at `frontend/src/__tests__/components/{component-name}.test.tsx`:
   - Cover: renders with default props, renders variants, interactive behaviour (click/keyboard)
   - Accessibility: check for ARIA roles where relevant

6. **Update `docs/CLAUDE.ref.md §Radix log`** if a new Radix primitive was introduced.

7. **Run tests** — `npx vitest run components/{component-name}` — must pass.

8. **Do NOT commit** — leave commit for the parent task.

## Rules
- NEVER add data logic to a component — props only
- NEVER use inline styles
- NEVER use `any` in TypeScript
- NEVER skip tests
