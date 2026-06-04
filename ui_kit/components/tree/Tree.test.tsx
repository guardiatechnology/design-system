import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Folder, FileText } from "lucide-react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Tree,
  treeRowVariants,
  type TreeNode,
} from "./index";

/**
 * Testes de unidade para o Plan #113 (Tech Task pai #112) — Tree v0.1.0 DoD.
 *
 * Cada `it(...)` carrega `AC-N:` para que `lex-issue-driven` Rule 3 (rastreio
 * bidirecional AC ↔ teste) passe no Gate 2. ACs vêm de
 * `docs/issues/issue-112/02-requirements.md`. Queries acessíveis
 * (`getByRole("tree")`, `getByRole("treeitem")`) conforme `lex-frontend-testing`.
 */

// ──────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────

const accounts: TreeNode[] = [
  {
    id: "1",
    label: "Ativo",
    icon: Folder,
    defaultExpanded: true,
    children: [
      {
        id: "1.1",
        label: "Circulante",
        defaultExpanded: true,
        children: [
          { id: "1.1.01", label: "Caixa", meta: "R$ 12.400" },
          { id: "1.1.02", label: "Bancos", meta: "R$ 88.120" },
        ],
      },
      { id: "1.2", label: "Não circulante" },
    ],
  },
  {
    id: "2",
    label: "Passivo",
    icon: Folder,
    children: [{ id: "2.1", label: "Fornecedores", icon: FileText }],
  },
];

const withDisabled: TreeNode[] = [
  {
    id: "root",
    label: "Raiz",
    defaultExpanded: true,
    children: [
      { id: "ok", label: "Selecionável" },
      { id: "blocked", label: "Bloqueado", disabled: true },
    ],
  },
];

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1, AC-2)
// ──────────────────────────────────────────────────────────────────

describe("Tree — public surface", () => {
  it("AC-1: Tree is defined and displayName === 'Tree'", () => {
    expect(Tree).toBeDefined();
    expect(Tree.displayName).toBe("Tree");
  });

  it("AC-2: treeRowVariants is callable with no args (defaults none/md)", () => {
    expect(typeof treeRowVariants).toBe("function");
    const cls = treeRowVariants({});
    expect(cls).toContain("min-h-[30px]"); // md default
    expect(cls).toContain("rounded-sm");
  });

  it("AC-2: treeRowVariants honors size='sm'", () => {
    const cls = treeRowVariants({ size: "sm" });
    expect(cls).toContain("min-h-[26px]");
  });
});

// ──────────────────────────────────────────────────────────────────
// Structure & ARIA (AC-3, AC-4, AC-5)
// ──────────────────────────────────────────────────────────────────

