# ADR-026 — Migrate Progress to v0.1.0 DoD (Data & content / progress indicator)

- **Status:** accepted
- **Date:** 2026-06-02
- **Deciders:** @fernandoseguim (CODEOWNER), `warrior-athena` (Issue-Driven flow orchestrator)
- **Precedents:** ADR-011 (Alert — danger token chain), ADR-013 (ConfidenceIndicator — Radix-free CVA recipe), ADR-020 (Stepper — Radix-free progress indicator + accepted-at-first-commit)
- **Issue:** [#106](https://github.com/guardiatechnology/design-system/issues/106)
- **Plan:** [#107](https://github.com/guardiatechnology/design-system/issues/107)

## Context

`Progress` é o indicador canônico de **progresso contínuo** (barra) no catálogo Data & content do `@guardia/design-system` v0.1.0. Aparece em `docs/src/pages/index.astro` como placeholder (slug `progress`, sem página). O baseline canônico vive em `ux_references/ui_kits/components/Progress/` como CSS-prefixed (`.grd-pg-*`) sobre raw tokens (`--violet-500`, `--signal-*`, `--gray-200`). A construção v0.1.0 DoD do zero crava decisões antes do código:

1. **Base primitive** — Radix UI vs primitiva própria.
2. **Modelo de API** — prop-driven (espelha referência) vs composição.
3. **Variantes + estados** suportados e mapeamento ARIA.
4. **Token contract** — qual chain alimenta fill, track, readout por tone.
5. **Comportamento de animação** — indeterminate slide + circular spin.

`Progress` é primitiva de produto (upload/parse/match no Copilot Isac, barra de conciliação, indicadores de processamento longo). Determinate + indeterminate × linear + circular cobrem o espectro de feedback de progresso contínuo (o discreto multi-step é do `Stepper`, ADR-020).

## Decision

Construir `Progress` v0.1.0 DoD seguindo o recipe **Stepper (ADR-020) + ConfidenceIndicator (ADR-013)** — componente Radix-free com CVA + tokens semânticos:

1. **Base primitive — nenhuma (Radix-free), por instrução.** Não usar `@radix-ui/react-progress`. A barra é uma `<div role="progressbar">` com `aria-value*`; o circular é um SVG com dois `<circle>`. Zero nova dependência.

2. **API prop-driven (espelhando a referência legacy):**
   ```tsx
   <Progress
     value={60}
     max={100}
     variant="linear" | "circular"
     tone="violet" | "green" | "amber" | "red"
     size="sm" | "md" | "lg"
     label="Conciliando lançamentos"
     showValue
     indeterminate={false}
   />
   ```
   - Rejeita composição filho-a-filho — `Progress` tem uma superfície homogênea (track + fill / ring + arc), sem heterogeneidade que justifique slots.
   - Tipos `ProgressProps`, `ProgressVariant`, `ProgressTone`, `ProgressSize` + CVA accessor `progressFillVariants` expostos publicamente.

3. **Variantes × estados.**
   - `variant="linear"` (default) — track horizontal + fill com `width: {pct}%`; altura 4/6/10px (sm/md/lg).
   - `variant="circular"` — SVG com ring de fundo + arco; diâmetro 36/48/64px, stroke 3/4/5px; `stroke-dasharray` reflete o pct; arco gira -90° (12 horas como ponto de partida).
   - **Determinate** — `value`/`max` → pct clampado 0–100.
   - **Indeterminate** — animação contínua; sem readout numérico; sem `aria-valuenow`.

4. **ARIA mapping explícito:**
   - Determinate (linear + circular): `role="progressbar"` + `aria-valuenow={round(pct)}` + `aria-valuemin={0}` + `aria-valuemax={100}`.
   - Indeterminate: `role="progressbar"` + min/max apenas; `aria-valuenow` omitido (sinaliza "busy, completion desconhecido").
   - `label` renderizado como texto visível + linkado via `aria-labelledby` (id gerado) — a barra fica nomeada para screen readers.
   - SVG/markers internos `aria-hidden` — o anúncio vem do role + valuenow.

5. **Token contract — semantic tokens only (Notion-canonical + ADR-011 reuse):**
   | Tone | Fill (linear) / Arc (circular) | Track / Ring de fundo | Readout |
   |---|---|---|---|
   | `violet` (default) | `bg-primary` / `text-primary` | `bg-muted` / `text-muted` | `text-fg` / `text-fg-muted` |
   | `green` | `bg-success` / `text-success` | idem | idem |
   | `amber` | `bg-warning` / `text-warning` | idem | idem |
   | `red` | `bg-danger` / `text-danger` | idem | idem |

   `--primary` é Notion-canonical CTA chain (violet 500 light / warm-orange 500 dark). `--success`/`--warning`/`--danger` herdam o chain de signal tokens com paridade dark via `:root[data-theme="dark"]` (ADR-011). **Zero expansão de token, zero hardcode.**

6. **Animação com guarda de motion.** Indeterminate linear usa um gradiente deslizante (`motion-safe:animate-[...]`); circular indeterminate gira (`motion-safe:animate-spin`). Guardas `motion-safe:` respeitam `prefers-reduced-motion` (precedente Spinner). Transição determinate de 280ms `ease` no fill/arco, igual à referência.

7. **ADR `accepted` desde o primeiro commit.** Commit atômico carrega código + ADR + docs juntos. Sem pattern `proposed → accepted` (Argos sinalizou 🟡 esse pattern; confirmado em ADR-020 cláusula 10).

## Divergences from the reference (justified — required by `lex-issue-driven` Rule 4)

1. **`role="progressbar"` + `aria-value*` no circular.** A referência só põe ARIA no track linear; o circular fica sem role. v0.1.0 DoD + `lex-frontend-accessibility` exigem anúncio de estado dinâmico — circular determinate agora carrega o mesmo contrato ARIA do linear. **Justificativa:** lei de acessibilidade; zero mudança visual.
2. **`motion-safe:` nas animações.** A referência anima incondicionalmente; aplicamos guarda `motion-safe:` por `lex-frontend-accessibility` + precedente Spinner. **Justificativa:** compliance reduced-motion; visual idêntico para quem não tem a preferência.
3. **Tokens semânticos substituem `.grd-pg-*` global + raw `--violet-500`/`--signal-*`/`--gray-200`.** Por `lex-design-system-library` + `lex-brand-colors` (zero hardcode). **Justificativa:** obrigatório; tokens dão paridade dark automática.
4. **`value` opcional (default 0).** A referência tipava `value` como obrigatório; tornamos opcional para `indeterminate` ser usado sem valor sem sentido. **Justificativa:** ergonomia; indeterminate não tem valor.
5. **`label` linkado via `aria-labelledby`.** A referência renderiza o label como texto solto sem associação ARIA. **Justificativa:** nomear a progressbar para screen readers (`lex-frontend-accessibility` Rule 4/6).

Todas as demais props, variantes, sizes, tones e proporções visuais (alturas de track 4/6/10px; diâmetros circulares 36/48/64px com stroke 3/4/5px; raio pill; transição 280ms) espelham a referência 1:1.

## Brand alignment (Notion source of truth)

Os fills de progresso são indicadores UI não-textuais (WCAG 1.4.11 non-text contrast, 3:1) extraídos da paleta aprovada via tokens. O readout numérico e o label usam `--fg`/`--fg-muted` (AAA). O tone `amber` mapeia para `--warning` (Signal Yellow) usado **apenas como barra de preenchimento** — nunca como texto sobre branco — então a combinação proibida Yellow-500-sobre-branco-texto de `lex-brand-colors` não é acionada. Sem divergência de paleta contra Notion; espelho local de tokens já atualizado.

## Consequences

### Positive

- Progress alcança paridade DoD com Stepper / Spinner / Skeleton / Toast / Alert (mesmo recipe Tailwind+CVA, mesmo token contract, mesmo rigor de teste).
- Reutilização integral de tokens existentes (`--primary` Notion-canonical + `--success`/`--warning`/`--danger`) — zero expansão.
- API espelha referência legacy — onboarding de consumidores conhecidos é zero-friction.
- Zero nova dependência — Radix-free como instruído.
- Categoria Data & content avança 1 componente rumo aos 52 do v0.1.0.

### Negative

- Os offsets geométricos do circular (diâmetro/stroke/raio por size) são 3 conjuntos de constantes calculadas em runtime. Custo: ~10 linhas de aritmética; mitigação: cobertura visual via Storybook + previews.
- Indeterminate linear usa um keyframe utilitário inline (`animate-[...]`); mitigação: idêntico ao padrão Spinner já em uso.

### Neutral

- 7 arquivos novos (`index.tsx`, `Progress.test.tsx`, `Progress.stories.tsx`, `progress.astro`, `progress.tsx` preview, `ADR-026.md`, phase artifacts) + 2 modificados (barrel, MIGRATED set).

## Alternatives considered

1. **`@radix-ui/react-progress` como base.** Rejeitado — instrução explícita Radix-free; Radix Progress cobre só o linear determinate (sem circular, sem indeterminate animado nativo); forçá-lo adicionaria dependência sem cobrir o escopo.
2. **Elemento `<progress>` HTML5 nativo.** Rejeitado — styling cross-browser de `<progress>` é frágil (pseudo-elementos `::-webkit-progress-*` vs `::-moz-progress-bar`); não modela circular nem o gradiente indeterminate; tokens não aplicam de forma consistente.
3. **`tone` como prop CSS custom em vez de variantes CVA.** Rejeitado — CVA dá type-safety + acessor público testável (`progressFillVariants`), alinhado ao recipe Stepper/ConfidenceIndicator.
4. **Manter o `value` obrigatório da referência.** Rejeitado — força um `value={0}` sem sentido em todo uso indeterminate; opcional com default 0 é mais ergonômico e não muda o comportamento determinate.

## Implementation note (acceptance criteria mapping)

| ADR clause | Plan AC |
|------------|---------|
| 1. Radix-free base | AC-1 (surface), AC-2 (displayName) |
| 2. Prop-driven API + tipos | AC-1, AC-10 |
| 3. Variantes × estados | AC-3, AC-4, AC-6, AC-7, AC-9 |
| 4. ARIA mapping | AC-5, AC-6, AC-10, AC-11 |
| 5. Token contract semantic-only | AC-8 |
| 6. Motion-safe animations | AC-6, AC-13 |
| 7. Accepted at first commit | AC-16 |
| Divergences justified | AC-16 (recorded here) |
