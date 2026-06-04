# Phase 2 — Requirements: Calendar v0.1.0 DoD Migration

Acceptance criteria derived from the full DoD checklist in [#92](https://github.com/guardiatechnology/design-system/issues/92) and Plan [#93](https://github.com/guardiatechnology/design-system/issues/93). Gate 1 is bound to this complete set — no narrower scope.

## Acceptance Criteria

- **AC-1 — Component readiness (elevate).** `ui_kit/components/calendar/index.tsx` (+ `inner_components.tsx`) stays on `react-day-picker` ^9 + `date-fns` ^4, exposes a refined public API, and uses **semantic tokens only** (no hardcoded hex/rgb colors). `Calendar` and `CalendarProps` are exported from the component and the barrel.

- **AC-2 — Storybook coverage (light + dark).** `Calendar.stories.tsx` covers `Default` plus the main variants (single selection, range selection, disabled days, multi-month) and renders correctly in **light** and **dark** (an explicit dark story).

- **AC-3 — Playground parity.** Side-by-side comparison against `ux_references/ui_kits/components/Calendar/` is registered for Fernando's review; the `index.tsx?raw` source is embedded in the Astro page. Divergence from the legacy events-calendar concept is justified in `03-architecture.md`. (The "está bom" check stays **pending** — human visual gate.)

- **AC-4 — Behavioral tests.** `Calendar.test.tsx` exercises user behavior — month navigation (dropdown), day selection (single + range), keyboard navigation, disabled days — using accessible queries (`getByRole`, `getByLabelText`) per `lex-frontend-testing`; **≥ 20 tests OR ≥ 80% file coverage**; no mocking of internal collaborators; clock determinism for "today".

- **AC-5 — A11y (jest-axe) light + dark.** `Calendar.test.tsx` runs `axeInThemes` (from `@/test-utils/a11y`) asserting `toHaveNoViolations()` in **light AND dark** for at least: `Default` (single), the main interactive state (a selected day / open month dropdown), and `disabled` days.

- **AC-6 — Brand × Notion.** Colors, typography, and logo follow [Notion Branding](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) (source of truth); on divergence with local `lex-brand-*` / `codex-brand-*`, Notion prevails and the local mirror is updated before approval. Verified via semantic-token audit (cross-checked in `06-quality-report.md`).

- **AC-7 — Docs page + previews.** `docs/src/pages/componentes/calendar.astro` + `docs/src/previews/calendar.tsx` (+ `calendar-live.tsx` if interactive) follow the stepper/top-bar structure; `Calendar` is added to the `MIGRATED` set in `docs/src/pages/index.astro`.

- **AC-8 — Quality gate green.** `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all pass.

- **AC-9 — Atomic commit + PR.** One atomic signed commit `feat(calendar): migrate to v0.1.0 DoD — …` per `lex-small-commits`; PR closes `#92` and `#93` on separate lines; `lex-pr-quality` satisfied (mirror `evolvability ♻️`, one `size/*`, `--assignee @me`, CODEOWNERS reviewer).

## Definition of Done (binding)

All AC-1…AC-9 met, with the single explicit exception that **AC-3's "está bom"** and merge are deferred to Fernando's playground review (the human visual gate). Athena opens the PR ready for review and stops there.

## Out of scope

- Rewriting `Calendar` as the legacy **events-calendar** (month/week/agenda views, event chips, toolbar, legend). That is a separate capability; recorded as a divergence in `03-architecture.md` + ADR-022.
- Token additions beyond what `Calendar` strictly needs.
- Refactoring unrelated primitives in `inner_components.tsx` (e.g., the unused `Form`/`FormField` bundle) — pre-existing baseline, left untouched to avoid scope creep.
- Unrelated test files / pre-existing flakes under contention (CI is authoritative).

## AC ↔ test traceability plan

| AC | Verified by |
|---|---|
| AC-1 | `git diff` on public surface + token audit; barrel export checked at Gate 2 |
| AC-2 | Storybook stories (owned by build); `Calendar.stories.tsx` renders |
| AC-3 | Astro page + embedded source (manual visual gate, pending Fernando) |
| AC-4 | `Calendar.test.tsx` — behavioral tests tagged `AC-4(x)` |
| AC-5 | `Calendar.test.tsx` — `axeInThemes` tests tagged `AC-5(x)` |
| AC-6 | Token audit summarized in `06-quality-report.md` |
| AC-7 | `calendar.astro` + `calendar.tsx` present; `MIGRATED` set updated |
| AC-8 | Gate 2 command results in `06-quality-report.md` |
| AC-9 | Commit + PR metadata |