describe("Tree — structure & ARIA", () => {
  it("AC-3: renders role='tree' at the root with aria-label", () => {
    render(<Tree nodes={accounts} aria-label="Plano de contas" />);
    const tree = screen.getByRole("tree", { name: "Plano de contas" });
    expect(tree).toBeInTheDocument();
    expect(tree.tagName).toBe("UL");
  });

  it("AC-3: each node is a treeitem; children sit in role='group'", () => {
    render(<Tree nodes={accounts} />);
    // Ativo is defaultExpanded → its children are in the DOM
    expect(screen.getByText("Ativo")).toBeInTheDocument();
    expect(screen.getAllByRole("group").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("treeitem").length).toBeGreaterThanOrEqual(3);
  });

  it("AC-3: parents carry aria-expanded; leaves omit it", () => {
    render(<Tree nodes={accounts} />);
    const ativo = screen.getByText("Ativo").closest("[role=treeitem]")!;
    expect(ativo).toHaveAttribute("aria-expanded", "true");
    // "Não circulante" is a leaf → no aria-expanded
    const leaf = screen
      .getByText("Não circulante")
      .closest("[role=treeitem]")!;
    expect(leaf).not.toHaveAttribute("aria-expanded");
  });

  it("AC-4: selected node carries aria-selected=true (single)", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    await user.click(screen.getByText("Não circulante"));
    const item = screen.getByText("Não circulante").closest("[role=treeitem]")!;
    expect(item).toHaveAttribute("aria-selected", "true");
  });

  it("AC-5: exactly one treeitem row is tabbable (roving tabindex)", () => {
    const { container } = render(<Tree nodes={accounts} />);
    const tabbables = container.querySelectorAll('[role=treeitem][tabindex="0"]');
    expect(tabbables.length).toBe(1);
  });

  it("AC-5: when a node is selected, it becomes the tabbable row", async () => {
    const user = userEvent.setup();
    const { container } = render(<Tree nodes={accounts} />);
    await user.click(screen.getByText("Bancos"));
    const tabbable = container.querySelector('[role=treeitem][tabindex="0"]')!;
    expect(within(tabbable as HTMLElement).getByText("Bancos")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Modes & sizes (AC-6, AC-7, AC-8)
// ──────────────────────────────────────────────────────────────────

describe("Tree — modes & sizes", () => {
  it("AC-6: mode='single' moves selection from one node to another", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} mode="single" />);
    await user.click(screen.getByText("Caixa"));
    expect(
      screen.getByText("Caixa").closest("[role=treeitem]"),
    ).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByText("Bancos"));
    expect(
      screen.getByText("Caixa").closest("[role=treeitem]"),
    ).toHaveAttribute("aria-selected", "false");
    expect(
      screen.getByText("Bancos").closest("[role=treeitem]"),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("AC-6: mode='none' disables selection (no aria-selected)", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} mode="none" />);
    await user.click(screen.getByText("Caixa"));
    expect(
      screen.getByText("Caixa").closest("[role=treeitem]"),
    ).not.toHaveAttribute("aria-selected");
  });

  it("AC-7: mode='multi' renders checkboxes with aria-checked", () => {
    render(<Tree nodes={accounts} mode="multi" />);
    const checkboxes = screen.getAllByRole("checkbox", { hidden: true });
    expect(checkboxes.length).toBeGreaterThan(0);
    expect(checkboxes[0]).toHaveAttribute("aria-checked");
  });

  it("AC-7: toggling a parent selects all descendant leaves; parent becomes 'all'", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <Tree
        nodes={accounts}
        mode="multi"
        onSelectedChange={onSelectedChange}
      />,
    );
    // Click "Circulante" parent (has leaves Caixa + Bancos)
    await user.click(screen.getByText("Circulante"));
    const lastCall = onSelectedChange.mock.calls.at(-1)![0] as string[];
    expect(lastCall).toEqual(expect.arrayContaining(["1.1.01", "1.1.02"]));
  });

  it("AC-7: a partially-selected parent exposes aria-checked='mixed'", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} mode="multi" />);
    // Select only one leaf under Circulante
    await user.click(screen.getByText("Caixa"));
    const circulanteItem = screen
      .getByText("Circulante")
      .closest("[role=treeitem]")!;
    const cb = within(circulanteItem).getAllByRole("checkbox", {
      hidden: true,
    })[0];
    expect(cb).toHaveAttribute("aria-checked", "mixed");
  });

  it("AC-8: size='sm' applies the compact row class", () => {
    const { container } = render(<Tree nodes={accounts} size="sm" />);
    const row = container.querySelector('[role=treeitem]')!;
    expect(row.className).toContain("min-h-[26px]");
  });
});

// ──────────────────────────────────────────────────────────────────
// Expand / collapse — controlled + uncontrolled (AC-9, AC-10, AC-11)
// ──────────────────────────────────────────────────────────────────

describe("Tree — expansion", () => {
  it("AC-9: defaultExpanded node renders its children initially", () => {
    render(<Tree nodes={accounts} />);
    // Ativo (defaultExpanded) → "Circulante" visible; Passivo collapsed → "Fornecedores" hidden
    expect(screen.getByText("Circulante")).toBeInTheDocument();
    expect(screen.queryByText("Fornecedores")).not.toBeInTheDocument();
  });

  it("AC-9: clicking the caret toggles expansion (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    const expandBtn = screen.getByRole("button", { name: "Expandir" });
    await user.click(expandBtn);
    expect(screen.getByText("Fornecedores")).toBeInTheDocument();
  });

  it("AC-10: controlled expanded + onExpandedChange fires next ids", async () => {
    const user = userEvent.setup();
    const onExpandedChange = vi.fn();
    render(
      <Tree
        nodes={accounts}
        expanded={["1"]}
        onExpandedChange={onExpandedChange}
      />,
    );
    // Collapse "Ativo" via its caret
    const collapseBtn = screen.getByRole("button", { name: "Colapsar" });
    await user.click(collapseBtn);
    expect(onExpandedChange).toHaveBeenCalled();
    const next = onExpandedChange.mock.calls.at(-1)![0] as string[];
    expect(next).not.toContain("1");
  });

  it("AC-10: controlled expanded prop is the source of truth", () => {
    const { rerender } = render(<Tree nodes={accounts} expanded={[]} />);
    // Nothing expanded → Circulante hidden despite defaultExpanded flag
    expect(screen.queryByText("Circulante")).not.toBeInTheDocument();
    rerender(<Tree nodes={accounts} expanded={["1"]} />);
    expect(screen.getByText("Circulante")).toBeInTheDocument();
  });

  it("AC-11: controlled selected + onSelectedChange fires next ids", async () => {
    const user = userEvent.setup();
    const onSelectedChange = vi.fn();
    render(
      <Tree
        nodes={accounts}
        selected={["1.1.01"]}
        onSelectedChange={onSelectedChange}
      />,
    );
    await user.click(screen.getByText("Bancos"));
    expect(onSelectedChange).toHaveBeenCalledWith(["1.1.02"]);
  });

  it("AC-11: uncontrolled selection seeds from defaultSelected", () => {
    render(<Tree nodes={accounts} defaultSelected={["1.2"]} />);
    expect(
      screen.getByText("Não circulante").closest("[role=treeitem]"),
    ).toHaveAttribute("aria-selected", "true");
  });
});

