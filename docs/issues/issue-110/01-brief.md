# Issue #110 — Brief (Fase 1)

- **Issue:** [guardiatechnology/design-system#110](https://github.com/guardiatechnology/design-system/issues/110)
- **Plan sub-issue:** [#111](https://github.com/guardiatechnology/design-system/issues/111)
- **Epic pai:** #13
- **Tipo:** Tech Task (`evolvability ♻️`)
- **Autor:** @fernandoseguim
- **Componente:** `Timeline` · slug `timeline` · PascalName `Timeline`
- **Categoria:** Data & content
- **ADR pré-alocado:** ADR-027

## Por que

`Timeline` faz parte do catálogo canônico de 52 componentes do `@guardia/design-system` v0.1.0. Hoje existe apenas no bundle legacy (`ux_references/`), abaixo do DoD. Sem esta migração, a categoria **Data & content** fica incompleta no v0.1.0.

## O quê

Levar `Timeline` ao DoD do v0.1.0 como componente first-class: React + Tailwind v4 + CVA, espelhando a referência legacy (API + visual), com tokens semânticos exclusivos, testes de unidade comportamentais (incluindo jest-axe light + dark), stories, página Astro + previews, export no barrel e entrada no Set `MIGRATED`.

## Referência (fonte da verdade de API/visual)

- `ux_references/ui_kits/components/Timeline/index.tsx`
- `ux_references/ui_kits/components/Timeline/index.css`
- `ux_references/ui_kits/components/Timeline/Timeline.playground.html`

A referência é uma `<ol>` vertical de eventos cronológicos. Cada item: marcador (ícone ou dot), título, timestamp à direita, descrição, slot `meta` (badges/ações), e tom por item (`violet` default, `green`, `amber`, `red`, `neutral`). Props: `items`, `size` (`sm`/`md`), `connector` (`solid`/`dashed`).

## Incógnitas / decisões a registrar na Arquitetura

1. **Orientação horizontal** — o brief exige `vertical + horizontal`, mas a referência é só vertical. Adicionar `orientation` é uma divergência justificável (ADR-027).
2. **Ícones** — a referência usa `icon: string` + `window.Icon` global; o DS usa componentes `lucide-react`-shaped (vide Stepper). Divergência de mecanismo, não de visual (ADR-027).
3. **Tons → tokens** — mapear `violet/green/amber/red/neutral` para o vocabulário semântico (`--primary`, `--success`, `--warning`, `--danger`, `--muted`/`--border`), nunca cores cruas (`--violet-500` etc. do legacy).

## Restrições de projeto aplicáveis

- Apenas tokens semânticos (`lex-brand-colors`, `lex-design-system-library`).
- Radix-free — construir do zero espelhando a referência.
- A cor nunca é o único indicador de estado (`lex-frontend-accessibility`): tom sempre pareado com ícone/texto.
- Markup de lista semântica (`<ol>`/`<li>`).
- PT-BR nas docs/stories: "teste de unidade" (nunca "teste unitário").
