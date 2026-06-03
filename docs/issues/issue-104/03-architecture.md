# Phase 3 — Architecture: MetricCard v0.1.0 DoD

## Affected components (scope table)

| Path | Action |
|------|--------|
| `ui_kit/components/metric-card/index.tsx` | new — component + CVA |
| `ui_kit/components/metric-card/MetricCard.test.tsx` | new — behavioral + jest-axe |
| `ui_kit/components/metric-card/MetricCard.stories.tsx` | new — Storybook (light + dark) |
| `ui_kit/components/index.ts` | edit — add `export * from "./metric-card"` |
| `docs/src/pages/componentes/metric-card.astro` | new — docs page |
| `docs/src/previews/metric-card.tsx` | new — preview rows |
| `docs/src/pages/index.astro` | edit — add `"MetricCard"` to `MIGRATED` |
| `docs/adr/ADR-025-metric-card-v0.1.0-dod-migration.md` | new — status `accepted` |
| `docs/issues/issue-104/{01..06}-*.md` | new — phase artifacts |

## Design decisions

### Compose on the `Card` primitive

The legacy reference is a flat `<div class="grd-mc">`. The DS already ships a canonical `Card`
primitive (`bg-card`, `border-border`, `rounded-lg`, shadow). MetricCard composes the `Card`
root (`variant="default"`, `padding="none"`, internal padding via CVA `size`) — satisfying
`lex-design-system-library` (compose existing primitives, never reimplement) and keeping the
KPI card visually consistent with all other cards. This is the path the issue prefers
("Compose on the existing `Card` primitive if it fits"). The `Card` host element is `as="div"`
(not the Card default `article`) so the explicit `role="group"` is ARIA-valid — an `<article>`
exposes `role=article` and forbids a conflicting `role=group` (axe `aria-allowed-role`). The
flat-div render of the legacy reference is thereby reproduced while the labelled-group semantics
remain valid.

### CVA structure

- `metricCardVariants` — root: `size` (sm/md/lg → padding) × base card classes.
- Value font size scales with `size` (sm 24px / md 30px / lg 36px) via Tailwind text utilities,
  mirroring the legacy `.grd-mc-{size} .grd-mc-value` rules.
- Delta tone is resolved by a small internal `deltaToneClasses(tone)` helper returning the
  semantic token pair (no CVA needed — three discrete branches).

### Token mapping (legacy CSS var → DS semantic token)

| Legacy | DS semantic token | Notes |
|--------|-------------------|-------|
| `--surface` / `--border` | `bg-card` / `border-border` (via `Card`) | |
| `--fg` | `text-fg` / `text-card-foreground` | value |
| `--fg-muted` | `text-fg-muted` | label, caption, neutral delta |
| `--violet-50` / `--violet-600` (icon chip) | `bg-accent/10` / `text-accent` | `accent` aliases primary (violet light / orange dark) |
| `--success-soft` + `color-mix(signal-green, black)` | `bg-success-soft` / `text-success-fg` | AAA-contrast token replaces ad-hoc color-mix |
| `--danger-soft` + `color-mix(signal-red, black)` | `bg-danger-soft` / `text-danger-fg` | AAA-contrast token |
| `--gray-100` (neutral delta bg) | `bg-muted` | |
| `--radius-lg` / `--radius-sm` | `rounded-lg` / `rounded-sm` | |
| `--font-display` (value) | `font-sans` | see divergence D-2 |

### Accessibility strategy (trend not by color alone)

The reference already pairs the delta with a `trending-up`/`trending-down` icon and a signed
number. The migration hardens this for WCAG:

1. **Arrow icon** (`TrendingUp`/`TrendingDown`/`Minus`) `aria-hidden` — visual redundancy.
2. **Textual sign** (`+`/`-`) inside the formatted number — meaning without color.
3. **Accessible label** on the delta (`aria-label="aumento de X%"` / `"queda de X%"`) so SR
   users hear direction explicitly.
4. **AAA-contrast tone tokens** (`*-fg` over `*-soft`) — the raw `--signal-green`/`--signal-red`
   over surface fails WCAG AA (the legacy `color-mix(... black)` was an ad-hoc workaround;
   the DS `*-fg` tokens are the canonical, audited replacement — same intent, token-correct).
5. The whole KPI is a `role="group"` with `aria-labelledby` pointing at the label, so the
   metric is announced as one labelled unit.

## Reference divergences (each justified)

- **D-1 — `icon` prop is a component, not a string.** Legacy reads `(window as any).Icon` and
  passes a string name. The DS has no global `Icon` registry; the established pattern (Stepper,
  TopBar) is to accept a `lucide-react`-shaped `React.ComponentType`. **Justification:** removes
  a global dependency, gives consumers full icon control, matches DS precedent, and is type-safe.
- **D-2 — value uses `font-sans` (Poppins), not `font-display` (Lastica).** `lex-brand-typography`
  / the DS token system reserve **Lastica exclusively for logos/marks**, never UI text. The
  legacy `--font-display` on the value would violate the brand law in-product.
  **Justification:** brand-law compliance; the value keeps `tabular-nums` + `font-semibold` for
  the same numeric weight.
- **D-3 — delta tone uses `*-fg`/`*-soft` token pairs instead of `color-mix(signal, black)`.**
  **Justification:** the DS provides audited AAA-contrast danger/success foreground tokens;
  reproducing the ad-hoc `color-mix` would hardcode color math and risk WCAG failure. Same
  visual intent (dark green/red on soft bg), token-correct.
- **D-4 — composes the `Card` primitive instead of a flat `div`.** **Justification:**
  `lex-design-system-library` (no reimplementing primitives) + visual consistency. Net visual
  result matches the reference (surface, border, radius, padding).
- **D-5 — no `spark` prop.** The legacy JSDoc lists `spark` but the implementation never renders
  it. **Justification:** not implemented in the source of truth; out of scope per #104.

## Delegation

Pure frontend (React + Tailwind + CVA) within the DS. No API/event/AWS surface — no delegation
to Daedalus/Kronos/Atlas. Athena implements directly following the established DS component
pattern (Stepper/TopBar precedent).

## Stacked PR decomposition

Decision Checklist (`codex-stacked-prs`): single component, one atomic commit mandated by #104,
< 1 file domain. **0 high signals** → single PR. No decomposition.

## ADR

ADR-025 (pre-allocated) records the migration decision: compose-on-Card, CVA, semantic tokens,
the 5 reference divergences, and the a11y trend strategy. Status `accepted`.
