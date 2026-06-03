import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card } from "@/components/card";

/**
 * MetricCard — card de KPI com rótulo, valor e delta comparativo.
 *
 * Uso típico na Guardia:
 *   - Dashboards de conciliação (lançamentos, % conciliado, pendências)
 *   - Métricas de agentes (horas economizadas, agentes rodando)
 *   - Indicadores financeiros (MRR, receita processada, nota média)
 *
 * Compõe o primitivo `Card` (per `lex-design-system-library`) — não reimplementa
 * a superfície. Tokens semânticos exclusivamente; zero cor hardcoded.
 *
 * API espelha `ux_references/ui_kits/components/MetricCard/` (referência legacy),
 * trocando classes `.grd-mc-*` por tokens Tailwind v4. Divergências (ícone como
 * componente, valor em `font-sans`, tom de delta em tokens `*-fg`/`*-soft`,
 * composição no `Card`, ausência de `spark`) registradas em ADR-025.
 *
 * Acessibilidade — a direção da tendência NUNCA depende só de cor:
 *   1. ícone direcional (`TrendingUp`/`TrendingDown`/`Minus`), `aria-hidden`;
 *   2. sinal textual (`+`/`-`) dentro do número formatado;
 *   3. `aria-label` no delta descrevendo a direção ("aumento de X%" / "queda de X%").
 * O KPI inteiro é um `role="group"` rotulado pelo `label`.
 *
 * Public surface: `MetricCard` (default + named export), `metricCardVariants`
 * (CVA accessor) + tipos `MetricCardProps`, `DeltaType`, `MetricCardSize`.
 */

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export type DeltaType = "up" | "down" | "neutral";
export type MetricCardSize = "sm" | "md" | "lg";

// ──────────────────────────────────────────────────────────────────
// CVA — root (size → padding)
// ──────────────────────────────────────────────────────────────────

const metricCardVariants = cva(
  ["flex flex-col gap-1.5 font-sans"].join(" "),
  {
    variants: {
      size: {
        sm: "p-4",
        md: "p-5",
        lg: "p-6",
      },
    },
    defaultVariants: { size: "md" },
  },
);

// Value font size scales with size (mirrors the legacy
// `.grd-mc-{size} .grd-mc-value` 24/30/36px rules). Uses `font-sans`
// (Poppins) — NOT `font-display` (Lastica is logo-only per lex-brand-typography).
const valueSizeClasses: Record<MetricCardSize, string> = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
};

// ──────────────────────────────────────────────────────────────────
// Helpers — delta derivation, formatting, tone tokens
// ──────────────────────────────────────────────────────────────────

/** Derives the tone from a numeric/string delta sign. `0`/`NaN` → neutral. */
export function deriveDeltaType(delta?: number | string): DeltaType {
  if (delta === undefined) return "neutral";
  const n =
    typeof delta === "number"
      ? delta
      : parseFloat(String(delta).replace(",", "."));
  if (Number.isNaN(n) || n === 0) return "neutral";
  return n > 0 ? "up" : "down";
}

/**
 * Formats a numeric delta as a signed pt-BR percentage (`+12,4%` / `-18,2%`).
 * String deltas are returned verbatim (consumer-supplied copy).
 */
