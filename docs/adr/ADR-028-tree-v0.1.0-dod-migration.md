# ADR-028 — Migrate Tree to v0.1.0 DoD (Data & content / Hierarchical navigator)

- **Status:** accepted
- **Date:** 2026-06-02
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-007 (Tooltip), ADR-011 (Alert — danger token chain), ADR-013 (ConfidenceIndicator — Radix-free CVA recipe), ADR-020 (Stepper — Radix-free prop-driven primitive), ADR-021 (TopBar)
- **Issue:** [#112](https://github.com/guardiatechnology/design-system/issues/112)
- **Plan:** [#113](https://github.com/guardiatechnology/design-system/issues/113)

## Context

`Tree` is the canonical **hierarchical navigator** in the **Data & content** category of
`@guardia/design-system` v0.1.0. It does not exist in `ui_kit/components/` today — the name
appears in `docs/src/pages/index.astro` only as a navigation placeholder (slug `tree`,
group "Data & content", no corresponding page). The canonical baseline lives in
`ux_references/ui_kits/components/Tree/` as CSS-prefixed (`.grd-tr-*`) over a
`(window as any).Icon` global and, critically, **with no keyboard navigation** (click-only).

Building the v0.1.0 DoD component from scratch (no shadcn/Radix baseline) requires pinning
the following decisions before code:

1. Base primitive — Radix vs own primitive.
2. API model — prop-driven (`nodes` array) vs declarative composition.
3. Selection modes and how ARIA maps to each.
4. Keyboard model (the dimension the legacy reference omits).
5. Token contract for selection/structure.

Guardia use cases (per the legacy header): chart of accounts (1 → 1.1 → 1.1.01), company
structure (holding → branch → unit), nested fiscal categories, Copilot rules. The keyboard
model decided here propagates to every hierarchical navigator in the product.

## Decision

Build `Tree` v0.1.0 DoD following the **ConfidenceIndicator (ADR-013) + Stepper (ADR-020)**
recipe — Radix-free, CVA + semantic tokens — mirroring the legacy prop-driven API/visual and
**adding** the ARIA APG keyboard layer:

1. **Base primitive — none (Radix-free).** There is no `@radix-ui/react-tree`. The APG
   **Tree View** pattern is a `<ul role="tree">` of `<li role="treeitem">` with children in
   `<ul role="group">`, `aria-expanded` on parents, `aria-selected` on items, roving
   tabindex, and a keyboard model. Built with a plain primitive. Zero new dependency.

2. **API prop-driven (mirror legacy):**
   ```tsx
   <Tree
     nodes={[
       { id: "1", label: "Ativo", icon: Folder, defaultExpanded: true, children: [
         { id: "1.1", label: "Circulante", children: [{ id: "1.1.01", label: "Caixa" }] },
       ]},
     ]}
     mode="single" | "multi" | "none"
     size="md" | "sm"
     expanded={[...]} onExpandedChange={...}     // controlled
     selected={[...]} onSelectedChange={...}      // controlled
     defaultExpanded={[...]} defaultSelected={[...]} // uncontrolled
     showLines onNodeClick={...} emptyState={...}
   />
   ```
   Rejects child-composition (`<Tree.Item>`) — legacy is prop-driven; nodes are homogeneous;
   changing the API breaks playground parity with no gain. `TreeNode`/`TreeProps` exported.

3. **Three selection modes:** `none` (navigation/expand only), `single` (default, one node),
   `multi` (tri-state checkboxes; toggling a parent toggles all descendant leaves; parent
   `all`/`partial`/`none` derived from leaves). Controlled and uncontrolled for both
   expansion and selection (exact legacy parity).

4. **Keyboard model per ARIA APG (additive divergence):** roving tabindex (exactly one
   tabbable treeitem); `ArrowDown`/`ArrowUp` move across visible items; `ArrowRight` expands
   a collapsed parent then steps into the first child; `ArrowLeft` collapses an expanded
   parent then steps out to the parent; `Home`/`End` jump to first/last visible; `Enter`/
   `Space` select (or toggle in multi). `disabled` nodes are navigable but never selectable.

5. **Token contract:** selection chain `--primary` (violet light / orange dark, Notion-
   canonical CTA — same as Stepper/ADR-020), structure on neutral `--border`/`--muted`,
   text on `--fg`/`--fg-muted`, checkbox border `--border-strong`. Zero hardcode; automatic
   light/dark; WCAG AA verified in both themes. Multi parent exposes `aria-checked="mixed"`.

## Divergences from the legacy reference

| Divergence | Justification |
|------------|---------------|
| **Full APG keyboard navigation added** (legacy is click-only) | Mandated by #112 brief + v0.1.0 DoD a11y bar (`lex-frontend-accessibility`). Additive — no visual/prop change. |
| **`node.icon` is a `lucide-react` component** (was string via `window.Icon`) | DS canonical icon dependency; window global is SSR-hostile and untyped. Mirrors `Step.icon` (ADR-020). |
| **Semantic Tailwind v4 tokens** (was `.grd-tr-*` + raw `--violet-*`/`--gray-*`) | `lex-design-system-library` + `lex-brand-colors`: no hardcoded scale, no reimplemented CSS. |
| **`aria-checked="mixed"`** on the multi parent checkbox | APG-correct tri-state exposure to AT; legacy was visual-only. |

## Consequences

**Positive:** APG-conformant, keyboard- and screen-reader-accessible hierarchical navigator;
full visual + prop parity with the legacy playground; zero new dependency; automatic
theme + WCAG conformance via semantic tokens; controlled/uncontrolled flexibility.

**Negative / trade-offs:** the keyboard model adds focus-management complexity (roving
tabindex, visible-node traversal) absent from the legacy ref — covered by behavioral tests.
No virtualization — very large trees (10k+ nodes) render eagerly; acceptable for the
chart-of-accounts / company-structure use cases and out of scope for v0.1.0 (no lazy/virtual
support in the legacy ref either).

**Follow-ups (not silent debt — tracked here):** lazy/async children and virtualization are
explicitly out of scope; a future capability Issue would carry them if a high-cardinality use
case emerges.
