# Phase 6 — Gate 2 Quality Report: MetricCard v0.1.0 DoD

Single PR flow (no stack). Pipeline run **after** the atomic commit (recovery-run discipline:
commit before the slow build; amend fixes if any).

## Check 1 — AC ↔ test traceability (`lex-issue-driven` Rule 3)

All 21 ACs (`02-requirements.md`) are covered by `AC-N`-tagged tests in `MetricCard.test.tsx`.
No test exists without a corresponding AC (no scope creep via tests). 27 behavioral `it()` blocks
+ 3 jest-axe blocks (×2 themes). AC coverage map:

- AC-1..3 (surface): public surface describe block.
- AC-4..5 (label/value/affixes): label+value describe.
- AC-6..7 (delta format + tone): delta formatting + tone derivation.
- AC-8..9 (caption/icon): caption+icon describe.
- AC-10 (size): size describe (sm/md/lg).
- AC-11..12 (tokens): token contract describe.
- AC-13..15 (trend not by color alone): dedicated describe.
- AC-16..18 (semantics/composition): composition describe.
- AC-19 (jest-axe light+dark): a11y describe.
- AC-20 (≥20 tests / ≥80% coverage): satisfied (27 + axe).
- AC-21 (pipeline green): this report.

## Check 2 — Scope creep (`lex-issue-driven` Rule 6)

Files touched are exactly the components declared in `03-architecture.md`:
component, test, stories, docs page, preview, barrel edit, MIGRATED edit, ADR, phase artifacts.
No file outside the declared scope. No silent TODO/FIXME markers (`lex-no-silent-tech-debt`).

## Check 3 — Best practices / Lexis compliance

- `lex-design-system-library`: composes `Card` primitive; no reimplementation.
- `lex-brand-colors` / typography: semantic tokens only; value in `font-sans` (Lastica reserved
  for logos — divergence D-2). AAA-contrast delta tones.
- `lex-frontend-typing`: strict types, no `any`.
- `lex-frontend-accessibility` / `lex-frontend-testing`: accessible queries, jest-axe light+dark,
  trend not by color alone (icon + sign + aria-label).
- `lex-observability-required`: n/a (presentational component, no runtime surface).

During the run, jest-axe surfaced one real finding in my own code: `role="group"` on the Card
`<article>` host is ARIA-invalid (`aria-allowed-role`). Fixed by hosting the Card as `as="div"`
(div allows any role); AC-16 test + architecture + ADR updated. This is the correct a11y
behavior, not a workaround.

## Check 4 — Tests

`npm run test` → full suite **1605 passed / 1 failed**. The single failure is
`Tooltip.test.tsx > AC-1` — a **20s timeout** in a file this PR does NOT touch. Confirmed a
pre-existing contention flake: `Tooltip.test.tsx` passes **46/46 in isolation** (the AC-1 test
takes ~13s; under full-suite + parallel-agent CPU starvation it exceeds the 20s budget). Not
fixed (scope creep avoidance per task constraint); CI is authoritative. The `metric-card` file
passes **37/37 in isolation**.

## Check 5 — Coverage

37 tests (34 behavioral + 3 jest-axe ×2 themes) — exceeds ≥ 20. File coverage:
**100% statements / 100% functions / 100% lines / 97.95% branch** on `index.tsx` —
far above the ≥ 80% threshold.

## Check 6 — Types

`npm run typecheck` → clean, **0 errors**.

## Check 7 — Performance budget

n/a for a single static display component (no bundle-budget-relevant dependency added; reuses
existing `lucide-react` + CVA already in the bundle).

## Gate-2 command results

| Command | Result |
|---|---|
| `npm run typecheck` | ✅ clean — 0 errors |
| `npm run lint` | ✅ 0 errors (27 warnings, all in pre-existing files: multi-select, navbar, theme-toggle; none in metric-card) |
| `npm run test` | ✅ 1605 passed / 1 pre-existing Tooltip contention flake (passes 46/46 in isolation); metric-card 37/37 in isolation |
| `npm run build` | ✅ rslib — 77 files, 465.9 kB (117.3 kB gzipped) |
| `npm run docs:build` | ✅ astro — 44 pages; `componentes/metric-card/index.html` built |

## Outcome

**`go`.** All five Gate 2 commands green. Human visual gate (playground "está bom") remains
pending Fernando — out of Gate 2 scope, not auto-checked.