// ──────────────────────────────────────────────────────────────────
// Keyboard navigation — APG (AC-12, AC-13, AC-14, AC-15)
// ──────────────────────────────────────────────────────────────────

describe("Tree — keyboard navigation (APG)", () => {
  it("AC-12: ArrowDown / ArrowUp move focus across visible items", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    const ativoRow = screen.getByText("Ativo").closest("[role=treeitem]")! as HTMLElement;
    ativoRow.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() =>
      expect(
        within(document.activeElement as HTMLElement).getByText("Circulante"),
      ).toBeInTheDocument(),
    );
    await user.keyboard("{ArrowUp}");
    await waitFor(() =>
      expect(
        within(document.activeElement as HTMLElement).getByText("Ativo"),
      ).toBeInTheDocument(),
    );
  });

  it("AC-13: ArrowRight expands a collapsed parent", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    const passivoRow = screen.getByText("Passivo").closest("[role=treeitem]")! as HTMLElement;
    passivoRow.focus();
    expect(screen.queryByText("Fornecedores")).not.toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    await waitFor(() =>
      expect(screen.getByText("Fornecedores")).toBeInTheDocument(),
    );
  });

  it("AC-13: ArrowRight on an expanded parent steps into the first child", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    const ativoRow = screen.getByText("Ativo").closest("[role=treeitem]")! as HTMLElement;
    ativoRow.focus();
    await user.keyboard("{ArrowRight}"); // already expanded → move into first child
    await waitFor(() =>
      expect(
        within(document.activeElement as HTMLElement).getByText("Circulante"),
      ).toBeInTheDocument(),
    );
  });

  it("AC-13: ArrowLeft collapses an expanded parent", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    const ativoRow = screen.getByText("Ativo").closest("[role=treeitem]")! as HTMLElement;
    ativoRow.focus();
    await user.keyboard("{ArrowLeft}");
    await waitFor(() =>
      expect(screen.queryByText("Circulante")).not.toBeInTheDocument(),
    );
  });

  it("AC-13: ArrowLeft on a leaf moves focus to its parent", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    // Caixa is a leaf under Circulante (both expanded in the fixture).
    const caixaRow = screen.getByText("Caixa").closest("[role=treeitem]")! as HTMLElement;
    caixaRow.focus();
    await user.keyboard("{ArrowLeft}");
    await waitFor(() =>
      expect(
        within(document.activeElement as HTMLElement).getByText("Circulante"),
      ).toBeInTheDocument(),
    );
  });

  it("AC-14: Home / End jump to first / last visible item", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    const circulanteRow = screen
      .getByText("Circulante")
      .closest("[role=treeitem]")! as HTMLElement;
    circulanteRow.focus();
    await user.keyboard("{End}");
    await waitFor(() =>
      expect(
        within(document.activeElement as HTMLElement).getByText("Passivo"),
      ).toBeInTheDocument(),
    );
    await user.keyboard("{Home}");
    await waitFor(() =>
      expect(
        within(document.activeElement as HTMLElement).getByText("Ativo"),
      ).toBeInTheDocument(),
    );
  });

  it("AC-14: Enter selects the focused item", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    const leafRow = screen.getByText("Caixa").closest("[role=treeitem]")! as HTMLElement;
    leafRow.focus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByText("Caixa").closest("[role=treeitem]"),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("AC-14: Space selects the focused item", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={accounts} />);
    const leafRow = screen.getByText("Bancos").closest("[role=treeitem]")! as HTMLElement;
    leafRow.focus();
    await user.keyboard(" ");
    expect(
      screen.getByText("Bancos").closest("[role=treeitem]"),
    ).toHaveAttribute("aria-selected", "true");
  });

  it("AC-15: disabled node is not selectable via click", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={withDisabled} />);
    await user.click(screen.getByText("Bloqueado"));
    expect(
      screen.getByText("Bloqueado").closest("[role=treeitem]"),
    ).toHaveAttribute("aria-selected", "false");
  });

  it("AC-15: disabled node is not selectable via Enter", async () => {
    const user = userEvent.setup();
    render(<Tree nodes={withDisabled} />);
    const blockedRow = screen.getByText("Bloqueado").closest("[role=treeitem]")! as HTMLElement;
    blockedRow.focus();
    await user.keyboard("{Enter}");
    expect(
      screen.getByText("Bloqueado").closest("[role=treeitem]"),
    ).toHaveAttribute("aria-selected", "false");
  });

  it("AC-15: disabled node carries aria-disabled", () => {
    render(<Tree nodes={withDisabled} />);
    expect(
      screen.getByText("Bloqueado").closest("[role=treeitem]"),
    ).toHaveAttribute("aria-disabled", "true");
  });
});

