# Issue #106 — Architecture (Phase 3)

## Approach

Build `Progress` from scratch (no `@radix-ui/react-progress`, per instruction) mirroring the legacy reference API/visual, on the established v0.1.0 DoD stack: React + Tailwind v4 + CVA, consuming semantic tokens exclusively. Pattern follows already-migrated peers (`stepper`, `spinner`, `skeleton`).

## Affected components (scope table)

| Path | Action | Notes |
|------|--------|-------|
| `ui_kit/components/progress/index.tsx` | create | React + Tailwind v4 + CVA; linear + circular; determinate + indeterminate |
| `ui_kit/components/progress/Progress.test.tsx` | create | ≥20 behavioral tests; jest-axe light+dark |
| `ui_kit/components/progress/Progress.stories.tsx` | create | Default + variants; explicit dark story |
| `ui_kit/components/index.ts` | edit | `export * from "./progress"` (alpha order, between popover/radio region — actually after `pagination`/before `popover`? placed in Data&content cluster near skeleton) |
| `docs/src/pages/componentes/progress.astro` | create | mirrors `stepper.astro` structure |
| `docs/src/previews/progress.tsx` | create | preview rows consumed by the Astro page |
| `docs/src/pages/index.astro` | edit | add `"Progress"` to the `MIGRATED` set |
| `docs/adr/ADR-026-progress-v0.1.0-dod-migration.md` | create | status `accepted` |
| `docs/issues/issue-106/*.md` | create | phase artifacts |
| `ui_kit/styles/index.css` | edit | register `--animate-progress-indeterminate` keyframe (the slide motion `Progress` strictly needs; no equivalent exists — documented "real gap → contribute to library" path of `lex-design-system-library`) |

No other files touched (scope-creep guard for Gate 2).

## Component design

### Public API (mirrors reference)

```ts
type ProgressVariant = "linear" | "circular";
type ProgressTone = "violet" | "green" | "amber" | "red";
type ProgressSize = "sm" | "md" | "lg";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;          // 0..max; required for determinate
  max?: number;            // default 100
  variant?: ProgressVariant; // default "linear"
  tone?: ProgressTone;     // default "violet"
  size?: ProgressSize;     // default "md"
  label?: React.ReactNode; // optional accessible label
  showValue?: boolean;     // default false; numeric % readout
  indeterminate?: boolean; // default false
}
```

CVA accessor exported: `progressFillVariants` (tone × variant). Public types exported.

### Token mapping (semantic only)

| Reference token | v0.1.0 semantic token | Tailwind utility |
|-----------------|----------------------|------------------|
| `--violet-500` (violet tone / default fill) | `--primary` | `bg-primary` / `text-primary` |
| `--signal-green` (green tone) | `--success` | `bg-success` / `text-success` |
| `--signal-yellow` (amber tone) | `--warning` | `bg-warning` / `text-warning` |
| `--signal-red` (red tone) | `--danger` | `bg-danger` / `text-danger` |
| `--gray-200` (track / circular bg ring) | `--muted` | `bg-muted` / `text-muted` |
| `--fg` (value readout, label) | `--fg` | `text-fg` |
| `--fg-muted` (secondary readout) | `--fg-muted` | `text-fg-muted` |

Dark-mode parity is inherited automatically — every token above has a `:root[data-theme="dark"]` override (ADR-011 chain). No per-variant dark CSS needed.

### Accessibility

- Linear + circular determinate: `role="progressbar"`, `aria-valuenow={round(pct)}`, `aria-valuemin={0}`, `aria-valuemax={100}`.
- Indeterminate: `role="progressbar"` + min/max only; `aria-valuenow` omitted (signals "busy, unknown completion"); numeric readout suppressed.
- `label`: rendered as visible text and wired via `aria-labelledby` (generated id) so the bar is named.
- Animations (indeterminate slide / circular spin) guarded by `motion-safe:` to respect `prefers-reduced-motion` (improvement over the reference, which animates unconditionally).
- Marker SVG is `aria-hidden`; the announcement comes from the progressbar role + valuenow.

## Divergences from the reference (justified, per Lex requirement)

1. **`role="progressbar"` on circular variant.** The reference omits ARIA on the circular `<div>` (only the linear track has it). v0.1.0 DoD + `lex-frontend-accessibility` require dynamic state to be announced; circular determinate now carries the same `role`/`aria-value*` as linear. **Justification:** accessibility law; no visual change.
2. **`motion-safe:` guard on animations.** Reference animates indeterminate/circular unconditionally. We gate behind `motion-safe:` per `lex-frontend-accessibility` + the spinner precedent. **Justification:** reduced-motion compliance; identical look for users without the preference.
3. **Tokens replace `.grd-pg-*` global CSS + raw `--violet-500`/`--signal-*`.** Per `lex-design-system-library` + `lex-brand-colors` (no hardcoded colors). **Justification:** mandatory; semantic tokens give automatic dark-mode parity.
4. **`value` is optional (defaults to 0)** so `indeterminate` can be used without a meaningless value. Reference typed `value` as required. **Justification:** ergonomics; indeterminate has no value.

All other props, variants, sizes, tones, and visual proportions (track heights 4/6/10px; circular diameters 36/48/64px with stroke 3/4/5px; pill radius; 280ms ease transition) match the reference 1:1.

## Brand alignment (Notion source of truth)

Progress fills are non-text UI indicators (WCAG 1.4.11 non-text contrast, 3:1) drawn from the approved palette via tokens. The numeric readout/label use `--fg`/`--fg-muted` (AAA). The `amber` tone maps to `--warning` (Signal Yellow) used only as a fill bar — never as text on white — so `lex-brand-colors`' forbidden Yellow-500-on-white text combination is not triggered. No palette divergence from Notion; local token mirror already current.

## Stacked PR decision (codex-stacked-prs Decision Checklist)

Single, cohesive component migration (~7 files, one bounded surface). High signals < 3; explicit `lex-agent-planning` directive "one Plan = one PR". **Decision: single PR (no decomposition).** Phase 7 routes to `kata-contributing-pr`.

## Delegation

None. Self-contained frontend migration; Athena drives implementation directly on the established DoD pattern (no API/event/AWS/Python surface).
