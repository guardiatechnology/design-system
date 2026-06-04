import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Kanban, type KanbanCard, type KanbanColumn, type KanbanSwimlane } from "./index";

const meta: Meta<typeof Kanban> = {
  title: "Components/Kanban",
  component: Kanban,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Board com colunas, cards arrastáveis (drag-and-drop HTML5 nativo, zero dependência nova), swimlanes opcionais e colunas colapsáveis. Uso típico na Guardia: pipeline de revisão contábil, tarefas da equipe, pendências com clientes. Renderização de card customizável via `renderCard`. Tokens 100% semânticos (violet/orange Notion-canonical para o alvo de drag; danger/warning/success para prioridade, prazo e confiança do agente). Decisões em ADR-024.",
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Fixtures — pipeline de revisão contábil
// ──────────────────────────────────────────────────────────────────

const reviewColumns: KanbanColumn[] = [
  { id: "backlog", title: "Backlog", color: "var(--guardia-gray-500)" },
  { id: "review", title: "Em revisão", color: "var(--guardia-orange-500)" },
  { id: "approval", title: "Aguardando aprovação", color: "var(--guardia-purple-500)" },
  { id: "done", title: "Fechado", color: "var(--signal-green)" },
];

const reviewCards: KanbanCard[] = [
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

const swimlanes: KanbanSwimlane[] = [
  { id: "cliente-alfa", title: "Alfa Comércio LTDA" },
  { id: "cliente-beta", title: "Beta Serviços ME", defaultCollapsed: true },
];

const lanedCards: KanbanCard[] = reviewCards.map((c, i) => ({
  ...c,
  laneId: i % 2 === 0 ? "cliente-alfa" : "cliente-beta",
}));

// Interactive wrapper so the playground can actually move cards.
function InteractiveBoard(props: {
  swimlaned?: boolean;
  searchable?: boolean;
}): React.ReactElement {
  const [cards, setCards] = React.useState<KanbanCard[]>(
    props.swimlaned ? lanedCards : reviewCards,
  );

  const onCardMove = (
    cardId: string,
    toColumnId: string,
    toLaneId: string | undefined,
    toIndex: number,
  ): void => {
    setCards((prev) => {
      const moved = prev.find((c) => c.id === cardId);
      if (!moved) return prev;
      const without = prev.filter((c) => c.id !== cardId);
      const updated: KanbanCard = {
        ...moved,
        columnId: toColumnId,
        laneId: toLaneId,
      };
      // insert at toIndex among the cards of the destination column/lane
      const destSiblings = without.filter(
        (c) => c.columnId === toColumnId && c.laneId === toLaneId,
      );
      const anchor = destSiblings[toIndex];
      if (!anchor) return [...without, updated];
      const at = without.indexOf(anchor);
      return [...without.slice(0, at), updated, ...without.slice(at)];
    });
  };

  return (
    <Kanban
      title="Pipeline de revisão"
      columns={reviewColumns}
      cards={cards}
      swimlanes={props.swimlaned ? swimlanes : undefined}
      searchable={props.searchable}
      onCardMove={onCardMove}
    />
  );
}

// ──────────────────────────────────────────────────────────────────
// Default — pipeline de revisão (drag-and-drop ativo)
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div className="bg-bg p-4">
      <InteractiveBoard searchable />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Pipeline de revisão contábil. Arraste um card entre colunas para movê-lo (`onCardMove`). Header com busca filtra por título, tag e responsável. Cada coluna é uma região rotulada; cada card é um `<button>` arrastável e acessível via teclado.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Swimlanes — agrupamento por cliente
// ──────────────────────────────────────────────────────────────────

export const Swimlanes: Story = {
  render: () => (
    <div className="bg-bg p-4">
      <InteractiveBoard swimlaned />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Cards agrupados por swimlane (cliente). Cada lane colapsa via seu cabeçalho; `defaultCollapsed` inicia a lane recolhida. Sem `swimlanes`, todos os cards caem numa lane default sem cabeçalho.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Totals + collapse + add — coluna rica
// ──────────────────────────────────────────────────────────────────

export const TotalsAndActions: Story = {
  render: () => {
    const cols: KanbanColumn[] = [
      {
        id: "aberto",
        title: "Em aberto",
        showTotals: true,
        sumValue: (c) => (typeof c.raw === "number" ? c.raw : 0),
        sumFormat: (s) =>
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(s),
        onAdd: () => {},
      },
      { id: "pago", title: "Pago" },
    ];
    const cards: KanbanCard[] = [
      { id: "p1", columnId: "aberto", title: "NF Alfa", value: "R$ 1.200", raw: 1200 },
      { id: "p2", columnId: "aberto", title: "NF Beta", value: "R$ 3.400", raw: 3400 },
    ];
    return (
      <div className="bg-bg p-4">
        <Kanban title="Contas a pagar" columns={cols} cards={cards} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Coluna com `showTotals` + `sumValue`/`sumFormat` mostra o somatório formatado no header; `onAdd` renderiza a ação 'Adicionar card'. Clique no cabeçalho da coluna para colapsá-la.",
      },
    },
  },
};
