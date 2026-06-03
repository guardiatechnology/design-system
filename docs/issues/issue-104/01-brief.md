# Phase 1 — Brief: migrate MetricCard to v0.1.0 DoD

- **Issue:** guardiatechnology/design-system#104 (Tech Task)
- **Plan sub-issue:** #105 (status `development`)
- **Epic pai:** #13
- **Author:** @fernandoseguim
- **Category:** Data & content
- **Component:** MetricCard · slug `metric-card` · PascalName `MetricCard`
- **Pre-allocated ADR:** ADR-025

## Why

`MetricCard` is part of the canonical 52-component catalog of `@guardia/design-system` v0.1.0
but sits below the DoD. Without the migration the **Data & content** category stays incomplete.

## What

Bring `MetricCard` to the v0.1.0 DoD as a first-class component: React + Tailwind v4 + CVA,
semantic tokens only, behavioral tests with jest-axe (light + dark), Storybook stories,
Astro docs page + preview, barrel export, and inclusion in the `MIGRATED` set.

## Legacy reference (source of truth)

- `ux_references/ui_kits/components/MetricCard/index.tsx` (~63 loc)
- `ux_references/ui_kits/components/MetricCard/index.css`
- `ux_references/ui_kits/components/MetricCard/MetricCard.playground.html`

Reference API: `label`, `value`, `prefix`, `suffix`, `delta` (number|string), `deltaType`
(up|down|neutral, auto-derived from sign), `caption`, `icon` (Lucide name string), `size`
(sm|md|lg). Trend tone (green/red) derives from the delta sign; `deltaType="neutral"` silences it.

## Notion context (Brand source of truth)

The DoD references Notion Branding pages (Cores, Tipografia, Logomarca, Voz) as the source of
truth, with local `lex-brand-*` / `codex-brand-*` mirrors. MetricCard consumes only semantic
tokens already aligned to the canonical violet/orange palette — no new token or brand divergence
is introduced, so no Notion mirror update is required for this migration.

## Unknowns / decisions deferred to Phase 3

- Compose on the existing `Card` primitive vs. standalone `<div>` (reference is a flat div).
- How to map the legacy `icon` (string + global `window.Icon`) to the DS pattern.
- How to satisfy "trend not by color alone" beyond what the reference already does.
- Whether `spark` (mentioned in the reference JSDoc but never implemented) is in scope (it is not).
