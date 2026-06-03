"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Timeline — linha do tempo de eventos cronológicos.
 *
 * Uso típico na Guardia:
 *   - Trilha de auditoria de um fechamento (extrato importado → aprovados →
 *     marcados para revisão → revisado por humano → conciliação concluída)
 *   - Histórico de erro/retry (falha de sync → reprocessamento → restabelecido)
 *   - Atividade de agente/usuário com ator, ação e horário
 *
 * Cada evento traz marcador (ícone ou dot), título, descrição, timestamp,
 * slot `meta` (Badge/ações) e um tom: `violet` (default) · `green` · `amber`
 * · `red` · `neutral`.
 *
 * Orientação: `vertical` (default) · `horizontal`.
 * Tamanhos: `md` (default) · `sm`.
 * Connector: `solid` (default) · `dashed`.
 *
 * API espelha `ux_references/ui_kits/components/Timeline/` (referência legacy),
 * trocando classes prefixadas `.grd-tl-*` por tokens semânticos Tailwind v4.
 * Divergências (orientação horizontal, ícone como componente, tokens
 * semânticos, reforço não-cromático do tom) registradas em
 * `docs/adr/ADR-027-timeline-v0.1.0-dod-migration.md`.
 *
 * Public surface: `Timeline` (default export), `timelineMarkerVariants` (CVA
 * accessor) + tipos `TimelineItem`, `TimelineTone`, `TimelineConnector`,
 * `TimelineOrientation`.
 */

// ──────────────────────────────────────────────────────────────────
// Types — TimelineItem + variants
// ──────────────────────────────────────────────────────────────────

export type TimelineTone = "violet" | "green" | "amber" | "red" | "neutral";
export type TimelineConnector = "solid" | "dashed";
export type TimelineOrientation = "vertical" | "horizontal";
export type TimelineSize = "sm" | "md";

/**
 * Component shape for an event icon. Accepts any `lucide-react`-shaped
 * component (`(props: { className?, ... }) => ReactElement`). Render
 * happens inside the marker; consumer controls the icon family.
 */
export type TimelineIconComponent = React.ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface TimelineItem {
  /** Stable id used as React key. */
  id: string;
  /** Headline of the event — the primary accessible label. */
  title: React.ReactNode;
  /** Optional supporting copy below the title. */
  description?: React.ReactNode;
  /** Optional timestamp, rendered to the side (tabular-nums). */
  timestamp?: React.ReactNode;
  /** Icon shown inside the marker; falls back to a decorative dot. */
  icon?: TimelineIconComponent;
  /** Tone of the marker. Default `"violet"`. */
  tone?: TimelineTone;
  /** Optional node rendered below the body — Badge, actions, etc. */
  meta?: React.ReactNode;
}

// ──────────────────────────────────────────────────────────────────
// CVA — marker variants (tone × size)
//
// Tones map to semantic token chains only (no hex, no oklch, no raw
// Tailwind palette). `violet → --primary`, `green → --success*`,
// `amber → --warning*`, `red → --danger*`, `neutral → --border/--fg-muted`.
// `*-soft`/`*-fg` swap per theme (ADR-011); `--primary` is Notion-canonical.
// ──────────────────────────────────────────────────────────────────

const timelineMarkerVariants = cva(
  [
    "relative z-10 inline-flex shrink-0 items-center justify-center rounded-full",
    "border-2 bg-card",
    "transition-[background-color,border-color,color] duration-150",
  ].join(" "),
  {
    variants: {
      tone: {
        violet: "border-primary text-primary",
        green: "border-success bg-success-soft text-success-fg",
        amber: "border-warning bg-warning-soft text-warning-fg",
        red: "border-danger bg-danger-soft text-danger-fg",
        neutral: "border-border text-fg-muted",
      },
      size: {
        sm: "size-4",
        md: "size-[22px]",
      },
    },
    defaultVariants: { tone: "violet", size: "md" },
  },
);

// ──────────────────────────────────────────────────────────────────
// Helpers — accessible tone label + connector classes
// ──────────────────────────────────────────────────────────────────

/**
 * Non-chromatic, screen-reader-only label for the tone. `violet` is the
 * neutral default and carries no extra semantics, so it is unlabeled.
 * Pairing the tone with this text (and an icon when present) keeps color
 * from being the only state indicator (`lex-frontend-accessibility` 5.4).
 */
const TONE_LABEL: Record<Exclude<TimelineTone, "violet">, string> = {
  green: "sucesso",
  amber: "atenção",
  red: "erro",
  neutral: "neutro",
};

function toneLabel(tone: TimelineTone): string | null {
  return tone === "violet" ? null : TONE_LABEL[tone];
}

/** Dot diameter inside the marker per size. */
function dotClass(size: TimelineSize): string {
  return size === "sm" ? "size-1.5" : "size-2";
}

/** Icon size inside the marker per size. */
function iconClass(size: TimelineSize): string {
  return size === "sm" ? "size-2.5" : "size-3";
}

/**
 * Connector classes for a non-last item, resolved per orientation × size ×
 * connector style. The connector is the `::after` pseudo-element spanning
 * from this marker toward the next one. Color is always neutral (`--border`)
 * — Timeline is a record of events, not a progress chain (ADR-027 § 8).
 */
