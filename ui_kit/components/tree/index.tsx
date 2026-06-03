"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Tree — navegador hierárquico com expand/collapse, seleção (`none`/`single`/
 * `multi`), ícones opcionais e navegação por teclado completa (ARIA APG Tree
 * View).
 *
 * Uso típico na Guardia:
 *   - Plano de contas (1 → 1.1 → 1.1.01)
 *   - Estrutura de empresas (holding → filial → unidade)
 *   - Categorias fiscais aninhadas
 *   - Regras do Copilot Isac
 *
 * Seleção:
 *   - `mode="single"` (default): um único nó selecionado
 *   - `mode="multi"`           : vários nós; pais derivam estado (all/partial/none)
 *   - `mode="none"`            : apenas navegação/expand
 *
 * API controlada E não-controlada: passe `expanded`/`selected` para controlar
 * de fora; omita para usar estado interno (`defaultExpanded`/`defaultSelected`).
 *
 * Espelha `ux_references/ui_kits/components/Tree/` (referência legacy) em API e
 * visual, trocando classes `.grd-tr-*` por tokens semânticos Tailwind v4 e
 * ADICIONANDO a navegação por teclado APG que a referência não tinha. Decisões
 * em `docs/adr/ADR-028-tree-v0.1.0-dod-migration.md`.
 *
 * Public surface: `Tree` (default + named export), `treeRowVariants` (CVA
 * accessor) + tipos `TreeNode`, `TreeProps`, `TreeMode`, `TreeSize`,
 * `TreeSelectionState`.
 */

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

export type TreeMode = "none" | "single" | "multi";
export type TreeSize = "sm" | "md";
export type TreeSelectionState = "none" | "partial" | "all";

/**
 * Component shape for a node icon. Accepts any `lucide-react`-shaped
 * component (`(props: { className?, "aria-hidden"? }) => ReactElement`).
 */
export type TreeIconComponent = React.ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface TreeNode {
  /** Stable id used as React key + selection/expansion identity. */
  id: string;
  /** Headline of the node. */
  label: React.ReactNode;
  /** Optional supporting copy beside the label. */
  description?: React.ReactNode;
  /** Icon shown left of the label (`lucide-react`-shaped). */
  icon?: TreeIconComponent;
  /** Content rendered at the right edge (badge, value, action). */
  meta?: React.ReactNode;
  /** Disables selection (still navigable). */
  disabled?: boolean;
  /** Child nodes — presence makes this an expandable parent. */
  children?: TreeNode[];
  /** Seeds initial expansion (uncontrolled only). */
  defaultExpanded?: boolean;
}

export interface TreeProps
  extends Omit<React.HTMLAttributes<HTMLUListElement>, "onSelect"> {
  /** Hierarchical node list. */
  nodes: TreeNode[];
  /** Selection model. Default `"single"`. */
  mode?: TreeMode;
  /** Density. Default `"md"`. */
  size?: TreeSize;
  /** Controlled expansion (ids). Omit for uncontrolled. */
  expanded?: string[];
  onExpandedChange?: (expanded: string[]) => void;
  /** Controlled selection (ids). Omit for uncontrolled. */
  selected?: string[];
  onSelectedChange?: (selected: string[]) => void;
  /** Uncontrolled initial expansion (ids). */
  defaultExpanded?: string[];
  /** Uncontrolled initial selection (ids). */
  defaultSelected?: string[];
  /** Vertical guide lines on groups. Default `true`. */
  showLines?: boolean;
  /** Fires on every node activation, regardless of `mode`. */
  onNodeClick?: (node: TreeNode) => void;
  /** Rendered when `nodes` is empty. */
  emptyState?: React.ReactNode;
  /** Accessible label for the tree. Default `"Árvore"`. */
  "aria-label"?: string;
}

// ──────────────────────────────────────────────────────────────────
// CVA — row variants (state × size)
// ──────────────────────────────────────────────────────────────────

const treeRowVariants = cva(
  [
    "group/row relative flex w-full items-center gap-1.5 rounded-sm",
    "border-0 bg-transparent text-left font-sans leading-tight text-fg",
    "transition-[background-color,color] duration-150",
    "cursor-pointer outline-none",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "hover:bg-muted",
    "data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary",
    "data-[selected=true]:hover:bg-primary/15",
    "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-45",
    "data-[disabled=true]:hover:bg-transparent",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "min-h-[26px] px-1.5 py-px text-xs gap-1",
        md: "min-h-[30px] px-2 py-0.5 text-[13px] gap-1.5",
      },
    },
    defaultVariants: { size: "md" },
  },
);

