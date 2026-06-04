# Issue #106 — Brief (Phase 1)

- **Title:** feat(progress): migrate Progress to v0.1.0 DoD
- **Repo:** guardiatechnology/design-system
- **Type:** Tech Task
- **Author / Assignee:** @fernandoseguim
- **Labels:** `evolvability ♻️`
- **Parent Epic:** #13
- **Plan sub-issue:** #107 (`status: development`)
- **Category:** Data & content

## Why

`Progress` is part of the canonical 52-component catalog of `@guardia/design-system` v0.1.0 but currently sits below the v0.1.0 Definition of Done. Without this migration the **Data & content** category stays incomplete.

## What

Bring `Progress` to the v0.1.0 DoD as a first-class component: code + tests (incl. jest-axe light/dark) + stories (light + dark) + Astro page + previews + barrel export + `MIGRATED` set entry, consuming only semantic tokens (zero hardcoded colors).

## Legacy reference (source of truth)

- `ux_references/ui_kits/components/Progress/index.tsx`
- `ux_references/ui_kits/components/Progress/index.css`
- `ux_references/ui_kits/components/Progress/Progress.playground.html`

Component shape from the reference:

- **Variants:** `linear` (default) · `circular`
- **States:** determinate (with `value`) · `indeterminate`
- **Tones:** `violet` (default) · `green` · `amber` · `red`
- **Sizes:** `sm` · `md` (default) · `lg`
- **Props:** `value`, `max` (default 100), `variant`, `label`, `showValue`, `tone`, `size`, `indeterminate`, `className`
- **A11y:** linear track carries `role="progressbar"` + `aria-valuenow/min/max`; `aria-valuenow` omitted for indeterminate.

## Unknowns / decisions deferred to Phase 3

- Radix-free build (instruction): build from scratch, no `@radix-ui/react-progress`.
- Token mapping: `--violet-500` → `primary`; signal tones (`green/amber/red`) → `success/warning/danger` semantic tokens; gray track → `muted`/`border`.
- A11y for circular variant + `role="progressbar"` on circular (reference omits it on circular — divergence to record).
- ADR-026 records from-scratch build, reference fidelity, token choices, and any divergence.
