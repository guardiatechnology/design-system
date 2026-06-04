# Phase 1 — Brief: Kanban v0.1.0 DoD migration

- **Issue:** [#102](https://github.com/guardiatechnology/design-system/issues/102) — `feat(kanban): migrate Kanban to v0.1.0 DoD`
- **Plan sub-issue:** [#103](https://github.com/guardiatechnology/design-system/issues/103)
- **Epic:** #13 (catalog v0.1.0)
- **Author / assignee:** @fernandoseguim
- **Type:** Feature (component migration)
- **Label:** `evolvability ♻️`
- **Category:** Data & content

## Why

`Kanban` is part of the canonical 52-component catalog of `@guardia/design-system`
v0.1.0 but ships below the DoD (absent / minimalist baseline). Without this
migration the **Data & content** category stays incomplete. The catalog page
(`docs/src/pages/index.astro` line 655) already lists Kanban but the route does
not resolve because the component is not in the `MIGRATED` Set.

## What

Bring `Kanban` to v0.1.0 DoD as a first-class `@guardia/design-system` component:
columns + optional swimlanes + draggable cards, mirroring the legacy reference
API/visual. Native HTML5 drag-and-drop (no new runtime dependency).

## Reference (source of truth)

- `ux_references/ui_kits/components/Kanban/index.tsx` (~443 loc) — carries the
  native HTML5 DnD handlers (`draggable`, `e.dataTransfer`, `onDragStart` /
  `onDragOver` / `onDrop` / `onDragEnd`).
- `ux_references/ui_kits/components/Kanban/index.css` — `.grd-kb-*` classes;
  source of the visual token contract.
- `ux_references/ui_kits/components/Kanban/Kanban.playground.html` — playground
  baseline for the human visual gate.

## Notion context

Brand source of truth: Notion Branding (Cores / Tipografia / Logomarca / Voz).
In divergence with local `lex-brand-*`, Notion prevails. The local CTA hierarchy
already mirrors Notion (`--primary` = violet light / orange dark) per
`lex-brand-colors` — no token expansion needed for Kanban.

## Unknowns / decisions deferred to Phase 3

- DnD library vs native → **resolved**: native HTML5 (ADR-024), zero new dependency.
- Globals (`window.Icon/Avatar/Badge/Input`) in the reference → replaced with real
  DS imports (`lucide-react`, `Badge`, `Avatar`, `Input`).
- Raw primitive tokens in the reference CSS (`--gray-50`, `--violet-500`) → mapped
  to semantic Tailwind utilities (`bg-muted`, `bg-action`, …).
