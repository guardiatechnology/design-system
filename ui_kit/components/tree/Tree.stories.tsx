import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Folder, Building2, Wallet } from "lucide-react";

import { Tree, type TreeNode } from "./index";

const meta: Meta<typeof Tree> = {
  title: "Components/Tree",
  component: Tree,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Navegador hierárquico com expand/collapse, seleção (`none`/`single`/`multi`) e navegação por teclado completa (ARIA APG Tree View). Use Tree em plano de contas, estrutura de empresas, categorias fiscais aninhadas e regras do Copilot Isac. Modos `single`/`multi`/`none` × tamanhos `md`/`sm`. Tokens consomem o chain `--primary` (violet em light, orange em dark) para seleção. Decisões em ADR-028.",
      },
    },
  },
  argTypes: {
    mode: { control: "radio", options: ["none", "single", "multi"] },
    size: { control: "radio", options: ["md", "sm"] },
    showLines: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

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
      {
        id: "1.2",
        label: "Não circulante",
        children: [{ id: "1.2.01", label: "Imobilizado", meta: "R$ 240.000" }],
      },
    ],
  },
  {
    id: "2",
    label: "Passivo",
    icon: Folder,
    children: [
      { id: "2.1", label: "Fornecedores", meta: "R$ 31.900" },
      { id: "2.2", label: "Empréstimos", disabled: true },
    ],
  },
];

const company: TreeNode[] = [
  {
    id: "holding",
    label: "Guardia Holding",
    description: "matriz",
    icon: Building2,
    defaultExpanded: true,
    children: [
      {
        id: "br",
        label: "Guardia Brasil",
        icon: Building2,
        defaultExpanded: true,
        children: [
          { id: "sp", label: "Unidade São Paulo", icon: Wallet },
          { id: "rj", label: "Unidade Rio de Janeiro", icon: Wallet },
        ],
      },
      { id: "pt", label: "Guardia Portugal", icon: Building2 },
    ],
  },
];

// ──────────────────────────────────────────────────────────────────
// Default — single selection, md
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    nodes: accounts,
    mode: "single",
    "aria-label": "Plano de contas",
  },
  decorators: [
    (Story) => (
      <div className="max-w-sm">
        <Story />
      </div>
    ),
  ],
};

// ──────────────────────────────────────────────────────────────────
// Multi — tri-state checkboxes
// ──────────────────────────────────────────────────────────────────

export const MultiSelect: Story = {
  render: () => (
    <div className="max-w-sm">
      <Tree
        nodes={accounts}
        mode="multi"
        defaultSelected={["1.1.01"]}
        aria-label="Categorias"
      />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// None — navigation only
// ──────────────────────────────────────────────────────────────────

export const NavigationOnly: Story = {
  render: () => (
    <div className="max-w-sm">
      <Tree nodes={company} mode="none" aria-label="Estrutura de empresas" />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sizes — md vs sm
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="max-w-xs">
        <p className="mb-2 text-xs font-semibold text-fg-muted">md (default)</p>
        <Tree nodes={accounts} size="md" aria-label="md" />
      </div>
      <div className="max-w-xs">
        <p className="mb-2 text-xs font-semibold text-fg-muted">sm</p>
        <Tree nodes={accounts} size="sm" aria-label="sm" />
      </div>
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Without guide lines
// ──────────────────────────────────────────────────────────────────

export const WithoutLines: Story = {
  render: () => (
    <div className="max-w-sm">
      <Tree nodes={company} showLines={false} aria-label="Sem linhas guia" />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Icons + meta + description
// ──────────────────────────────────────────────────────────────────

export const WithIconsAndMeta: Story = {
  render: () => (
    <div className="max-w-sm">
      <Tree nodes={company} aria-label="Empresas com ícones" />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Controlled — external state
// ──────────────────────────────────────────────────────────────────

function ControlledTree() {
  const [expanded, setExpanded] = React.useState<string[]>(["1", "1.1"]);
  const [selected, setSelected] = React.useState<string[]>(["1.1.02"]);
  return (
    <div className="max-w-sm">
      <Tree
        nodes={accounts}
        expanded={expanded}
        onExpandedChange={setExpanded}
        selected={selected}
        onSelectedChange={setSelected}
        aria-label="Controlado"
      />
      <p className="mt-3 text-xs text-fg-muted">
        Selecionado: {selected.join(", ") || "—"}
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledTree />,
};

// ──────────────────────────────────────────────────────────────────
// Empty state
// ──────────────────────────────────────────────────────────────────

export const Empty: Story = {
  render: () => (
    <div className="max-w-sm">
      <Tree
        nodes={[]}
        emptyState={<span>Nenhuma conta cadastrada.</span>}
        aria-label="Vazio"
      />
    </div>
  ),
};