function formatDelta(delta: number | string): string {
  if (typeof delta !== "number") return delta;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

/**
 * Semantic token pair per tone. Uses AAA-contrast `*-fg` over `*-soft`
 * (≥ 6.6:1) — the canonical replacement for the legacy ad-hoc
 * `color-mix(signal, black)`. Neutral uses muted surface + muted fg.
 */
function deltaToneClasses(tone: DeltaType): string {
  switch (tone) {
    case "up":
      return "bg-success-soft text-success-fg";
    case "down":
      return "bg-danger-soft text-danger-fg";
    case "neutral":
    default:
      return "bg-muted text-fg-muted";
  }
}

/** Accessible direction label so SR users hear the trend without the arrow. */
function deltaAriaLabel(tone: DeltaType, deltaText: string): string {
  switch (tone) {
    case "up":
      return `aumento de ${deltaText.replace(/^\+/, "")}`;
    case "down":
      return `queda de ${deltaText.replace(/^-/, "")}`;
    case "neutral":
    default:
      return `variação: ${deltaText}`;
  }
}

// ──────────────────────────────────────────────────────────────────
// MetricCard
// ──────────────────────────────────────────────────────────────────

export interface MetricCardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "prefix">,
    VariantProps<typeof metricCardVariants> {
  /** Small uppercase label above the value. Acts as the metric's accessible name. */
  label: React.ReactNode;
  /** Large central value (number/string node). */
  value: React.ReactNode;
  /** Prefix rendered before the value (e.g. `"R$ "`). */
  prefix?: React.ReactNode;
  /** Suffix rendered after the value (e.g. `"%"`, `" h"`). */
  suffix?: React.ReactNode;
  /**
   * Comparative delta. A **number** renders signed + `%` (pt-BR); a **string**
   * renders verbatim. Omit for metrics with no comparison.
   */
  delta?: number | string;
  /**
   * Tone override. When omitted, derived from the delta sign
   * (`>0` up, `<0` down, `0`/`NaN`/string neutral).
   */
  deltaType?: DeltaType;
  /** Supporting caption in the footer (e.g. period context). */
  caption?: React.ReactNode;
  /**
   * Decorative icon in the top-right chip. A `lucide-react`-shaped component
   * (divergence D-1 vs. legacy string + global `window.Icon`).
   */
  icon?: React.ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  /** Card scale. Default `"md"`. */
  size?: MetricCardSize;
}

const MetricCard = React.forwardRef<HTMLElement, MetricCardProps>(
  function MetricCard(
    {
      label,
      value,
      prefix,
      suffix,
      delta,
      deltaType,
      caption,
      icon: Icon,
      size = "md",
      className,
      ...rest
    },
    ref,
  ) {
    const labelId = React.useId();
    const tone = deltaType ?? deriveDeltaType(delta);
    const hasDelta = delta !== undefined;
    const deltaText = hasDelta ? formatDelta(delta) : null;

    const TrendIcon =
      tone === "up" ? TrendingUp : tone === "down" ? TrendingDown : Minus;

    const iconSize = size === "lg" ? "size-[18px]" : "size-4";

    return (
      <Card
        ref={ref}
        // WHY: root is a <div> (not <article>) so the explicit role="group" is
        // ARIA-valid — an <article> exposes role=article and does not allow a
        // conflicting role=group (axe aria-allowed-role). The Card surface
        // tokens are unchanged; only the host element differs.
        as="div"
        padding="none"
        // role=group + aria-labelledby makes the KPI announce as one labelled unit.
        role="group"
        aria-labelledby={labelId}
        data-slot="metric-card"
        data-size={size}
        className={cn(metricCardVariants({ size }), className)}
        {...rest}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            id={labelId}
            data-slot="metric-card-label"
            className="text-xs font-semibold uppercase tracking-wide text-fg-muted"
          >
            {label}
          </span>
          {Icon ? (
            <span
              data-slot="metric-card-icon"
              aria-hidden="true"
              className={cn(
                "inline-flex items-center justify-center rounded-lg",
                "bg-accent/10 text-accent",
                size === "lg" ? "size-9" : "size-8",
              )}
            >
              <Icon aria-hidden="true" className={iconSize} />
            </span>
          ) : null}
        </div>

        <div
          data-slot="metric-card-value"
          className={cn(
            "flex items-baseline gap-1 font-semibold leading-tight text-fg",
            "[font-feature-settings:'tnum'] tabular-nums",
            valueSizeClasses[size],
          )}
        >
          {prefix ? (
            <span className="text-[0.6em] font-medium text-fg-muted">
              {prefix}
            </span>
          ) : null}
          <span data-slot="metric-card-number">{value}</span>
          {suffix ? (
            <span className="text-[0.6em] font-medium text-fg-muted">
              {suffix}
            </span>
          ) : null}
        </div>

        {deltaText || caption ? (
          <div
            data-slot="metric-card-footer"
            className="mt-0.5 flex flex-wrap items-center gap-2"
          >
            {deltaText ? (
              <span
                data-slot="metric-card-delta"
                data-tone={tone}
                aria-label={deltaAriaLabel(tone, deltaText)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5",
                  "text-xs font-semibold [font-feature-settings:'tnum'] tabular-nums",
                  deltaToneClasses(tone),
                )}
              >
                <TrendIcon aria-hidden="true" className="size-3" />
                {deltaText}
              </span>
            ) : null}
            {caption ? (
              <span
                data-slot="metric-card-caption"
                className="text-xs text-fg-muted"
              >
                {caption}
              </span>
            ) : null}
          </div>
        ) : null}
      </Card>
    );
  },
);
MetricCard.displayName = "MetricCard";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { MetricCard, metricCardVariants };
export default MetricCard;
