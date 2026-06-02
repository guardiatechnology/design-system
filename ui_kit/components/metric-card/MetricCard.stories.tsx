import type { Meta, StoryObj } from "@storybook/react";
import {
  FileText,
  ArrowLeftRight,
  TriangleAlert,
  Bot,
  Building2,
  CircleDollarSign,
  ReceiptText,
} from "lucide-react";

import { MetricCard } from "./index";

const meta: Meta<typeof MetricCard> = {
  title: "Components/MetricCard",
  // Pin the story id to the project-canonical kebab slug so Storybook and the
  // docs playground share ONE slug (`metric-card`) — Storybook would otherwise
  // derive `metriccard` from the PascalCase title.
  id: "components-metric-card",
  component: MetricCard,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Card de KPI com rótulo, valor e delta comparativo. Use em dashboards de conciliação, métricas de agentes e indicadores financeiros. O sinal do delta deriva o tom (verde/vermelho), mas a direção NUNCA depende só de cor: vem acompanhada de ícone (`TrendingUp`/`TrendingDown`) + sinal textual (`+`/`-`) + `aria-label`. Compõe o primitivo `Card`; consome só tokens semânticos (`bg-card`, `success-*`, `danger-*`, `accent`). Decisões em ADR-025.",
      },
    },
  },
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    deltaType: {
      control: "radio",
      options: [undefined, "up", "down", "neutral"],
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Default
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    icon: FileText,
    label: "Lançamentos",
    value: "2.487",
    delta: 12.4,
    caption: "vs. 30d anteriores",
  },
};

// ──────────────────────────────────────────────────────────────────
// KPI grid — typical dashboard row
// ──────────────────────────────────────────────────────────────────

export const KpiGrid: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard icon={FileText} label="Lançamentos" value="2.487" delta={12.4} caption="vs. 30d anteriores" />
      <MetricCard icon={ArrowLeftRight} label="Conciliação" value="96" suffix="%" delta={2.1} />
      <MetricCard icon={TriangleAlert} label="Pendências" value="11" delta={-18.2} caption="resolvidas essa semana" />
      <MetricCard icon={Bot} label="Horas economizadas" value="32" suffix="h" delta={8.7} />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Sizes
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-fg-muted">size=&quot;sm&quot;</p>
        <MetricCard size="sm" label="MRR" prefix="R$ " value="38.490" delta={4.2} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-fg-muted">size=&quot;md&quot; (default)</p>
        <MetricCard size="md" label="MRR" prefix="R$ " value="38.490" delta={4.2} />
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-fg-muted">size=&quot;lg&quot;</p>
        <MetricCard size="lg" label="MRR" prefix="R$ " value="38.490" delta={4.2} caption="vs. mês anterior" />
      </div>
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Delta tones — up · down · neutral · string
// ──────────────────────────────────────────────────────────────────

export const DeltaTones: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Conciliado" value="96" suffix="%" delta={2.1} />
      <MetricCard label="Falhas" value="3" delta={-42.0} />
      <MetricCard label="Estável" value="1.000" delta={0} deltaType="neutral" />
      <MetricCard label="vs. meta" value="84" suffix="%" delta="atingido 84% do trimestre" deltaType="neutral" />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// No delta (context only) + monetary prefix/suffix
// ──────────────────────────────────────────────────────────────────

export const ContextAndMonetary: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <MetricCard icon={Building2} label="Empresas ativas" value="38" caption="de 40 no plano" />
      <MetricCard icon={Bot} label="Agentes rodando" value="6" caption="em produção" />
      <MetricCard icon={CircleDollarSign} label="Receita processada" prefix="R$ " value="2,4" suffix=" mi" delta={5.8} />
      <MetricCard icon={ReceiptText} label="Nota média" prefix="R$ " value="487,20" delta={-3.1} />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Light + Dark — same grid under both themes, side by side
// ──────────────────────────────────────────────────────────────────

export const LightAndDark: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "O mesmo grid renderizado em `light` e `dark` (toggle via `data-theme` no wrapper). Os tokens semânticos (`bg-card`, `success-fg`/`success-soft`, `danger-fg`/`danger-soft`, `accent`) trocam de valor por tema sem mudança de markup — confirma o contrato de tema do DoD.",
      },
    },
  },
  render: () => {
    const Grid = () => (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard icon={FileText} label="Lançamentos" value="2.487" delta={12.4} caption="vs. 30d anteriores" />
        <MetricCard icon={TriangleAlert} label="Pendências" value="11" delta={-18.2} />
        <MetricCard icon={Bot} label="Agentes rodando" value="6" caption="em produção" />
        <MetricCard icon={CircleDollarSign} label="Receita" prefix="R$ " value="2,4" suffix=" mi" delta={5.8} />
      </div>
    );
    return (
      <div className="flex flex-col gap-4">
        <div data-theme="light" className="rounded-lg bg-background p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">Light</p>
          <Grid />
        </div>
        <div data-theme="dark" className="rounded-lg bg-background p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-muted">Dark</p>
          <Grid />
        </div>
      </div>
    );
  },
};
