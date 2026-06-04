"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
  type SortingState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/table";

/**
 * DataTable — tabela de dados com ordenação, seleção e densidade configurável.
 *
 * Wrapper de alto nível sobre `@tanstack/react-table` (`useReactTable` +
 * `getCoreRowModel` + `getSortedRowModel`) que compõe os primitivos
 * `Table*` do design system. Renderiza `<table>` nativo com semântica
 * acessível (`scope="col"`, `aria-sort` nos cabeçalhos ordenáveis,
 * checkboxes com `aria-label`).
 *
 * Uso típico na Guardia:
 *   - Listas de conciliação (cliente, status, valor, responsável)
 *   - Grids de lançamentos com seleção em lote para ações
 *   - Tabelas densas em dashboards do Copilot Isac
 *
 * API espelha `ux_references/ui_kits/components/DataTable/` (referência
 * legacy), trocando o estado manual por TanStack Table e as classes
 * `.grd-dt-*` por tokens semânticos Tailwind v4. Decisões e divergências
 * registradas em `docs/adr/ADR-023-data-table-v0.1.0-dod-migration.md`.
 *
 * Public surface: `DataTable` (default + named export), `dataTableVariants`
 * (CVA de densidade) + tipos `DataTableProps`, `DataTableColumn`,
 * `SortDirection`, `DataTableDensity`, `ColumnAlign`.
 */

// ──────────────────────────────────────────────────────────────────
// Types — columns + variants
// ──────────────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";
export type DataTableDensity = "compact" | "normal" | "comfortable";
export type ColumnAlign = "left" | "right" | "center";

/** Sort descriptor compatible with TanStack's `SortingState` entries. */
export interface DataTableSort {
  id: string;
  desc: boolean;
}

export interface DataTableColumn<T> {
  /** Stable column id (used as sort key + React key). */
  id: string;
  /** Header content rendered inside the `<th>`. */
  header: React.ReactNode;
  /** Key on the row object to read the cell value. */
  accessorKey?: keyof T;
  /** Function accessor — takes precedence over `accessorKey`. */
  accessor?: (row: T) => unknown;
  /** Custom cell renderer. Receives the accessed value + the row. */
  cell?: (value: unknown, row: T) => React.ReactNode;
  /** Enables click-to-sort on the header. Default `false`. */
  sortable?: boolean;
  /** Horizontal alignment of header + cells. Default `"left"`. */
  align?: ColumnAlign;
  /** Fixed column width (CSS value). */
  width?: number | string;
}

// ──────────────────────────────────────────────────────────────────
// CVA — density (drives header + cell padding)
// ──────────────────────────────────────────────────────────────────

const dataTableVariants = cva("w-full font-sans", {
  variants: {
    density: {
      compact: "[&_th]:py-[7px] [&_th]:px-3 [&_td]:py-[7px] [&_td]:px-3",
      normal: "[&_th]:py-2.5 [&_th]:px-3.5 [&_td]:py-3 [&_td]:px-3.5",
      comfortable: "[&_th]:py-4 [&_th]:px-[18px] [&_td]:py-4 [&_td]:px-[18px]",
    },
  },
  defaultVariants: { density: "normal" },
});

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

const alignClass: Record<ColumnAlign, string> = {
  left: "text-left",
  right: "text-right [font-feature-settings:'tnum'] [font-variant-numeric:tabular-nums]",
  center: "text-center",
};

/** Maps TanStack column sort state to the `aria-sort` token. */
function ariaSortValue(
  isSorted: false | SortDirection,
): "ascending" | "descending" | "none" {
  if (isSorted === "asc") return "ascending";
  if (isSorted === "desc") return "descending";
  return "none";
}

// ──────────────────────────────────────────────────────────────────
// DataTable — main component
// ──────────────────────────────────────────────────────────────────

