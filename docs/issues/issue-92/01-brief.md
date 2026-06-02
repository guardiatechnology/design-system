# Phase 1 — Brief: Calendar v0.1.0 DoD Migration

- **Issue:** [#92](https://github.com/guardiatechnology/design-system/issues/92) — `feat(calendar): migrate Calendar to v0.1.0 DoD`
- **Plan sub-issue:** [#93](https://github.com/guardiatechnology/design-system/issues/93) (status: development)
- **Epic parent:** #13
- **Type:** Tech Task · **Label:** `evolvability ♻️` · **Category:** Data & content
- **Author/Assignee:** @fernandoseguim

## Why

`Calendar` is in the canonical 52-component catalog of `@guardia/design-system` v0.1.0 but sits below DoD. A baseline already exists in `ui_kit/components/calendar/` (tracked on main, built on `react-day-picker` ^9 + `date-fns` ^4). Without this migration, the **Data & content** category remains incomplete.

## What

Bring `Calendar` to v0.1.0 DoD as a first-class component: code + behavioral tests (incl. jest-axe light/dark) + stories (light + dark) + Astro docs page + previews + barrel export + `MIGRATED` set entry, with semantic tokens only, playground approval, and Brand alignment against Notion.

## Decision posture: ELEVATE, not greenfield

`ui_kit/components/calendar/` already exists and is healthy:
- `index.tsx` — `react-day-picker` `DayPicker` wrapper, locale `ptBR`, dropdown-driven month/year navigation (nav chevrons hidden), single + range selection styled via semantic tokens.
- `inner_components.tsx` — bundled Radix-based `Select`, `ScrollArea`, `Button`, `Popover`, `Label`, `Form` primitives consumed by the dropdown.
- `Calendar.stories.tsx` — only a `Default` story (pinned month for deterministic visual snapshots).

The migration **preserves and refines the existing public API** and **adds the missing DoD pieces**, instead of rewriting from scratch.

## Existing baseline gap analysis (vs. DoD)

| DoD item | State on main | Action |
|---|---|---|
| `index.tsx` (semantic tokens only) | Exists; uses semantic tokens already | Audit for hardcoded colors; refine; export `CalendarProps` |
| `Calendar.test.tsx` (≥20 tests / ≥80%; jest-axe light+dark) | **Absent** | **Create** |
| `Calendar.stories.tsx` (Default + variants, light+dark) | Only `Default` | **Extend** (Range, Disabled, MultiMonth, DarkTheme) |
| `docs/.../calendar.astro` + `previews/calendar.tsx` | **Absent** | **Create** |
| Barrel export `Calendar` + `CalendarProps` | `Calendar` exported; `CalendarProps` **not** | Add `export type { CalendarProps }` |
| `MIGRATED` set entry | **Absent** ("Calendar" missing) | **Add** |
| ADR (elevate decision) | **Absent** | **Create ADR-022** (pre-allocated) |

## Legacy visual reference (source of truth for visual parity)

`ux_references/ui_kits/components/Calendar/` (`index.tsx`, `index.css`, `Calendar.playground.html`).

**Material divergence:** the legacy reference is a different concept — a large **events calendar** (month / week / agenda views, toolbar, event chips, legend), built on plain HTML + bespoke `.grd-cal-*` CSS. The existing DS baseline (and DatePicker, per ADR-004) is a **`react-day-picker` date grid** (date selection, no event rendering). The recovery directive is authoritative: keep on `react-day-picker` + `date-fns`, align with `DatePicker` (ADR-004, shared `react-day-picker`). The events-calendar surface is recorded as a divergence in `03-architecture.md` and ADR-022, out of scope for this DoD.

## Knowledge context

- Brand source of truth: [Notion Branding](https://www.notion.so/Branding-34536f91ebd280a69efacbadab3861c6) (Cores, Tipografia, Logomarca, Voz). Local `lex-brand-*` mirror Notion; on divergence Notion prevails.
- Sibling component `DatePicker` (ADR-004) shares `react-day-picker` — alignment target.

## Unknowns / risks

- The legacy events-calendar API (`view`, `events`, `onEventClick`…) is intentionally **not** adopted; documented divergence carries the risk of a future reviewer expecting the events surface. Mitigated by explicit ADR-022 + architecture note.
- Visual parity is judged by Fernando at the playground gate (pending, never auto-checked).
