# Issue #110 — Requirements / Acceptance Criteria (Fase 2)

Critérios numerados; cada um tem ≥ 1 teste de unidade em `Timeline.test.tsx` com a tag `AC-N` (rastreabilidade bidirecional, `lex-issue-driven` Regra 3).

## Public surface

- **AC-1:** `Timeline` é exportado de `ui_kit/components/timeline/index.tsx` e re-exportado pelo barrel `ui_kit/components/index.ts`.
- **AC-2:** O CVA accessor `timelineMarkerVariants` é exportado e chamável sem argumentos (defaults `tone="violet"`, `size="md"`).
- **AC-3:** `Timeline.displayName === "Timeline"`.

## Estrutura semântica

- **AC-4:** Renderiza uma `<ol>` (`role=list`) com `aria-label` default `"Linha do tempo"` (override via prop).
- **AC-5:** Cada evento é um `<li>`; a quantidade de `<li>` é igual ao número de `items`.

## Orientação (divergência documentada — ADR-027)

- **AC-6:** `orientation="vertical"` (default) empilha os eventos em coluna com connector vertical.
- **AC-7:** `orientation="horizontal"` dispõe os eventos em linha com connector horizontal.

## Conteúdo do item

- **AC-8:** `title` é renderizado para cada item.
- **AC-9:** `description` é renderizado quando presente; omitido quando ausente.
- **AC-10:** `timestamp` é renderizado quando presente (tabular-nums).
- **AC-11:** `meta` (ReactNode, ex.: Badge) é renderizado quando presente.
- **AC-12:** `icon` (componente `lucide-react`-shaped) é renderizado no marcador quando presente; sem `icon`, o marcador mostra um dot decorativo.

## Tons → tokens semânticos

- **AC-13:** `tone="violet"` (default) usa `--primary` (`border-primary`/`text-primary`).
- **AC-14:** `tone="green"` usa tokens `--success`.
- **AC-15:** `tone="amber"` usa tokens `--warning`.
- **AC-16:** `tone="red"` usa tokens `--danger`.
- **AC-17:** `tone="neutral"` usa tokens neutros (`--border`/`--fg-muted`).

## Connector

- **AC-18:** `connector="solid"` (default) desenha linha sólida entre marcadores; o último item não tem connector.
- **AC-19:** `connector="dashed"` desenha linha tracejada.

## Tamanho

- **AC-20:** `size="md"` (default) e `size="sm"` produzem marcadores de tamanhos distintos.

## Acessibilidade — cor nunca é o único indicador

- **AC-21:** Cada item expõe o tom também de forma não-cromática: o marcador carrega `data-tone` e o item carrega um rótulo textual de estado acessível (`<span class="sr-only">` com o nome do tom) quando o tom não é o default `violet`. Ícone reforça o significado quando fornecido.

## Tokens

- **AC-22:** As variantes CVA do marcador não contêm literais hex, `oklch()` nem nomes de paleta Tailwind crus (`text-red-500` etc.) — apenas tokens semânticos.

## jest-axe — light + dark (obrigatório)

- **AC-23:** Timeline vertical padrão (multi-tom) sem violações axe em light + dark.
- **AC-24:** Timeline horizontal sem violações axe em light + dark.
- **AC-25:** Timeline com `connector="dashed"` + `size="sm"` + tom `red` sem violações axe em light + dark.

## Definition of Done (DoD do #110 — vinculado ao Gate 1)

- [ ] `ui_kit/components/timeline/index.tsx` (React + Tailwind v4 + CVA, espelhando a referência).
- [ ] `Timeline.test.tsx` ≥ 20 testes OU ≥ 80% de cobertura no arquivo; comportamental; queries acessíveis; jest-axe light + dark.
- [ ] `Timeline.stories.tsx` Default + variantes principais em light + dark.
- [ ] `docs/src/pages/componentes/timeline.astro` + `docs/src/previews/timeline.tsx` (+ `-live` se interativo).
- [ ] Export no barrel `ui_kit/components/index.ts`.
- [ ] `Timeline` no Set `MIGRATED` de `docs/src/pages/index.astro`.
- [ ] Apenas tokens semânticos.
- [ ] `docs/adr/ADR-027-timeline-v0.1.0-dod-migration.md` (status `accepted`).
- [ ] Gate 2 verde: `typecheck && lint && test && build && docs:build`.
- [ ] Commit atômico único `feat(timeline): migrate to v0.1.0 DoD — ...`.
- [ ] PR `Closes #110` + `Closes #111`.
- [ ] **Playground / "está bom" do Fernando** — PENDENTE (gate visual humano; não fechado por Athena).

## Fora de escopo

- Refatorações não relacionadas.
- Tokens novos além do que `Timeline` estritamente precisa (todos os tons mapeiam para tokens já existentes).
- Animação de entrada / scroll-reveal (não há na referência).
