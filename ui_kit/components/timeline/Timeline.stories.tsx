import type { Meta, StoryObj } from "@storybook/react";
import {
  UploadCloud,
  CircleCheck,
  Flag,
  User,
  Check,
  Clock,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";

import { Badge } from "../badge";
import { Timeline, type TimelineItem } from "./index";

const meta: Meta<typeof Timeline> = {
  title: "Components/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Linha do tempo de eventos cronológicos. Timeline registra histórico temporal com ator, ação e horário (trilha de auditoria de fechamento, histórico de erro/retry, atividade de agente/usuário). Cada evento traz marcador (ícone ou dot), título, descrição, timestamp, slot `meta` e um tom: `violet` (default) · `green` · `amber` · `red` · `neutral`. Orientações `vertical`/`horizontal` × tamanhos `md`/`sm` × connector `solid`/`dashed`. Tons consomem tokens semânticos (`--primary` Notion-canonical + `--success`/`--warning`/`--danger` da ADR-011). Decisões em ADR-027.",
      },
    },
  },
  argTypes: {
    orientation: { control: "radio", options: ["vertical", "horizontal"] },
    size: { control: "radio", options: ["md", "sm"] },
    connector: { control: "radio", options: ["solid", "dashed"] },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// Trilha de auditoria de um fechamento — espelha o playground legacy.
const auditTrail: TimelineItem[] = [
  {
    id: "1",
    tone: "violet",
    icon: UploadCloud,
    title: "Extrato Itaú importado",
    description: "237 lançamentos via OFX",
    timestamp: "hoje · 09:12",
  },
  {
    id: "2",
    tone: "green",
    icon: Check,
    title: "248 lançamentos aprovados automaticamente",
    description: "Confiança média 97,3% — regras fiscais aplicadas",
    timestamp: "09:14",
    meta: (
      <Badge variant="success" appearance="soft">
        Automático
      </Badge>
    ),
  },
  {
    id: "3",
    tone: "amber",
    icon: Flag,
    title: "11 lançamentos marcados para revisão",
    description: "Confiança abaixo do limiar de 95%",
    timestamp: "09:15",
    meta: (
      <Badge variant="warning" appearance="soft">
        Pendente
      </Badge>
    ),
  },
  {
    id: "4",
    tone: "violet",
    icon: User,
    title: "Luana aprovou 9 lançamentos",
    description: "2 reclassificados · NF 4891 corrigida",
    timestamp: "10:42",
    meta: (
      <Badge variant="neutral" appearance="soft">
        Humano
      </Badge>
    ),
  },
  {
    id: "5",
    tone: "green",
    icon: CircleCheck,
    title: "Conciliação Itaú concluída",
    description: "Balanço fechado · diferença R$ 0,00",
    timestamp: "10:44",
  },
];

// Histórico de erro/retry — exercita tom red + neutral + dashed.
const errorTrail: TimelineItem[] = [
  { id: "1", tone: "neutral", icon: Clock, title: "Fechamento de setembro iniciado", timestamp: "01/10 · 08:00" },
  {
    id: "2",
    tone: "red",
    icon: TriangleAlert,
    title: "Falha ao sincronizar com o Domínio",
    description: "Credencial expirada",
    timestamp: "01/10 · 08:03",
  },
  {
    id: "3",
    tone: "amber",
    icon: RefreshCw,
    title: "Reprocessamento em fila",
    description: "3 tentativas restantes",
    timestamp: "01/10 · 08:12",
  },
  { id: "4", tone: "green", icon: Check, title: "Sincronização restabelecida", timestamp: "01/10 · 09:28" },
];

// ──────────────────────────────────────────────────────────────────
// Default — vertical, solid, md (auditoria de fechamento)
// ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <div className="max-w-md">
      <Timeline items={auditTrail} />
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Tones — todos os 5 tons num só shot
// ──────────────────────────────────────────────────────────────────

export const Tones: Story = {
  render: () => (
    <div className="max-w-md">
      <Timeline
        items={[
          { id: "v", tone: "violet", icon: UploadCloud, title: "Violet — ação do sistema", description: "Tom default · --primary" },
          { id: "g", tone: "green", icon: Check, title: "Green — sucesso", description: "--success" },
          { id: "a", tone: "amber", icon: Flag, title: "Amber — atenção", description: "--warning" },
          { id: "r", tone: "red", icon: TriangleAlert, title: "Red — erro", description: "--danger" },
          { id: "n", tone: "neutral", icon: Clock, title: "Neutral — informativo", description: "--border / --fg-muted" },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Os 5 tons lado a lado. Cada tom mapeia para um chain de token semântico (zero hardcode) e é reforçado de forma não-cromática: `data-tone` no marcador + rótulo `sr-only` (sucesso/atenção/erro/neutro) + ícone — a cor nunca é o único indicador (`lex-frontend-accessibility`).",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Horizontal
// ──────────────────────────────────────────────────────────────────

export const Horizontal: Story = {
  render: () => (
    <Timeline
      orientation="horizontal"
      items={[
        { id: "1", tone: "violet", icon: UploadCloud, title: "Importado", timestamp: "09:12" },
        { id: "2", tone: "green", icon: Check, title: "Aprovados", timestamp: "09:14" },
        { id: "3", tone: "amber", icon: Flag, title: "Em revisão", timestamp: "09:15" },
        { id: "4", tone: "green", icon: CircleCheck, title: "Conciliado", timestamp: "10:44" },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Orientação `horizontal` dispõe os eventos numa linha com connector horizontal — útil para headers compactos e resumos de fluxo. Divergência aditiva da referência (que é só vertical), exigida pelo #110 e registrada na ADR-027.',
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Dashed connector
// ──────────────────────────────────────────────────────────────────

export const DashedConnector: Story = {
  render: () => (
    <div className="max-w-md">
      <Timeline items={errorTrail} connector="dashed" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Connector tracejado (`connector=\"dashed\"`) para histórico com lacunas temporais ou tentativas. Aqui num fluxo de erro/retry com tons `neutral` → `red` → `amber` → `green`.",
      },
    },
  },
};

// ──────────────────────────────────────────────────────────────────
// Sizes
// ──────────────────────────────────────────────────────────────────

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div className="max-w-md">
        <p className="mb-2 text-xs font-semibold text-fg-muted">size=&quot;md&quot; (default)</p>
        <Timeline items={auditTrail.slice(0, 3)} />
      </div>
      <div className="max-w-md">
        <p className="mb-2 text-xs font-semibold text-fg-muted">size=&quot;sm&quot;</p>
        <Timeline items={auditTrail.slice(0, 3)} size="sm" />
      </div>
    </div>
  ),
};

// ──────────────────────────────────────────────────────────────────
// Without icons — dot fallback
// ──────────────────────────────────────────────────────────────────

export const DotFallback: Story = {
  render: () => (
    <div className="max-w-md">
      <Timeline
        items={[
          { id: "1", tone: "violet", title: "Sem ícone — dot decorativo", timestamp: "09:00" },
          { id: "2", tone: "green", title: "O marcador cai para um dot", timestamp: "09:05" },
          { id: "3", tone: "neutral", title: "Mesmo contrato de tom", timestamp: "09:10" },
        ]}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Quando `item.icon` não é fornecido, o marcador mostra um dot decorativo (`bg-current`) — exatamente como a referência legacy.",
      },
    },
  },
};
