# Issue #106 — Requirements (Phase 2)

Numbered acceptance criteria. Each AC maps to at least one test in `Progress.test.tsx` via an `AC-N:` tag (per `lex-issue-driven` Rule 3). Scope bound to the **complete** DoD checklist in #106 / #107.

## Acceptance Criteria

- **AC-1 — Public surface.** `Progress` is exported from `ui_kit/components/progress/index.tsx` and re-exported from `ui_kit/components/index.ts`. Its CVA accessor (`progressFillVariants`) and public types (`ProgressProps`, `ProgressVariant`, `ProgressTone`, `ProgressSize`) are exported.
- **AC-2 — displayName.** `Progress.displayName === "Progress"`.
- **AC-3 — Linear variant (default).** With no `variant`, renders a horizontal track + fill. The fill width reflects `value/max` as a percentage (clamped 0–100).
- **AC-4 — Circular variant.** `variant="circular"` renders an SVG with a background ring + a foreground arc whose `stroke-dasharray` reflects the percentage.
- **AC-5 — Determinate a11y.** Determinate progress exposes `role="progressbar"` with `aria-valuenow` (rounded percentage), `aria-valuemin={0}`, `aria-valuemax={100}` on both linear and circular variants.
- **AC-6 — Indeterminate a11y.** `indeterminate` omits `aria-valuenow` (keeps `role="progressbar"` + min/max), and never renders the numeric `showValue` readout.
- **AC-7 — Clamping.** `value` below 0 clamps to 0%; above `max` clamps to 100%. Custom `max` is honored (e.g. `value=50 max=200` → 25%).
- **AC-8 — Tones (semantic tokens only).** `tone` ∈ {`violet`,`green`,`amber`,`red`} selects the fill color from semantic tokens (`primary`/`success`/`warning`/`danger`). No hardcoded hex/rgb in the component.
- **AC-9 — Sizes.** `size` ∈ {`sm`,`md`,`lg`} changes linear track height and circular diameter/stroke. Default `md`.
- **AC-10 — Label + value readout.** `label` renders an accessible text label associated with the bar; `showValue` renders the rounded percentage; both omitted by default.
- **AC-11 — A11y (jest-axe) light + dark.** `Progress.test.tsx` asserts `toHaveNoViolations()` in `light` AND `dark` for at least: linear determinate (with label), circular determinate, and indeterminate.
- **AC-12 — Behavioral test bar.** `Progress.test.tsx` contains ≥ 20 tests OR ≥ 80% file coverage, using accessible queries (`getByRole`, `getByLabelText`), no mocking of internal collaborators.
- **AC-13 — Storybook light + dark.** `Progress.stories.tsx` covers Default + main variants and renders correctly in light and dark (incl. an explicit dark story).
- **AC-14 — Docs page + previews.** `docs/src/pages/componentes/progress.astro` + `docs/src/previews/progress.tsx` exist and follow the migrated-component structure.
- **AC-15 — MIGRATED set.** `Progress` is added to the `MIGRATED` set in `docs/src/pages/index.astro`.
- **AC-16 — ADR.** `docs/adr/ADR-026-progress-v0.1.0-dod-migration.md` exists with status `accepted`, recording the from-scratch build, reference fidelity, divergences, and token choices.
- **AC-17 — Gate 2 green.** `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` all pass locally.

## Definition of Done (binding — from #106/#107)

Storybook (light+dark) · Playground side-by-side (Fernando's "está bom" — human gate, pending) · Behavioral tests + jest-axe light/dark · Brand alignment (Notion source of truth) · Gate-2 commands green · single atomic Conventional commit · PR closes #106 and #107.

## Out of scope

- Unrelated refactors.
- Token additions beyond what `Progress` strictly needs.
- Marking the Playground "está bom" checkbox (only Fernando), merging, or applying `regenerate-baselines`.
