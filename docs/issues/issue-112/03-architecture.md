# Issue #112 — Architecture (Phase 3)

## Approach

Build `Tree` v0.1.0 DoD following the **Radix-free CVA recipe** established by
ConfidenceIndicator (ADR-013), Tooltip (ADR-007), and Stepper (ADR-020). There is no
`@radix-ui/react-tree`; the ARIA APG **Tree View** pattern is a `<ul role="tree">` of
`<li role="treeitem">` with `aria-expanded`/`aria-selected`, roving tabindex, and a
keyboard model — all achievable with a plain primitive + `cva` + semantic tokens. Zero
new dependency.

The component **mirrors the legacy reference's prop-driven API and visual** (recursive
`nodes`, `mode`, `size`, controlled/uncontrolled expand+select, `showLines`, `icon`,
`meta`, `description`, tri-state `multi` checkboxes, `emptyState`) and adds the keyboard
layer the legacy reference lacks.

## Affected components (scope table)

| Path | Action | Notes |
|------|--------|-------|
| `ui_kit/components/tree/index.tsx` | create | Component + CVA + types |
| `ui_kit/components/tree/Tree.test.tsx` | create | ≥20 behavioral tests + jest-axe light/dark |
| `ui_kit/components/tree/Tree.stories.tsx` | create | Default + variants, light/dark |
| `ui_kit/components/index.ts` | edit | `export * from "./tree";` |
| `docs/src/pages/componentes/tree.astro` | create | Follows stepper structure |
| `docs/src/previews/tree.tsx` | create | Static preview rows |
| `docs/src/previews/tree-live.tsx` | create | react-live interactive snippet |
| `docs/src/pages/index.astro` | edit | Add `"Tree"` to `MIGRATED` set |
| `docs/adr/ADR-028-tree-v0.1.0-dod-migration.md` | create | status `accepted` |
| `docs/issues/issue-112/{01..06}-*.md` | create | Flow artifacts |

No token additions; no changes to other components (`lex-issue-driven` Rule 6, no scope creep).

## Token mapping (legacy `.grd-tr-*` → semantic Tailwind v4)

| Legacy | Semantic |
|--------|----------|
| `--gray-50` row hover | `hover:bg-muted` |
| `--violet-50` / `--violet-700` selected row | `bg-primary/10` / `text-primary` |
| `--violet-100` selected hover | `hover:bg-primary/15` |
| `--violet-600` checkbox/icon fill | `bg-primary` / `border-primary` / `text-primary` |
| `--gray-100` caret hover | `hover:bg-muted` |
| `--gray-200` guide line | `bg-border` |
| `--border-strong` checkbox border | `border-border-strong` |
| `--surface` / `--card` checkbox bg | `bg-card` |
| `--fg` / `--fg-muted` text | `text-fg` / `text-fg-muted` |
| `--radius-sm` / `--radius-xs` | `rounded-sm` / `rounded-[3px]` |

Selection chain follows the same `--primary` (violet light / orange dark) contract used by
Stepper (ADR-020) and the Notion-canonical CTA token — verified ≥ 4.5:1 in both themes.

## Design decisions (recorded in ADR-028)

1. **Base primitive — none (Radix-free).** APG Tree View is a plain `<ul>`/`<li>` ARIA
   pattern; no Radix equivalent exists. Build the primitive.
2. **API prop-driven (mirror legacy).** Recursive `nodes` array, not `<Tree.Item>`
   composition — preserves cognitive parity with the playground; tree nodes are homogeneous.
3. **Controlled + uncontrolled** for both expansion and selection (mirror legacy exactly).
4. **Selection modes** `none | single | multi`; `multi` derives parent tri-state from leaves.
5. **Keyboard model per APG** (the additive divergence) — roving tabindex + Arrow/Home/End.
6. **Token contract** — `--primary` selection chain, neutral `--border`/`--muted` structure.

## Divergences from the legacy reference (mandatory justification)

| Divergence | Justification |
|------------|---------------|
| **Add full APG keyboard navigation** (roving tabindex, Arrow/Home/End, Right=expand/into, Left=collapse/out, Enter/Space=select) — legacy is click-only | Required by the task brief and the v0.1.0 DoD a11y bar (`lex-frontend-accessibility`, ARIA APG). Additive: does not change the visual or the prop surface. A `treeitem` keyboard model is non-negotiable for screen-reader + keyboard users navigating a hierarchical navigator. |
| **`node.icon` is a lucide-react component** (was a `string` resolved via global `(window as any).Icon`) | The DS canonical icon dependency is `lucide-react` (Stepper/TopBar/etc.). A global window lookup is not viable in SSR/Astro and breaks typing. Same shape as `Step.icon` in Stepper. |
| **Semantic Tailwind v4 tokens** replace `.grd-tr-*` CSS + raw `--violet-*`/`--gray-*` scale | `lex-design-system-library` + `lex-brand-colors` forbid hardcoded scale values and reimplemented CSS; semantic tokens give automatic light/dark + WCAG conformance. |
| **`aria-checked="mixed"`** on multi parent checkbox indicator | APG-correct exposure of tri-state to AT; legacy used a purely visual `partial` class with no ARIA. |

## Delegation

None. Single-component frontend migration handled directly within the Issue-Driven flow
(no REST API → no Daedalus; no events → no Kronos; no AWS → no Atlas). The implementation
follows `kata-frontend-implement` conventions inline.

## Stacked PR decomposition

Decision Checklist (`codex-stacked-prs`) evaluated against scope + ACs: single cohesive
component, one file of production code, one atomic commit mandated by #112/#113
(`lex-small-commits`, one Plan = one PR). **0 high signals for decomposition → single PR.**
Routes Phase 7 to `kata-contributing-pr` (single PR).
