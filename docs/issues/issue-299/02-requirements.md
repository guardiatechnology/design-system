# Phase 2 — Requirements: fix out-of-order `@import` in `index.css`

> Issue: [#299](https://github.com/guardiatechnology/design-system/issues/299)

## Acceptance Criteria

- **AC-1** — In `ui_kit/styles/index.css`, the Google-Fonts `@import url(...)` appears **before** any `@source`, `@custom-variant`, or other non-`@import`/`@charset`/`@layer` rule. The only statements allowed above it are the other `@import` declarations (`tailwindcss`, `tw-animate-css`).
- **AC-2** — No `@import` (font, `tailwindcss`, or `tw-animate-css`) is removed; the font CDN convenience is preserved. The Poppins + Roboto families and weights in the URL are unchanged.
- **AC-3** — An automated test asserts the ordering invariant: the index of the font `@import url(` is lower than the index of the first `@source` and the first `@custom-variant` occurrence in `ui_kit/styles/index.css`. The test fails on the pre-fix ordering and passes after the fix (guards against regression).
- **AC-4** — `npm run build` reproduces the corrected ordering in `dist/styles/index.css` (the copied artifact matches the source).

## Definition of Done

- AC-1…AC-4 satisfied.
- `vitest run`, `eslint .`, and `prettier --check .` pass.
- No unrelated diff (logo work on the current branch is excluded; fix lands on its own branch off `main`).

## Out of scope

- Dropping the CDN `@import` in favor of self-hosted `next/font` (the documented alternative). Recorded as a possible future direction, not done here — relocating resolves the bug while keeping consumer convenience, the smaller and reversible change.
- Any token, color, typography-family, or component change.
- Bumping the package version / publishing (handled by the release flow, `warrior-janus`, after merge).