function connectorClasses(
  orientation: TimelineOrientation,
  size: TimelineSize,
  connector: TimelineConnector,
): string {
  const dashed = connector === "dashed";

  if (orientation === "vertical") {
    // Vertical: line at the marker's horizontal center, from just below the
    // marker down to the next item. Marker half-width: 11px (md) / 8px (sm).
    const left = size === "sm" ? "after:left-[7px]" : "after:left-[10px]";
    const top = size === "sm" ? "after:top-4" : "after:top-[22px]";
    if (dashed) {
      return cn(
        'after:content-[""] after:absolute after:z-0',
        top,
        "after:bottom-0",
        left,
        "after:w-0 after:border-l-2 after:border-dashed after:border-border",
      );
    }
    return cn(
      'after:content-[""] after:absolute after:z-0',
      top,
      "after:bottom-0",
      left,
      "after:w-0.5 after:bg-border",
    );
  }

  // Horizontal: line at the marker's vertical center, spanning from this
  // marker toward the next (center-to-center). Marker half-height: 11px (md)
  // / 8px (sm). Items get flex-1; the connector fills the gap to the right.
  const topOffset = size === "sm" ? "after:top-2" : "after:top-[11px]";
  if (dashed) {
    return cn(
      'after:content-[""] after:absolute after:z-0',
      topOffset,
      "after:left-[50%] after:right-[-50%]",
      "after:h-0 after:border-t-2 after:border-dashed after:border-border",
    );
  }
  return cn(
    'after:content-[""] after:absolute after:z-0',
    topOffset,
    "after:left-[50%] after:right-[-50%]",
    "after:h-0.5 after:bg-border",
  );
}

// ──────────────────────────────────────────────────────────────────
// Timeline — main component
// ──────────────────────────────────────────────────────────────────

export interface TimelineProps
  extends Omit<React.HTMLAttributes<HTMLOListElement>, "title"> {
  /** Ordered list of chronological events. */
  items: TimelineItem[];
  /** Marker size. Default `"md"`. */
  size?: TimelineSize;
  /** Connector style between markers. Default `"solid"`. */
  connector?: TimelineConnector;
  /** Layout orientation. Default `"vertical"`. */
  orientation?: TimelineOrientation;
  /**
   * Accessible label for the ordered list. Default `"Linha do tempo"`.
   * Override when the timeline has a more specific role in context.
   */
  "aria-label"?: string;
}

const Timeline = React.forwardRef<HTMLOListElement, TimelineProps>(
  function Timeline(
    {
      items,
      size = "md",
      connector = "solid",
      orientation = "vertical",
      className,
      "aria-label": ariaLabel = "Linha do tempo",
      ...rest
    },
    ref,
  ) {
    const isHorizontal = orientation === "horizontal";

    return (
      <ol
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          "m-0 list-none p-0 font-sans text-fg",
          isHorizontal ? "flex items-start" : "flex flex-col",
          className,
        )}
        {...rest}
      >
        {items.map((item, index) => {
          const tone = item.tone ?? "violet";
          const isLast = index === items.length - 1;
          const label = toneLabel(tone);
          const IconCmp = item.icon;

          const markerContent = IconCmp ? (
            <IconCmp aria-hidden="true" className={iconClass(size)} />
          ) : (
            <span
              aria-hidden="true"
              className={cn("rounded-full bg-current", dotClass(size))}
            />
          );

          const marker = (
            <span
              data-tone={tone}
              aria-hidden="true"
              className={cn(timelineMarkerVariants({ tone, size }), "shrink-0")}
            >
              {markerContent}
            </span>
          );

          const body = (
            <div className={cn("min-w-0", isHorizontal && "mt-2 text-center")}>
              <div
                className={cn(
                  "flex items-baseline gap-3",
                  isHorizontal ? "justify-center" : "justify-between",
                )}
              >
                <span
                  className={cn(
                    "font-semibold text-fg",
                    size === "sm" ? "text-[13px]" : "text-sm",
                  )}
                >
                  {/* Non-chromatic reinforcement of the tone for assistive tech. */}
                  {label ? <span className="sr-only">{label}: </span> : null}
                  {item.title}
                </span>
                {item.timestamp ? (
                  <span
                    className={cn(
                      "shrink-0 tabular-nums text-fg-muted [font-feature-settings:'tnum']",
                      size === "sm" ? "text-[11px]" : "text-xs",
                    )}
                  >
                    {item.timestamp}
                  </span>
                ) : null}
              </div>
              {item.description ? (
                <div
                  className={cn(
                    "mt-0.5 leading-relaxed text-fg-muted",
                    size === "sm" ? "text-xs" : "text-[13px]",
                  )}
                >
                  {item.description}
                </div>
              ) : null}
              {item.meta ? <div className="mt-2">{item.meta}</div> : null}
            </div>
          );

          return (
            <li
              key={item.id}
              className={cn(
                "relative",
                isHorizontal
                  ? cn("flex min-w-0 flex-1 flex-col items-center px-2")
                  : cn(
                      "grid grid-cols-[auto_1fr] items-start",
                      size === "sm" ? "gap-2.5 pb-3" : "gap-3 pb-[18px]",
                    ),
                !isLast && connectorClasses(orientation, size, connector),
                isLast && (isHorizontal ? "flex-none" : "pb-0"),
              )}
            >
              {marker}
              {body}
            </li>
          );
        })}
      </ol>
    );
  },
);
Timeline.displayName = "Timeline";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { Timeline, timelineMarkerVariants };
export type { VariantProps };
