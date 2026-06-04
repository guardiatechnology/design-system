# Phase 3 — Architecture: Calendar v0.1.0 DoD Migration

- **Issue:** [#92](https://github.com/guardiatechnology/design-system/issues/92) · **Plan:** [#93](https://github.com/guardiatechnology/design-system/issues/93)
- **ADR:** [ADR-022](../../adr/ADR-022-calendar-v0.1.0-dod-migration.md) (status `accepted`)
- **Decision posture:** REBUILD as the events calendar (month / week / agenda) mirroring the legacy reference.

> **Decision reversal (2026-06-04).** A first attempt elevated the existing
> `react-day-picker` **date-grid**. Fernando rejected it at the visual gate:
> Issue #92 requires "espelhar a API/visual da referência", and the reference
> (`ux_references/ui_kits/components/Calendar/`) is an **events calendar**, not
> a date-selection grid. The catalog already covers date selection via
> `DatePicker` (ADR-004). This Phase-3 document and ADR-022 are updated to the
> events-calendar decision; the prior date-grid framing (and the
> `02-requirements.md` "Out of scope: rewriting as events-calendar" clause) is
> **superseded** by this reversal.

## Affected components (scope table)

| Component | Action | DoD AC | Notes |
|---|---|---|---|
| `ui_kit/components/calendar/index.tsx` | **rebuild** | AC-1, AC-6 | Events calendar (React + Tailwind v4 + CVA); month/week/agenda; `events[]`; semantic tokens only; export public types |
| `ui_kit/components/calendar/inner_components.tsx` | **remove** | AC-1 | Radix Select/ScrollArea bundle served only the date-grid; no longer needed |
| `ui_kit/components/calendar/Calendar.test.tsx` | **rewrite** | AC-4, AC-5 | 37 behavioral tests; jest-axe light+dark via `axeInThemes`; clock injected via `today` prop |
| `ui_kit/components/calendar/Calendar.stories.tsx` | **rewrite** | AC-2 | Default + Month + Week + Agenda + WeekNumbers + Empty; no dark-dup story (theme via toggle) |
| `ui_kit/components/index.ts` | unchanged | AC-1 | already `export * from "./calendar"`; new types flow through |
| `docs/src/pages/componentes/calendar.astro` | **rewrite** | AC-3, AC-7 | events-calendar sections; embeds `index.tsx?raw` |
| `docs/src/previews/calendar.tsx` | **rewrite** | AC-7 | month/week/agenda/week-numbers/empty preview rows |
| `docs/src/previews/calendar-live.tsx` | **rewrite** | AC-7 | interactive events-calendar live snippet |
| `docs/src/pages/index.astro` | edit | AC-7 | `"Calendar"` already in `MIGRATED`; revert catalog description to events calendar |
| `docs/adr/ADR-022-calendar-v0.1.0-dod-migration.md` | **rewrite** | AC-1 | events-calendar decision; token mapping; divergences |

No new runtime endpoints/consumers/jobs → `lex-observability-required` Gate-2 Check 3 is N/A (pure presentational UI component). No DB migration → `lex-migrations-reversible` N/A.

## Design decisions

1. **Surface — mirror the reference.** Three views (`month` default, `week`, `agenda`); an `events[]` model (`date`, `endDate` multi-day, `time`, `title`, `tone`, `icon`, `allDay`, `meta`); toolbar (`Hoje` + prev/next + `Mês/Semana/Agenda` switcher + title); event chips with "+N mais" overflow; ISO week numbers; `weekStartsOn` (0/1); tone legend. Props match the reference.

2. **Stack — React + Tailwind v4 + CVA; own date math.** The events calendar is a distinct surface from the date-grid, so it does its own pure, deterministic date math (`startOfWeek`, `getISOWeek`, month-cell generation). `react-day-picker` stays the `DatePicker` engine; Calendar no longer depends on it. `inner_components.tsx` is removed.

3. **Tokens — semantic only, zero hardcoded color.** The legacy CSS used raw vars (`--violet-500`, `--signal-*`, hardcoded hex). Every one maps to a published semantic/brand token via a `TONE_MAP` + `calendarEventVariants` CVA (mapping table in ADR-022). Solid (all-day) foregrounds follow the **Badge-canonical** AA overrides — `text-white` fails AA over orange/green/red/yellow, so those use `text-guardia-gray-900` / `text-guardia-purple-900`.

4. **A11y beyond the reference.** The reference had a `nested-interactive` violation (day cell `role="button"` wrapping event-chip buttons). The rebuild fixes it: the day cell is not a control; the **day number** is the day-click `<button>` and chips are siblings. View switcher is a `role="tablist"`; today is `aria-current="date"`; selected day announces `", selecionado"` + `aria-pressed`; color is never the only signal (time/title/all-day text). jest-axe passes light+dark for month/month-selected/week/agenda.

5. **Determinism.** `today` is an injectable prop (default `new Date()`). Tests, previews, and stories pin Novembro 2025 + a fixed `today` (14 Nov) — no "today" drift, no fake timers needed.

6. **Public surface.** `Calendar` + `calendarEventVariants` + types `CalendarEvent`, `CalendarView`, `CalendarTone`, `CalendarLegendItem`, `CalendarProps`, `CalendarIconComponent`, exported through the barrel.

7. **Icons.** Reference used a global `window.Icon` by string name; rebuild takes a typed `lucide-react`-shaped component (`CalendarIconComponent`) — DS-native, tree-shakeable, typed.

## Reference fidelity & divergences

Mirrored: month (6 rows, out-of-month days, today pill, "+N mais"), week (7 columns + header day numbers), agenda (chronological, grouped, empty message), toolbar, `events[]` (multi-day fan-out + all-day filled pill), ISO week numbers, `weekStartsOn`, legend.

Declared divergences (justified — full rationale in ADR-022):

- **View switcher is interactive** (reference's was a static visual placeholder) — a `role="tablist"` that switches the view. UX/a11y improvement.
- **No `nested-interactive`** — day-number-as-button + sibling chips instead of cell-as-button. Fixes the reference's axe violation.
- **Typed icon components** (`lucide-react` shape) instead of global `window.Icon` strings.
- **Semantic tokens** instead of raw color vars (`lex-brand-colors`).

## Stacked PR Decomposition

**Single PR — checklist not met.** Per `codex-stacked-prs` Decision Checklist: high signals = 0–1 (one cohesive component, ~1 author-day, one reviewer, no independent deploy units); anti-signals present (component + tests + stories + docs + ADR land together as one atomic DoD unit per `lex-small-commits` and Plan #93 "1 Plan = 1 PR"). Single atomic PR (amended onto the existing feat commit on this branch).

## Delegation

None. `warrior-hephaestus` authors the frontend rebuild directly (design-system component migration is an established self-driven practice). No Daedalus/Kronos/Apollo handoff.

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| Calendar duplicates DatePicker's purpose (the rejected attempt) | Calendar is the events/agenda surface; DatePicker stays the date selector — clear separation recorded in ADR-022 |
| Two date-handling paths in the library | Accepted: different surfaces; Calendar's date math is small, pure, unit-tested (97.95% coverage) — not domain knowledge under `lex-dry` |
| `nested-interactive` a11y violation from the reference pattern | Day-number-as-button + sibling chips; jest-axe light+dark gates it |
| Solid all-day chip contrast (`text-white` fails AA over signal fills) | Badge-canonical AA foreground overrides per tone (ADR-003) |
| Build slowness under contention | Commit atomic FIRST, then build; amend fixes |
