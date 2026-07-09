# ADR-029 — Correct the brand palette to the official Guardia tones (#552973 / #F47720)

- **Status:** accepted
- **Date:** 2026-07-09
- **Deciders:** Fernando Seguim
- **Issue:** [#307](https://github.com/guardiatechnology/design-system/issues/307)
- **Related:** Ahrena [#359](https://github.com/guardiatechnology/ahrena/issues/359) (canonical `lex-/codex-brand-colors` correction), landing-pages [#62](https://github.com/guardiatechnology/landing-pages/issues/62), landing-pages #143 (closed, not planned — it targeted the stale tones).

## Context

The design-system shipped the **stale** brand base colors — Deep Violet `#4F186D` and Warm Orange `#E07400` — across `ui_kit/styles/index.css` (ramps + shadcn HSL bridge), the `Logo`/`Badge` components, `assets/logo/*.svg`, and the docs site.

The **official** Guardia palette (source of truth: Notion → Branding → **"Cores"**, updated 2026-06-03, "Base alinhada ao logo de 2026") is **Violeta Intenso `#552973`** and **Laranja Quente `#F47720`**, with recalculated 100–900 ramps and WCAG matrix. Because the DS is the brand's canonical source, the stale values propagated off-brand output to every consumer.

## Decision — adopt the official palette and ramps verbatim from Notion

| | 100 | 200 | 500 | 700 | 900 |
|---|---|---|---|---|---|
| Violeta (`--guardia-purple-*`) | `#DCD3E2` | `#B29FC0` | `#552973` | `#3B1D50` | `#22102E` |
| Laranja (`--guardia-orange-*`) | `#FDE3D1` | `#FAC29B` | `#F47720` | `#AB5316` | `#612F0D` |

Applied to: token ramps, the shadcn HSL bridge (`--primary`/`--secondary`/`--accent`/`--ring`/`--foreground`/sidebar + dark-mode variants, converted to the exact official HSL), `--shadow-brand`, `--border-guardia`, the `Logo`/`IsacSymbol` fills, `Badge` fills, `assets/logo/*.svg`, the docs-site copies (`docs/public/**`), and `docs/BRAND.md`. SVG changes are fill-only — path/`viewBox` untouched.

### Consequence — orange-500 fails 3:1 on light (WCAG)

The official Warm Orange `#F47720` on white is **2.80:1** (vs. `#E07400` = 3.36:1). Notion's own matrix marks white-on-orange-500 as **forbidden** and prescribes orange-700 `#AB5316` (5.28:1) for text/UI on light. Impact and handling:

- **`Badge` outline `accent`** used `border-guardia-orange-500` in both themes; in light it now reads 2.73:1. Fixed with the codebase's established theme-conditional pattern: `border-guardia-orange-700 dark:border-guardia-orange-500` (light 5.14:1 / dark 6.39:1). Tests and contrast comments updated.
- **`--secondary-foreground: white` on orange-500** (2.80:1) is left unchanged in this PR and **flagged** for a Brand decision (Notion allows white on orange only for large text; small text should use violet-500). Not silently redesigned here.
- **`Badge` soft `accent`** (orange-700 on orange-100) drops to 4.29:1 — marginally under AA-Normal (4.5). Flagged for the accessibility follow-up, not changed here.

### White on violet-500

White on `#552973` = **10.76:1 (AAA)** — text/CTA pairings remain fully accessible.

## Scope boundaries

- **Canonical `lex-brand-colors` / `codex-brand-colors`** are Ahrena framework artifacts (vendored here under `.claude/` and `.ahrena/`). They are **not** rewritten in this repo — corrected upstream in Ahrena [#359](https://github.com/guardiatechnology/ahrena/issues/359) and refreshed here via sync. The DS-local copies are temporarily divergent until that lands.
- **Visual baselines** (`__image_snapshots__/`) are **not** regenerated locally — per the standing policy (Tooltip AC-28, `migrate-visual-baselines.mjs`), baselines are Ubuntu/CI-rendered via `regenerate-baselines`, never committed from macOS.
- **Historical artifacts** (`docs/issues/**`, past ADRs, `sessions/*.jsonl`) and framework-example incidental hex mentions are left intact.

## Version

`0.1.0` (minor). Pre-1.0, a visible palette change to every consumer warrants a minor bump; consumers must re-verify their surfaces. Publication is manual (out of this PR).

## Alternatives considered

| Alternative | Why rejected |
|---|---|
| Swap `assets/logo/*.svg` for freshly exported DS files | The defect is color-only; in-place hex edit guarantees "geometry unchanged" and avoids viewBox/path churn. |
| Keep `border-guardia-orange-500` on accent and accept 2.73:1 | Ships a WCAG 1.4.11 failure the component's own contract forbids; the theme-conditional remedy already exists in-repo. |
| Rewrite `--secondary-foreground` / soft-accent text now | Design decisions (button/label text color) belong to Brand; surfaced as follow-ups instead. |
| Patch `lex-brand-colors` locally in the DS | The Law is Ahrena-owned; local edits would drift from canonical and be overwritten by sync. |

## Logo art — standalone assets replaced with the official 2026 identity

Beyond palette, the standalone `assets/logo/*.svg` carried the **old** identity (the "G-in-square" mark). The official 2026 identity (Notion → Branding → Logomarca; Drive SVG kit) is the concentric-arc symbol + lowercase "guardia" wordmark with the orange i-dot — already embedded in the React `<GuardiaLogo>`/`<GuardiaBadge>`. The standalone assets and their `docs/public/**` copies were regenerated from the official colorido vector (geometry = official; per-path fills: symbol orange, wordmark violet, i-dot orange).

The official kit ships **only 4 full signatures** (colorido, branco, branco-roxo, preto) — no symbol-only, monochrome, or rounded variants. Per Fernando's decision ("adopt the 4 official + derive the rest"), the DS's richer taxonomy was **derived** from the official geometry, documented here for review:

| DS file group | Derivation |
|---|---|
| `guardia-logotipo-colorido` (new) | official colorido, verbatim |
| `guardia-logotipo-branco-roxo` (new) | violet bg + white wordmark + orange symbol/i-dot (official branco-roxo composition) |
| `guardia-logotipo-{purple,orange,mono-black,mono-white}` | monochrome recolor of the official signature geometry |
| `guardia-logo-*-transparent`, `-mono-*` | symbol-only (2 official symbol paths, bbox-cropped), single-color |
| `guardia-logo-{purple,orange}-and-{orange,purple}` | symbol-only, the two symbol paths colored arc/inner (dual) |
| `guardia-logo-{purple,orange}-rounded` | symbol-only (white + accent) on a rounded-square brand-color background |

Geometry is authentic to the official vector; the color/composition choices for symbol-only, dual, and rounded variants are the derivation decisions to validate. The React component is unchanged (already the new identity + corrected palette). Visual baselines regenerate on CI.

## References

- `ui_kit/styles/index.css`, `ui_kit/components/logo/index.tsx`, `ui_kit/components/badge/index.tsx`
- `assets/logo/*.svg`, `docs/public/**`, `docs/BRAND.md`
- Notion → Branding → "Cores" (official palette, source of truth)
- Issue [#307](https://github.com/guardiatechnology/design-system/issues/307); Ahrena [#359](https://github.com/guardiatechnology/ahrena/issues/359)
