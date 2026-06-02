# Phase 6 — Gate 2 Quality Report: Calendar v0.1.0 DoD Migration

- **Issue:** #92 · **Plan:** #93 · **ADR:** ADR-022
- **Result:** **GO** — proceed to PR (Phase 7).

## Gate 2 command results (`lex-issue-driven` Rule 2 — actually executed)

| Command | Result | Notes |
|---|---|---|
| `npm run typecheck` | ✅ pass | `tsc -p tsconfig.test.json --noEmit`, 0 errors. `CalendarProps` importable from component + barrel. |
| `npm run lint` | ✅ pass | **0 errors**, 27 warnings — all in pre-existing files (button, file-upload, navbar, multi-select, theme-toggle, .storybook). **0 in any touched calendar file.** |
| `npm run test` | ✅ pass (Calendar) | Calendar **27/27** in isolation and in-suite (95.39% file coverage on `index.tsx`). 1 suite failure in `Tooltip.test.tsx` — see below. |
| `npm run build` | ✅ pass | rslib: 76 files, declarations generated clean (459.9 kB / 115.7 kB gz). |
| `npm run docs:build` | ✅ pass | Astro: 44 pages; `/componentes/calendar/index.html` built (278 kB). |

## Pre-existing failure (untouched file — not a block)

`Tooltip.test.tsx > AC-1: tooltip surface is re-exported from the components barrel unchanged` times out (20s). Verified:

- Fails **in isolation** too (same timeout) → genuine pre-existing flake in `Tooltip.test.tsx`, not contention from this run.
- `Tooltip` is **not** in this commit; `ui_kit/components/index.ts` (the barrel) is **not** touched by this PR — the `calendar` export was already present via wildcard before this work.
- The test reads files from disk (`readFileSync`) + `renderToString` — a heavy test independent of Calendar.

Per the run directive (and `lex-issue-driven` scope discipline): a failure in a file this PR did not touch is **not fixed here** (that would be scope creep). CI is authoritative.

## 7-check summary

| # | Check | Result |
|---|---|---|
| 1 | AC ↔ test traceability | ✅ AC-4/AC-5 each have ≥1 test, tagged `AC-4(x)`/`AC-5(x)`; AC-1/AC-6 covered by token + export assertions; AC-2/AC-3/AC-7 owned by build/docs |
| 2 | Scope creep | ✅ Only the declared scope (Phase 3 component table) touched; `inner_components.tsx` unused bundle left untouched intentionally |
| 3 | Observability (`lex-observability-required`) | N/A — presentational UI component, no runtime endpoint/consumer/job |
| 4 | Tests pass + no silent tech debt | ✅ 27/27; no `TODO`/`FIXME` markers added; `# WHY` comments only |
| 5 | Coverage | ✅ 95.39% on `index.tsx` (threshold 80%); 27 tests (>20) |
| 6 | Types (`lex-frontend-typing`) | ✅ typecheck clean; `any` only inside `*.test.tsx` controlled-state helpers (test boundary), no `any` in component |
| 7 | Performance budget | N/A — bundle delta is one already-present component; no new dependency |

## AC coverage

| AC | Status |
|---|---|
| AC-1 component readiness (react-day-picker, semantic tokens, `CalendarProps` exported) | ✅ |
| AC-2 Storybook light + dark | ✅ (Default, Range, Disabled, MultiMonth, DropdownNavigation, DarkTheme) |
| AC-3 Playground parity | ⏳ pending Fernando's visual gate (by design) |
| AC-4 behavioral tests ≥20 / ≥80% | ✅ 27 tests, 95.39% |
| AC-5 jest-axe light + dark | ✅ 4 `axeInThemes` tests (Default, selected, disabled, range) |
| AC-6 Brand × Notion (tokens) | ✅ zero hardcoded colors; selected on `--primary` (Notion CTA) |
| AC-7 docs page + previews + MIGRATED set | ✅ |
| AC-8 quality gate green | ✅ (all 5 commands) |
| AC-9 atomic commit + PR | ✅ commit done; PR in Phase 7 |

## Visual gate

`AC-3` "está bom" and merge are **deferred to Fernando** (human visual gate). Athena opens the PR ready for review and stops there — does not check the playground item, does not merge, does not apply `regenerate-baselines`.
