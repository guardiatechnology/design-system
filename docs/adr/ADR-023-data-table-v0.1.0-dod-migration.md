# ADR-023 — Migrate DataTable to v0.1.0 DoD (Data & content)

- **Status:** accepted
- **Date:** 2026-06-02
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-020 (Stepper — composite catalog migration chassis), ADR-021 (TopBar — most recent slotted-primitive migration), ADR-004 (DatePicker — discriminated-union API discipline)
- **Issue:** [#100](https://github.com/guardiatechnology/design-system/issues/100)
- **Plan:** [#101](https://github.com/guardiatechnology/design-system/issues/101)

## Context

`DataTable` is the flagship component of the **Data & content** category in the canonical 52-component catalog of `@guardia/design-system` v0.1.0. The repository ships two relevant pieces today:

1. `ui_kit/components/table/` — the low-level composable primitive (shadcn-style `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`). Structure only, no behavior.
2. `ux_references/ui_kits/components/DataTable/` — the legacy reference (`index.tsx` + `index.css` + `DataTable.playground.html`) that defines the canonical visual + API contract: sortable headers (asc/desc/none cycle), per-row selection + select-all, three densities, custom cell render, alignment, sticky header, empty state.

The legacy reference manages sort and selection state by hand (`useState`) and reads `Icon`/`Checkbox`/`EmptyState` from `window` globals — a pattern of the standalone HTML bundle that does not survive in a React/Vite build. `@tanstack/react-table` ^8.21.3 is **already a dependency**, and both the Issue (#100) and the Plan (#101) explicitly call for "wrappers do TanStack Table" that consolidate the existing `table` baseline.

Architectural decisions to crystallize in an ADR rather than dilute into a commit:

- **Engine** — hand-rolled state vs `@tanstack/react-table`.
- **Reuse vs reimplement** — compose the existing `table` primitive vs render raw `<table>` markup.
- **Sort API shape** — preserve the legacy `{ id, dir } | null` vs adopt the TanStack `{ id, desc }[]` shape.
- **Selection collaborator** — bespoke checkbox vs the DS `Checkbox` primitive.
- **Empty-state ownership** — rich `EmptyState` baked in vs a minimal accessible fallback owned by `DataTable`.
- **Table semantics** — `scope` headers + `aria-sort` as non-negotiable accessibility.

## Decision

Migrate DataTable to v0.1.0 DoD as a **high-level wrapper over `@tanstack/react-table` that composes the existing `Table*` primitives** and the DS `Checkbox`:

1. **TanStack as the engine.** `useReactTable` + `getCoreRowModel` + `getSortedRowModel` own the row model, sorting, and row selection. The component does not re-implement sort comparison or selection bookkeeping — it configures TanStack and renders the resulting model. This is exactly what #100/#101 mandate ("wrappers do TanStack Table; consolida o baseline table existente").

2. **Compose, never reimplement.** DataTable renders through the existing `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` primitives (`lex-design-system-library`, `lex-dry`). It does not duplicate the `<table>`/`<thead>`/`<tbody>` markup or the row-hover/striping styling already owned by `table`. Per-column overrides (alignment, sticky, density) are applied via `className`.

3. **Adopt the TanStack sort shape `{ id, desc }[]` (divergence D2).** The public `sorting`/`defaultSorting`/`onSortingChange` props use TanStack's native `SortingState` entries instead of the legacy `{ id, dir: "asc" | "desc" } | null`. Reason: translating between the two shapes on every change is frail and duplicates the engine's own contract; exposing the native shape keeps the wrapper thin and avoids a DRY violation against TanStack. The asc → desc → none click cycle (legacy behavior) is preserved — it is TanStack's default tri-state toggle.

4. **The DS `Checkbox` is the selection collaborator (divergence D3).** Selection uses `ui_kit/components/checkbox` (already accessible, already supports `indeterminate`) rather than a bespoke input. The select-all header checkbox shows `indeterminate` on partial selection. Each checkbox carries an `aria-label` ("Selecionar linha" / "Selecionar todas as linhas").

5. **Table semantics are non-negotiable (divergences D5, D6).** Every header cell carries `scope="col"`. Each sortable `<th>` exposes `aria-sort="ascending" | "descending" | "none"`. The sortable header is a real `<button>` (focusable, Enter/Space-activatable, visible focus ring) so keyboard users sort without a mouse. The empty state renders inside `role="status" aria-live="polite"` and spans all columns.

6. **DataTable owns a minimal empty-state fallback, not a rich `EmptyState` (divergence D3).** The legacy reference delegates to a global `EmptyState` widget. DataTable instead renders an accessible text fallback (`emptyText`, default "Sem dados") and leaves rich empty states (illustration, CTA) to the consumer via custom content. This keeps DataTable agnostic of content atoms and avoids a hard dependency on `EmptyState`.

7. **CVA for density only.** `dataTableVariants` exposes a single `density` variant (`compact` | `normal` | `comfortable`, default `normal`) driving header/cell padding via descendant selectors, mirroring the legacy `.grd-dt-compact`/`.grd-dt-comfortable`. No tone matrix, no size matrix — density is the only visual axis.

8. **Token contract — semantic only, no expansion (divergence D4).** DataTable consumes `bg-card`, `border-border`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-primary`, `ring-ring`, `bg-primary/10` exclusively, plus the striping/hover already owned by `table`. **No new tokens are introduced.** Notion-canonical brand palette per `lex-brand-colors`.

9. **Controlled + uncontrolled for both sort and selection (divergence D1).** Sort is controlled via `sorting`/`onSortingChange`, uncontrolled via `defaultSorting`. Selection is controlled via `rowSelection`/`onRowSelectionChange`, uncontrolled otherwise. `rowKey` (→ TanStack `getRowId`) defines the stable selection key. Row click (`onRowClick`) is independent and the checkbox `stopPropagation`s so selecting never triggers the row action.

10. **a11y coverage (`axeInThemes`)** over 4 states × 2 themes = **8 invocations minimum** in `DataTable.test.tsx`: Default, sorted, selection (incl. select-all), empty. Light + dark always.

11. **ADR `accepted` at first commit.** Atomic commit ships code + tests + stories + docs + ADR together — no `proposed → accepted` two-step (per the post-PR-#237 retrospective, see ADR-014 clause 9).

## Divergences from the legacy reference

| # | Legacy reference | v0.1.0 migration | Justification |
|---|---|---|---|
| D1 | Hand-rolled `useState` sort + selection | `useReactTable` (`getSortedRowModel`, `rowSelection`) | #100/#101 mandate TanStack; consolidates the baseline. User-observable behavior identical. |
| D2 | Sort API `{ id, dir } \| null` | Sort API `{ id, desc }[]` (TanStack-native) | Avoids frail bidirectional translation; thin wrapper; no DRY violation against the engine. |
| D3 | `window.Icon/Checkbox/EmptyState` globals | DS `Checkbox` + `lucide-react` Chevrons + minimal inline empty fallback | React/Vite has no `window` globals; composes DS primitives; rich empty state left to the consumer. |
| D4 | `.grd-dt-*` classes + `index.css` | Tailwind v4 semantic tokens + CVA | DoD standard; zero prefixed CSS, zero hardcode. |
| D5 | Raw `colSpan` empty cell | `colSpan` + `role="status"`/`aria-live="polite"` | Accessible empty-state announcement. |
| D6 | No `scope` on `<th>` | `scope="col"` on every header | Accessible table semantics (WCAG 2.1 AA). |

## Consequences

### Positive

- DataTable reaches DoD as the first **Data & content** component, advancing the catalog 1 toward 52.
- TanStack does the heavy lifting (sorting, selection, row model), so the wrapper is small and the behavior is battle-tested.
- Composes the existing `table` primitive and `Checkbox` — exercises the catalog as a system, satisfies `lex-design-system-library` and `lex-dry`.
- Token surface unchanged — zero risk to other consumers of `--card` / `--border` / `--fg`.
- Real table semantics (`scope`, `aria-sort`, `<button>` headers, labelled checkboxes) make it screen-reader-correct by construction.

### Negative

- **Sort API diverges from the legacy shape.** Consumers porting from the legacy bundle must migrate `{ id, dir }` → `{ id, desc }`. Trade-off: the TanStack-native shape is the durable contract and avoids translation bugs. Documented in the props table and this ADR.
- **No baked-in rich empty state.** Consumers wanting an illustrated empty state pass it via `emptyText` content. Not a regression — it keeps DataTable content-agnostic.
- **Scope limited to sort + selection.** Pagination, filtering, grouping, column resize/reorder, and virtualization are out of scope (the legacy reference does not exercise them). They are TanStack features that a future ADR can enable on the same wrapper without breaking the API.

### Neutral

- **+0 dependencies.** `@tanstack/react-table` and `lucide-react` are already in the bundle; `cn`, `Checkbox`, and `Table*` are internal.
- **+1 directory** (`ui_kit/components/data-table/`), +1 docs page, +1 preview module, +1 ADR. Total: ~6 new files + 3 modified (barrel + docs index Set + this ADR list).

## Alternatives considered

1. **Hand-roll sort/selection (keep the legacy approach).** Rejected — #100/#101 explicitly mandate a TanStack wrapper; re-implementing the row model duplicates a maintained dependency and risks subtle comparison/selection bugs (locale sort, indeterminate state).

2. **Render raw `<table>` markup instead of composing `table`.** Rejected — duplicates the markup and styling the `table` primitive already owns (`lex-dry`, `lex-design-system-library`). Composition is the only permitted path for variations.

3. **Preserve the legacy `{ id, dir } | null` sort shape.** Rejected — forces a translation layer on every sort change against TanStack's native `SortingState`, a frail seam. The native shape is the durable contract; the migration cost is a one-line mapping for porting consumers, documented here.

4. **Bake a rich `EmptyState` into DataTable.** Rejected — couples DataTable to a content atom and forces a dependency. A minimal accessible fallback + consumer-supplied content is more composable and keeps the component agnostic.

5. **Expose the full TanStack feature surface (pagination, filtering, faceting) now.** Rejected — YAGNI for v0.1.0; the reference exercises none of them. The wrapper API is deliberately scoped to sort + selection + density + empty; future features land via additive ADRs on the same component.

6. **Build DataTable as part of the `table` package (`ui_kit/components/table/data-table.tsx`).** Rejected — they are distinct catalog entries (the primitive vs the high-level component). Co-locating would muddy the import surface and the docs nav. DataTable lives in its own directory and composes `table`.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. TanStack as the engine | AC-3, AC-5, AC-7 |
| 2. Compose `Table*`, never reimplement | AC-2, AC-3 |
| 3. TanStack sort shape (D2) | AC-5, AC-7 |
| 4. DS `Checkbox` selection collaborator (D3) | AC-8, AC-9, AC-10 |
| 5. Table semantics: scope + aria-sort + button headers (D5, D6) | AC-2, AC-5, AC-6, AC-16 |
| 6. Minimal accessible empty-state fallback | AC-13 |
| 7. CVA for density only | AC-12, AC-19 |
| 8. Semantic tokens only, no expansion (D4) | AC-17 |
| 9. Controlled + uncontrolled sort/selection; row click (D1) | AC-7, AC-10, AC-11 |
| 10. `axeInThemes` over 4 states × 2 themes | AC-18 |
| 11. ADR accepted at first commit | AC-20 |
