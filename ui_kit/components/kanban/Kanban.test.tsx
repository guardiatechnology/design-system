import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Kanban,
  kanbanColumnVariants,
  type KanbanCard,
  type KanbanColumn,
  type KanbanSwimlane,
} from "./index";
import { cardMatches, confidenceBucket } from "./inner_components";

/**
 * Tests for Plan #103 (parent feature Issue #102) — Kanban v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come from
 * `docs/issues/issue-102/02-requirements.md`.
 *
 * jsdom has no native drag-and-drop engine, so drag tests dispatch
 * `fireEvent.dragStart/dragOver/drop` with a stubbed `dataTransfer` and
 * assert the resulting callbacks / DOM state — never pixel motion.
 */

// ──────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────

const columns: KanbanColumn[] = [
  { id: "todo", title: "A fazer" },
  { id: "doing", title: "Em andamento" },
  { id: "done", title: "Concluído" },
];

const cards: KanbanCard[] = [
  {
    id: "c1",
    columnId: "todo",
    title: "Conciliar extrato Itaú",
    description: "Março/2026",
    displayId: "TSK-101",
    priority: "high",
    tags: [{ label: "fiscal", tone: "violet" }],
    assignee: { name: "Luana Rocha" },
    dueDate: "30/04",
    dueStatus: "danger",
    value: "R$ 12.480",
    confidence: 0.97,
    progress: 0.4,
    commentsCount: 3,
    attachmentsCount: 1,
  },
  {
    id: "c2",
    columnId: "todo",
    title: "Revisar NF-e pendentes",
    priority: "med",
    confidence: 0.8,
  },
  {
    id: "c3",
    columnId: "doing",
    title: "Fechar competência",
    priority: "low",
    confidence: 0.6,
  },
];

function dataTransferStub(): DataTransfer {
  let stored = "";
  return {
    setData: (_type: string, value: string) => {
      stored = value;
    },
    getData: () => stored,
    effectAllowed: "all",
    dropEffect: "none",
    // unused surface — cast keeps the test honest about what it stubs
  } as unknown as DataTransfer;
}

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});
afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — public surface", () => {
  it("AC-1: exports Kanban (named + default) and the CVA accessor", () => {
    expect(Kanban).toBeDefined();
    expect(Kanban.displayName).toBe("Kanban");
    expect(typeof kanbanColumnVariants).toBe("function");
  });

  it("AC-1 / AC-19: kanbanColumnVariants() defaults compose semantic tokens only", () => {
    const cls = kanbanColumnVariants({});
    expect(cls).toContain("bg-muted");
    expect(cls).toContain("border-border");
    expect(cls).not.toMatch(/#[0-9a-fA-F]{3,8}/);
    expect(cls).not.toMatch(/bg-gray-\d+/);
    expect(cls).not.toMatch(/text-red-\d+/);
  });

  it("AC-1: kanbanColumnVariants reflects isOver + collapsed flags", () => {
    const over = kanbanColumnVariants({ isOver: true });
    expect(over).toContain("border-action");
    expect(over).toContain("bg-bg-hover");
    const collapsed = kanbanColumnVariants({ collapsed: true });
    expect(collapsed).toContain("w-11");
  });
});

// ──────────────────────────────────────────────────────────────────
// Pure helpers (AC-14, AC-22 backing)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — pure helpers", () => {
  it("AC-14: cardMatches returns true for empty query", () => {
    expect(cardMatches(cards[0]!, "")).toBe(true);
  });

  it("AC-14: cardMatches matches title, displayId, assignee and tag", () => {
    expect(cardMatches(cards[0]!, "itaú")).toBe(true);
    expect(cardMatches(cards[0]!, "TSK-101")).toBe(true);
    expect(cardMatches(cards[0]!, "luana")).toBe(true);
    expect(cardMatches(cards[0]!, "fiscal")).toBe(true);
    expect(cardMatches(cards[0]!, "inexistente")).toBe(false);
  });

  it("AC-22: confidenceBucket maps thresholds high/mid/low", () => {
    expect(confidenceBucket(0.97)).toBe("high");
    expect(confidenceBucket(0.8)).toBe("mid");
    expect(confidenceBucket(0.5)).toBe("low");
  });
});

