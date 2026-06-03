import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "../badge";
import { DataTable, type DataTableColumn } from "./index";

interface Conta {
  id: number;
  cliente: string;
  status: "conciliado" | "pendente" | "divergente";
  valor: number;
  resp: string;
  data: string;
}

const ROWS: Conta[] = [
  { id: 1, cliente: "Contábil Silva & Cia", status: "conciliado", valor: 128450.2, resp: "Ana Lima", data: "12/03/2025" },
  { id: 2, cliente: "Escritório Nova Era", status: "pendente", valor: 34200.0, resp: "Bruno Castro", data: "11/03/2025" },
  { id: 3, cliente: "Prime Partners", status: "divergente", valor: 89120.75, resp: "Carla Diniz", data: "11/03/2025" },
  { id: 4, cliente: "Martins Consultoria", status: "conciliado", valor: 12890.4, resp: "Daniel Efe", data: "10/03/2025" },
  { id: 5, cliente: "Grupo Horizonte", status: "pendente", valor: 256700.9, resp: "Elisa Faria", data: "10/03/2025" },
];

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const statusVariant: Record<Conta["status"], "success" | "warning" | "danger"> = {
  conciliado: "success",
  pendente: "warning",
  divergente: "danger",
};

const COLUMNS: DataTableColumn<Conta>[] = [
  {
    id: "cliente",
    header: "Cliente",
    accessorKey: "cliente",
    sortable: true,
    cell: (value) => <span className="font-medium">{String(value)}</span>,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    sortable: true,
    cell: (value) => {
      const status = value as Conta["status"];
      const label = status.charAt(0).toUpperCase() + status.slice(1);
      return <Badge variant={statusVariant[status]}>{label}</Badge>;
    },
  },
  {
    id: "valor",
    header: "Valor",
    accessorKey: "valor",
    align: "right",
    sortable: true,
    cell: (value) => fmtBRL(value as number),
  },
  { id: "resp", header: "Responsável", accessorKey: "resp", sortable: true },
  { id: "data", header: "Atualizado em", accessorKey: "data", align: "right" },
];

const meta: Meta<typeof DataTable<Conta>> = {
  title: "Components/DataTable",
  // Pin the story id to the project-canonical kebab slug so Storybook and the
  // docs playground share ONE slug (`data-table`) — Storybook would otherwise
  // derive `datatable` from the PascalCase title.
  id: "components-data-table",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Tabela de dados com ordenação, seleção e densidade configurável. Wrapper sobre `@tanstack/react-table` que compõe os primitivos `Table*` do DS, renderizando `<table>` nativo com semântica acessível (`scope=\"col\"`, `aria-sort`, checkboxes rotulados). Tokens semânticos Notion-canonical; zero hardcode. Decisões em ADR-023.",
      },
    },
  },
  argTypes: {
    density: { control: "radio", options: ["compact", "normal", "comfortable"] },
    selectable: { control: "boolean" },
    stickyHeader: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Default
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    columns: COLUMNS,
    rows: ROWS,
    caption: "Conciliações do período",
  },
};

// ──────────────────────────────────────────────────────────────────
// Selectable + initial sort
// ──────────────────────────────────────────────────────────────────

export const Selectable: Story = {
  render: function SelectableStory(args) {
    const [selection, setSelection] = React.useState<Record<string, boolean>>({
      "2": true,
    });
    return (
      <div className="flex flex-col gap-3">
        <DataTable<Conta>
          {...args}
          columns={COLUMNS}
          rows={ROWS}
          selectable
          rowSelection={selection}
          onRowSelectionChange={setSelection}
          defaultSorting={[{ id: "valor", desc: true }]}
        />
        <p className="text-xs text-fg-muted">
          Selecionados:{" "}
          <code className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-primary">
            {Object.keys(selection).filter((k) => selection[k]).join(", ") || "—"}
          </code>
        </p>
      </div>
    );
  },
};

// ──────────────────────────────────────────────────────────────────
// Densities
// ──────────────────────────────────────────────────────────────────

export const Densities: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <DataTable<Conta> columns={COLUMNS.slice(0, 4)} rows={ROWS} density="compact" />
      <DataTable<Conta> columns={COLUMNS.slice(0, 4)} rows={ROWS.slice(0, 3)} density="comfortable" />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Empty
// ──────────────────────────────────────────────────────────────────

export const Empty: Story = {
  args: {
    columns: COLUMNS.slice(0, 4),
    rows: [],
    emptyText: "Nenhuma conciliação no período",
  },
};