export interface DataTableProps<T>
  extends Omit<
      React.HTMLAttributes<HTMLTableElement>,
      "onClick" | "children"
    >,
    VariantProps<typeof dataTableVariants> {
  /** Column definitions in display order. */
  columns: DataTableColumn<T>[];
  /** Row data. */
  rows: T[];
  /** Stable row id resolver. Default: `row.id ?? index`. */
  rowKey?: (row: T, index: number) => string;
  /** Adds a per-row checkbox column + a "select all" header checkbox. */
  selectable?: boolean;
  /** Controlled row selection (keyed by resolved row id). */
  rowSelection?: RowSelectionState;
  /** Called when the row selection changes. */
  onRowSelectionChange?: (selection: RowSelectionState) => void;
  /** Controlled sorting. */
  sorting?: DataTableSort[];
  /** Initial sorting when uncontrolled. */
  defaultSorting?: DataTableSort[];
  /** Called when the sorting changes (both controlled and uncontrolled). */
  onSortingChange?: (sorting: DataTableSort[]) => void;
  /** Called when a row is clicked (checkbox clicks do not propagate). */
  onRowClick?: (row: T) => void;
  /** Content shown when `rows` is empty. */
  emptyText?: React.ReactNode;
  /** Pins the header to the top of a scroll container. Default `false`. */
  stickyHeader?: boolean;
  /** Optional `<caption>` (screen-reader friendly table description). */
  caption?: React.ReactNode;
  /** Density preset. Default `"normal"`. */
  density?: DataTableDensity;
}

