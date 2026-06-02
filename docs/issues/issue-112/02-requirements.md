# Issue #112 — Requirements / Acceptance Criteria (Phase 2)

Numbered ACs derived from the **complete DoD checklist** in #112 + Plan #113.
Each AC maps to at least one test in `Tree.test.tsx` via the `AC-N:` convention
(`lex-issue-driven` Rule 3).

## Public surface

- **AC-1:** `Tree` is exported from `ui_kit/components/tree/index.tsx` and re-exported
  from the barrel `ui_kit/components/index.ts`. `Tree.displayName === "Tree"`.
- **AC-2:** Public types `TreeNode`, `TreeProps`, `TreeMode`, `TreeSize`,
  `TreeSelectionState` are exported. The CVA recipe `treeRowVariants` is exported as a
  public accessor and callable with no args (defaults `none`/`md`).

## Structure & ARIA (APG Tree View)

- **AC-3:** The root renders `<ul role="tree">`; each node renders `<li role="treeitem">`;
  children render inside `<ul role="group">`. Parent items carry `aria-expanded`
  (`true`/`false`); leaves omit `aria-expanded`.
- **AC-4:** Selected items carry `aria-selected="true"`. In `multi`, a parent with all
  descendant leaves selected is `aria-selected="true"`; partial is reflected via
  `aria-checked="mixed"` on its checkbox indicator.
- **AC-5:** Roving tabindex — exactly one treeitem is tabbable (`tabIndex=0`) at a time;
  all others are `tabIndex=-1`. The active item is the selected one, else the first.

## Modes & sizes

- **AC-6:** `mode="single"` (default) selects a single node; clicking another node moves
  selection. `mode="none"` disables selection (navigation/expand only).
- **AC-7:** `mode="multi"` renders tri-state checkboxes; toggling a parent toggles all
  descendant leaves; parent state (`all`/`partial`/`none`) is auto-derived from leaves.
- **AC-8:** `size="md"` (default) and `size="sm"` change row height/indent/spacing.

## Expand / collapse (controlled + uncontrolled)

- **AC-9:** Uncontrolled: nodes flagged `defaultExpanded` start expanded; `defaultExpanded`
  prop array seeds initial expansion. Clicking the caret toggles expansion.
- **AC-10:** Controlled: passing `expanded` makes expansion controlled; `onExpandedChange`
  fires with the next id array on every toggle.
- **AC-11:** Controlled selection: passing `selected` makes selection controlled;
  `onSelectedChange` fires with the next id array. Uncontrolled uses `defaultSelected`.

## Keyboard navigation (APG — required divergence, ADR-028)

- **AC-12:** `ArrowDown` moves focus to the next visible treeitem; `ArrowUp` to the previous
  visible treeitem (skipping collapsed subtrees).
- **AC-13:** `ArrowRight` on a collapsed parent expands it; on an expanded parent moves focus
  to its first child. `ArrowLeft` on an expanded parent collapses it; on a child/leaf moves
  focus to its parent.
- **AC-14:** `Home` moves focus to the first visible treeitem; `End` to the last visible
  treeitem. `Enter` / `Space` select (or toggle in multi) the focused item.
- **AC-15:** `disabled` nodes are not selectable (click + Enter/Space are no-ops) and render
  with reduced opacity; they remain reachable for navigation but never receive selection.

## Features & content

- **AC-16:** `showLines` (default `true`) draws vertical guide lines on groups; `showLines={false}`
  omits them. Optional `icon` (lucide-shaped) and `meta` (right slot) render when provided.
  `description` renders as muted secondary text.
- **AC-17:** Empty `nodes` with `emptyState` renders the empty state; `onNodeClick` fires with
  the clicked node regardless of mode.

## Tokens, brand & a11y

- **AC-18:** Only semantic tokens are used — no hardcoded hex, no raw `--violet-*`/`--gray-*`
  scale, no reimplemented primitive (`lex-design-system-library`, `lex-brand-colors`).
- **AC-19:** jest-axe `toHaveNoViolations()` passes in **light AND dark** for at least:
  Default (single), expanded multi (tri-state), and a tree with a `disabled` node.

## Stories & docs

- **AC-20:** `Tree.stories.tsx` covers Default + main variants (single/multi/none, sizes,
  showLines, icons+meta, controlled, empty) and renders in light + dark.
- **AC-21:** `docs/src/pages/componentes/tree.astro` + `docs/src/previews/tree.tsx`
  (+ `tree-live.tsx`) follow the stepper/top-bar structure; `tree` added to `MIGRATED`.

## Definition of Done (gate)

`npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build`
green; single atomic signed commit; PR `Closes #112` + `Closes #113`.

## Out of scope

- Unrelated refactors; token additions beyond what `Tree` strictly needs.
- Async/lazy children loading, drag-and-drop reordering, virtualization (not in legacy ref).
- The human playground "está bom" approval (Fernando's visual gate — never agent-approved).