// ──────────────────────────────────────────────────────────────────
// Pure helpers (no DOM) — derive structure + selection
// ──────────────────────────────────────────────────────────────────

function collectAutoExpanded(nodes: TreeNode[], acc: string[] = []): string[] {
  for (const node of nodes) {
    if (node.defaultExpanded) acc.push(node.id);
    if (node.children) collectAutoExpanded(node.children, acc);
  }
  return acc;
}

function collectLeafIds(nodes: TreeNode[], acc: string[] = []): string[] {
  for (const node of nodes) {
    if (!node.children || node.children.length === 0) acc.push(node.id);
    else collectLeafIds(node.children, acc);
  }
  return acc;
}

function computeSelectionState(
  node: TreeNode,
  selectedSet: Set<string>,
): TreeSelectionState {
  if (!node.children || node.children.length === 0) {
    return selectedSet.has(node.id) ? "all" : "none";
  }
  const states = node.children.map((child) =>
    computeSelectionState(child, selectedSet),
  );
  if (states.every((state) => state === "all")) return "all";
  if (states.every((state) => state === "none")) return "none";
  return "partial";
}

function toggleBranchLeaves(
  node: TreeNode,
  selectedSet: Set<string>,
  target: boolean,
): void {
  for (const leafId of collectLeafIds([node])) {
    if (target) selectedSet.add(leafId);
    else selectedSet.delete(leafId);
  }
}

interface FlatNode {
  node: TreeNode;
  depth: number;
  parentId: string | null;
  hasChildren: boolean;
}

/**
 * Flattens the tree into the sequence of currently visible nodes (a parent's
 * children are visible only when the parent is expanded). Drives roving
 * tabindex + Arrow Up/Down keyboard traversal.
 */
function flattenVisible(
  nodes: TreeNode[],
  expandedSet: Set<string>,
  depth = 0,
  parentId: string | null = null,
  acc: FlatNode[] = [],
): FlatNode[] {
  for (const node of nodes) {
    const hasChildren = !!node.children && node.children.length > 0;
    acc.push({ node, depth, parentId, hasChildren });
    if (hasChildren && expandedSet.has(node.id)) {
      flattenVisible(node.children!, expandedSet, depth + 1, node.id, acc);
    }
  }
  return acc;
}

// ──────────────────────────────────────────────────────────────────
// Tree — main component
// ──────────────────────────────────────────────────────────────────

