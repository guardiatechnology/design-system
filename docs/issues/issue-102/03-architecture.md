# Phase 3 — Architecture: Kanban v0.1.0 DoD

## Affected components (scope table)

| Component | Path | Type |
|---|---|---|
| Kanban component | `ui_kit/components/kanban/index.tsx` | new |
| Card/helpers split | `ui_kit/components/kanban/inner_components.tsx` | new |
| Unit tests | `ui_kit/components/kanban/Kanban.test.tsx` | new |
| Stories | `ui_kit/components/kanban/Kanban.stories.tsx` | new |
| Astro doc page | `docs/src/pages/componentes/kanban.astro` | new |
| Static previews | `docs/src/previews/kanban.tsx` | new |
| Interactive (live) preview | `docs/src/previews/kanban-live.tsx` | new |
| Barrel export | `ui_kit/components/index.ts` | edit (+1 line) |
| Catalog MIGRATED set | `docs/src/pages/index.astro` | edit (+1 line) |
| ADR | `docs/adr/ADR-024-kanban-v0.1.0-dod-migration.md` | new |

No runtime surface (no endpoint/consumer/job) — `lex-observability-required`
does not apply (pure presentational React component, design-system catalog).

## Design decisions

1. **Native HTML5 drag-and-drop (zero new dependency).** Mirror the legacy
   reference exactly: `draggable` cards + `dataTransfer` + `onDragStart` /
   `onDragOver` / `onDrop` / `onDragEnd`. **No dnd-kit, no react-dnd.** Recorded in
   ADR-024. Rationale: the reference already implements a complete, working DnD
   model; adding a DnD library would expand the bundle and the runtime dependency
   surface against `lex-design-system-library`'s "cheapest migration" principle
   (precedent: ADR-021 TopBar — semantic tokens only, no expansion).

2. **Component split.** `index.tsx` holds the `Kanban` board + DnD orchestration;
   `inner_components.tsx` holds the `DefaultCard` renderer + pure helpers
   (`cardMatches`, `confidenceBucket`, tone maps), mirroring the `calendar/`
   precedent. Keeps `index.tsx` focused on board layout + DnD state.

3. **Globals → real DS imports.** The reference reads `window.Icon/Avatar/Badge/
   Input`. The DS replaces these with direct imports: `lucide-react` icons,
   `Badge` (variant + appearance), `Avatar` + `AvatarFallback`, `Input` (leftIcon).
   Composition over reimplementation (`lex-design-system-library`).

4. **Token mapping — semantic only.** Reference raw primitives → semantic Tailwind
   utilities (all confirmed in `ui_kit/styles/index.css` `@theme inline`):

   | Reference | Semantic utility | Notes |
   |---|---|---|
   | `--gray-50` (column bg) | `bg-muted` | theme-aware |
   | `--gray-100/200/300` (dividers/borders) | `border-border` / `border-border-strong` | |
   | `--surface` (card bg) | `bg-card` | |
   | `--fg` / `--fg-muted` | `text-fg` / `text-fg-muted` | |
   | `--violet-50/400/500` (drag-over, fill, drop indicator) | `bg-bg-hover` / `border-action` / `bg-action` / `ring-action` | brand, theme-aware |
   | `--violet-700` (add hover) | `text-action` | |
   | `--signal-red` + `--danger-soft` (prio high) | `bg-danger` + `bg-danger-soft` | |
   | `--signal-yellow` + `--yellow-100` (prio med) | `bg-warning` + `bg-warning-soft` | |
   | `--gray-400` (prio low) | `bg-fg-muted` | |
   | confidence high/mid/low | `bg-success-soft text-success-fg` / `bg-warning-soft text-warning-fg` / `bg-danger-soft text-danger-fg` | `-fg` ensures AA contrast |
   | due danger / warn | `text-danger-fg` / `text-warning-fg` | |
   | `--shadow-xs/sm/md` | `shadow-xs/sm/md` | |
   | `--radius-sm/md/lg` | `rounded-sm/md/lg` | |

5. **CVA accessor.** `kanbanColumnVariants` exposes the column surface (`isOver` ×
   `collapsed`) for the public surface test, mirroring `topBarVariants` /
   `stepperMarkerVariants`.

6. **a11y enrichment over the reference.** The reference uses bare `<div onClick>`
   for cards and headers. The DS upgrades:
   - Each column → `role="region"` + `aria-label` (column title + count).
   - Each card → `<button>` (draggable, keyboard-reachable, `aria-label` = title) so
     `lex-frontend-accessibility` rule 1 (no `<div onClick>`) is satisfied.
   - Lane / column collapse toggles → `<button>` with `aria-expanded`.
   - A visually-hidden `aria-describedby` on each card describes the drag
     interaction ("Arraste para mover entre colunas").
   This is a justified divergence (accessibility upgrade), recorded in ADR-024.

## Divergences from the reference (justified)

| Divergence | Justification |
|---|---|
| `window.*` globals → DS imports | reference is a standalone bundle; DS composes real primitives |
| raw primitive tokens → semantic tokens | `lex-brand-colors` / `lex-design-system-library` forbid hardcoded values |
| `<div onClick>` cards/headers → `<button>` | `lex-frontend-accessibility` rule 1 (semantic HTML, keyboard) |
| added `aria-label` / `role="region"` / `aria-describedby` | a11y DoD (jest-axe light+dark) — not present in reference |
| `KanbanCardData` renamed to public `KanbanCard` (alias kept internally) | public type naming consistency with `KanbanColumn` |
| `raw?: any` dropped from public card type → `raw?: unknown` | `lex-frontend-typing` (no unjustified `any`) |

Visual/behavioral parity (columns, swimlanes, collapse, totals, search, DnD move +
reorder, priority/confidence/progress/due meta, custom renderer) is preserved 1:1.

## Stacked PR Decomposition

**Single PR — checklist not met.** Decision Checklist (`codex-stacked-prs` §2):
high signals = 1 (single cohesive component, one reviewable unit; ~1 file of code +
tests + stories + docs); anti-signals present (atomic component migration, single
Plan = single PR per `lex-agent-planning`, Plan #103 explicitly estimates 1 PR).
→ standard single-PR flow via `kata-contributing-pr`.

## Gate 1 — Scope (self-approved)

Per the recovery directive and established design-system migration practice
(sensible defaults, no relay), Gate 1 is **approved** bound to the COMPLETE DoD
checklist in #102 / #103 — no narrower scope. The human visual gate (playground
"está bom") remains pending and is the only open DoD item at PR time.
