# Phase 5 — Security Review: Calendar v0.1.0 DoD Migration

- **Issue:** #92 · **Plan:** #93
- **Scope of review:** the diff for the Calendar elevate — `ui_kit/components/calendar/*`, `docs/src/previews/calendar*.tsx`, `docs/src/pages/componentes/calendar.astro`, `docs/src/pages/index.astro` (Set + catalog desc).
- **Result:** **approved** (no findings).

## Surface

`Calendar` is a **presentational, client-side UI component** built on `react-day-picker` + `date-fns`, Radix Select (for the dropdown caption). No server route, no network call, no persistence, no authentication, no user-supplied HTML.

## Checks (`lex-frontend-security`, OWASP-relevant subset)

| Check | Result |
|---|---|
| No `dangerouslySetInnerHTML` / `innerHTML` with untrusted content | Pass — none present in touched files |
| No `eval` / dynamic code execution | Pass — none |
| No secrets / API keys / tokens in client code | Pass — none; no `process.env`, no public-prefixed env vars |
| No network calls / `fetch` / external URLs to untrusted origins | Pass — pure rendering; no I/O |
| No `localStorage` / `sessionStorage` of sensitive data | Pass — none |
| Inputs validated at boundary | N/A — no free-text inputs; selection is constrained to calendar cells by `react-day-picker`; `disabled` matchers are declarative |
| `target="_blank"` without `rel="noopener"` | N/A — no external links introduced in the component (docs links are internal Astro routes) |
| Dependency posture | No new dependencies added; `react-day-picker`, `date-fns`, Radix, CVA already in `package.json` |
| `react-live` playground (`calendar-live.tsx`) | Same controlled pattern as the established `date-picker-live.tsx`; scoped `LiveProvider` with an explicit `scope` allow-list (`{ Calendar, useState }`) — no arbitrary host scope exposure beyond the existing docs convention |

## Sensitive data / logging

No logging is introduced (`lex-logging-decorator` N/A — presentational component, no log primitives). No PII handled — the component renders dates the consumer already holds.

## Note

The legacy `ux_references/ui_kits/components/Calendar/index.tsx` uses a global `window.Icon` / `window.Calendar` assignment, but it is **not** touched by this migration (reference-only, out of scope per `03-architecture.md`). The production component does not use `window.*`.

## Conclusion

No security findings. Not `blocked`, not `changes-required`. Proceed to Gate 2.
