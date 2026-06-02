# ADR-022 — Migrate Calendar to v0.1.0 DoD (Events calendar: month/week/agenda)

- **Status:** accepted
- **Date:** 2026-06-04
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-hephaestus` (frontend implementer), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-004 (DatePicker — `react-day-picker` engine + discriminated union by `mode`), ADR-003 (Chip — solid/soft/outline WCAG foreground policy), Badge (`solid` compoundVariants — AA-safe foregrounds over signal fills), ADR-021 (TopBar — DoD migration chassis: atomic commit, ADR accepted at first commit)
- **Issue:** [#92](https://github.com/guardiatechnology/design-system/issues/92)
- **Plan:** [#93](https://github.com/guardiatechnology/design-system/issues/93)
- **Supersedes:** the prior revision of this ADR, which elevated a `react-day-picker` date-grid. That decision was **rejected by Fernando** (visual gate): Issue #92 requires "espelhar a API/visual da referência", and the reference is an events calendar — not a date-selection grid.

## Context

`Calendar` is the **Data & content** component in the canonical 52-component catalog of `@guardia/design-system` v0.1.0. Two distinct calendar surfaces exist in the repo, and they are **not** the same concept:

1. **Date-selection grid** (`DatePicker`, ADR-004) — a `react-day-picker` grid that picks a date / range / multiple in a form input or popover.
2. **Events calendar** (`ux_references/ui_kits/components/Calendar/`) — a large panel surface with `view: month | week | agenda`, an `events[]` model (date, time, title, tone, icon, all-day, multi-day), a prev/next/today toolbar with a view switcher, event chips colored by tone, ISO week numbers, and a tone legend. Built on plain HTML + bespoke `.grd-cal-*` CSS using **raw color vars** (`--violet-500`, `--signal-green`, `--orange-500`, hardcoded hex like `#E8F5EE`) and a global `window.Icon`.

