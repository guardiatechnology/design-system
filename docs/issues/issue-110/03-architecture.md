# Issue #110 — Architecture (Fase 3)

## Abordagem

`Timeline` é um componente de apresentação puro (sem estado, sem runtime async). Construído do zero (Radix-free) espelhando a referência legacy, trocando classes `.grd-tl-*` por utilities Tailwind v4 com tokens semânticos, e CVA para as variantes do marcador (tom × tamanho). Mesma família de padrões já validada no Stepper (PR #84/#262), Top-Bar (#264) e Accordion (#263).

## Componentes afetados (escopo)

| Caminho | Mudança | Tipo |
|---|---|---|
| `ui_kit/components/timeline/index.tsx` | novo — componente + CVA + tipos | runtime (UI, sem surface de servidor/evento/job) |
| `ui_kit/components/timeline/Timeline.test.tsx` | novo — testes de unidade + jest-axe | teste |
| `ui_kit/components/timeline/Timeline.stories.tsx` | novo — stories light/dark | story |
| `ui_kit/components/index.ts` | edição — `export * from "./timeline"` | barrel |
| `docs/src/pages/componentes/timeline.astro` | novo — página de docs | docs |
| `docs/src/previews/timeline.tsx` | novo — previews | docs |
| `docs/src/pages/index.astro` | edição — `"Timeline"` no Set `MIGRATED` | docs |
| `docs/adr/ADR-027-timeline-v0.1.0-dod-migration.md` | novo — ADR `accepted` | adr |

`lex-observability-required` não se aplica: nenhum novo endpoint HTTP, consumer de eventos ou job. É um componente de UI estático.

## API (espelha a referência)

```ts
type TimelineTone = "violet" | "green" | "amber" | "red" | "neutral";
type TimelineConnector = "solid" | "dashed";
type TimelineOrientation = "vertical" | "horizontal";

interface TimelineItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  timestamp?: React.ReactNode;
  icon?: TimelineIconComponent; // lucide-react-shaped
  tone?: TimelineTone;          // default "violet"
  meta?: React.ReactNode;
}

interface TimelineProps extends Omit<React.HTMLAttributes<HTMLOListElement>, "..."> {
  items: TimelineItem[];
  size?: "sm" | "md";              // default "md"
  connector?: TimelineConnector;   // default "solid"
  orientation?: TimelineOrientation; // default "vertical"
  "aria-label"?: string;           // default "Linha do tempo"
}
```

Superfície pública exportada: `Timeline` (default + named), `timelineMarkerVariants` (CVA accessor), e os tipos acima.

## Mapeamento tom → token (zero hardcode)

| Tom (ref legacy) | Token semântico DS | Marcador |
|---|---|---|
| `violet` (default) | `--primary` | `border-primary text-primary` |
| `green` | `--success` / `--success-soft` / `--success-fg` | `border-success text-success-fg bg-success-soft` |
| `amber` | `--warning` / `--warning-soft` / `--warning-fg` | `border-warning text-warning-fg bg-warning-soft` |
| `red` | `--danger` / `--danger-soft` / `--danger-fg` | `border-danger text-danger-fg bg-danger-soft` |
| `neutral` | `--border` / `--fg-muted` | `border-border text-fg-muted` |

Os `*-soft`/`*-fg` já trocam por tema (light/dark) via `:root[data-theme="dark"]` (ADR-011). Marcador `violet` e `neutral` herdam `bg-card`/`bg-surface` para o miolo do círculo, como na referência.

## Divergências da referência (justificadas — registradas no ADR-027)

1. **`orientation` (vertical default + horizontal).** O brief #110 exige vertical + horizontal; a referência é só vertical. Horizontal mantém o mesmo contrato de item, dispondo os marcadores em linha com connector horizontal. Vertical é o default, idêntico à referência.
2. **`icon` como componente vs. string global.** A referência lê `window.Icon` por `icon: string`. O DS já padronizou ícones como componentes `lucide-react`-shaped (vide Stepper `StepIconComponent`). Adotamos a mesma convenção: `icon?: TimelineIconComponent`. Visual equivalente (ícone dentro do marcador); mecanismo idiomático ao DS.
3. **Tokens semânticos vs. cores cruas.** A referência usa `--violet-500`, `--signal-green`, `--yellow-100` etc. diretamente. O DS proíbe hardcode (`lex-design-system-library`); mapeamos para o vocabulário semântico (tabela acima). Visual preservado; fonte da cor passa a ser tokenizada e brand-aware (Notion-canonical).
4. **Reforço não-cromático do tom (`lex-frontend-accessibility`).** A referência distingue tons só por cor. Adicionamos `data-tone` no marcador + `sr-only` com o nome do tom quando ≠ `violet`, e o ícone reforça o significado. Cor deixa de ser o único indicador.

Nenhuma divergência altera a API central (`items`/`size`/`connector`) nem o visual vertical padrão.

## Decisão de arquitetura (ADR)

ADR-027 (`accepted`) registra: build do zero Radix-free, fidelidade à referência, as 4 divergências acima e o mapeamento tom→token.

## Decomposição em Stacked PRs

Não aplicável. Escopo coeso de um único componente; um Plan = um PR atômico (`lex-agent-planning`). Decision Checklist de `codex-stacked-prs`: 0 sinais altos.

## Stack delegada

Implementação frontend (React/Tailwind/CVA) conduzida diretamente nesta sessão Athena seguindo o padrão estabelecido das migrações de design-system (sem delegação a Hephaestus — migração de baixa ambiguidade, padrão consolidado).