// ──────────────────────────────────────────────────────────────────
// Columns + cards from data (AC-2, AC-3)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — render from data", () => {
  it("AC-2: renders one labeled region per column", () => {
    render(<Kanban columns={columns} cards={cards} />);
    expect(
      screen.getByRole("group", { name: /A fazer/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /Em andamento/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /Concluído/ }),
    ).toBeInTheDocument();
  });

  it("AC-2: column accessible name carries its card count", () => {
    render(<Kanban columns={columns} cards={cards} />);
    // "todo" has 2 cards, "doing" has 1, "done" has 0
    expect(screen.getByRole("group", { name: "A fazer (2)" })).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Em andamento (1)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "Concluído (0)" }),
    ).toBeInTheDocument();
  });

  it("AC-3: each card renders inside its column as a labeled button", () => {
    render(<Kanban columns={columns} cards={cards} />);
    const todo = screen.getByRole("group", { name: /A fazer/ });
    expect(
      within(todo).getByRole("button", { name: "Conciliar extrato Itaú" }),
    ).toBeInTheDocument();
    expect(
      within(todo).getByRole("button", { name: "Revisar NF-e pendentes" }),
    ).toBeInTheDocument();
  });

  it("AC-3: card shows description, displayId and value", () => {
    render(<Kanban columns={columns} cards={cards} />);
    expect(screen.getByText("Março/2026")).toBeInTheDocument();
    expect(screen.getByText("TSK-101")).toBeInTheDocument();
    expect(screen.getByText("R$ 12.480")).toBeInTheDocument();
  });

  it("AC-22: tag renders, priority dot is labeled, confidence percent shows", () => {
    render(<Kanban columns={columns} cards={cards} />);
    expect(screen.getByText("fiscal")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "prioridade alta" }),
    ).toBeInTheDocument();
    expect(screen.getByText("97%")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Swimlanes (AC-4)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — swimlanes", () => {
  const swimlanes: KanbanSwimlane[] = [
    { id: "team-a", title: "Time A" },
    { id: "team-b", title: "Time B", defaultCollapsed: true },
  ];
  const laned: KanbanCard[] = [
    { id: "x1", columnId: "todo", laneId: "team-a", title: "Card A" },
    { id: "x2", columnId: "todo", laneId: "team-b", title: "Card B" },
  ];

  it("AC-4: renders a collapse toggle per lane", () => {
    render(<Kanban columns={columns} cards={laned} swimlanes={swimlanes} />);
    expect(
      screen.getByRole("button", { name: /Time A/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Time B/ }),
    ).toBeInTheDocument();
  });

  it("AC-4: lane respects defaultCollapsed (Team B body hidden initially)", () => {
    render(<Kanban columns={columns} cards={laned} swimlanes={swimlanes} />);
    expect(
      screen.getByRole("button", { name: "Card A" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Card B" })).toBeNull();
  });

  it("AC-13: clicking a collapsed lane header expands it", () => {
    render(<Kanban columns={columns} cards={laned} swimlanes={swimlanes} />);
    fireEvent.click(screen.getByRole("button", { name: /Time B/ }));
    expect(
      screen.getByRole("button", { name: "Card B" }),
    ).toBeInTheDocument();
  });

  it("AC-4: without swimlanes, no lane header is rendered", () => {
    render(<Kanban columns={columns} cards={cards} />);
    expect(screen.queryByRole("button", { name: /Time/ })).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────
// Empty column (AC-5)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — empty column", () => {
  it("AC-5: empty column renders default empty copy", () => {
    render(<Kanban columns={columns} cards={cards} />);
    // "done" column has no cards
    expect(screen.getByText("Sem cards por aqui")).toBeInTheDocument();
  });

  it("AC-5: empty column honors custom emptyState", () => {
    const cols: KanbanColumn[] = [
      { id: "done", title: "Concluído", emptyState: "Nada concluído ainda" },
    ];
    render(<Kanban columns={cols} cards={[]} />);
    expect(screen.getByText("Nada concluído ainda")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Drag and drop (AC-6, AC-7, AC-8, AC-9, AC-10)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — native HTML5 drag and drop", () => {
  it("AC-6: dragStart writes the card id to dataTransfer", () => {
    render(<Kanban columns={columns} cards={cards} />);
    const card = screen.getByRole("button", { name: "Conciliar extrato Itaú" });
    const dt = dataTransferStub();
    fireEvent.dragStart(card, { dataTransfer: dt });
    expect(dt.getData("text/plain")).toBe("c1");
  });

  it("AC-7 / AC-8: drop on another column calls onCardMove with that column id", () => {
    const onCardMove = vi.fn();
    render(
      <Kanban columns={columns} cards={cards} onCardMove={onCardMove} />,
    );
    const card = screen.getByRole("button", { name: "Conciliar extrato Itaú" });
    const target = screen.getByRole("group", { name: /Em andamento/ });

    fireEvent.dragStart(card, { dataTransfer: dataTransferStub() });
    fireEvent.dragOver(target, { dataTransfer: dataTransferStub() });
    fireEvent.drop(target, { dataTransfer: dataTransferStub() });

    expect(onCardMove).toHaveBeenCalledTimes(1);
    // moved card c1 → column "doing", default lane (undefined), tail index 1
    expect(onCardMove).toHaveBeenCalledWith("c1", "doing", undefined, 1);
  });

  it("AC-8: drop without a prior dragStart does not call onCardMove", () => {
    const onCardMove = vi.fn();
    render(
      <Kanban columns={columns} cards={cards} onCardMove={onCardMove} />,
    );
    const target = screen.getByRole("group", { name: /Em andamento/ });
    fireEvent.drop(target, { dataTransfer: dataTransferStub() });
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it("AC-9: drop onto an inter-card zone reorders within the same column", () => {
    const onCardMove = vi.fn();
    render(
      <Kanban columns={columns} cards={cards} onCardMove={onCardMove} />,
    );
    const card = screen.getByRole("button", { name: "Revisar NF-e pendentes" });
    const todo = screen.getByRole("group", { name: /A fazer/ });
    // inter-card drop zones are aria-hidden separators; pick the first one.
    const zones = todo.querySelectorAll('[aria-hidden="true"]');
    const firstZone = Array.from(zones).find(
      (z) => z.parentElement?.className.includes("overflow-y-auto"),
    ) as HTMLElement;

    fireEvent.dragStart(card, { dataTransfer: dataTransferStub() });
    fireEvent.dragOver(firstZone, { dataTransfer: dataTransferStub() });
    fireEvent.drop(firstZone, { dataTransfer: dataTransferStub() });

    expect(onCardMove).toHaveBeenCalledWith("c2", "todo", undefined, 0);
  });

  it("AC-10: dragEnd clears state without calling onCardMove", () => {
    const onCardMove = vi.fn();
    render(
      <Kanban columns={columns} cards={cards} onCardMove={onCardMove} />,
    );
    const card = screen.getByRole("button", { name: "Conciliar extrato Itaú" });
    fireEvent.dragStart(card, { dataTransfer: dataTransferStub() });
    fireEvent.dragEnd(card);
    expect(onCardMove).not.toHaveBeenCalled();
  });
});

// ──────────────────────────────────────────────────────────────────
// Click + collapse + add + totals + custom renderer (AC-11, 12, 15, 16, 17)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — interactions", () => {
  it("AC-11: clicking a card calls onCardClick with the card", () => {
    const onCardClick = vi.fn();
    render(
      <Kanban columns={columns} cards={cards} onCardClick={onCardClick} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Conciliar extrato Itaú" }),
    );
    expect(onCardClick).toHaveBeenCalledTimes(1);
    expect(onCardClick.mock.calls[0]![0]).toMatchObject({ id: "c1" });
  });

  it("AC-12: clicking a column header collapses its body (cards hidden)", () => {
    render(<Kanban columns={columns} cards={cards} />);
    expect(
      screen.getByRole("button", { name: "Conciliar extrato Itaú" }),
    ).toBeInTheDocument();
    // The column header toggle carries an explicit collapse/expand aria-label.
    const header = screen.getByRole("button", { name: "Colapsar coluna A fazer" });
    fireEvent.click(header);
    expect(screen.queryByRole("button", { name: "Conciliar extrato Itaú" })).toBeNull();
  });

  it("AC-12: defaultCollapsedColumns starts the column collapsed", () => {
    render(
      <Kanban
        columns={columns}
        cards={cards}
        defaultCollapsedColumns={["todo"]}
      />,
    );
    expect(screen.queryByRole("button", { name: "Conciliar extrato Itaú" })).toBeNull();
  });

  it("AC-15: a column with onAdd renders an add affordance that fires the callback", () => {
    const onAdd = vi.fn();
    const cols: KanbanColumn[] = [{ id: "todo", title: "A fazer", onAdd }];
    render(<Kanban columns={cols} cards={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /Adicionar card/ }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it("AC-16: renderCard replaces the default card body", () => {
    render(
      <Kanban
        columns={columns}
        cards={cards}
        renderCard={(card) => <span>custom:{card.id}</span>}
      />,
    );
    expect(screen.getByText("custom:c1")).toBeInTheDocument();
    // default-only content is gone
    expect(screen.queryByText("Março/2026")).toBeNull();
  });

  it("AC-17: column totals render formatted sum", () => {
    const cols: KanbanColumn[] = [
      {
        id: "todo",
        title: "A fazer",
        showTotals: true,
        sumValue: (c) => (c.id === "c1" ? 100 : 50),
        sumFormat: (s) => `R$ ${s}`,
      },
    ];
    render(<Kanban columns={cols} cards={cards} />);
    expect(screen.getByText("R$ 150")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Search (AC-14)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — search filter", () => {
  it("AC-14: typing in the search field filters visible cards", () => {
    render(<Kanban columns={columns} cards={cards} searchable />);
    const input = screen.getByRole("searchbox", { name: "Buscar cards" });
    fireEvent.change(input, { target: { value: "NF-e" } });
    expect(
      screen.getByRole("button", { name: "Revisar NF-e pendentes" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Conciliar extrato Itaú" })).toBeNull();
  });

  it("AC-14: header count reflects the filtered total", () => {
    render(
      <Kanban columns={columns} cards={cards} searchable title="Board" />,
    );
    expect(screen.getByText(/· 3 cards/)).toBeInTheDocument();
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Buscar cards" }),
      { target: { value: "Itaú" } },
    );
    expect(screen.getByText(/· 1 cards/)).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// className composition + drag description (AC-18, AC-21)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — composition + a11y wiring", () => {
  it("AC-21: consumer className is appended, base chain preserved", () => {
    const { container } = render(
      <Kanban columns={columns} cards={cards} className="my-board" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("my-board");
    expect(root.className).toContain("font-sans");
  });

  it("AC-18: cards reference an accessible drag description via aria-describedby", () => {
    render(<Kanban columns={columns} cards={cards} />);
    const card = screen.getByRole("button", { name: "Conciliar extrato Itaú" });
    const describedBy = card.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const hint = document.getElementById(describedBy!);
    expect(hint?.textContent).toMatch(/Arraste/);
  });

  it("AC-18: the board exposes a labeled navigation landmark", () => {
    render(
      <Kanban columns={columns} cards={cards} aria-label="Pipeline contábil" />,
    );
    expect(
      screen.getByRole("navigation", { name: "Pipeline contábil" }),
    ).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// a11y — jest-axe, light + dark (AC-20)
// ──────────────────────────────────────────────────────────────────

describe("Kanban — a11y (jest-axe, light + dark)", () => {
  it("AC-20: default board has no a11y violations in light + dark", async () => {
    const { container } = render(
      <Kanban columns={columns} cards={cards} title="Board" searchable />,
    );
    await axeInThemes(container);
  });

  it("AC-20: board mid-drag has no a11y violations in light + dark", async () => {
    const { container } = render(
      <Kanban columns={columns} cards={cards} />,
    );
    const card = screen.getByRole("button", { name: "Conciliar extrato Itaú" });
    fireEvent.dragStart(card, { dataTransfer: dataTransferStub() });
    const target = screen.getByRole("group", { name: /Em andamento/ });
    fireEvent.dragOver(target, { dataTransfer: dataTransferStub() });
    await axeInThemes(container);
  });

  it("AC-20: swimlanes board has no a11y violations in light + dark", async () => {
    const swimlanes: KanbanSwimlane[] = [
      { id: "team-a", title: "Time A" },
      { id: "team-b", title: "Time B" },
    ];
    const { container } = render(
      <Kanban
        columns={columns}
        cards={[
          { id: "x1", columnId: "todo", laneId: "team-a", title: "Card A" },
          { id: "x2", columnId: "doing", laneId: "team-b", title: "Card B" },
        ]}
        swimlanes={swimlanes}
      />,
    );
    await axeInThemes(container);
  });

  it("AC-20: empty board has no a11y violations in light + dark", async () => {
    const { container } = render(<Kanban columns={columns} cards={[]} />);
    await axeInThemes(container);
  });
});
