"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight, Minimize2, Plus, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "../input";
import {
  cardMatches,
  DefaultCard,
  type KanbanCard,
  type KanbanColumn,
  type KanbanSwimlane,
  type KanbanTag,
  type KanbanTone,
} from "./inner_components";

/**
 * Kanban — board with columns, draggable cards, optional swimlanes, and
 * collapsible columns. Typical Guardia use: accounting team tasks, review
 * pipeline, client pending-items management.
 *
 * Architecture:
 *   columns[]   fixed column structure (id, title, color, onAdd?, totals?)
 *   cards[]     flat card list (each card has columnId + optional laneId)
 *   swimlanes?  horizontal groupings (omitted → single "default" lane)
 *
 * Drag and drop — native HTML5 (zero new runtime dependency):
 *   onCardMove(cardId, toColumnId, toLaneId, toIndex)
 *     - reorder within a column (same columnId, different toIndex)
 *     - move across columns / lanes (different columnId / laneId)
 *
 * Custom render: renderCard(card, { dragging }) ⇒ ReactNode replaces the
 * default card body entirely.
 *
 * API mirrors `ux_references/ui_kits/components/Kanban/`, swapping the legacy
 * `.grd-kb-*` classes + `window.*` globals for semantic Tailwind v4 tokens and
 * real DS primitives. Decisions in
 * `docs/adr/ADR-024-kanban-v0.1.0-dod-migration.md`.
 *
 * Public surface: `Kanban` (named + default), `kanbanColumnVariants` (CVA
 * accessor) + types `KanbanCard`, `KanbanColumn`, `KanbanSwimlane`, `KanbanTag`,
 * `KanbanTone`, `KanbanProps`.
 */

const DEFAULT_LANE_ID = "__default";

// ──────────────────────────────────────────────────────────────────
// CVA — column surface (drop-target × collapsed)
// ──────────────────────────────────────────────────────────────────

const kanbanColumnVariants = cva(
  [
    "flex flex-col rounded-lg border bg-muted",
    "transition-[background-color,border-color,box-shadow] duration-150",
    "scroll-snap-align-start",
  ].join(" "),
  {
    variants: {
      isOver: {
        true: "border-action bg-bg-hover shadow-[inset_0_0_0_1.5px_var(--action)]",
        false: "border-border",
      },
      collapsed: {
        true: "w-11 shrink-0 grow-0 basis-11 min-h-0",
        false: "w-[280px] shrink-0 grow-0 basis-[280px] min-h-[220px] max-h-[680px]",
      },
    },
    defaultVariants: { isOver: false, collapsed: false },
  },
);

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export type {
  KanbanCard,
  KanbanColumn,
  KanbanSwimlane,
  KanbanTag,
  KanbanTone,
};

interface DropTarget {
  columnId: string;
  laneId: string | undefined;
  index: number;
}

export interface KanbanProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Board title rendered in the header. */
  title?: string;
  /** Fixed column structure. */
  columns: KanbanColumn[];
  /** Flat list of cards (each pinned to a columnId + optional laneId). */
  cards: KanbanCard[];
  /** Horizontal groupings. Omitted → single default lane (no lane header). */
  swimlanes?: KanbanSwimlane[];
  /** Render a search input that filters cards client-side. */
  searchable?: boolean;
  /** Called when a card is dropped onto a column or inter-card zone. */
  onCardMove?: (
    cardId: string,
    toColumnId: string,
    toLaneId: string | undefined,
    toIndex: number,
  ) => void;
  /** Called when a card is activated (click / Enter / Space). */
  onCardClick?: (card: KanbanCard) => void;
  /** Replace the default card body entirely. */
  renderCard?: (
    card: KanbanCard,
    ctx: { dragging: boolean },
  ) => React.ReactNode;
  /** Column ids that start collapsed. */
  defaultCollapsedColumns?: string[];
  /** Accessible label for the board region. Default `"Quadro Kanban"`. */
  "aria-label"?: string;
}

// ──────────────────────────────────────────────────────────────────
// Kanban — main component
// ──────────────────────────────────────────────────────────────────

