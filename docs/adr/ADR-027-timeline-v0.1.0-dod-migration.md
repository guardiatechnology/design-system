# ADR-027 — Migrate Timeline to v0.1.0 DoD (Data & content / chronological event list)

- **Status:** accepted
- **Date:** 2026-06-02
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-011 (Alert — danger/success/warning/info token chain), ADR-013 (ConfidenceIndicator — Radix-free CVA recipe), ADR-020 (Stepper — prop-driven `<ol>` recipe, lucide-shaped icons, token contract)
- **Issue:** [#110](https://github.com/guardiatechnology/design-system/issues/110)
- **Plan:** [#111](https://github.com/guardiatechnology/design-system/issues/111)

## Context

`Timeline` é o componente canônico de **histórico cronológico de eventos** no catálogo Data & content do `@guardia/design-system` v0.1.0. Hoje existe apenas no bundle legacy (`ux_references/ui_kits/components/Timeline/`) como CSS-prefixed (`.grd-tl-*`) sobre um `(window as any).Icon` global; o nome aparece em `docs/src/pages/index.astro` como placeholder de navegação (slug `timeline`, sem página). A migração v0.1.0 DoD constrói o componente do zero (não há baseline shadcn ou outra primitiva) e precisa cravar as decisões arquiteturais antes do código:

1. **Base primitive** — Radix vs primitiva própria.
2. **Modelo de API** — prop-driven (`items` array) vs composição declarativa.
3. **Orientação** — a referência é só vertical, mas o #110 exige vertical + horizontal.
4. **Mecanismo de ícone** — string + global vs componente `lucide-react`-shaped.
5. **Mapeamento tom → token** e como a cor deixa de ser o único indicador de estado.

`Timeline` é primitiva de produto Guardia: trilha de auditoria de fechamento ("extrato importado → aprovados → marcados → revisado → conciliado"), histórico de erros/retry, atividade de agente/usuário. As decisões aqui propagam para todo histórico temporal do produto.

## Decision

Construir `Timeline` v0.1.0 DoD seguindo o recipe **ConfidenceIndicator (ADR-013) + Stepper (ADR-020)** — componente Radix-free com CVA + tokens semânticos:

1. **Base primitive — nenhuma (Radix-free).** Não existe `@radix-ui/react-timeline`; a estrutura canônica de uma timeline é uma `<ol>` cronológica de `<li>`. Construímos `<ol role="list" aria-label="Linha do tempo">` + `<li>` por evento. Zero nova dependência (`lucide-react` já é dep).

2. **API prop-driven (espelhando a referência legacy):**
   ```tsx
   <Timeline
     items={[
       { id: "1", tone: "violet", icon: UploadCloud, title: "Extrato Itaú importado",
         description: "237 lançamentos via OFX", timestamp: "hoje · 09:12" },
       { id: "2", tone: "green", title: "248 aprovados", meta: <Badge tone="success" variant="soft">Automático</Badge> },
     ]}
     size="md" | "sm"
     connector="solid" | "dashed"
     orientation="vertical" | "horizontal"
   />
   ```
   - **Rejeita composição filho-a-filho** (`<Timeline><TimelineItem>...`). A referência legacy é prop-driven; eventos são homogêneos (sempre marker + body). Mesma decisão de ADR-020 cláusula 2.
   - Tipo `TimelineItem` exposto publicamente.

3. **Orientação — `vertical` (default) + `horizontal` (DIVERGÊNCIA da referência, exigida pelo #110).** A referência é só vertical. Vertical é idêntico à referência (marker à esquerda, connector descendo). Horizontal mantém o mesmo contrato de item, dispondo os marcadores numa linha com connector horizontal entre eles. Justificativa: o brief #110 ("Vertical + horizontal; events + states") torna `orientation` requisito explícito. O contrato de `items`/`size`/`connector`/tons permanece idêntico entre orientações.

4. **Ícone como componente `lucide-react`-shaped (DIVERGÊNCIA de mecanismo).** A referência lê `(window as any).Icon` via `icon: string`. O DS já padronizou ícones como componentes (vide `StepIconComponent` em ADR-020). Adotamos `icon?: TimelineIconComponent`. Visual equivalente (ícone dentro do marker); sem `icon`, marker mostra dot decorativo — exatamente como a referência. Mecanismo idiomático ao DS, sem global polyfill.

5. **5 tons mapeados para tokens semânticos (DIVERGÊNCIA de cor crua → token):**
   | Tom (ref legacy) | Token DS | Marcador |
   |---|---|---|
   | `violet` (default) | `--primary` (Notion CTA chain) | `border-primary text-primary bg-card` |
   | `green` | `--success*` (ADR-011) | `border-success text-success-fg bg-success-soft` |
   | `amber` | `--warning*` (ADR-011) | `border-warning text-warning-fg bg-warning-soft` |
   | `red` | `--danger*` (ADR-011) | `border-danger text-danger-fg bg-danger-soft` |
   | `neutral` | `--border` / `--fg-muted` | `border-border text-fg-muted bg-card` |

   A referência usa `--violet-500`, `--signal-green`, `--yellow-100`, `--danger-soft`, `--gray-400` diretamente. O DS proíbe hardcode (`lex-design-system-library`); mapeamos para o vocabulário semântico. `--primary` é Notion-canonical (violet 500 light, warm-orange 500 dark — `lex-brand-colors`). `--success/warning/danger/info*` herdam ADR-011 (soft+fg trocam por tema). **Zero expansão de token.**

6. **Cor nunca é o único indicador (`lex-frontend-accessibility` Regra 5.4).** A referência distingue tons só por cor. Adicionamos: (a) `data-tone={tone}` no marcador (gancho determinístico, não-cromático); (b) um rótulo `sr-only` com o nome do tom quando ≠ `violet` (ex.: "sucesso", "atenção", "erro", "neutro"), anunciado ao screen reader antes do título; (c) o `icon` reforça o significado quando fornecido (a referência sempre usa ícone por tom). O título do evento permanece a label primária.

7. **ARIA / estrutura.**
   - `<ol role="list" aria-label="Linha do tempo">` (override via `aria-label`).
   - Marker é decorativo: `aria-hidden="true"` no dot/ícone. O título é o conteúdo real.
   - `timestamp` em `[font-feature-settings:'tnum'] tabular-nums` para alinhamento de dígitos.
   - `meta` renderizado abaixo do body (slot para Badge/ações), idêntico à referência.

8. **Connector strategy (espelha a referência + estende para horizontal).**
   - **Vertical solid:** `::before` absoluto no centro horizontal do marker, descendo do fim do marker até o próximo (`top-[marker] bottom-0 left-[half-marker] w-px bg-border`). Último item sem connector.
   - **Vertical dashed:** mesma posição, `border-l border-dashed border-border` (linha tracejada).
   - **Horizontal solid/dashed:** connector entre marker atual e próximo, centrado verticalmente na linha do marker (`top-[half-marker] left/right h-px`).
   - Connector é sempre `--border` (neutro) — diferente do Stepper, a Timeline é um histórico de eventos concluídos, não uma cadeia de progresso; não há "trailing colored". Espelha a referência (`background: var(--border)`).

9. **Tamanhos.** `size="md"` (default, marker 22px) e `size="sm"` (marker 16px), espelhando a referência (`.grd-tl-sm`). Afeta marker, dot, fontes e offsets de connector.

10. **a11y coverage (`axeInThemes`)** sobre ≥ 3 cenários × 2 temas = ≥ 6 invocações jest-axe explícitas em `Timeline.test.tsx`: (a) vertical multi-tom padrão; (b) horizontal; (c) dashed + sm + tom red. Garante WCAG AA em light + dark.

11. **ADR `accepted` desde o primeiro commit.** Commit atômico carrega código + ADR + docs juntos (sem pattern `proposed → accepted`, conforme ADR-014 cláusula 9 / sinal de Argos em #237).

## Consequences

### Positive

- Timeline alcança paridade DoD com Stepper / Alert / Chart (mesmo recipe Tailwind+CVA, mesmo token contract, mesmo rigor de teste).
- Reutilização integral de tokens existentes (`--primary` Notion + `--success/warning/danger*` ADR-011) — zero expansão de token.
- API espelha a referência legacy — onboarding de consumidores conhecidos é zero-friction.
- `orientation="horizontal"` cobre casos que a referência não tinha (ex.: timeline compacta em header), satisfazendo o #110.
- Categoria Data & content avança 1 componente em direção ao 52 do v0.1.0.

### Negative

- **API prop-driven não permite render heterogêneo por evento** além do slot `meta`. Mitigação: `meta?: React.ReactNode` cobre badges/ações inline (idêntico à referência).
- Connector via Tailwind arbitrary properties tem variantes por orientação × size × solid/dashed (~6 combinações de class strings). Mitigação: cobertura visual via Storybook stories light/dark + playground humano.
- **`orientation="horizontal"` diverge da referência** (que é só vertical). Mitigação: vertical é o default e é byte-equivalente à referência; horizontal é aditivo e documentado aqui + nas stories. O gate visual humano (Fernando) valida a fidelidade do vertical.

### Neutral

- 6 arquivos novos (`index.tsx`, `Timeline.test.tsx`, `Timeline.stories.tsx`, `timeline.astro`, `timeline.tsx` preview, `ADR-027.md`) + 2 modificados (barrel, MIGRATED set).
- Timeline reusa o helper `axeInThemes` (Tech Task #125) e o padrão de previews/docs de Stepper/Top-Bar.

## Alternatives considered

1. **Composição `<Timeline><TimelineItem tone="green">...</TimelineItem></Timeline>`.** Rejeitado — quebra paridade com a referência prop-driven e oferece zero ganho para eventos homogêneos. Adicionaria 3+ símbolos ao surface público sem necessidade.

2. **Manter `icon: string` + um registry global de ícones.** Rejeitado — exige polyfill global (`window.Icon`) inaceitável num pacote npm; diverge do padrão DS já cravado em ADR-020 (componente lucide-shaped).

3. **Apenas vertical (ignorar horizontal).** Rejeitado — o #110 exige explicitamente vertical + horizontal. Cortar horizontal seria escopo mais estreito que o DoD vinculado ao Gate 1.

4. **Connector colorido por tom do evento (como o trailing do Stepper).** Rejeitado — Timeline é histórico, não progresso em cadeia; a referência usa connector neutro (`--border`). Colorir o connector por tom criaria ruído visual e divergiria da referência. O tom vive no marcador.

5. **Distinguir tom só por cor (como a referência).** Rejeitado — viola `lex-frontend-accessibility` Regra 5.4. Adicionamos `data-tone` + `sr-only` + ícone como reforços não-cromáticos.

6. **Expor `tone` mapeado para nomes de token (`tone="success"`) em vez dos nomes da referência (`tone="green"`).** Rejeitado — a referência usa `violet/green/amber/red/neutral`; mudar os nomes da prop quebra paridade cognitiva com o playground. O mapeamento para tokens é interno.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. Radix-free `<ol>` base | AC-4, AC-5 |
| 2. Prop-driven API + TimelineItem type | AC-1, AC-2, AC-3 |
| 3. Orientation vertical + horizontal | AC-6, AC-7 |
| 4. lucide-shaped icon + dot fallback | AC-12 |
| 5. 5 tones → semantic tokens | AC-13..AC-17, AC-22 |
| 6. Color is not the only indicator | AC-21 |
| 7. ARIA / structure / timestamp / meta | AC-4, AC-8..AC-11 |
| 8. Connector strategy (solid/dashed) | AC-18, AC-19 |
| 9. Sizes md/sm | AC-20 |
| 10. axeInThemes ≥ 3 scenarios | AC-23, AC-24, AC-25 |
| 11. Accepted at first commit | (commit atômico) |
