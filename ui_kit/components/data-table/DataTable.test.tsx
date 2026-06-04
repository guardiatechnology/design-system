import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { axeInThemes } from "@/test-utils/a11y";
import {
  DataTable,
  dataTableVariants,
  type DataTableColumn,
} from "./index";

/**
 * Tests for Plan #101 (parent Tech Task #100) — DataTable v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come
 * from `docs/issues/issue-100/02-requirements.md`.
 *
 * Behavioral, from the user's point of view (`lex-frontend-testing`):
 * accessible queries (`getByRole`), real component tree (Checkbox + Table
 * primitives + TanStack are real collaborators, never mocked).
 */

// ──────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────

interface Conta {
  id: number;
  cliente: string;
  status: string;
  valor: number;
}

const ROWS: Conta[] = [
  { id: 1, cliente: "Contábil Silva", status: "conciliado", valor: 128450 },
  { id: 2, cliente: "Escritório Nova Era", status: "pendente", valor: 34200 },
  { id: 3, cliente: "Prime Partners", status: "divergente", valor: 89120 },
];

const COLUMNS: DataTableColumn<Conta>[] = [
  { id: "cliente", header: "Cliente", accessorKey: "cliente", sortable: true },
  { id: "status", header: "Status", accessorKey: "status" },
  {
    id: "valor",
    header: "Valor",
    accessorKey: "valor",
    align: "right",
    sortable: true,
    cell: (value) => `R$ ${value}`,
  },
];

function renderTable(props: Partial<React.ComponentProps<typeof DataTable<Conta>>> = {}) {
  return render(<DataTable<Conta> columns={COLUMNS} rows={ROWS} {...props} />);
}

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1, AC-19)
// ──────────────────────────────────────────────────────────────────

describe("DataTable — public surface", () => {
  it("AC-1: exports DataTable component", () => {
    expect(DataTable).toBeDefined();
  });

  it("AC-1: DataTable.displayName === 'DataTable'", () => {
    expect(
      (DataTable as { displayName?: string }).displayName,
    ).toBe("DataTable");
  });

  it("AC-19: exports dataTableVariants CVA accessor, callable with defaults", () => {
    expect(typeof dataTableVariants).toBe("function");
    const cls = dataTableVariants({});
    expect(cls).toContain("w-full");
    // default density === "normal"
    expect(cls).toContain("[&_td]:py-3");
  });
});

// ──────────────────────────────────────────────────────────────────
// Table semantics + rows from data (AC-2, AC-3, AC-4)
// ──────────────────────────────────────────────────────────────────

