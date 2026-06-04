"use client";

import * as React from "react";
import {
  Calendar,
  MessageCircle,
  Paperclip,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import { Badge } from "../badge";

/**
 * Kanban — inner components & pure helpers.
 *
 * Split out of `index.tsx` (mirrors the `calendar/inner_components.tsx`
 * precedent) so the board file stays focused on layout + native HTML5
 * drag-and-drop orchestration. This file holds:
 *   - public card / column / lane / tag types
 *   - the search predicate + confidence bucketing (pure)
 *   - tone maps (priority dot, confidence chip, due status) — semantic tokens
 *   - `DefaultCard` — the default card body renderer
 *
 * Decisions recorded in `docs/adr/ADR-024-kanban-v0.1.0-dod-migration.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Public types
// ──────────────────────────────────────────────────────────────────

export type KanbanTone =
  | "violet"
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "neutral";

export interface KanbanTag {
  label: string;
  tone?: KanbanTone;
}

export interface KanbanCard {
  /** Stable id used as React key and DnD payload. */
  id: string;
  /** Column this card currently belongs to. */
  columnId: string;
  /** Optional swimlane this card belongs to. */
  laneId?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Display id badge, e.g. "TSK-248". */
  displayId?: string;
  priority?: "low" | "med" | "high";
  tags?: KanbanTag[];
  assignee?: { name: string; avatar?: string };
  dueDate?: string;
  /** Colors the due-date chip. */
  dueStatus?: "ok" | "warn" | "danger";
  /** Monetary / numeric value rendered at the trailing edge. */
  value?: React.ReactNode;
  /** Agent confidence indicator, 0..1. */
  confidence?: number;
  /** Thin progress bar at the card footer, 0..1. */
  progress?: number;
  commentsCount?: number;
  attachmentsCount?: number;
  /** Free payload forwarded to `renderCard`. */
  raw?: unknown;
}

export interface KanbanColumn {
  id: string;
  title: string;
  /** Header dot color — accepts any CSS color or token var. */
  color?: string;
  onAdd?: () => void;
  emptyState?: React.ReactNode;
  /** Show count + summed `value` in the header. */
  showTotals?: boolean;
  /** How to extract the numeric value from a card. */
  sumValue?: (card: KanbanCard) => number;
  /** How to format the summed total. */
  sumFormat?: (sum: number) => string;
}

export interface KanbanSwimlane {
  id: string;
  title: string;
  defaultCollapsed?: boolean;
}

// ──────────────────────────────────────────────────────────────────
// Pure helpers
// ──────────────────────────────────────────────────────────────────

