# ADR-025 — Migrate MetricCard to v0.1.0 DoD (Data & content KPI card)

- **Status:** accepted
- **Date:** 2026-06-02
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-011 (Alert — tone token foundation), ADR-020 (Stepper — most recent display-component chassis), ADR-021 (TopBar — slot-prop layout primitive, compose-not-reimplement discipline)
- **Issue:** [#104](https://github.com/guardiatechnology/design-system/issues/104)
- **Plan:** [#105](https://github.com/guardiatechnology/design-system/issues/105)

## Context

`MetricCard` is the **KPI card** in the Data & content category of the canonical 52-component
catalog of `@guardia/design-system` v0.1.0. The repository ships no implementation —
`ui_kit/components/metric-card/` does not exist, and `docs/src/pages/index.astro` lists
MetricCard (group "MC", "KPI com delta") without a `MIGRATED` Set entry, so the route does not
resolve. Without this migration the Data & content category stays incomplete.

The legacy bundle at `ux_references/ui_kits/components/MetricCard/` defines the canonical visual
and API contract (~63 loc):

- A flat `<div class="grd-mc">` surface (border, radius-lg, surface bg).
- `label` (small uppercase, top) + `value` (large central, tabular-nums) + optional
  `prefix`/`suffix` + optional `delta` + optional `caption` + optional `icon` (top-right chip).
- `delta` accepts `number` (formatted `+X%`/`-X%` in pt-BR) or `string` (verbatim).
- `deltaType` (`up`/`down`/`neutral`) is auto-derived from the delta sign and can be overridden.
- Trend tone is paired with a `trending-up`/`trending-down` icon — never color alone.
- `size`: `sm`/`md`/`lg` scales padding + value font size.

Architectural decisions worth crystallizing in an ADR rather than diluting into a commit:

- **Composition** — compose the existing `Card` primitive vs. a standalone flat `div`.
- **`icon` shape** — legacy string + global `window.Icon` vs. the DS component pattern.
- **Token contract** — which semantic tokens MetricCard consumes; whether the palette expands.
- **Trend-not-by-color-alone** — how to satisfy WCAG beyond the reference's icon pairing.
- **Value typography** — legacy `--font-display` (Lastica) vs. brand-law-compliant `font-sans`.

## Decision

Migrate MetricCard to v0.1.0 DoD following the **Stepper / TopBar display-component chassis**
(no Radix base, no portal — MetricCard is a static display component):

1. **Compose the `Card` primitive (div host).** The root composes
   `<Card as="div" variant="default" padding="none">` and applies size-driven padding via CVA.
   This satisfies `lex-design-system-library` (compose existing primitives, never reimplement a
   surface) and keeps the KPI visually consistent with every other card in the catalog. The host
   is `as="div"` (not Card's default `article`) so the explicit `role="group"` is ARIA-valid — an
   `<article>` forbids a conflicting `role=group` (axe `aria-allowed-role`). The legacy flat-div
   render is reproduced (surface, border, radius, padding) without duplicating those styles.

2. **Slot-prop API mirroring the reference.** A single `<MetricCard>` exposing
   `label`, `value`, `prefix?`, `suffix?`, `delta?`, `deltaType?`, `caption?`, `icon?`, `size?`.
   Public surface: 1 component, 1 CVA accessor (`metricCardVariants`), the `MetricCardProps`
   type, and the `DeltaType` / `MetricCardSize` unions. No compound API.

3. **CVA for `size` only.** `metricCardVariants` carries one `size` variant (sm/md/lg → padding
   + value font size). Delta tone is resolved by a small internal `deltaToneClasses(tone)`
   helper (three discrete token-pair branches) — no tone matrix needed.

4. **`icon` is a `lucide-react`-shaped component, not a string** (divergence D-1). The DS has no
   global `Icon` registry; Stepper/TopBar already accept `React.ComponentType`. Removes a global
   dependency, gives consumers full icon control, and is type-safe.

5. **Value typography uses `font-sans` (Poppins), not `font-display` (Lastica)** (divergence
   D-2). `lex-brand-typography` reserves **Lastica exclusively for logos/marks**, never UI text.
   The value keeps `tabular-nums` + `font-semibold` for the same numeric weight.

6. **Token contract — semantic only, no expansion.** MetricCard consumes `bg-card`,
   `text-card-foreground`, `text-fg`, `text-fg-muted`, `border-border`, `bg-accent`/`text-accent`
   (icon chip), and the tone pairs `success-soft`/`success-fg`, `danger-soft`/`danger-fg`,
   `muted`/`fg-muted`. **No new tokens are introduced.** Same Notion-canonical brand palette.

7. **Delta tone uses `*-fg`/`*-soft` token pairs, not `color-mix(signal, black)`** (divergence
   D-3). The DS ships audited AAA-contrast danger/success foreground tokens (≥ 6.6:1 over their
   soft backgrounds). Reproducing the legacy ad-hoc `color-mix` would hardcode color math and
   risk WCAG failure. Same visual intent (dark green/red on soft bg), token-correct.

8. **Trend never by color alone** (WCAG 1.4.1, `lex-frontend-accessibility`):
   - directional arrow icon (`TrendingUp`/`TrendingDown`/`Minus`), `aria-hidden`;
   - textual sign (`+`/`-`) inside the formatted number;
   - an accessible `aria-label` on the delta describing the direction
     (`"aumento de X%"` / `"queda de X%"`), so SR users hear direction without the visual arrow.

9. **The KPI is a labelled group.** Root carries `role="group"` + `aria-labelledby` pointing at
   the rendered `label`, so the metric is announced as one unit. The icon chip is decorative
   (`aria-hidden`).

10. **No `spark` prop** (divergence D-5). Listed in the legacy JSDoc but never implemented in the
    source of truth; out of scope per #104.

11. **a11y coverage (`axeInThemes`)** over at least 3 representative states × 2 themes in
    `MetricCard.test.tsx`: Default (icon + numeric delta), down-tone delta, no-delta caption-only.
    Light + dark always.

12. **ADR `accepted` at first commit.** The atomic commit ships code + tests + stories + docs +
    ADR together (per the post-PR-#237 retrospective discipline carried by ADR-014/020/021).

## Consequences

### Positive

- Data & content category advances; the `/componentes/metric-card` route resolves.
- KPI cards are visually consistent with the rest of the catalog (compose-on-Card).
- Trend direction is conveyed by icon + sign + accessible label + AAA-contrast tone — robust for
  color-blind and screen-reader users.
- Zero token expansion; zero brand divergence (Notion-canonical palette preserved).
- Type-safe `icon` prop with no global runtime dependency.

### Negative / trade-offs

- Five documented divergences from the legacy reference (D-1..D-5). All are brand-law /
  WCAG / DS-precedent driven and recorded in `03-architecture.md`; none changes the visual intent.
- Composing `Card` adds one wrapper element vs. the flat legacy div — negligible DOM cost,
  offset by style reuse.

### Neutral

- The human playground "está bom" visual gate (#104) remains pending Fernando — not auto-checked
  by this flow.
