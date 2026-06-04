import * as React from "react";

import { DataTable, type DataTableColumn } from "@ds/components/data-table";
import { Badge } from "@ds/components/badge";

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

// ──────────────────────────────────────────────────────────────────
// Padrão — ordenação por clique
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <div className="py-4">
      <DataTable<Conta> columns={COLUMNS} rows={ROWS} caption="Conciliações" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Seleção + ordenação inicial + render customizado
// ──────────────────────────────────────────────────────────────────

export function SelectableRow(): React.ReactElement {
  const [selection, setSelection] = React.useState<Record<string, boolean>>({
    "2": true,
  });
  const selected = Object.keys(selection).filter((k) => selection[k]);
  return (
    <div className="flex flex-col gap-3 py-4">
      <DataTable<Conta>
        columns={COLUMNS}
        rows={ROWS}
        selectable
        rowSelection={selection}
        onRowSelectionChange={setSelection}
        defaultSorting={[{ id: "valor", desc: true }]}
        caption="Conciliações selecionáveis"
      />
      <p className="text-xs text-fg-muted">
        Selecionados:{" "}
        <code className="rounded-sm bg-primary/10 px-1.5 py-0.5 text-primary">
          {selected.join(", ") || "—"}
        </code>
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Densidades
// ──────────────────────────────────────────────────────────────────

export function DensitiesRow(): React.ReactElement {
  return (
    <div className="flex flex-col gap-6 py-4">
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-fg-muted">
          Compact
        </p>
        <DataTable<Conta>
          columns={COLUMNS.slice(0, 4)}
          rows={ROWS}
          density="compact"
        />
      </div>
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-wide text-fg-muted">
          Comfortable
        </p>
        <DataTable<Conta>
          columns={COLUMNS.slice(0, 4)}
          rows={ROWS.slice(0, 3)}
          density="comfortable"
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Estado vazio
// ──────────────────────────────────────────────────────────────────

export function EmptyRow(): React.ReactElement {
  return (
    <div className="py-4">
      <DataTable<Conta>
        columns={COLUMNS.slice(0, 4)}
        rows={[]}
        emptyText="Nenhuma conciliação no período"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Clicável por linha
// ──────────────────────────────────────────────────────────────────

export function ClickableRow(): React.ReactElement {
  const [last, setLast] = React.useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3 py-4">
      <DataTable<Conta>
        columns={COLUMNS.slice(0, 4)}
        rows={ROWS}
        onRowClick={(row) => setLast(row.cliente)}
        caption="Conciliações clicáveis"
      />
      <p className="text-xs text-fg-muted">
        Última linha clicada: <strong>{last ?? "—"}</strong>
      </p>
    </div>
  );
}