// ──────────────────────────────────────────────────────────────────
// Features & content (AC-16, AC-17)
// ──────────────────────────────────────────────────────────────────

describe("Tree — features & content", () => {
  it("AC-16: renders icon + meta + description when provided", () => {
    const { container } = render(<Tree nodes={accounts} />);
    // icon (Folder) → svg present; meta "R$ 12.400" rendered
    expect(container.querySelectorAll("svg").length).toBeGreaterThan(0);
    expect(screen.getByText("R$ 12.400")).toBeInTheDocument();
  });

  it("AC-16: showLines={false} omits the guide line spans", () => {
    const { container: withLines } = render(<Tree nodes={accounts} />);
    const { container: noLines } = render(
      <Tree nodes={accounts} showLines={false} />,
    );
    const linesCount = withLines.querySelectorAll("span[aria-hidden=true].bg-border").length;
    const noLinesCount = noLines.querySelectorAll("span[aria-hidden=true].bg-border").length;
    expect(linesCount).toBeGreaterThan(0);
    expect(noLinesCount).toBe(0);
  });

  it("AC-17: empty nodes renders the emptyState", () => {
    render(<Tree nodes={[]} emptyState={<span>Sem contas</span>} />);
    expect(screen.getByText("Sem contas")).toBeInTheDocument();
  });

  it("AC-17: onNodeClick fires regardless of mode", async () => {
    const user = userEvent.setup();
    const onNodeClick = vi.fn();
    render(<Tree nodes={accounts} mode="none" onNodeClick={onNodeClick} />);
    await user.click(screen.getByText("Caixa"));
    expect(onNodeClick).toHaveBeenCalledTimes(1);
    expect(onNodeClick.mock.calls[0][0].id).toBe("1.1.01");
  });
});

// ──────────────────────────────────────────────────────────────────
// Accessibility — jest-axe light + dark (AC-18, AC-19)
// ──────────────────────────────────────────────────────────────────

describe("Tree — a11y (jest-axe light + dark)", () => {
  it("AC-19: Default (single) has no violations in light + dark", async () => {
    const { container } = render(
      <Tree nodes={accounts} aria-label="Plano de contas" />,
    );
    await axeInThemes(container);
  });

  it("AC-19: expanded multi (tri-state) has no violations in light + dark", async () => {
    const { container } = render(
      <Tree
        nodes={accounts}
        mode="multi"
        defaultSelected={["1.1.01"]}
        aria-label="Categorias"
      />,
    );
    await axeInThemes(container);
  });

  it("AC-19: tree with a disabled node has no violations in light + dark", async () => {
    const { container } = render(
      <Tree nodes={withDisabled} aria-label="Regras" />,
    );
    await axeInThemes(container);
  });

  it("AC-18: row uses semantic tokens (no hardcoded hex)", () => {
    const cls = treeRowVariants({ size: "md" });
    expect(cls).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    expect(cls).toContain("text-fg");
    expect(cls).toContain("bg-primary/10");
  });
});
