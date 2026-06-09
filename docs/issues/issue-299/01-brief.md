# Phase 1 — Issue Brief: out-of-order Google Fonts `@import` breaks Turbopack consumers

> Issue: [#299](https://github.com/guardiatechnology/design-system/issues/299) · Type: Bug (fix) · Repo: `guardiatechnology/design-system`

## Problem

`ui_kit/styles/index.css` (published verbatim as `dist/styles/index.css`) declares the Google-Fonts `@import url(...)` **after** `@source` and `@custom-variant` rules. The CSS spec requires every `@import` to precede all other rules except `@charset` and `@layer`. Turbopack (Next 16 `next dev`) enforces this as a hard parse error, so every route in a consuming app returns 500.

## Evidence

- `ui_kit/styles/index.css:29` — the font `@import url(...)` sits after `@source` (lines 17–18) and `@custom-variant` (line 21).
- `rslib.config.ts:19-24` — the build copies the file unchanged into `dist/styles/index.css`; the published artifact carries the same ordering defect.
- Reported from `guardiatechnology/financial-context` (PR #511), currently worked around downstream with `patch-package`.

## Impact

- **Turbopack (Next 16 dev):** hard error `@import rules must precede all rules aside from @charset and @layer statements` → every route 500s.
- **Production (lightningcss):** warning only; the font `@import` may be silently dropped during optimization.

## Affected surface

- Single file: `ui_kit/styles/index.css`. No TS/JS, no component, no public API. CSS-only ordering change.

## Desired outcome

Consumers can `import "@guardiatechnology/design-system/styles.css"` under Turbopack without a 500, and can delete their `patch-package` workaround after the next release.
