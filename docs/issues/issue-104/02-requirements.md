# Phase 2 — Requirements: MetricCard v0.1.0 DoD

Numbered acceptance criteria. Each AC maps to ≥1 test (`AC-{N}:` convention) per
`lex-issue-driven` Rule 3. Scope is bound to the **complete DoD checklist** in #104 / #105 —
no narrower scope.

## Public surface

- **AC-1:** `MetricCard` is exported from `ui_kit/components/metric-card/index.ts(x)` and
  re-exported from `ui_kit/components/index.ts` (barrel).
- **AC-2:** `metricCardVariants` (CVA accessor) is exported and callable with no args
  (defaults to `size="md"`, `deltaTone="neutral"`).
- **AC-3:** `MetricCard.displayName === "MetricCard"`.

## API parity with the legacy reference

- **AC-4:** Renders `label` (small, uppercase, above) and `value` (large, central, tabular-nums).
- **AC-5:** Renders `prefix` and `suffix` around the value when provided.
- **AC-6:** `delta` as a **number** renders formatted with sign + `%` in pt-BR
  (`+12,4%`, `-18,2%`); `delta` as a **string** renders verbatim.
- **AC-7:** `deltaType` is auto-derived from the delta sign (`>0` → up, `<0` → down,
  `0`/`NaN` → neutral) and can be overridden explicitly.
- **AC-8:** `caption` renders in the footer when provided.
- **AC-9:** `icon` (a `lucide-react`-shaped component) renders in a chip at the top-right.
- **AC-10:** `size` (`sm` | `md` (default) | `lg`) scales padding + value font size.

## Token contract & accessibility (trend not by color alone)

- **AC-11:** Only semantic tokens — zero hardcoded hex / oklch / raw Tailwind palette names in
  the component classes.
- **AC-12:** Delta tone uses AAA-contrast pairs: up → `text-success-fg`/`bg-success-soft`,
  down → `text-danger-fg`/`bg-danger-soft`, neutral → `text-fg-muted`/`bg-muted`.
- **AC-13:** Trend direction is **never** conveyed by color alone: each non-neutral delta is
  paired with a directional arrow icon (`TrendingUp`/`TrendingDown`) **and** a textual sign
  (`+`/`-`) in the formatted number. The arrow is `aria-hidden`; the sign carries meaning.
- **AC-14:** The delta exposes an accessible label describing the direction
  (e.g. `aria-label="aumento de 12,4%"` / `"queda de 18,2%"`), so screen readers announce
  direction without relying on the visual arrow.
- **AC-15:** The icon chip is decorative (`aria-hidden`); the `label` is the accessible name of
  the metric.

## Semantics & composition

- **AC-16:** Root composes the existing `Card` primitive with `bg-card`/`text-card-foreground`.
  The host element is a `<div>` (not `<article>`) so the explicit `role="group"` is ARIA-valid
  (an `<article>` forbids a conflicting `role=group` per axe `aria-allowed-role`).
- **AC-17:** The metric exposes a programmatic association between `label` and `value` via
  an accessible group (`role="group"` + `aria-labelledby`) so the KPI reads as one unit.
- **AC-18:** Extra `className` and standard `HTMLAttributes` pass through to the root.

## A11y (jest-axe, light + dark)

- **AC-19:** `MetricCard.test.tsx` runs `axeInThemes` (light **and** dark) with
  `toHaveNoViolations()` on at least: Default (with icon + numeric delta), the down/error-tone
  delta, and the no-delta caption-only variant.

## Quality gate

- **AC-20:** ≥ 20 behavioral tests **or** ≥ 80% file coverage, using accessible queries
  (`getByRole`, `getByText`, `getByLabelText`), no mocking of internal collaborators.
- **AC-21:** `npm run typecheck && npm run lint && npm run test && npm run build &&
  npm run docs:build` all green.

## Out of scope

- `spark` / sparkline (mentioned in the legacy JSDoc, never implemented in the reference).
- Unrelated refactors; token additions beyond what MetricCard strictly needs.
- The human playground "está bom" gate (pending Fernando — not auto-checked).

## Definition of Done (mirror of #104)

Storybook (light+dark) · Playground side-by-side (human gate, pending) · behavioral tests +
jest-axe · Brand (Notion-canonical, no divergence) · green pipeline · single atomic commit ·
PR closes #104 + #105.
