"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Progress — indicador de progresso contínuo, linear ou circular.
 *
 * Uso típico na Guardia:
 *   - Upload / parse / match de lançamentos no Copilot Isac
 *   - Barra de progresso de conciliação em lote
 *   - Processamentos longos com percentual conhecido (determinate)
 *   - Aguardando resposta de duração desconhecida (indeterminate)
 *
 * Variantes: `linear` (default) · `circular`.
 * Estados: determinate (com `value`) · `indeterminate`.
 * Tons: `violet` (default) · `green` · `amber` · `red`.
 * Tamanhos: `sm` · `md` (default) · `lg`.
 *
 * API espelha `ux_references/ui_kits/components/Progress/` (referência legacy),
 * trocando as classes prefixadas `.grd-pg-*` + raw tokens por tokens semânticos
 * Tailwind v4. Decisões e divergências registradas em
 * `docs/adr/ADR-026-progress-v0.1.0-dod-migration.md`.
 *
 * Para progresso discreto multi-etapa use `<Stepper>` (ADR-020); para loading
 * pontual inline use `<Spinner>`.
 *
 * Public surface: `Progress` (default + named export), `progressFillVariants`
 * (CVA accessor) + tipos `ProgressProps`, `ProgressVariant`, `ProgressTone`,
 * `ProgressSize`.
 */

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export type ProgressVariant = "linear" | "circular";
export type ProgressTone = "violet" | "green" | "amber" | "red";
export type ProgressSize = "sm" | "md" | "lg";

// ──────────────────────────────────────────────────────────────────
// CVA — fill / arc color per tone (semantic tokens only)
// ──────────────────────────────────────────────────────────────────

/**
 * Resolves the fill (linear) / arc (circular) color from semantic tokens.
 * `violet` → `--primary` (Notion-canonical CTA chain); the signal tones map
 * to `--success` / `--warning` / `--danger` (ADR-011 chain, dark parity
 * inherited). Zero hardcoded color values.
 */
const progressFillVariants = cva("", {
  variants: {
    tone: {
      violet: "bg-primary",
      green: "bg-success",
      amber: "bg-warning",
      red: "bg-danger",
    },
  },
  defaultVariants: { tone: "violet" },
});

const arcToneClass: Record<ProgressTone, string> = {
  violet: "text-primary",
  green: "text-success",
  amber: "text-warning",
  red: "text-danger",
};

// ──────────────────────────────────────────────────────────────────
// Geometry — sizes
// ──────────────────────────────────────────────────────────────────

const LINEAR_TRACK_HEIGHT: Record<ProgressSize, string> = {
  sm: "h-1", // 4px
  md: "h-1.5", // 6px
  lg: "h-2.5", // 10px
};

const CIRCULAR_GEOMETRY: Record<ProgressSize, { size: number; stroke: number }> = {
  sm: { size: 36, stroke: 3 },
  md: { size: 48, stroke: 4 },
  lg: { size: 64, stroke: 5 },
};

let progressIdCounter = 0;

// ──────────────────────────────────────────────────────────────────
// Props
// ──────────────────────────────────────────────────────────────────

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof progressFillVariants> {
  /** Current value (0..max). Ignored when `indeterminate`. Default `0`. */
  value?: number;
  /** Upper bound of `value`. Default `100`. */
  max?: number;
  /** Layout variant. Default `"linear"`. */
  variant?: ProgressVariant;
  /** Fill color. Default `"violet"`. */
  tone?: ProgressTone;
  /** Track height (linear) / diameter + stroke (circular). Default `"md"`. */
  size?: ProgressSize;
  /** Optional accessible label rendered next to / inside the bar. */
  label?: React.ReactNode;
  /** Render the rounded percentage readout. Suppressed when `indeterminate`. */
  showValue?: boolean;
  /** Continuous, unknown-completion state. Omits `aria-valuenow`. */
  indeterminate?: boolean;
}

// ──────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(function Progress(
  {
    value = 0,
    max = 100,
    variant = "linear",
    tone = "violet",
    size = "md",
    label,
    showValue = false,
    indeterminate = false,
    className,
    ...rest
  },
  ref,
) {
  // Clamp to 0..100. A non-positive `max` falls back to 100 to avoid /0.
  const safeMax = max > 0 ? max : 100;
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  const rounded = Math.round(pct);

  // Stable label id so `aria-labelledby` wires the bar to its visible label.
  const labelId = React.useMemo(
    () => (label != null ? `progress-label-${(progressIdCounter += 1)}` : undefined),
    [label],
  );

  const ariaProps = {
    role: "progressbar" as const,
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    ...(indeterminate ? {} : { "aria-valuenow": rounded }),
    // Every progressbar needs an accessible name (axe `aria-progressbar-name`).
    // A visible label wires via `aria-labelledby`; otherwise fall back to a
    // sensible default that a consumer-supplied `aria-label` (spread through
    // `...rest`) still overrides.
    ...(labelId ? { "aria-labelledby": labelId } : { "aria-label": "Progresso" }),
  };

  // ── Circular ─────────────────────────────────────────────────────
  if (variant === "circular") {
    const { size: dim, stroke } = CIRCULAR_GEOMETRY[size];
    const radius = (dim - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    // Indeterminate draws a quarter-arc that spins; determinate maps pct→arc.
    const dash = indeterminate ? circumference * 0.25 : (pct / 100) * circumference;

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center font-sans", className)}
        {...ariaProps}
        {...rest}
      >
        {label != null ? (
          <span id={labelId} className="sr-only">
            {label}
          </span>
        ) : null}
        <svg
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          aria-hidden="true"
          className={cn(indeterminate && "motion-safe:animate-spin")}
        >
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            className={cn(
              arcToneClass[tone],
              "origin-center -rotate-90",
              !indeterminate && "motion-safe:transition-[stroke-dasharray] motion-safe:duration-300 motion-safe:ease-out",
            )}
          />
        </svg>
        {showValue && !indeterminate ? (
          <span
            className={cn(
              "absolute inset-0 inline-flex items-center justify-center",
              "text-[11px] font-bold text-fg [font-feature-settings:'tnum'] tabular-nums",
            )}
            aria-hidden="true"
          >
            {rounded}%
          </span>
        ) : null}
      </div>
    );
  }

  // ── Linear ───────────────────────────────────────────────────────
  return (
    <div
      ref={ref}
      className={cn("flex w-full flex-col gap-1.5 font-sans", className)}
      {...rest}
    >
      {label != null || (showValue && !indeterminate) ? (
        <div className="flex items-center justify-between gap-2 text-xs">
          {label != null ? (
            <span id={labelId} className="font-medium text-fg">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue && !indeterminate ? (
            <span className="font-semibold text-fg-muted [font-feature-settings:'tnum'] tabular-nums">
              {rounded}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        className={cn("w-full overflow-hidden rounded-full bg-muted", LINEAR_TRACK_HEIGHT[size])}
        {...ariaProps}
      >
        {indeterminate ? (
          <div
            className={cn(
              "h-full w-2/5 rounded-full",
              progressFillVariants({ tone }),
              "motion-safe:animate-progress-indeterminate",
            )}
          />
        ) : (
          <div
            className={cn(
              "h-full rounded-full",
              progressFillVariants({ tone }),
              "motion-safe:transition-[width] motion-safe:duration-300 motion-safe:ease-out",
            )}
            style={{ width: `${pct}%` }}
          />
        )}
      </div>
    </div>
  );
});
Progress.displayName = "Progress";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { Progress, progressFillVariants };
export type { VariantProps };
export default Progress;