const Tree = React.forwardRef<HTMLUListElement, TreeProps>(function Tree(
  {
    nodes,
    mode = "single",
    size = "md",
    expanded,
    onExpandedChange,
    selected,
    onSelectedChange,
    defaultExpanded,
    defaultSelected,
    showLines = true,
    onNodeClick,
    emptyState,
    className,
    "aria-label": ariaLabel = "Árvore",
    ...rest
  },
  ref,
) {
  // Expansion: controlled or uncontrolled
  const [internalExpanded, setInternalExpanded] = React.useState<string[]>(
    () => defaultExpanded ?? collectAutoExpanded(nodes),
  );
  const expandedSet = React.useMemo(
    () => new Set(expanded ?? internalExpanded),
    [expanded, internalExpanded],
  );

  // Selection: controlled or uncontrolled
  const [internalSelected, setInternalSelected] = React.useState<string[]>(
    defaultSelected ?? [],
  );
  const selectedSet = React.useMemo(
    () => new Set(selected ?? internalSelected),
    [selected, internalSelected],
  );

  // Roving tabindex: which node id currently owns tabindex=0
  const visible = React.useMemo(
    () => flattenVisible(nodes, expandedSet),
    [nodes, expandedSet],
  );
  const [activeId, setActiveId] = React.useState<string | null>(null);

  // The tabbable node is: the active one (if still visible), else the first
  // selected visible node, else the first visible node.
  const tabbableId = React.useMemo(() => {
    const visibleIds = visible.map((entry) => entry.node.id);
    if (activeId && visibleIds.includes(activeId)) return activeId;
    const firstSelected = visibleIds.find((id) => selectedSet.has(id));
    return firstSelected ?? visibleIds[0] ?? null;
  }, [activeId, visible, selectedSet]);

  const rowRefs = React.useRef(new Map<string, HTMLDivElement>());
  // When keyboard navigation moves the active node, focus must follow after the
  // roving tabindex re-renders. A pending-focus ref flushed in useLayoutEffect
  // keeps focus inside React's commit phase (deterministic, act-safe in tests).
  const pendingFocusRef = React.useRef<string | null>(null);

  React.useLayoutEffect(() => {
    const id = pendingFocusRef.current;
    if (id) {
      pendingFocusRef.current = null;
      rowRefs.current.get(id)?.focus();
    }
  });

  const commitExpanded = React.useCallback(
    (next: Set<string>) => {
      const arr = Array.from(next);
      if (expanded === undefined) setInternalExpanded(arr);
      onExpandedChange?.(arr);
    },
    [expanded, onExpandedChange],
  );

  const commitSelected = React.useCallback(
    (next: Set<string>) => {
      const arr = Array.from(next);
      if (selected === undefined) setInternalSelected(arr);
      onSelectedChange?.(arr);
    },
    [selected, onSelectedChange],
  );

  const setExpand = React.useCallback(
    (id: string, open: boolean) => {
      const next = new Set(expandedSet);
      if (open) next.add(id);
      else next.delete(id);
      commitExpanded(next);
    },
    [expandedSet, commitExpanded],
  );

  const toggleExpand = React.useCallback(
    (id: string) => setExpand(id, !expandedSet.has(id)),
    [expandedSet, setExpand],
  );

  const selectNode = React.useCallback(
    (node: TreeNode) => {
      if (node.disabled || mode === "none") return;
      if (mode === "single") {
        commitSelected(new Set([node.id]));
        return;
      }
      // multi
      const next = new Set(selectedSet);
      if (node.children && node.children.length > 0) {
        const state = computeSelectionState(node, selectedSet);
        toggleBranchLeaves(node, next, state !== "all");
      } else if (next.has(node.id)) {
        next.delete(node.id);
      } else {
        next.add(node.id);
      }
      commitSelected(next);
    },
    [mode, selectedSet, commitSelected],
  );

  const focusNode = React.useCallback((id: string) => {
    pendingFocusRef.current = id;
    setActiveId(id);
  }, []);

  const handleActivate = React.useCallback(
    (node: TreeNode) => {
      if (node.disabled) return;
      onNodeClick?.(node);
      selectNode(node);
    },
    [onNodeClick, selectNode],
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent, nodeId: string) => {
      const index = visible.findIndex((v) => v.node.id === nodeId);
      if (index === -1) return;
      // Authoritative entry from the visible flat list (correct parentId/depth).
      const current = visible[index]!;
      const { node, hasChildren, parentId } = current;
      const isOpen = expandedSet.has(node.id);

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();
          const next = visible[index + 1];
          if (next) focusNode(next.node.id);
          break;
        }
        case "ArrowUp": {
          event.preventDefault();
          const prev = visible[index - 1];
          if (prev) focusNode(prev.node.id);
          break;
        }
        case "ArrowRight": {
          event.preventDefault();
          if (hasChildren && !isOpen) {
            setExpand(node.id, true);
          } else if (hasChildren && isOpen) {
            const firstChild = visible[index + 1];
            if (firstChild) focusNode(firstChild.node.id);
          }
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          if (hasChildren && isOpen) {
            setExpand(node.id, false);
          } else if (parentId) {
            focusNode(parentId);
          }
          break;
        }
        case "Home": {
          event.preventDefault();
          const first = visible[0];
          if (first) focusNode(first.node.id);
          break;
        }
        case "End": {
          event.preventDefault();
          const last = visible[visible.length - 1];
          if (last) focusNode(last.node.id);
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          handleActivate(node);
          break;
        }
        default:
          break;
      }
    },
    [visible, expandedSet, focusNode, setExpand, handleActivate],
  );

  // Empty state
  if (nodes.length === 0) {
    return (
      <div
        className={cn(
          "px-6 py-6 text-center font-sans text-sm text-fg-muted",
          className,
        )}
      >
        {emptyState ?? "Nenhum item."}
      </div>
    );
  }

  const indentStep = size === "sm" ? 16 : 18;
  const iconSize = size === "sm" ? "size-3.5" : "size-4";

  const renderNodes = (
    list: TreeNode[],
    depth: number,
    isRoot: boolean,
  ): React.ReactNode => (
    <ul
      role={isRoot ? "tree" : "group"}
      aria-label={isRoot ? ariaLabel : undefined}
      className={cn("m-0 list-none p-0", !isRoot && "relative")}
      {...(isRoot ? { ref, ...rest } : {})}
    >
      {!isRoot && showLines ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-1.5 top-0 w-px bg-border"
          style={{ left: (depth - 1) * indentStep + (size === "sm" ? 14 : 17) }}
        />
      ) : null}
      {list.map((node) => {
        const hasChildren = !!node.children && node.children.length > 0;
        const isOpen = expandedSet.has(node.id);
        const selectionState: TreeSelectionState =
          mode === "multi"
            ? computeSelectionState(node, selectedSet)
            : selectedSet.has(node.id)
              ? "all"
              : "none";
        const isSelected =
          mode === "single"
            ? selectedSet.has(node.id)
            : selectionState === "all";
        const isTabbable = node.id === tabbableId;
        const Icon = node.icon;

        return (
          <li key={node.id} role="none" className="m-0">
            {/* The treeitem role lives on the focusable row (APG Tree View):
                it is the single interactive element per node — owns tabindex,
                keyboard + click handlers, and the aria state. */}
            <div
              role="treeitem"
              aria-expanded={hasChildren ? isOpen : undefined}
              aria-selected={mode === "none" ? undefined : isSelected}
              aria-disabled={node.disabled || undefined}
              ref={(el) => {
                if (el) rowRefs.current.set(node.id, el);
                else rowRefs.current.delete(node.id);
              }}
              tabIndex={isTabbable ? 0 : -1}
              data-selected={isSelected || undefined}
              data-disabled={node.disabled || undefined}
              className={treeRowVariants({ size })}
              style={{ paddingLeft: 8 + depth * indentStep }}
              onClick={() => handleActivate(node)}
              onFocus={() =>
                setActiveId((prev) => (prev === node.id ? prev : node.id))
              }
              onKeyDown={(event) => handleKeyDown(event, node.id)}
            >
              {/* Caret */}
              {hasChildren ? (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={isOpen ? "Colapsar" : "Expandir"}
                  className={cn(
                    "inline-flex size-4 shrink-0 items-center justify-center rounded-[3px]",
                    "text-fg-muted transition-transform duration-150",
                    "hover:bg-muted hover:text-fg",
                    isOpen && "rotate-90",
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleExpand(node.id);
                  }}
                >
                  <ChevronRight className="size-3.5" aria-hidden="true" />
                </button>
              ) : (
                <span aria-hidden="true" className="inline-block size-4 shrink-0" />
              )}

              {/* Checkbox (multi) */}
              {mode === "multi" ? (
                <span
                  role="checkbox"
                  aria-checked={
                    selectionState === "all"
                      ? true
                      : selectionState === "partial"
                        ? "mixed"
                        : false
                  }
                  aria-hidden="true"
                  className={cn(
                    "inline-flex size-[15px] shrink-0 items-center justify-center rounded-[3px]",
                    "border-[1.5px] border-border-strong bg-card text-primary-foreground",
                    "transition-colors duration-150",
                    (selectionState === "all" || selectionState === "partial") &&
                      "border-primary bg-primary",
                    size === "sm" && "size-[13px]",
                  )}
                >
                  {selectionState === "all" ? (
                    <Check className="size-2.5" aria-hidden="true" />
                  ) : selectionState === "partial" ? (
                    <span className="h-0.5 w-2 rounded-full bg-primary-foreground" />
                  ) : null}
                </span>
              ) : null}

              {/* Icon */}
              {Icon ? (
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center text-fg-muted",
                    "group-data-[selected=true]/row:text-primary",
                  )}
                >
                  <Icon className={iconSize} aria-hidden="true" />
                </span>
              ) : null}

              {/* Label + description */}
              <span className="flex min-w-0 flex-1 items-baseline gap-2 overflow-hidden">
                <span
                  className={cn(
                    "truncate font-medium",
                    "group-data-[selected=true]/row:font-semibold",
                  )}
                >
                  {node.label}
                </span>
                {node.description ? (
                  <span className="truncate text-xs text-fg-muted">
                    {node.description}
                  </span>
                ) : null}
              </span>

              {/* Meta (right slot) */}
              {node.meta ? (
                <span className="ml-auto shrink-0 pl-2 text-xs text-fg-muted [font-variant-numeric:tabular-nums]">
                  {node.meta}
                </span>
              ) : null}
            </div>

            {hasChildren && isOpen
              ? renderNodes(node.children!, depth + 1, false)
              : null}
          </li>
        );
      })}
    </ul>
  );

  return renderNodes(nodes, 0, true);
});
Tree.displayName = "Tree";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { Tree, treeRowVariants };
export default Tree;
export type { VariantProps };