A first attempt shipped Calendar as an elevation of the `react-day-picker` **date-grid** (sharing DatePicker's engine). Fernando rejected it at the visual gate: the catalog already covers date selection via `DatePicker`, and Issue #92's DoD explicitly asks Calendar to mirror the **events-calendar reference**. Keeping Calendar as a second date-grid duplicated `DatePicker`'s purpose and left the catalog without an events/agenda surface.

The decision to crystallize: **rebuild Calendar as the events calendar mirroring the legacy reference**, with the legacy raw-color CSS mapped onto semantic Guardia tokens.

## Decision

**Rebuild `Calendar` as the events calendar (month / week / agenda) that mirrors the legacy reference. Date selection stays in `DatePicker` (ADR-004); Calendar is the events/agenda surface.**

1. **Surface — mirror the reference faithfully.** Three views (`month` default, `week`, `agenda`); an `events[]` model with `date`, `endDate` (multi-day), `time`, `title`, `tone`, `icon`, `allDay`; a toolbar with `Hoje` + prev/next + a `Mês/Semana/Agenda` switcher; event chips inside day cells with "+N mais" overflow; ISO week numbers (`showWeekNumbers`); `weekStartsOn` (0/1); a tone legend. API matches the reference props (`view`, `date`/`defaultDate`, `onDateChange`, `events`, `onEventClick`, `onDayClick`, `selectedDate`, `maxEventsPerDay`, `weekStartsOn`, `showWeekNumbers`, `toolbar`, `title`, `legend`).

2. **Stack — React + Tailwind v4 + CVA; no `react-day-picker` for Calendar.** The events calendar is a distinct surface from the date-grid; it does its own (pure, deterministic) date math. `react-day-picker` stays the `DatePicker` engine. `inner_components.tsx` (the Radix `Select`/`ScrollArea` bundle the date-grid used) is **removed** — it no longer serves the events calendar.

3. **Tokens — semantic only, zero hardcoded color.** The legacy CSS used raw vars; every one maps to a published semantic / brand-scale token (table below). `calendarEventVariants` (CVA) drives the chip/block/all-day pill kinds; a `TONE_MAP` resolves the 7 tones. Solid (all-day) foregrounds follow the **Badge-canonical** AA overrides — `text-white` fails WCAG AA over orange/green/red/yellow, so those use `text-guardia-gray-900` / `text-guardia-purple-900` (see Badge `solid` compoundVariants + ADR-003).

4. **Accessibility beyond the reference.** The reference had a `nested-interactive` flaw — a `<div role="button">` day cell containing `<button>` event chips. The rebuild fixes it: the day cell is **not** a control; the **day number** is the day-click affordance (a real `<button>` when `onDayClick` is set), and event chips are sibling buttons. The view switcher is a `role="tablist"`; today is `aria-current="date"`; the selected day announces `", selecionado"` + `aria-pressed`; color is never the only signal (time/title/all-day text carry meaning). jest-axe passes in **light + dark** for month (with events + legend), month-with-selection, week, and agenda.

5. **Public surface.** `Calendar` + `calendarEventVariants` (CVA accessor) + types `CalendarEvent`, `CalendarView`, `CalendarTone`, `CalendarLegendItem`, `CalendarProps`, `CalendarIconComponent` — exported from the component and the barrel (`export * from "./calendar"`).

6. **Determinism.** `today` is an injectable prop (default `new Date()`) so tests/previews/stories render deterministically against a pinned month (Novembro 2025) — no "today" drift.

7. **DoD additions land atomically.** One commit ships: rebuilt component, `Calendar.test.tsx` (37 behavioral tests + jest-axe light/dark), rewritten stories (Default + Month/Week/Agenda/WeekNumbers/Empty), Astro docs page + previews (+ live), `MIGRATED` Set entry, catalog description. ADR is `accepted` at first commit (per ADR-021 chassis).

### Tone → semantic-token map (replaces the legacy raw vars)

| Legacy tone (raw CSS) | Chip (soft) bg / text | Solid (all-day) bg / text | Left rail / dot |
|---|---|---|---|
| violet (`--violet-*`) | `bg-guardia-purple-100` / `text-guardia-purple-700` | `bg-guardia-purple-500` / `text-white` | `border-l-primary` / `bg-primary` |
| orange (`--orange-*`) | `bg-guardia-orange-100` / `text-guardia-orange-900` | `bg-guardia-orange-500` / `text-guardia-gray-900` | `border-l-guardia-orange-500` |
| blue (`--blue-*`) | `bg-info-soft` / `text-info-fg` | `bg-signal-blue` / `text-white` | `border-l-info` / `bg-info` |
| green (`--signal-green`, `#E8F5EE`) | `bg-success-soft` / `text-success-fg` | `bg-signal-green` / `text-guardia-gray-900` | `border-l-success` |
| red (`--signal-red`, `#FEECEC`) | `bg-danger-soft` / `text-danger-fg` | `bg-signal-red` / `text-guardia-gray-900` | `border-l-danger` |
| yellow (`--signal-yellow`, `#FEF7D6`) | `bg-warning-soft` / `text-warning-fg` | `bg-signal-yellow` / `text-guardia-purple-900` | `border-l-warning` |
| neutral (`--gray-*`) | `bg-muted` / `text-fg` | `bg-guardia-gray-500` / `text-white` | `border-l-border-strong` / `bg-fg-muted` |

All chip text-over-fill pairings use the `*-fg` high-contrast tokens (≥ 4.5:1 AA, AAA on most); solid foregrounds reuse the Badge-proven AA-safe overrides. Orange/yellow consume brand-scale tokens (`guardia-orange-*`, `guardia-yellow-*` via `warning-*`) to keep the 7 tones visually distinct.

## Reference fidelity

| Reference feature | Mirrored | Note |
|---|---|---|
| Month view (6 rows, out-of-month days, today pill, "+N mais") | ✅ | |
| Week view (7 day columns, header day numbers) | ✅ | |
| Agenda view (chronological, grouped by day, empty message) | ✅ | |
| Toolbar (Hoje + prev/next + title) | ✅ | |
| View switcher (Mês/Semana/Agenda) | ✅ | Reference switcher was **non-interactive** (visual only); rebuild makes it a real `tablist` that switches `view` (divergence — improvement). |
| `events[]` model (date, endDate, time, title, tone, icon, allDay, meta) | ✅ | |
| Multi-day fan-out + all-day filled pill | ✅ | |
| ISO week numbers + `weekStartsOn` | ✅ | |
| Tone legend | ✅ | |
| Icons | ✅ | Reference used a global `window.Icon` by string name; rebuild takes a typed `lucide-react`-shaped component (`CalendarIconComponent`) — DS-native, no global. |

### Declared divergences (justified)

- **View switcher is interactive.** The reference switcher was a static visual placeholder (`view` controlled only externally). The rebuild makes it a real `role="tablist"` that switches the view, with `onViewChange` + uncontrolled fallback — an a11y/UX improvement, not a regression.
- **No `nested-interactive`.** Day cells are not controls; the day number is the click affordance and event chips are siblings. Fixes the reference's nested-interactive a11y violation.
- **Icons are typed components, not global strings.** `icon?: CalendarIconComponent` (lucide-react shape) instead of `icon?: string` resolved against `window.Icon`. DS-native, tree-shakeable, typed.
- **Tokens, not raw vars.** Every legacy `--violet-500` / `--signal-*` / hardcoded hex is mapped to a semantic/brand token (table above) per `lex-brand-colors`. Visuals stay equivalent; the chassis is tokenized and theme-aware.

## Consequences

### Positive

- Catalog gains a true events/agenda surface; date selection remains `DatePicker`'s job (clear separation, no duplicated purpose).
- Faithful mirror of the reference's API and visual, with a11y and tokens upgraded to DS standards.
- Self-contained: no `react-day-picker` coupling for Calendar; pure deterministic date math, fully unit-tested (97.95% file coverage, 37 tests).
- Data & content category advances 1 toward 52.

### Negative

- **Two date-handling code paths in the library** (Calendar's own month math + `react-day-picker` in DatePicker). Accepted: they are different surfaces (events grid vs. input selector); sharing an engine forced the wrong abstraction (the rejected attempt). Date math here is small, pure, and unit-tested — not domain knowledge under `lex-dry`.
- **No keyboard roving-grid (arrow-key) navigation between day cells.** The reference had none; day affordances are tab-reachable buttons with Enter/Space. A future ADR may add arrow-key roving if a consumer needs it (YAGNI for this DoD).

### Neutral

- **+0 dependencies.** React, Tailwind v4, CVA, lucide-react already in the bundle. `react-day-picker`/`date-fns` stay for DatePicker.
- **−1 file** (`inner_components.tsx` removed — it served only the date-grid).

## Alternatives considered

1. **Elevate the `react-day-picker` date-grid (prior ADR revision).** Rejected by Fernando at the visual gate — duplicates `DatePicker`, leaves the catalog without an events surface, does not mirror the reference Issue #92 requires.
2. **Mirror the reference but keep its raw color vars / global `window.Icon`.** Rejected — violates `lex-brand-colors` (hardcoded color) and the DS component conventions; not theme-aware.
3. **Keep the reference's `nested-interactive` day-cell-as-button.** Rejected — it is a WCAG `nested-interactive` violation (axe-confirmed); the day-number-as-button pattern is the accessible equivalent.
4. **Add arrow-key roving grid navigation now.** Deferred — not in the reference; tab-reachable button affordances satisfy AA. Future ADR if needed.
5. **Two-step ADR (`proposed` → `accepted`).** Rejected — atomic commit ships code + ADR together; `accepted` at first commit per the ADR-021 chassis.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. Mirror reference surface (views, toolbar, events, legend) | AC-1, AC-3 |
| 2. React + Tailwind + CVA; remove `inner_components.tsx` | AC-1 |
| 3. Tokens only, zero hardcoded color; tone map | AC-1, AC-6 |
| 4. A11y (no nested-interactive, tablist, today/selected announced, jest-axe light/dark) | AC-4, AC-5 |
| 5. Public surface (`CalendarEvent`, `CalendarView`, `CalendarProps`, barrel) | AC-1 |
| 6. Determinism via injectable `today` | AC-4 |
| 7. DoD additions atomic; ADR accepted at first commit | AC-2, AC-4, AC-5, AC-7, AC-8, AC-9 |
