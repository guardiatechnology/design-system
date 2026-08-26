// Barrel for the `./theme` subpath export (see package.json `exports`).
// Mirrors the per-component pattern in `ui_kit/components/*` so
// `scripts/generate-exports.mjs` can derive `./theme` from `dist/theme/index.js`
// the same way it derives `./button`, `./table`, etc. from `dist/components/*`.
//
// The root barrel (`ui_kit/index.tsx`) keeps exporting `theme-provider` and
// `theme-toggle` directly for backward compatibility; this file does not
// change that behavior.
export * from './theme-provider';
export * from './theme-toggle';
