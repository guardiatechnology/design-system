import * as React from "react";

import { Timeline, type TimelineItem } from "@ds/components/timeline";
import { Badge } from "@ds/components/badge";
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
// Padrão — vertical, solid, md
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <div className="w-full max-w-md py-4">
      <Timeline items={auditTrail} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tons (todos juntos)
// ──────────────────────────────────────────────────────────────────

export function TonesRow(): React.ReactElement {
  return (
    <div className="w-full max-w-md py-4">
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
  );
}

// ──────────────────────────────────────────────────────────────────
// Horizontal
// ──────────────────────────────────────────────────────────────────

export function HorizontalRow(): React.ReactElement {
  return (
    <div className="w-full py-4">
      <Timeline
        orientation="horizontal"
        items={[
          { id: "1", tone: "violet", icon: UploadCloud, title: "Importado", timestamp: "09:12" },
          { id: "2", tone: "green", icon: Check, title: "Aprovados", timestamp: "09:14" },
          { id: "3", tone: "amber", icon: Flag, title: "Em revisão", timestamp: "09:15" },
          { id: "4", tone: "green", icon: CircleCheck, title: "Conciliado", timestamp: "10:44" },
        ]}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Dashed connector
// ──────────────────────────────────────────────────────────────────

export function DashedRow(): React.ReactElement {
  return (
    <div className="w-full max-w-md py-4">
      <Timeline items={errorTrail} connector="dashed" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Sizes
// ──────────────────────────────────────────────────────────────────

export function SizesRow(): React.ReactElement {
  return (
    <div className="flex w-full flex-col gap-8 py-4">
      <div className="max-w-md">
        <Timeline items={auditTrail.slice(0, 3)} />
      </div>
      <div className="max-w-md">
        <Timeline items={auditTrail.slice(0, 3)} size="sm" />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Dot fallback (sem ícone)
// ──────────────────────────────────────────────────────────────────

export function DotFallbackRow(): React.ReactElement {
  return (
    <div className="w-full max-w-md py-4">
      <Timeline
        items={[
          { id: "1", tone: "violet", title: "Sem ícone — dot decorativo", timestamp: "09:00" },
          { id: "2", tone: "green", title: "O marcador cai para um dot", timestamp: "09:05" },
          { id: "3", tone: "neutral", title: "Mesmo contrato de tom", timestamp: "09:10" },
        ]}
      />
    </div>
  );
}