describe("DataTable — semantics + data", () => {
  it("AC-2: renders a real <table> reachable via role 'table'", () => {
    renderTable();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });

  it("AC-2: every header cell uses scope='col'", () => {
    renderTable();
    const columnHeaders = screen.getAllByRole("columnheader");
    // 3 data columns
    expect(columnHeaders).toHaveLength(3);
    for (const th of columnHeaders) {
      expect(th).toHaveAttribute("scope", "col");
    }
  });

  it("AC-3: renders one body row per data item", () => {
    renderTable();
    // header row + 3 body rows
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.getByText("Contábil Silva")).toBeInTheDocument();
    expect(screen.getByText("Prime Partners")).toBeInTheDocument();
  });

  it("AC-3: renders cells in column order", () => {
    renderTable();
    const firstBodyRow = screen.getAllByRole("row")[1];
    const cells = within(firstBodyRow!).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("Contábil Silva");
    expect(cells[1]).toHaveTextContent("conciliado");
  });

  it("AC-4: custom cell renderer is applied", () => {
    renderTable();
    expect(screen.getByText("R$ 128450")).toBeInTheDocument();
  });

  it("AC-4: value accessor without custom cell renders raw value", () => {
    renderTable();
    expect(screen.getByText("pendente")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Sorting (AC-5, AC-6, AC-7)
// ──────────────────────────────────────────────────────────────────

describe("DataTable — sorting", () => {
  it("AC-5: sortable header renders a button; non-sortable does not", () => {
    renderTable();
    expect(
      screen.getByRole("button", { name: /cliente/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /status/i }),
    ).not.toBeInTheDocument();
  });

  it("AC-5: clicking a sortable header reorders the rows asc then desc", async () => {
    const user = userEvent.setup();
    renderTable();
    const clienteSort = screen.getByRole("button", { name: /cliente/i });

    await user.click(clienteSort); // asc
    let bodyRows = screen.getAllByRole("row").slice(1);
    expect(within(bodyRows[0]!).getAllByRole("cell")[0]).toHaveTextContent(
      "Contábil Silva",
    );

    await user.click(clienteSort); // desc
    bodyRows = screen.getAllByRole("row").slice(1);
    expect(within(bodyRows[0]!).getAllByRole("cell")[0]).toHaveTextContent(
      "Prime Partners",
    );
  });

  it("AC-5: a third click clears the sort (asc → desc → none)", async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();
    renderTable({ onSortingChange });
    const clienteSort = screen.getByRole("button", { name: /cliente/i });

    await user.click(clienteSort);
    await user.click(clienteSort);
    await user.click(clienteSort);

    expect(onSortingChange).toHaveBeenLastCalledWith([]);
  });

  it("AC-6: sortable header exposes aria-sort reflecting the current state", async () => {
    const user = userEvent.setup();
    renderTable();
    const header = screen
      .getByRole("button", { name: /valor/i })
      .closest("th")!;

    expect(header).toHaveAttribute("aria-sort", "none");
    await user.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "ascending");
    await user.click(within(header).getByRole("button"));
    expect(header).toHaveAttribute("aria-sort", "descending");
  });

  it("AC-6: non-sortable header has no aria-sort", () => {
    renderTable();
    const statusHeader = screen.getByRole("columnheader", { name: "Status" });
    expect(statusHeader).not.toHaveAttribute("aria-sort");
  });

  it("AC-7: defaultSorting orders rows on first render (uncontrolled)", () => {
    renderTable({ defaultSorting: [{ id: "valor", desc: true }] });
    const bodyRows = screen.getAllByRole("row").slice(1);
    expect(within(bodyRows[0]!).getAllByRole("cell")[0]).toHaveTextContent(
      "Contábil Silva", // 128450 is the highest
    );
  });

  it("AC-7: controlled sorting renders the provided order and calls back", async () => {
    const user = userEvent.setup();
    const onSortingChange = vi.fn();
    renderTable({ sorting: [{ id: "cliente", desc: true }], onSortingChange });

    const bodyRows = screen.getAllByRole("row").slice(1);
    expect(within(bodyRows[0]!).getAllByRole("cell")[0]).toHaveTextContent(
      "Prime Partners",
    );

    await user.click(screen.getByRole("button", { name: /cliente/i }));
    expect(onSortingChange).toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────────────────────
// Selection (AC-8, AC-9, AC-10)
// ──────────────────────────────────────────────────────────────────

describe("DataTable — selection", () => {
  it("AC-8: selectable adds a labelled checkbox per row", () => {
    renderTable({ selectable: true });
    const rowChecks = screen.getAllByRole("checkbox", {
      name: "Selecionar linha",
    });
    expect(rowChecks).toHaveLength(3);
  });

  it("AC-8: toggling a row checkbox marks the row as selected", async () => {
    const user = userEvent.setup();
    renderTable({ selectable: true });
    const firstRowCheck = screen.getAllByRole("checkbox", {
      name: "Selecionar linha",
    })[0]!;

    await user.click(firstRowCheck);
    const firstBodyRow = screen.getAllByRole("row")[1]!;
    expect(firstBodyRow).toHaveAttribute("aria-selected", "true");
  });

  it("AC-9: select-all checkbox selects every row", async () => {
    const user = userEvent.setup();
    renderTable({ selectable: true });
    const selectAll = screen.getByRole("checkbox", {
      name: "Selecionar todas as linhas",
    });

    await user.click(selectAll);
    const bodyRows = screen.getAllByRole("row").slice(1);
    for (const row of bodyRows) {
      expect(row).toHaveAttribute("aria-selected", "true");
    }
  });

  it("AC-9: select-all is indeterminate on partial selection", async () => {
    const user = userEvent.setup();
    renderTable({ selectable: true });
    await user.click(
      screen.getAllByRole("checkbox", { name: "Selecionar linha" })[0]!,
    );
    const selectAll = screen.getByRole("checkbox", {
      name: "Selecionar todas as linhas",
    });
    expect(selectAll).toHaveAttribute("data-state", "indeterminate");
  });

  it("AC-10: controlled rowSelection renders the provided state + calls back", async () => {
    const user = userEvent.setup();
    const onRowSelectionChange = vi.fn();
    renderTable({
      selectable: true,
      rowSelection: { "2": true },
      onRowSelectionChange,
    });

    // row with id=2 (Escritório Nova Era) is the 2nd body row
    const bodyRows = screen.getAllByRole("row").slice(1);
    expect(bodyRows[1]).toHaveAttribute("aria-selected", "true");

    await user.click(
      screen.getAllByRole("checkbox", { name: "Selecionar linha" })[0]!,
    );
    expect(onRowSelectionChange).toHaveBeenCalled();
  });

  it("AC-10: rowKey defines the stable selection key", async () => {
    const user = userEvent.setup();
    const onRowSelectionChange = vi.fn();
    renderTable({
      selectable: true,
      rowKey: (row) => `conta-${row.id}`,
      onRowSelectionChange,
    });
    await user.click(
      screen.getAllByRole("checkbox", { name: "Selecionar linha" })[0]!,
    );
    expect(onRowSelectionChange).toHaveBeenCalledWith({ "conta-1": true });
  });
});

// ──────────────────────────────────────────────────────────────────
// Row click (AC-11)
// ──────────────────────────────────────────────────────────────────

describe("DataTable — row click", () => {
  it("AC-11: onRowClick fires with the row data", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderTable({ onRowClick });
    await user.click(screen.getByText("Prime Partners"));
    expect(onRowClick).toHaveBeenCalledWith(ROWS[2]);
  });

  it("AC-11: clicking the row checkbox does not trigger onRowClick", async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    renderTable({ selectable: true, onRowClick });
    await user.click(
      screen.getAllByRole("checkbox", { name: "Selecionar linha" })[0]!,
    );
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────────────────────
// Density + alignment + sticky (AC-12, AC-14, AC-15)
// ──────────────────────────────────────────────────────────────────

describe("DataTable — layout props", () => {
  it("AC-12: density='compact' applies the compact padding tokens", () => {
    renderTable({ density: "compact" });
    expect(screen.getByRole("table").className).toContain("[&_td]:py-[7px]");
  });

  it("AC-12: density defaults to normal", () => {
    renderTable();
    expect(screen.getByRole("table").className).toContain("[&_td]:py-3");
  });

  it("AC-14: stickyHeader pins the header", () => {
    renderTable({ stickyHeader: true });
    const thead = screen.getByRole("table").querySelector("thead");
    expect(thead).not.toBeNull();
    expect(thead!.className).toContain("sticky");
  });

  it("AC-15: align='right' applies right alignment to the column header", () => {
    renderTable();
    const valorHeader = screen
      .getByRole("button", { name: /valor/i })
      .closest("th")!;
    expect(valorHeader.className).toContain("text-right");
  });
});

// ──────────────────────────────────────────────────────────────────
// Empty state (AC-13)
// ──────────────────────────────────────────────────────────────────

describe("DataTable — empty state", () => {
  it("AC-13: empty rows render a single announced empty row", () => {
    renderTable({ rows: [] });
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Sem dados");
    // header row + 1 empty row
    expect(screen.getAllByRole("row")).toHaveLength(2);
  });

  it("AC-13: emptyText is customizable", () => {
    renderTable({ rows: [], emptyText: "Nenhuma conciliação no período" });
    expect(
      screen.getByText("Nenhuma conciliação no período"),
    ).toBeInTheDocument();
  });

  it("AC-13: empty cell spans all columns including the selection column", () => {
    renderTable({ rows: [], selectable: true });
    const emptyCell = screen.getByRole("cell");
    expect(emptyCell).toHaveAttribute("colspan", "4");
  });
});

// ──────────────────────────────────────────────────────────────────
// Keyboard (AC-16)
// ──────────────────────────────────────────────────────────────────

describe("DataTable — keyboard", () => {
  it("AC-16: sortable header is focusable via Tab and activatable via Enter", async () => {
    const user = userEvent.setup();
    renderTable();
    await user.tab();
    const clienteSort = screen.getByRole("button", { name: /cliente/i });
    expect(clienteSort).toHaveFocus();

    await user.keyboard("{Enter}");
    const header = clienteSort.closest("th")!;
    expect(header).toHaveAttribute("aria-sort", "ascending");
  });

  it("AC-16: row checkbox is toggleable via the Space key", async () => {
    const user = userEvent.setup();
    renderTable({ selectable: true });
    const firstRowCheck = screen.getAllByRole("checkbox", {
      name: "Selecionar linha",
    })[0]!;
    firstRowCheck.focus();
    await user.keyboard(" ");
    const firstBodyRow = screen.getAllByRole("row")[1]!;
    expect(firstBodyRow).toHaveAttribute("aria-selected", "true");
  });
});

// ──────────────────────────────────────────────────────────────────
// Accessibility — jest-axe light + dark (AC-18)
// ──────────────────────────────────────────────────────────────────

describe("DataTable — a11y (light + dark)", () => {
  it("AC-18: Default has no violations in light + dark", async () => {
    const { container } = renderTable({ caption: "Conciliações" });
    await axeInThemes(container);
  });

  it("AC-18: sorted state has no violations in light + dark", async () => {
    const { container } = renderTable({
      defaultSorting: [{ id: "valor", desc: true }],
      caption: "Conciliações ordenadas",
    });
    await axeInThemes(container);
  });

  it("AC-18: selection (incl. select-all) has no violations in light + dark", async () => {
    const user = userEvent.setup();
    const { container } = renderTable({
      selectable: true,
      caption: "Conciliações selecionáveis",
    });
    await user.click(
      screen.getByRole("checkbox", { name: "Selecionar todas as linhas" }),
    );
    await axeInThemes(container);
  });

  it("AC-18: empty state has no violations in light + dark", async () => {
    const { container } = renderTable({
      rows: [],
      caption: "Conciliações vazias",
    });
    await axeInThemes(container);
  });
});