/** Case-insensitive match across the card's searchable surface. */
export function cardMatches(card: KanbanCard, q: string): boolean {
  if (!q) return true;
  const lc = q.toLowerCase();
  const haystack = [
    String(card.title ?? ""),
    String(card.description ?? ""),
    card.displayId ?? "",
    card.assignee?.name ?? "",
    ...(card.tags ?? []).map((t) => t.label),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(lc);
}

export function confidenceBucket(c: number): "high" | "mid" | "low" {
  if (c >= 0.95) return "high";
  if (c >= 0.75) return "mid";
  return "low";
}

// ──────────────────────────────────────────────────────────────────
// Tone maps — semantic tokens only (no hex, no raw color utilities)
// ──────────────────────────────────────────────────────────────────

const priorityDot: Record<NonNullable<KanbanCard["priority"]>, string> = {
  // danger / warning signal anchors with a soft halo; low = muted foreground.
  high: "bg-danger ring-2 ring-danger-soft",
  med: "bg-warning ring-2 ring-warning-soft",
  low: "bg-fg-muted",
};

const priorityLabel: Record<NonNullable<KanbanCard["priority"]>, string> = {
  high: "prioridade alta",
  med: "prioridade média",
  low: "prioridade baixa",
};

const confidenceChip: Record<"high" | "mid" | "low", string> = {
  // `-fg` foreground keeps AA contrast over the matching soft surface.
  high: "bg-success-soft text-success-fg",
  mid: "bg-warning-soft text-warning-fg",
  low: "bg-danger-soft text-danger-fg",
};

const dueStatusClass: Record<NonNullable<KanbanCard["dueStatus"]>, string> = {
  ok: "text-fg-muted",
  warn: "text-warning-fg font-semibold",
  danger: "text-danger-fg font-semibold",
};

/** Badge `variant` from the tag tone. */
function tagVariant(
  tone: KanbanTone | undefined,
): "neutral" | "brand" | "success" | "warning" | "danger" | "info" {
  switch (tone) {
    case "violet":
      return "brand";
    case "green":
      return "success";
    case "amber":
      return "warning";
    case "red":
      return "danger";
    case "blue":
      return "info";
    default:
      return "neutral";
  }
}

// ──────────────────────────────────────────────────────────────────
// DefaultCard — default card body renderer
// ──────────────────────────────────────────────────────────────────

export function DefaultCard({ card }: { card: KanbanCard }): React.ReactElement {
  const hasTopBar = Boolean(card.displayId || card.priority);
  const conf =
    card.confidence !== undefined ? confidenceBucket(card.confidence) : null;
  const hasMeta = Boolean(
    card.assignee ||
      card.dueDate ||
      card.value !== undefined ||
      card.confidence !== undefined ||
      card.commentsCount ||
      card.attachmentsCount,
  );

  return (
    <>
      {hasTopBar && (
        <div className="flex min-h-[18px] flex-wrap items-center gap-1.5">
          {card.priority && (
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                priorityDot[card.priority],
              )}
              aria-label={priorityLabel[card.priority]}
              role="img"
            />
          )}
          {card.displayId && (
            <span className="text-[10.5px] font-medium tracking-wide text-fg-muted [font-feature-settings:'tnum']">
              {card.displayId}
            </span>
          )}
          {conf && (
            <span
              className={cn(
                "ml-auto inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5",
                "text-[10.5px] font-semibold [font-feature-settings:'tnum']",
                confidenceChip[conf],
              )}
            >
              <span
                aria-hidden="true"
                className="size-[5px] rounded-full bg-current"
              />
              {Math.round((card.confidence ?? 0) * 100)}%
            </span>
          )}
        </div>
      )}

      <div className="line-clamp-3 text-[13px] font-semibold leading-snug text-fg">
        {card.title}
      </div>
      {card.description && (
        <div className="line-clamp-2 text-xs leading-relaxed text-fg-muted">
          {card.description}
        </div>
      )}

      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map((t, i) => (
            <Badge
              key={`${t.label}-${i}`}
              variant={tagVariant(t.tone)}
              appearance="soft"
            >
              {t.label}
            </Badge>
          ))}
        </div>
      )}

      {typeof card.progress === "number" && (
        <div
          className="mt-0.5 h-[3px] overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Progresso do card"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(
            Math.min(100, Math.max(0, card.progress * 100)),
          )}
        >
          <div
            className="h-full bg-action transition-[width] duration-300"
            style={{
              width: `${Math.min(100, Math.max(0, card.progress * 100))}%`,
            }}
          />
        </div>
      )}

      {hasMeta && (
        <div className="mt-0.5 flex items-center justify-between gap-2 text-[11.5px] text-fg-muted">
          <div className="inline-flex items-center gap-2.5">
            {card.assignee && (
              <Avatar size="xs">
                {card.assignee.avatar && (
                  <AvatarImage
                    src={card.assignee.avatar}
                    alt={card.assignee.name}
                  />
                )}
                <AvatarFallback aria-label={card.assignee.name}>
                  {card.assignee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            {card.dueDate && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 [font-feature-settings:'tnum']",
                  card.dueStatus ? dueStatusClass[card.dueStatus] : undefined,
                )}
              >
                <Calendar aria-hidden="true" className="size-3" />
                {card.dueDate}
              </span>
            )}
            {typeof card.commentsCount === "number" &&
              card.commentsCount > 0 && (
                <span className="inline-flex items-center gap-1 [font-feature-settings:'tnum']">
                  <MessageCircle aria-hidden="true" className="size-3" />
                  {card.commentsCount}
                </span>
              )}
            {typeof card.attachmentsCount === "number" &&
              card.attachmentsCount > 0 && (
                <span className="inline-flex items-center gap-1 [font-feature-settings:'tnum']">
                  <Paperclip aria-hidden="true" className="size-3" />
                  {card.attachmentsCount}
                </span>
              )}
          </div>
          {card.value !== undefined && (
            <span className="text-[12.5px] font-bold text-fg [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]">
              {card.value}
            </span>
          )}
        </div>
      )}
    </>
  );
}
