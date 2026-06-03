# 02 — Requisitos: DataTable v0.1.0 DoD

Critérios de aceitação numerados. Cada AC tem ≥ 1 teste em `DataTable.test.tsx` referenciando `AC-{N}` (rastreabilidade bidirecional, `lex-issue-driven` Rule 3).

## Critérios de aceitação

- **AC-1 — Superfície pública.** O barrel `ui_kit/components/index.ts` exporta `DataTable` (default + named) e os tipos públicos (`DataTableProps`, `DataTableColumn`, `SortDirection`, `DataTableDensity`). `DataTable.displayName === "DataTable"`.
- **AC-2 — Semântica de tabela real.** Renderiza `<table>` nativo com `<thead>`/`<tbody>`, `<th scope="col">` em todos os cabeçalhos e `role="table"` acessível via `getByRole("table")`.
- **AC-3 — Linhas a partir de dados.** Dado `columns` + `rows`, renderiza uma linha (`row`) por item e uma célula por coluna, na ordem das colunas, usando `@tanstack/react-table` como engine.
- **AC-4 — Render custom por célula.** Coluna com `cell`/`render` aplica o render custom; sem ele, exibe o valor acessado por `accessorKey`/`accessor`.
- **AC-5 — Ordenação por clique.** Cabeçalho com `sortable` é um `<button>`; clicar cicla `asc → desc → none`; as linhas reordenam conforme a direção corrente. Colunas sem `sortable` não respondem.
- **AC-6 — `aria-sort` nos cabeçalhos ordenáveis.** O `<th>` ordenável expõe `aria-sort="ascending" | "descending" | "none"` refletindo o estado corrente.
- **AC-7 — Ordenação controlada e não-controlada.** Com `sorting`/`onSortingChange` o componente é controlado; com `defaultSorting` (ou sem nada) gerencia estado interno.
- **AC-8 — Seleção por linha.** Com `selectable`, cada linha tem um checkbox (`getByRole("checkbox")`) com `aria-label`; alternar marca/desmarca a linha (`aria-selected`/`data-state=selected`).
- **AC-9 — Selecionar todos.** O checkbox do cabeçalho marca/desmarca todas as linhas; entra em estado indeterminado quando há seleção parcial.
- **AC-10 — Seleção controlada e não-controlada.** Com `rowSelection`/`onRowSelectionChange` o componente é controlado; sem isso, gerencia estado interno; `getRowId`/`rowKey` define a chave estável.
- **AC-11 — Clique de linha.** Com `onRowClick`, clicar na linha dispara o callback com o dado da linha; clique no checkbox NÃO propaga para `onRowClick`.
- **AC-12 — Densidades.** `density="compact" | "normal" | "comfortable"` altera o padding das células; default `normal`.
- **AC-13 — Estado vazio.** `rows=[]` renderiza uma única linha de estado vazio ocupando todas as colunas, com `emptyText` (default acessível) e `role`/`aria-live` para anúncio.
- **AC-14 — Sticky header.** `stickyHeader` aplica posicionamento sticky no `<thead>`.
- **AC-15 — Alinhamento por coluna.** `align="left" | "right" | "center"` posiciona o conteúdo da célula e do cabeçalho.
- **AC-16 — Navegação por teclado.** Cabeçalho ordenável é focável via `Tab` e ativável via `Enter`/`Space` (é `<button>`); checkboxes são focáveis e alternáveis por teclado; foco visível preservado (`focus-visible:ring`).
- **AC-17 — Apenas tokens semânticos.** Zero cores/tipografia/spacing hardcoded; somente tokens Tailwind v4 (`bg-card`, `border-border`, `text-fg`, `text-fg-muted`, `text-primary`, `ring-ring`, etc.).
- **AC-18 — A11y jest-axe light + dark.** `toHaveNoViolations()` em `light` E `dark` (via `axeInThemes`) para: Default, estado ordenado, estado com seleção (incl. select-all), e estado vazio.
- **AC-19 — CVA acessor exportado.** `dataTableVariants` (ou equivalente CVA de densidade) é exportado e chamável com defaults.
- **AC-20 — Documentação publicada.** Página `docs/src/pages/componentes/data-table.astro` + previews `docs/src/previews/data-table.tsx`; `DataTable` adicionado ao Set `MIGRATED` em `docs/src/pages/index.astro`.

## Definition of Done (do #100/#101)

- Storybook: Default + variantes principais em light + dark.
- Behavioral tests: ≥ 20 testes OU ≥ 80% de cobertura no arquivo; queries acessíveis; sem mockar colaboradores internos; jest-axe light + dark.
- Brand: tokens semânticos conforme Notion-canonical (espelho local de `lex-brand-*`).
- `npm run typecheck && npm run lint && npm run test && npm run build && npm run docs:build` verde.
- Commit atômico único; PR `Closes #100` + `Closes #101`.
- Playground "está bom" do Fernando registrado no PR (**gate humano — fora do escopo do agente**).

## Fora de escopo

- Paginação, filtros, agrupamento, column resizing/reordering, virtualização (recursos do TanStack não exercidos pela referência).
- Refatoração do primitivo `table` existente ou de outros componentes.
- Tokens novos além do que `DataTable` estritamente precisa (todos já existem).
