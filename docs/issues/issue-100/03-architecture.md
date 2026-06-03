# 03 — Arquitetura: DataTable v0.1.0 DoD

## Decisão central

`DataTable` é um componente de alto nível **client-side**, controlado por `columns` + `rows`, que usa `@tanstack/react-table` (`useReactTable` + `getCoreRowModel` + `getSortedRowModel`) como engine de modelo de linha/ordenação e **compõe** os primitivos `Table*` já existentes (`ui_kit/components/table`) para renderizar a marcação. Não reimplementa tabela (atende `lex-design-system-library` e `lex-dry`) nem adiciona nova lib (TanStack já é dependência).

## Componentes afetados (tabela de escopo)

| Arquivo | Tipo | Ação |
|---|---|---|
| `ui_kit/components/data-table/index.tsx` | Componente | **Novo** — wrapper TanStack + composição de `Table*` + CVA de densidade |
| `ui_kit/components/data-table/DataTable.test.tsx` | Teste de unidade | **Novo** — behavioral + jest-axe light/dark |
| `ui_kit/components/data-table/DataTable.stories.tsx` | Storybook | **Novo** — Default + variantes, light/dark |
| `ui_kit/components/index.ts` | Barrel | **Editar** — `export * from "./data-table"` |
| `docs/src/pages/componentes/data-table.astro` | Docs | **Novo** — página de componente |
| `docs/src/previews/data-table.tsx` | Docs | **Novo** — previews client:load |
| `docs/src/pages/index.astro` | Docs | **Editar** — adicionar `"DataTable"` ao Set `MIGRATED` |
| `docs/adr/ADR-023-data-table-v0.1.0-dod-migration.md` | ADR | **Novo** — `accepted` |
| `docs/issues/issue-100/{01..06}-*.md` | Artefatos de fase | **Novo** |

Nenhuma superfície runtime nova (endpoint/consumer/job) — `lex-observability-required` não se aplica (componente de UI puro).

## API (espelha a referência, adaptada ao DoD)

```ts
type SortDirection = "asc" | "desc";
type DataTableDensity = "compact" | "normal" | "comfortable";
type ColumnAlign = "left" | "right" | "center";

interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  accessorKey?: keyof T;                  // ou accessor(row) => value
  accessor?: (row: T) => unknown;
  cell?: (value: unknown, row: T) => React.ReactNode;  // render custom
  sortable?: boolean;
  align?: ColumnAlign;
  width?: number | string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey?: (row: T, index: number) => string;   // getRowId
  selectable?: boolean;
  rowSelection?: Record<string, boolean>;        // controlado
  onRowSelectionChange?: (s: Record<string, boolean>) => void;
  sorting?: { id: string; desc: boolean }[];      // controlado
  defaultSorting?: { id: string; desc: boolean }[];
  onSortingChange?: (s: { id: string; desc: boolean }[]) => void;
  onRowClick?: (row: T) => void;
  emptyText?: React.ReactNode;
  density?: DataTableDensity;
  stickyHeader?: boolean;
  caption?: React.ReactNode;                       // <caption> para SR
  className?: string;
}
```

Exporta `DataTable` (default + named), os tipos acima e `dataTableVariants` (CVA de densidade).

## Divergências em relação à referência (justificadas)

| # | Referência legacy | Migração v0.1.0 | Justificativa |
|---|---|---|---|
| D1 | Estado de sort/seleção em `useState` manual | `useReactTable` (`getSortedRowModel`, `rowSelection` state) | Issue/Plan exigem wrapper TanStack; consolida o baseline. Comportamento de usuário idêntico. |
| D2 | API de sort `{ id, dir: "asc"\|"desc" } \| null` | API de sort do TanStack `{ id, desc: boolean }[]` | Alinha com a engine; expõe o tipo nativo do TanStack, evitando tradução frágil e divergência DRY. |
| D3 | `(window as any).Icon/Checkbox/EmptyState` (globais do bundle HTML) | Composição React: `Checkbox` do DS para seleção; ícone `lucide-react` (`ChevronUp`/`ChevronDown`/`ChevronsUpDown`) para sort; estado vazio inline tokenizado | Ambiente React/Vite real não tem globais `window`. Usa primitivos do DS (atende `lex-design-system-library`). `EmptyState` rico fica a cargo do consumidor via render — `DataTable` provê fallback acessível mínimo. |
| D4 | Classes `.grd-dt-*` + `index.css` | Tokens Tailwind v4 semânticos + CVA | Padrão DoD do DS; zero CSS prefixado, zero hardcode (`AC-17`). |
| D5 | `colSpan` cru no estado vazio | `colSpan` calculado + `role="status"`/`aria-live="polite"` | Anúncio acessível do estado vazio (`AC-13`, `lex-frontend-accessibility`). |
| D6 | Sem `scope` nos `<th>` | `scope="col"` em todos os cabeçalhos | Semântica de tabela acessível obrigatória (`AC-2`). |

## Decisões de design

- **Sort acessível:** cabeçalho ordenável renderiza `<button>` interno (foco/teclado nativo — `AC-16`) e o `<th>` carrega `aria-sort`. Cabeçalho não-ordenável é texto puro.
- **Seleção:** usa o `Checkbox` do DS (já acessível, com `indeterminate`). `aria-label` por linha ("Selecionar linha") e no header ("Selecionar todas as linhas").
- **Clique de linha vs. checkbox:** o handler do checkbox chama `stopPropagation` para não disparar `onRowClick` (`AC-11`).
- **Densidade:** CVA mapeia `compact|normal|comfortable` para classes de padding aplicadas em `<th>`/`<td>` via data-attribute no wrapper, espelhando o legacy.
- **Composição:** reusa `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` do primitivo `table`; overrides pontuais de className para densidade/alinhamento/sticky.

## ADR

ADR-023 (`accepted`) registra: (a) wrapper sobre TanStack consolidando o baseline `table`; (b) composição dos primitivos em vez de reimplementação; (c) divergências D1–D6.

## Stacked PR Decomposition

Não aplicável. Decision Checklist de `codex-stacked-prs`: 1 componente, 1 PR atômico (Plan #101 declara explicitamente "1 PR atômico único"). 0 sinais altos para decomposição → PR único via `kata-contributing-pr`.

## Gate 1 — Escopo (auto-aprovado)

Conforme instrução de execução (migração v0.1.0 DoD com defaults sensatos, escopo amarrado ao DoD completo de #100/#101, ADR-023 pré-alocado, sem ambiguidade irreversível): **Gate 1 aprovado**. Sem renegociação de escopo. Prossigo para Fase 4.
