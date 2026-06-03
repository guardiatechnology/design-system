import * as React from "react";

import { MetricCard } from "@ds/components/metric-card";
import {
  FileText,
  ArrowLeftRight,
  TriangleAlert,
  Bot,
  Building2,
  CircleDollarSign,
  ReceiptText,
} from "lucide-react";

// ──────────────────────────────────────────────────────────────────
// Padrão — KPI com ícone, valor e delta
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <div className="py-4 max-w-xs">
      <MetricCard
        icon={FileText}
        label="Lançamentos"
        value="2.487"
        delta={12.4}
        caption="vs. 30d anteriores"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Grid de KPIs — linha típica de dashboard
// ──────────────────────────────────────────────────────────────────

export function GridRow(): React.ReactElement {
  return (
    <div className="grid w-full grid-cols-1 gap-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard icon={FileText} label="Lançamentos" value="2.487" delta={12.4} caption="vs. 30d anteriores" />
      <MetricCard icon={ArrowLeftRight} label="Conciliação" value="96" suffix="%" delta={2.1} />
      <MetricCard icon={TriangleAlert} label="Pendências" value="11" delta={-18.2} caption="resolvidas essa semana" />
      <MetricCard icon={Bot} label="Horas economizadas" value="32" suffix="h" delta={8.7} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tamanhos — sm · md · lg
// ──────────────────────────────────────────────────────────────────

export function SizesRow(): React.ReactElement {
  return (
    <div className="flex flex-wrap items-stretch gap-4 py-4">
      <MetricCard size="sm" label="MRR" prefix="R$ " value="38.490" delta={4.2} />
      <MetricCard size="md" label="MRR" prefix="R$ " value="38.490" delta={4.2} />
      <MetricCard size="lg" label="MRR" prefix="R$ " value="38.490" delta={4.2} caption="vs. mês anterior" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tons de delta — up · down · neutral · string custom
// ──────────────────────────────────────────────────────────────────

export function DeltaRow(): React.ReactElement {
  return (
    <div className="grid w-full grid-cols-1 gap-3 py-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Conciliado" value="96" suffix="%" delta={2.1} />
      <MetricCard label="Falhas" value="3" delta={-42.0} />
      <MetricCard label="Estável" value="1.000" delta={0} deltaType="neutral" />
      <MetricCard label="vs. meta" value="84" suffix="%" delta="atingido 84% do trimestre" deltaType="neutral" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Sem delta (contexto) + prefix/suffix monetário
// ──────────────────────────────────────────────────────────────────

export function ContextRow(): React.ReactElement {
  return (
    <div className="grid w-full grid-cols-1 gap-3 py-4 sm:grid-cols-2">
      <MetricCard icon={Building2} label="Empresas ativas" value="38" caption="de 40 no plano" />
      <MetricCard icon={Bot} label="Agentes rodando" value="6" caption="em produção" />
      <MetricCard icon={CircleDollarSign} label="Receita processada" prefix="R$ " value="2,4" suffix=" mi" delta={5.8} />
      <MetricCard icon={ReceiptText} label="Nota média" prefix="R$ " value="487,20" delta={-3.1} />
    </div>
  );
}
