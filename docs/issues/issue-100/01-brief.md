# 01 — Brief: migrate DataTable to v0.1.0 DoD

- **Issue:** guardiatechnology/design-system#100 (Tech Task `feat(data-table): migrate DataTable to v0.1.0 DoD`)
- **Plan sub-issue:** #101 (`status: development`)
- **Epic pai:** #13
- **Autor:** @fernandoseguim
- **Categoria:** Data & content
- **Label:** `evolvability ♻️`
- **ADR pré-alocado:** ADR-023

## Por que

`DataTable` faz parte do catálogo canônico de 52 componentes do `@guardia/design-system` v0.1.0. Hoje existe apenas o primitivo `table` (peças composáveis estilo shadcn) e a referência legacy em `ux_references/`. Sem esta migração a categoria **Data & content** fica incompleta no DoD do v0.1.0.

## O quê

Elevar `DataTable` a componente first-class no DoD do v0.1.0: um wrapper de alto nível sobre `@tanstack/react-table` ^8.21 que compõe o primitivo `table` já existente, espelhando a API/visual da referência legacy (ordenação, seleção, densidade, render por célula, estado vazio, sticky header).

## Referência (fonte da verdade)

- `ux_references/ui_kits/components/DataTable/index.tsx` — API + comportamento (sorting controlado/não-controlado, seleção, densidades, render custom).
- `ux_references/ui_kits/components/DataTable/index.css` — visual (`.grd-dt-*` → tokens semânticos Tailwind v4).
- `ux_references/ui_kits/components/DataTable/DataTable.playground.html` — cenários de playground (completa, densidades, vazio).

## Contexto do repositório

- Primitivo existente: `ui_kit/components/table` (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, …) — será **composto**, não reimplementado (`lex-design-system-library`, `lex-dry`).
- `@tanstack/react-table` ^8.21.3 já é dependência — não adicionar nova lib de tabela.
- Estrutura DoD espelha migrações recentes (Stepper #84 / ADR-020, TopBar #264 / ADR-021).

## Incógnitas

Nenhuma bloqueante. A referência usa `Avatar`/`Badge`/`Icon`/`Checkbox`/`EmptyState` apenas no playground (via render custom do consumidor), não como dependência interna do componente — o `DataTable` permanece agnóstico de conteúdo de célula.
