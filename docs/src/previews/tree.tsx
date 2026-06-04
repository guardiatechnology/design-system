import * as React from "react";

import { Tree, type TreeNode } from "@ds/components/tree";
import { Folder, Building2, Wallet } from "lucide-react";

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
// Padrão — single selection
// ──────────────────────────────────────────────────────────────────

export function BasicTree(): React.ReactElement {
  return (
    <div className="max-w-sm py-4">
      <Tree nodes={accounts} mode="single" aria-label="Plano de contas" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Multi — tri-state
// ──────────────────────────────────────────────────────────────────

export function MultiTree(): React.ReactElement {
  return (
    <div className="max-w-sm py-4">
      <Tree
        nodes={accounts}
        mode="multi"
        defaultSelected={["1.1.01"]}
        aria-label="Categorias"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Navegação (mode="none")
// ──────────────────────────────────────────────────────────────────

export function NavigationTree(): React.ReactElement {
  return (
    <div className="max-w-sm py-4">
      <Tree nodes={company} mode="none" aria-label="Estrutura de empresas" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tamanhos
// ──────────────────────────────────────────────────────────────────

export function SizesTree(): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-8 py-4">
      <div className="max-w-xs">
        <p className="mb-2 text-xs font-semibold text-fg-muted">md</p>
        <Tree nodes={accounts} size="md" aria-label="md" />
      </div>
      <div className="max-w-xs">
        <p className="mb-2 text-xs font-semibold text-fg-muted">sm</p>
        <Tree nodes={accounts} size="sm" aria-label="sm" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Ícones + meta + description
// ──────────────────────────────────────────────────────────────────

export function IconsTree(): React.ReactElement {
  return (
    <div className="max-w-sm py-4">
      <Tree nodes={company} aria-label="Empresas com ícones" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Sem linhas guia
// ──────────────────────────────────────────────────────────────────

export function WithoutLinesTree(): React.ReactElement {
  return (
    <div className="max-w-sm py-4">
      <Tree nodes={company} showLines={false} aria-label="Sem linhas guia" />
    </div>
  );
}
