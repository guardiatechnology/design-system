# ADR-024 — Migrate Kanban to v0.1.0 DoD (Data & content / draggable board)

- **Status:** accepted
- **Date:** 2026-06-02
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-020 (Stepper — CVA + state-derivation chassis), ADR-021 (TopBar — semantic-token-only, zero expansion), ADR-013 (ConfidenceIndicator — agent confidence tone tokens)
- **Issue:** [#102](https://github.com/guardiatechnology/design-system/issues/102)
- **Plan:** [#103](https://github.com/guardiatechnology/design-system/issues/103)

## Context

`Kanban` is the **draggable board** primitive in the canonical 52-component catalog
of `@guardia/design-system` v0.1.0 (Data & content category). The catalog page
(`docs/src/pages/index.astro` line 655) lists it, but the route does not resolve
because the component is absent from the `MIGRATED` Set and from
`ui_kit/components/`.

The legacy bundle at `ux_references/ui_kits/components/Kanban/` defines the
canonical visual + API contract (~443 loc):

- `columns[]` (fixed structure: id, title, color, optional `onAdd`, `showTotals`,
  `sumValue`/`sumFormat`), `cards[]` (flat list, each with `columnId` + optional
  `laneId`), optional `swimlanes[]` (horizontal groupings).
- **Native HTML5 drag-and-drop**: `draggable` cards + `e.dataTransfer` +
  `onDragStart` / `onDragOver` / `onDrop` / `onDragEnd`, exposing
  `onCardMove(cardId, toColumnId, toLaneId, toIndex)` for both intra-column reorder
  and cross-column move.
- Collapsible columns + collapsible lanes; optional search filter; column totals;
  custom card renderer (`renderCard`); rich card meta (priority, tags, assignee,
  due date + status, monetary value, agent confidence, progress bar, comment /
  attachment counts).

Decisions to crystallize in an ADR rather than dilute into a commit:

- **Drag-and-drop strategy** — native HTML5 vs a DnD library (dnd-kit / react-dnd).
- **Token contract** — the reference CSS uses raw primitives (`--gray-50`,
  `--violet-500`, `--surface`); the DS forbids hardcoded values.
- **Globals** — the reference reads `window.Icon/Avatar/Badge/Input`; the DS must
  compose real primitives.
- **Accessibility** — the reference uses bare `<div onClick>`; the DS DoD requires
  keyboard-reachable, labeled, jest-axe-clean (light + dark) markup.

## Decision

Migrate Kanban to v0.1.0 DoD following the **Stepper / TopBar chassis** (CVA
accessor, semantic tokens only, `cn()` className composition, `axeInThemes`
coverage), adapted for an interactive board:

1. **Native HTML5 drag-and-drop — zero new runtime dependency.** Mirror the legacy
   reference exactly: `draggable` cards, `e.dataTransfer.setData("text/plain", id)`,
   `onDragStart` / `onDragOver` (with `preventDefault` + `dropEffect = "move"`) /
   `onDrop` / `onDragEnd`, and the `onCardMove(cardId, toColumnId, toLaneId,
   toIndex)` callback for reorder + move. **No dnd-kit, no react-dnd, no new
   package.** Rationale: the reference is a complete working DnD model; a DnD library
   would add bundle weight and a runtime dependency for behavior already covered by
   the platform API. This is the cheapest migration on the dependency surface,
   consistent with ADR-021 (TopBar — no expansion). jsdom has no real DnD engine, so
   tests assert the resulting callbacks / state via `fireEvent.dragStart/dragOver/
   drop` with a stubbed `dataTransfer`, never pixel motion.

2. **Component split (`index.tsx` + `inner_components.tsx`).** `index.tsx` owns the
   board layout, lane/column grouping, collapse state, search state, and DnD
   orchestration. `inner_components.tsx` owns the `DefaultCard` renderer and the pure
   helpers (`cardMatches`, `confidenceBucket`, tone maps). Mirrors the `calendar/`
   split precedent. Keeps each file legible.

3. **Globals replaced by real DS imports.** `lucide-react` icons (board-local),
   `Badge` (`variant` + `appearance="soft"`), `Avatar` + `AvatarFallback`, `Input`
   (`leftIcon="search"` via a Search icon). Composition over reimplementation
   (`lex-design-system-library`).

4. **Token contract — semantic only, no expansion.** Raw reference primitives map
   to confirmed semantic Tailwind utilities (`bg-muted`, `bg-card`, `text-fg`,
   `text-fg-muted`, `border-border`, `border-border-strong`, `bg-action`,
   `bg-bg-hover`, `ring-action`, `bg-danger`/`bg-danger-soft`/`text-danger-fg`,
   `bg-warning`/`bg-warning-soft`/`text-warning-fg`, `bg-success-soft`/
   `text-success-fg`, `shadow-xs/sm/md`, `rounded-sm/md/lg`). **No new token is
   introduced.** The Notion-canonical brand palette (violet light / orange dark for
   `--action`) is honored automatically through the theme-aware tokens.

5. **CVA accessor `kanbanColumnVariants`.** Exposes the column surface
   (`isOver` × `collapsed`) for the public-surface test and consumer overrides,
   mirroring `topBarVariants` / `stepperMarkerVariants`.

6. **Accessibility upgrade over the reference (justified divergence).** Columns
   render as labeled `role="region"`; draggable cards render as keyboard-reachable
   `<button>` with `aria-label`; collapse toggles are `<button aria-expanded>`; a
   visually-hidden description (`aria-describedby`) explains the drag interaction.
   The reference's bare `<div onClick>` would fail `lex-frontend-accessibility`
   rule 1 and jest-axe. Tone is never the only signal (priority dots carry
   `aria-label`; due status carries text).

7. **Public type naming.** `KanbanCardData` (reference) is exported as `KanbanCard`
   for naming symmetry with `KanbanColumn` / `KanbanSwimlane`; `raw?: any` becomes
   `raw?: unknown` (`lex-frontend-typing`).

8. **a11y coverage (`axeInThemes`)** over 4 states × 2 themes = **8 invocations
   minimum** in `Kanban.test.tsx`: Default board, board mid-drag, swimlanes board,
   empty board. Light + dark always.

9. **Single atomic commit, ADR `accepted` at first commit.** Code + tests + stories
   + docs + ADR ship together. No `proposed → accepted` two-step (per the post-PR
   retrospective in ADR-014 clause 10 / ADR-021 clause 10).

## Consequences

**Positive.**
- Data & content category advances toward completion; the catalog route
  `/componentes/kanban/` resolves.
- Zero new runtime dependency; bundle unaffected.
- Board is keyboard-reachable and jest-axe-clean in both themes — a strict upgrade
  over the legacy reference.
- DnD behavior (reorder + cross-column + cross-lane move) preserved 1:1 with the
  reference contract via `onCardMove`.

**Negative / trade-offs.**
- Native HTML5 DnD has no built-in keyboard reordering. Full keyboard-driven card
  movement is explicitly out of scope (it would be a separate capability); cards are
  still focusable, labeled, and clickable. Documented in `02-requirements.md`
  "Out of scope".
- Native DnD is not testable for pixel motion in jsdom; tests assert callbacks /
  state with a stubbed `dataTransfer`. This is the standard approach and does not
  reduce behavioral coverage of the move/reorder contract.

**Neutral.**
- The visual fidelity vs the playground remains subject to the human visual gate
  (Fernando) before merge — that DoD item stays open at PR time by design.
