# Phase 2 — Requirements: Kanban v0.1.0 DoD

Numbered acceptance criteria. Each AC maps to ≥1 test in `Kanban.test.tsx`
via an `AC-{N}:` docstring (per `lex-issue-driven` Rule 3).

## Acceptance Criteria

- **AC-1 — Public surface.** `Kanban` is exported (named + default) from
  `ui_kit/components/kanban`; public types `KanbanColumn`, `KanbanCard`,
  `KanbanSwimlane`, `KanbanTag`, `KanbanProps` are exported; the CVA accessor
  `kanbanColumnVariants` is exported and callable.
- **AC-2 — Columns from data.** Given `columns` + `cards`, the board renders one
  column region per column with its title and a per-column card count.
- **AC-3 — Cards from data.** Each card renders inside its `columnId` column,
  showing title and (when present) description, displayId, tags, value.
- **AC-4 — Swimlanes.** When `swimlanes` is provided, cards group by `laneId` under
  collapsible lane headers; when omitted, all cards fall into a single default lane
  with no lane header.
- **AC-5 — Empty column.** A column with no cards renders its `emptyState` (or the
  default empty copy) and announces emptiness accessibly.
- **AC-6 — Drag start.** `onDragStart` on a card sets the dragging state and writes
  the card id to `dataTransfer` (`text/plain`).
- **AC-7 — Drag over column.** `onDragOver` on a column (while dragging) calls
  `preventDefault`, sets `dropEffect = "move"`, and marks the column as the drop
  target.
- **AC-8 — Drop on column.** `onDrop` on a column calls `onCardMove(cardId,
  toColumnId, toLaneId, toIndex)` with the dragged card and the column's tail index.
- **AC-9 — Drop between cards (reorder).** Dropping on an inter-card drop zone calls
  `onCardMove` with that zone's index (intra-column reorder + cross-column move).
- **AC-10 — Drag end.** `onDragEnd` clears the dragging + drop-target state without
  calling `onCardMove`.
- **AC-11 — Card click.** `onCardClick(card)` fires when a card is activated; click
  is independent of drag.
- **AC-12 — Collapsible column.** Clicking a column header toggles its collapsed
  state; collapsed columns hide their body, totals and add button.
- **AC-13 — Collapsible lane.** Clicking a lane header toggles the lane; respects
  `defaultCollapsed`.
- **AC-14 — Search filter.** When `searchable`, typing in the search field filters
  cards by title / description / displayId / assignee / tag; the header count
  reflects the visible total.
- **AC-15 — Add card.** A column with `onAdd` renders an "add card" affordance that
  invokes the callback.
- **AC-16 — Custom card renderer.** `renderCard(card, { dragging })` replaces the
  default card body entirely.
- **AC-17 — Column totals.** A column with `showTotals` + `sumValue` shows a total
  row formatted by `sumFormat`.
- **AC-18 — Accessible structure.** The board exposes accessible labels: each column
  is a labeled region; each draggable card is a labeled, keyboard-reachable
  `button`; the drag interaction has an accessible description (`aria-describedby`).
- **AC-19 — Semantic tokens only.** No hardcoded hex / oklch / raw `bg-gray-N` /
  `text-red-N` utilities; only semantic tokens (`bg-muted`, `bg-card`, `text-fg`,
  `bg-action`, `bg-danger-soft`, …) and `font-sans`.
- **AC-20 — a11y (jest-axe).** `toHaveNoViolations()` passes in **light AND dark**
  for: Default board, board mid-drag, swimlanes board, and empty board.
- **AC-21 — className composition.** Consumer `className` is appended via `cn()`,
  not replacing the base chain.
- **AC-22 — Priority / confidence / due tone tokens.** Priority dots, agent
  confidence chips and due-date statuses use only semantic tone tokens
  (danger/warning/success families with `-fg` text for AA contrast).

## Definition of Done (from #102 / #103)

- Storybook: Default + main variants, light + dark.
- Behavioral tests: ≥20 tests OR ≥80% file coverage; accessible queries; jest-axe
  light + dark; no mocking internal collaborators.
- Astro page + previews (`kanban.tsx` + `kanban-live.tsx`).
- Export in barrel; `Kanban` in `MIGRATED` set.
- `typecheck && lint && test && build && docs:build` green.
- Single atomic commit; ADR-024 `accepted`.
- Playground "está bom" from Fernando (human visual gate — pending).

## Out of scope

- Unrelated refactors; token additions beyond what Kanban strictly needs.
- Keyboard-driven card reordering beyond native focus + click (the legacy reference
  uses pointer DnD only; full keyboard DnD would be a separate capability).
