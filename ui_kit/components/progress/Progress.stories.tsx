import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from "./index";

const meta: Meta<typeof Progress> = {
  title: "Components/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Indicador de progresso contínuo. `Progress` sinaliza o andamento de uma tarefa de duração conhecida (determinate) ou desconhecida (indeterminate). Variantes `linear`/`circular` × tons `violet`/`green`/`amber`/`red` × tamanhos `sm`/`md`/`lg`. Tokens consomem `--primary` (Notion-canonical, violet em light / orange em dark) + `--success`/`--warning`/`--danger` herdados de ADR-011. Decisões em ADR-026. Para progresso discreto multi-etapa use `Stepper`; para loading pontual inline use `Spinner`.",
      },
    },
  },
  argTypes: {
    variant: { control: "radio", options: ["linear", "circular"] },
    tone: { control: "radio", options: ["violet", "green", "amber", "red"] },
    size: { control: "radio", options: ["sm", "md", "lg"] },
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    indeterminate: { control: "boolean" },
    showValue: { control: "boolean" },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// ──────────────────────────────────────────────────────────────────
// Default — linear determinate, violet, md
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  args: {
    value: 60,
    label: "Conciliando lançamentos",
    showValue: true,
  },
};

// ──────────────────────────────────────────────────────────────────
// Linear — tones
// ──────────────────────────────────────────────────────────────────

export const Tones: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-5">
      <Progress value={72} tone="violet" label="Violet (default)" showValue />
      <Progress value={100} tone="green" label="Concluído" showValue />
      <Progress value={48} tone="amber" label="Atenção" showValue />
      <Progress value={22} tone="red" label="Falha parcial" showValue />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Linear — sizes
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-6">
      <Progress value={60} size="sm" label="sm" showValue />
      <Progress value={60} size="md" label="md (default)" showValue />
      <Progress value={60} size="lg" label="lg" showValue />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Indeterminate — linear
// ──────────────────────────────────────────────────────────────────

export const Indeterminate: Story = {
  render: () => (
    <div className="max-w-md">
      <Progress indeterminate label="Aguardando resposta…" />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Circular — determinate + tones + sizes
// ──────────────────────────────────────────────────────────────────

export const Circular: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Progress value={75} variant="circular" size="sm" showValue />
      <Progress value={75} variant="circular" size="md" showValue />
      <Progress value={75} variant="circular" size="lg" showValue />
      <Progress value={40} variant="circular" tone="green" size="lg" showValue />
      <Progress value={40} variant="circular" tone="amber" size="lg" showValue />
      <Progress value={40} variant="circular" tone="red" size="lg" showValue />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Circular — indeterminate (spinner-style)
// ──────────────────────────────────────────────────────────────────

export const CircularIndeterminate: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Progress indeterminate variant="circular" size="sm" label="Carregando" />
      <Progress indeterminate variant="circular" size="md" label="Carregando" />
      <Progress indeterminate variant="circular" size="lg" label="Carregando" />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// DarkTheme (forçado via data-theme="dark" no host)
// ──────────────────────────────────────────────────────────────────

export const DarkTheme: Story = {
  render: () => (
    <div data-theme="dark" className="flex flex-col gap-6 rounded-lg bg-background p-6">
      <Progress value={72} tone="violet" label="Violet (dark)" showValue />
      <Progress value={100} tone="green" label="Concluído (dark)" showValue />
      <Progress value={48} tone="amber" label="Atenção (dark)" showValue />
      <Progress value={22} tone="red" label="Falha parcial (dark)" showValue />
      <div className="flex items-center gap-8 pt-2">
        <Progress value={75} variant="circular" size="lg" showValue />
        <Progress indeterminate variant="circular" size="lg" label="Carregando" />
        <Progress indeterminate label="Aguardando…" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Paridade dark herdada do chain de tokens `:root[data-theme=\"dark\"]` (ADR-011 / ADR-026). O fill consome `--primary` (warm-orange em dark) e os tons signal mantêm reconhecibilidade sem hardcode.",
      },
    },
  },
};
