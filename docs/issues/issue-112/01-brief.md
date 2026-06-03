# Issue #112 — Brief (Phase 1)

- **Title:** feat(tree): migrate Tree to v0.1.0 DoD
- **Repo:** guardiatechnology/design-system
- **Author:** @fernandoseguim
- **Type:** Tech Task · Label `evolvability ♻️`
- **Plan sub-issue:** [#113](https://github.com/guardiatechnology/design-system/issues/113) (`status: development`)
- **Epic pai:** #13 · Categoria: **Data & content**

## Why

`Tree` is part of the canonical 52-component catalog of `@guardia/design-system` v0.1.0
but sits below DoD (absent from `ui_kit/components/`; appears only as a navigation
placeholder in `docs/src/pages/index.astro` slug `tree`). Without this migration the
v0.1.0 catalog stays incomplete in the **Data & content** category.

## What

Bring `Tree` to v0.1.0 DoD as a first-class component: React + Tailwind v4 + CVA,
semantic tokens only, behavioral tests (≥20 or ≥80% file coverage) with mandatory
jest-axe in light + dark, stories (light + dark), Astro docs page + previews, barrel
export, and the `MIGRATED` set entry.

## Reference (source of truth)

`ux_references/ui_kits/components/Tree/` — `index.tsx`, `index.css`, `Tree.playground.html`.
Legacy is a recursive prop-driven `<ul role="tree">` with:
- `nodes: TreeNode[]` (recursive `children`), `mode: none|single|multi`, `size: sm|md`.
- Controlled **and** uncontrolled expand + select (`expanded`/`onExpandedChange`,
  `selected`/`onSelectedChange`, `defaultExpanded`/`defaultSelected`).
- `showLines` guide lines, optional `icon`, `meta` (right slot), `description`, `disabled`,
  `emptyState`, tri-state checkboxes in `multi` (all/partial/none auto-derived for parents).
- Prefixed CSS classes (`.grd-tr-*`) over a global `(window as any).Icon`.

## Identified divergences (justified in Phase 3 / ADR-028)

1. **Keyboard navigation per ARIA APG Tree View** — the legacy reference has **no**
   keyboard navigation (click-only). The task brief mandates full APG keyboard support
   (roving tabindex; Arrow Up/Down to move; Right to expand/into; Left to collapse/out;
   Home/End; Enter/Space to select). This is a **required additive divergence** — APG
   conformance is a v0.1.0 DoD a11y bar; it does not change the visual or the prop API.
2. **lucide-react icons** instead of `(window as any).Icon` global — the canonical DS
   icon dependency (matches Stepper/TopBar). `node.icon` accepts a `lucide-react`-shaped
   component instead of a string name.
3. **Semantic Tailwind v4 tokens** replace `.grd-tr-*` prefixed CSS + raw `--violet-*`/
   `--gray-*` scale references — zero hardcode (`lex-design-system-library`,
   `lex-brand-colors`).

## Unknowns / risks

- jsdom does not lay out scroll/visual; keyboard nav is asserted via focus + roving
  tabindex + accessible queries (no visual reliance) per `lex-frontend-testing`.
- Visual gate ("está bom") is a human checkpoint (Fernando); the agent never self-approves it.
