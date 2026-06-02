import * as React from "react";

import {
  Kanban,
  type KanbanCard,
  type KanbanColumn,
  type KanbanSwimlane,
} from "@ds/components/kanban";

// ──────────────────────────────────────────────────────────────────
// Shared fixtures — pipeline de revisão contábil
// ──────────────────────────────────────────────────────────────────

const columns: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", color: "var(--guardia-gray-500)" },
  { id: "review", title: "Em revisão", color: "var(--guardia-orange-500)" },
  { id: "approval", title: "Aprovação", color: "var(--guardia-purple-500)" },
  { id: "done", title: "Fechado", color: "var(--signal-green)" },
];

const cards: KanbanCard[] = [
  {
    id: "t1",
    columnId: "backlog",
    title: "Conciliar extrato Itaú — Março",
    displayId: "REV-118",
    priority: "high",
    tags: [{ label: "conciliação", tone: "violet" }],
    assignee: { name: "Luana Rocha" },
    dueDate: "30/04",
    dueStatus: "danger",
    confidence: 0.97,
    commentsCount: 2,
  },
  {
    id: "t2",
    columnId: "backlog",
    title: "Importar NF-e do fornecedor Alfa",
    displayId: "REV-119",
    priority: "med",
    tags: [{ label: "fiscal", tone: "amber" }],
    confidence: 0.82,
    attachmentsCount: 3,
  },
  {
    id: "t3",
    columnId: "review",
    title: "Revisar lançamentos duplicados",
    displayId: "REV-104",
    priority: "med",
    assignee: { name: "Marcos Dias" },
    progress: 0.6,
    confidence: 0.74,
  },
  {
    id: "t4",
    columnId: "approval",
    title: "Aprovar fechamento de competência",
    displayId: "REV-092",
    priority: "high",
    assignee: { name: "Ana Prado" },
    value: "R$ 248.900",
    dueDate: "28/04",
    dueStatus: "warn",
    confidence: 0.99,
  },
  {
    id: "t5",
    columnId: "done",
    title: "Baixar guias DARF",
    displayId: "REV-077",
    priority: "low",
    confidence: 0.6,
  },
];

/** Controlled wrapper so the docs board actually moves cards on drop. */
function useMovableCards(initial: KanbanCard[]) {
  const [state, setState] = React.useState<KanbanCard[]>(initial);
  const onCardMove = (
    cardId: string,
    toColumnId: string,
    toLaneId: string | undefined,
    toIndex: number,
  ): void => {
    setState((prev) => {
      const moved = prev.find((c) => c.id === cardId);
      if (!moved) return prev;
      const without = prev.filter((c) => c.id !== cardId);
      const updated: KanbanCard = { ...moved, columnId: toColumnId, laneId: toLaneId };
      const siblings = without.filter(
        (c) => c.columnId === toColumnId && c.laneId === toLaneId,
      );
      const anchor = siblings[toIndex];
      if (!anchor) return [...without, updated];
      const at = without.indexOf(anchor);
      return [...without.slice(0, at), updated, ...without.slice(at)];
    });
  };
  return { cards: state, onCardMove };
}

// ──────────────────────────────────────────────────────────────────
// Padrão — board com busca + drag-and-drop
// ──────────────────────────────────────────────────────────────────

export function BasicBoard(): React.ReactElement {
  const { cards: live, onCardMove } = useMovableCards(cards);
  return (
    <Kanban
      title="Pipeline de revisão"
      columns={columns}
      cards={live}
      searchable
      onCardMove={onCardMove}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// Swimlanes — agrupamento por cliente
// ──────────────────────────────────────────────────────────────────

const swimlanes: KanbanSwimlane[] = [
  { id: "alfa", title: "Alfa Comércio LTDA" },
  { id: "beta", title: "Beta Serviços ME", defaultCollapsed: true },
];

export function SwimlanesBoard(): React.ReactElement {
  const laned = React.useMemo(
    () => cards.map((c, i) => ({ ...c, laneId: i % 2 === 0 ? "alfa" : "beta" })),
    [],
  );
  const { cards: live, onCardMove } = useMovableCards(laned);
  return (
    <Kanban
      columns={columns}
      cards={live}
      swimlanes={swimlanes}
      onCardMove={onCardMove}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// Totais + ação de adicionar + colapsável
// ──────────────────────────────────────────────────────────────────

export function TotalsBoard(): React.ReactElement {
  const cols: KanbanColumn[] = [
    {
      id: "aberto",
      title: "Em aberto",
      showTotals: true,
      sumValue: (c) => (typeof c.raw === "number" ? c.raw : 0),
      sumFormat: (s) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(s),
      onAdd: () => {},
    },
    { id: "pago", title: "Pago" },
  ];
  const data: KanbanCard[] = [
    { id: "p1", columnId: "aberto", title: "NF Alfa", value: "R$ 1.200", raw: 1200 },
    { id: "p2", columnId: "aberto", title: "NF Beta", value: "R$ 3.400", raw: 3400 },
  ];
  return <Kanban title="Contas a pagar" columns={cols} cards={data} />;
}

// ──────────────────────────────────────────────────────────────────
// Estado vazio
// ──────────────────────────────────────────────────────────────────

export function EmptyBoard(): React.ReactElement {
  return (
    <Kanban
      columns={[
        { id: "a", title: "A fazer", emptyState: "Nenhuma tarefa pendente" },
        { id: "b", title: "Concluído" },
      ]}
      cards={[]}
    />
  );
}
