import * as React from "react";

import { Progress } from "@ds/components/progress";

// ──────────────────────────────────────────────────────────────────
// Padrão — linear determinate, violet
// ──────────────────────────────────────────────────────────────────

export function BasicRow(): React.ReactElement {
  return (
    <div className="flex max-w-md flex-col gap-3 py-4">
      <Progress value={60} label="Conciliando lançamentos" showValue />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tons
// ──────────────────────────────────────────────────────────────────

export function TonesRow(): React.ReactElement {
  return (
    <div className="flex max-w-md flex-col gap-5 py-4">
      <Progress value={72} tone="violet" label="Violet (default)" showValue />
      <Progress value={100} tone="green" label="Concluído" showValue />
      <Progress value={48} tone="amber" label="Atenção" showValue />
      <Progress value={22} tone="red" label="Falha parcial" showValue />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Tamanhos
// ──────────────────────────────────────────────────────────────────

export function SizesRow(): React.ReactElement {
  return (
    <div className="flex max-w-md flex-col gap-6 py-4">
      <Progress value={60} size="sm" label="sm" showValue />
      <Progress value={60} size="md" label="md (default)" showValue />
      <Progress value={60} size="lg" label="lg" showValue />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Indeterminate (linear)
// ──────────────────────────────────────────────────────────────────

export function IndeterminateRow(): React.ReactElement {
  return (
    <div className="max-w-md py-4">
      <Progress indeterminate label="Aguardando resposta…" />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Circular — determinate + tons + tamanhos
// ──────────────────────────────────────────────────────────────────

export function CircularRow(): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-8 py-4">
      <Progress value={75} variant="circular" size="sm" showValue />
      <Progress value={75} variant="circular" size="md" showValue />
      <Progress value={75} variant="circular" size="lg" showValue />
      <Progress value={40} variant="circular" tone="green" size="lg" showValue />
      <Progress value={40} variant="circular" tone="amber" size="lg" showValue />
      <Progress value={40} variant="circular" tone="red" size="lg" showValue />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Circular — indeterminate
// ──────────────────────────────────────────────────────────────────

export function CircularIndeterminateRow(): React.ReactElement {
  return (
    <div className="flex items-center gap-8 py-4">
      <Progress indeterminate variant="circular" size="sm" label="Carregando" />
      <Progress indeterminate variant="circular" size="md" label="Carregando" />
      <Progress indeterminate variant="circular" size="lg" label="Carregando" />
    </div>
  );
}