const Kanban = React.forwardRef<HTMLDivElement, KanbanProps>(function Kanban(
  {
    title,
    columns,
    cards,
    swimlanes,
    searchable = false,
    onCardMove,
    onCardClick,
    renderCard,
    defaultCollapsedColumns,
    className,
    "aria-label": ariaLabel = "Quadro Kanban",
    ...rest
  },
  ref,
) {
  const dragHintId = React.useId();

  const [q, setQ] = React.useState("");
  const [collapsed, setCollapsed] = React.useState<Set<string>>(
    () => new Set(defaultCollapsedColumns ?? []),
  );
  const [collapsedLanes, setCollapsedLanes] = React.useState<Set<string>>(() => {
    const s = new Set<string>();
    swimlanes?.forEach((l) => l.defaultCollapsed && s.add(l.id));
    return s;
  });

  // ---- DnD state ----
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget | null>(null);

  const toggleCol = (id: string): void => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleLane = (id: string): void => {
    setCollapsedLanes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ---- Filter + grouping ----
  const visibleCards = React.useMemo(
    () => cards.filter((c) => cardMatches(c, q)),
    [cards, q],
  );
  const totalCount = visibleCards.length;

  const lanes: KanbanSwimlane[] = React.useMemo(
    () =>
      swimlanes && swimlanes.length > 0
        ? swimlanes
        : [{ id: DEFAULT_LANE_ID, title: "" }],
    [swimlanes],
  );

  const cardsByLaneColumn = React.useMemo(() => {
    const map: Record<string, Record<string, KanbanCard[]>> = {};
    for (const lane of lanes) {
      map[lane.id] = Object.fromEntries(columns.map((c) => [c.id, []]));
    }
    const fallbackLane = lanes[0]!.id;
    for (const card of visibleCards) {
      const laneId =
        card.laneId && map[card.laneId] ? card.laneId : fallbackLane;
      const colMap = map[laneId] ?? map[fallbackLane]!;
      if (colMap[card.columnId]) colMap[card.columnId]!.push(card);
    }
    return map;
  }, [visibleCards, columns, lanes]);

  // ---- DnD handlers ----
  const handleDragStart =
    (cardId: string) =>
    (e: React.DragEvent): void => {
      setDraggingId(cardId);
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", cardId);
      } catch {
        /* jsdom / some browsers throw on setData — non-fatal */
      }
    };

  const handleDragEnd = (): void => {
    setDraggingId(null);
    setDropTarget(null);
  };

  const handleColumnDragOver =
    (columnId: string, laneId: string, index: number, disabled: boolean) =>
    (e: React.DragEvent): void => {
      if (!draggingId || disabled) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (
        !dropTarget ||
        dropTarget.columnId !== columnId ||
        dropTarget.laneId !== laneId
      ) {
        setDropTarget({ columnId, laneId, index });
      }
    };

  const handleZoneDragOver =
    (columnId: string, laneId: string, index: number) =>
    (e: React.DragEvent): void => {
      if (!draggingId) return;
      e.preventDefault();
      e.stopPropagation();
      setDropTarget({ columnId, laneId, index });
    };

  const handleDrop =
    (columnId: string, laneId: string, index: number) =>
    (e: React.DragEvent): void => {
      e.preventDefault();
      if (!draggingId) return;
      onCardMove?.(
        draggingId,
        columnId,
        laneId === DEFAULT_LANE_ID ? undefined : laneId,
        index,
      );
      setDraggingId(null);
      setDropTarget(null);
    };

  // ──────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────
  return (
    <div
      ref={ref}
      className={cn("flex w-full min-w-0 min-h-0 flex-col font-sans text-fg", className)}
      {...rest}
    >
      <span id={dragHintId} className="sr-only">
        Arraste o card para outra coluna ou posição para movê-lo.
      </span>

      {(title || searchable) && (
        <div className="mb-3.5 flex items-center gap-2.5 border-b border-border pb-3.5">
          {title && (
            <h3 className="m-0 text-[15px] font-semibold text-fg">{title}</h3>
          )}
          <span className="text-xs text-fg-muted [font-feature-settings:'tnum']">
            · {totalCount} cards
          </span>
          {searchable && (
            <div className="ml-auto min-w-[240px]">
              <Input
                type="search"
                size="sm"
                leftIcon={<Search aria-hidden="true" className="size-4" />}
                placeholder="Buscar por título, tag, responsável…"
                aria-label="Buscar cards"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      <nav
        aria-label={ariaLabel}
        className="flex min-w-0 min-h-0 flex-col gap-[22px]"
      >
        {lanes.map((lane) => {
          const laneIsCollapsed = collapsedLanes.has(lane.id);
          const laneCardCount = columns.reduce(
            (sum, col) =>
              sum + (cardsByLaneColumn[lane.id]?.[col.id]?.length ?? 0),
            0,
          );
          const showLaneHdr = lane.id !== DEFAULT_LANE_ID;

          return (
            <div key={lane.id} className="flex min-w-0 min-h-0 flex-col gap-2">
              {showLaneHdr && (
                <button
                  type="button"
                  aria-expanded={!laneIsCollapsed}
                  onClick={() => toggleLane(lane.id)}
                  className={cn(
                    "flex select-none items-center gap-2 rounded-sm px-1 py-1.5 text-left",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                >
                  <ChevronRight
                    aria-hidden="true"
                    className={cn(
                      "size-3.5 text-fg-muted transition-transform duration-150",
                      !laneIsCollapsed && "rotate-90",
                    )}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide text-fg-muted">
                    {lane.title}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-fg-muted [font-feature-settings:'tnum']">
                    {laneCardCount}
                  </span>
                </button>
              )}

              {!laneIsCollapsed && (
                <div className="flex gap-3 overflow-x-auto px-0.5 pb-3.5 pt-1 max-md:flex-col">
                  {columns.map((col) => {
                    const list = cardsByLaneColumn[lane.id]?.[col.id] ?? [];
                    const isColCollapsed = collapsed.has(col.id);
                    const isOver =
                      dropTarget?.columnId === col.id &&
                      dropTarget?.laneId === lane.id;
                    const sumTotal =
                      col.showTotals && col.sumValue
                        ? list.reduce((acc, c) => acc + col.sumValue!(c), 0)
                        : null;

                    return (
                      <div
                        key={col.id}
                        role="group"
                        aria-label={`${col.title} (${list.length})`}
                        className={cn(
                          kanbanColumnVariants({
                            isOver,
                            collapsed: isColCollapsed,
                          }),
                          "max-md:w-full max-md:basis-auto max-md:grow",
                        )}
                        onDragOver={handleColumnDragOver(
                          col.id,
                          lane.id,
                          list.length,
                          isColCollapsed,
                        )}
                        onDrop={handleDrop(col.id, lane.id, list.length)}
                      >
                        {/* Header (collapse toggle) */}
                        <button
                          type="button"
                          aria-expanded={!isColCollapsed}
                          aria-label={`${isColCollapsed ? "Expandir" : "Colapsar"} coluna ${col.title}`}
                          onClick={() => toggleCol(col.id)}
                          className={cn(
                            "flex select-none items-center gap-2 px-3 py-2.5 text-left",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isColCollapsed && "h-full flex-col",
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className="size-2.5 shrink-0 rounded-full bg-fg-muted"
                            style={
                              col.color ? { background: col.color } : undefined
                            }
                          />
                          <span
                            className={cn(
                              "flex-1 truncate text-[12.5px] font-semibold text-fg",
                              isColCollapsed && "[writing-mode:vertical-rl] rotate-180",
                            )}
                          >
                            {col.title}
                          </span>
                          {!isColCollapsed && (
                            <span className="rounded-full border border-border-strong bg-card px-2 py-0.5 text-[11px] text-fg-muted [font-feature-settings:'tnum']">
                              {list.length}
                            </span>
                          )}
                          {!isColCollapsed && (
                            <Minimize2
                              aria-hidden="true"
                              className="size-3.5 text-fg-muted"
                            />
                          )}
                        </button>

                        {!isColCollapsed &&
                          col.showTotals &&
                          sumTotal !== null && (
                            <div className="flex justify-between px-3 pb-2 text-[11px] text-fg-muted [font-feature-settings:'tnum']">
                              <span>Total</span>
                              <strong className="font-semibold text-fg">
                                {col.sumFormat
                                  ? col.sumFormat(sumTotal)
                                  : sumTotal}
                              </strong>
                            </div>
                          )}

                        {!isColCollapsed && (
                          <div className="flex min-h-[60px] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2 pt-1">
                            {list.length === 0 ? (
                              <div className="flex flex-1 items-center justify-center px-3.5 py-4 text-center text-xs leading-relaxed text-fg-muted">
                                {col.emptyState ?? "Sem cards por aqui"}
                              </div>
                            ) : (
                              list.map((card, idx) => {
                                const isDrop =
                                  dropTarget?.columnId === col.id &&
                                  dropTarget?.laneId === lane.id &&
                                  dropTarget?.index === idx;
                                const isDragging = draggingId === card.id;
                                return (
                                  <React.Fragment key={card.id}>
                                    <div
                                      aria-hidden="true"
                                      className={cn(
                                        "-my-[3px] mx-1 h-0.5 rounded-full transition-colors",
                                        isDrop
                                          ? "bg-action shadow-[0_0_0_4px_var(--bg-hover)]"
                                          : "bg-transparent",
                                      )}
                                      onDragOver={handleZoneDragOver(
                                        col.id,
                                        lane.id,
                                        idx,
                                      )}
                                      onDrop={handleDrop(col.id, lane.id, idx)}
                                    />
                                    <button
                                      type="button"
                                      draggable
                                      aria-label={
                                        typeof card.title === "string"
                                          ? card.title
                                          : (card.displayId ?? card.id)
                                      }
                                      aria-describedby={dragHintId}
                                      data-dragging={isDragging || undefined}
                                      onDragStart={handleDragStart(card.id)}
                                      onDragEnd={handleDragEnd}
                                      onClick={() => onCardClick?.(card)}
                                      className={cn(
                                        "relative flex cursor-grab flex-col gap-2 rounded-md border border-border-strong bg-card p-3 pt-3 text-left",
                                        "shadow-xs transition-[box-shadow,border-color,transform,opacity] duration-150",
                                        "hover:shadow-sm active:cursor-grabbing",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                        isDragging &&
                                          "rotate-[1.5deg] opacity-50 shadow-md",
                                      )}
                                    >
                                      {renderCard ? (
                                        renderCard(card, { dragging: isDragging })
                                      ) : (
                                        <DefaultCard card={card} />
                                      )}
                                    </button>
                                  </React.Fragment>
                                );
                              })
                            )}
                            {list.length > 0 && (
                              <div
                                aria-hidden="true"
                                className={cn(
                                  "-my-[3px] mx-1 h-0.5 rounded-full transition-colors",
                                  dropTarget?.columnId === col.id &&
                                    dropTarget?.laneId === lane.id &&
                                    dropTarget?.index === list.length
                                    ? "bg-action shadow-[0_0_0_4px_var(--bg-hover)]"
                                    : "bg-transparent",
                                )}
                                onDragOver={handleZoneDragOver(
                                  col.id,
                                  lane.id,
                                  list.length,
                                )}
                                onDrop={handleDrop(col.id, lane.id, list.length)}
                              />
                            )}
                          </div>
                        )}

                        {!isColCollapsed && col.onAdd && (
                          <div className="px-2 pb-2.5 pt-1.5">
                            <button
                              type="button"
                              onClick={col.onAdd}
                              className={cn(
                                "inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border-strong px-2.5 py-2",
                                "text-[12.5px] font-medium text-fg-muted transition-colors duration-150",
                                "hover:border-solid hover:border-action hover:bg-card hover:text-action",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              )}
                            >
                              <Plus aria-hidden="true" className="size-3.5" />
                              Adicionar card
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
});
Kanban.displayName = "Kanban";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { Kanban, kanbanColumnVariants };
export default Kanban;
export type { VariantProps };