function DataTableInner<T>(
  {
    columns,
    rows,
    rowKey,
    selectable = false,
    rowSelection,
    onRowSelectionChange,
    sorting,
    defaultSorting = [],
    onSortingChange,
    onRowClick,
    emptyText = "Sem dados",
    stickyHeader = false,
    caption,
    density = "normal",
    className,
    ...rest
  }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>,
): React.ReactElement {
  const isSortingControlled = sorting !== undefined;
  const isSelectionControlled = rowSelection !== undefined;

  const [internalSorting, setInternalSorting] =
    React.useState<SortingState>(defaultSorting);
  const [internalSelection, setInternalSelection] =
    React.useState<RowSelectionState>({});

  const sortingState: SortingState = isSortingControlled
    ? sorting
    : internalSorting;
  const selectionState: RowSelectionState = isSelectionControlled
    ? rowSelection
    : internalSelection;

  const handleSortingChange: OnChangeFn<SortingState> = React.useCallback(
    (updater) => {
      const next =
        typeof updater === "function" ? updater(sortingState) : updater;
      if (!isSortingControlled) setInternalSorting(next);
      onSortingChange?.(next);
    },
    [isSortingControlled, onSortingChange, sortingState],
  );

  const handleSelectionChange: OnChangeFn<RowSelectionState> = React.useCallback(
    (updater) => {
      const next =
        typeof updater === "function" ? updater(selectionState) : updater;
      if (!isSelectionControlled) setInternalSelection(next);
      onRowSelectionChange?.(next);
    },
    [isSelectionControlled, onRowSelectionChange, selectionState],
  );

  // Build TanStack column defs from the public column shape.
  const columnDefs = React.useMemo<ColumnDef<T>[]>(() => {
    return columns.map((col) => ({
      id: col.id,
      header: () => col.header,
      enableSorting: Boolean(col.sortable),
      // WHY: legacy reference cycles asc → desc → none for every column type.
      // TanStack defaults numeric columns to desc-first; pin asc-first so the
      // sort cycle is uniform and matches the reference (ADR-023 divergence D2).
      sortDescFirst: false,
      accessorFn: (row: T) => {
        if (col.accessor) return col.accessor(row);
        if (col.accessorKey != null) return row[col.accessorKey];
        return (row as Record<string, unknown>)[col.id];
      },
      cell: (ctx) => {
        const value = ctx.getValue();
        if (col.cell) return col.cell(value, ctx.row.original);
        return value as React.ReactNode;
      },
    }));
  }, [columns]);

  const getRowId = React.useCallback(
    (row: T, index: number) => {
      if (rowKey) return rowKey(row, index);
      const candidate = (row as { id?: unknown }).id;
      return candidate != null ? String(candidate) : String(index);
    },
    [rowKey],
  );

  const table = useReactTable<T>({
    data: rows,
    columns: columnDefs,
    state: { sorting: sortingState, rowSelection: selectionState },
    onSortingChange: handleSortingChange,
    onRowSelectionChange: handleSelectionChange,
    enableRowSelection: selectable,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const headerRow = table.getHeaderGroups()[0];
  const dataRows = table.getRowModel().rows;
  const totalColumns = columns.length + (selectable ? 1 : 0);

  const allSelected = selectable && dataRows.length > 0 && table.getIsAllRowsSelected();
  const someSelected = selectable && table.getIsSomeRowsSelected();

  return (
    <Table
      ref={ref}
      className={cn(dataTableVariants({ density }), className)}
      {...rest}
    >
      {caption ? (
        <caption className="sr-only">{caption}</caption>
      ) : null}
      <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-card")}>
        <TableRow className="hover:bg-transparent">
          {selectable ? (
            <TableHead className="w-10 text-center [&:has([role=checkbox])]:pr-0">
              <Checkbox
                checked={
                  allSelected ? true : someSelected ? "indeterminate" : false
                }
                onCheckedChange={(value) =>
                  table.toggleAllRowsSelected(value === true)
                }
                aria-label="Selecionar todas as linhas"
              />
            </TableHead>
          ) : null}
          {headerRow?.headers.map((headerCell) => {
            const col = columns.find((c) => c.id === headerCell.column.id);
            const align = col?.align ?? "left";
            const canSort = headerCell.column.getCanSort();
            const sortDir = headerCell.column.getIsSorted();
            const headerContent = flexRender(
              headerCell.column.columnDef.header,
              headerCell.getContext(),
            );

            return (
              <TableHead
                key={headerCell.id}
                scope="col"
                aria-sort={canSort ? ariaSortValue(sortDir) : undefined}
                style={col?.width != null ? { width: col.width } : undefined}
                className={cn(alignClass[align])}
              >
                {canSort ? (
                  <button
                    type="button"
                    onClick={headerCell.column.getToggleSortingHandler()}
                    className={cn(
                      "inline-flex items-center gap-1.5 select-none",
                      "rounded-sm transition-colors duration-150",
                      "hover:text-fg",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      align === "right" && "flex-row-reverse",
                    )}
                  >
                    <span>{headerContent}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "inline-flex",
                        sortDir ? "text-primary" : "text-fg-subtle",
                      )}
                    >
                      {sortDir === "asc" ? (
                        <ChevronUp className="size-3" />
                      ) : sortDir === "desc" ? (
                        <ChevronDown className="size-3" />
                      ) : (
                        <ChevronsUpDown className="size-3" />
                      )}
                    </span>
                  </button>
                ) : (
                  headerContent
                )}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {dataRows.length === 0 ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={totalColumns} className="h-24 text-center">
              <span
                role="status"
                aria-live="polite"
                className="text-fg-muted"
              >
                {emptyText}
              </span>
            </TableCell>
          </TableRow>
        ) : (
          dataRows.map((row: Row<T>) => {
            const isSelected = row.getIsSelected();
            return (
              <TableRow
                key={row.id}
                data-state={isSelected ? "selected" : undefined}
                aria-selected={selectable ? isSelected : undefined}
                onClick={
                  onRowClick
                    ? () => onRowClick(row.original)
                    : undefined
                }
                className={cn(onRowClick && "cursor-pointer")}
              >
                {selectable ? (
                  <TableCell
                    className="w-10 text-center [&:has([role=checkbox])]:pr-0"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(value) =>
                        row.toggleSelected(value === true)
                      }
                      aria-label="Selecionar linha"
                    />
                  </TableCell>
                ) : null}
                {row.getVisibleCells().map((cell) => {
                  const col = columns.find((c) => c.id === cell.column.id);
                  const align = col?.align ?? "left";
                  return (
                    <TableCell
                      key={cell.id}
                      className={cn(alignClass[align])}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

/**
 * Generic `forwardRef` wrapper. The cast preserves the generic `T`
 * parameter that `React.forwardRef` otherwise erases.
 */
const DataTable = React.forwardRef(DataTableInner) as <T>(
  props: DataTableProps<T> & { ref?: React.ForwardedRef<HTMLTableElement> },
) => React.ReactElement;

// Attach a displayName via the inner function (forwardRef result has no
// stable identity for the cast above).
DataTableInner.displayName = "DataTable";
(DataTable as { displayName?: string }).displayName = "DataTable";

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { DataTable, dataTableVariants };
export default DataTable;
