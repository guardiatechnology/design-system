import * as React from "react";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Users } from "lucide-react";

import {
  Calendar,
  type CalendarEvent,
  type CalendarLegendItem,
} from "@ds/components/calendar";

// A pinned reference month + fixed "today" keep the static previews
// deterministic (no drift as the day boundary crosses). Mirrors the legacy
// fiscal-calendar dataset (Novembro 2025).
const REF = new Date(2025, 10, 1);
const TODAY = new Date(2025, 10, 14);

const FISCAL_EVENTS: CalendarEvent[] = [
  { id: "e1", date: "2025-11-07", time: "23:59", title: "DCTFWeb Outubro", tone: "red", icon: AlertTriangle },
  { id: "e2", date: "2025-11-07", time: "23:59", title: "FGTS", tone: "red", icon: AlertTriangle },
  { id: "e3", date: "2025-11-10", time: "09:00", title: "Revisão Porto Brasil", tone: "violet", icon: Users },
  { id: "e4", date: "2025-11-14", time: "23:59", title: "SPED Contribuições", tone: "orange", icon: FileText },
  { id: "e5", date: "2025-11-14", time: "14:00", title: "Call Tech Ltda", tone: "blue", icon: Users },
  { id: "e6", date: "2025-11-14", time: "10:30", title: "Conferência folha", tone: "yellow" },
  { id: "e7", date: "2025-11-14", time: "16:00", title: "Review Rafa Costa", tone: "neutral" },
  { id: "e8", date: "2025-11-17", time: "11:30", title: "Onboarding Volt Café", tone: "green", icon: CheckCircle2 },
  { id: "e9", date: "2025-11-20", time: "23:59", title: "DARF IRRF", tone: "red", icon: AlertTriangle },
  { id: "e10", date: "2025-11-25", time: "23:59", title: "PIS/COFINS", tone: "orange", icon: FileText },
  { id: "e11", date: "2025-11-25", time: "15:00", title: "Fechamento Pietra Moda", tone: "violet", icon: Users },
  { id: "e12", date: "2025-11-11", allDay: true, title: "Treinamento equipe", tone: "blue" },
  { id: "e13", date: "2025-11-21", allDay: true, title: "Offsite — São Paulo", tone: "violet" },
  { id: "e14", date: "2025-11-03", endDate: "2025-11-05", allDay: true, title: "Fechamento mensal", tone: "green" },
];

const FISCAL_LEGEND: CalendarLegendItem[] = [
  { label: "Prazo crítico", tone: "red" },
  { label: "Obrigação fiscal", tone: "orange" },
  { label: "Reunião cliente", tone: "violet" },
  { label: "Interno", tone: "blue" },
  { label: "Marco", tone: "green" },
];

// ──────────────────────────────────────────────────────────────────
// Mês — calendário fiscal com seleção de dia e clique em evento
// ──────────────────────────────────────────────────────────────────

export function MonthRow(): React.ReactElement {
  const [selected, setSelected] = useState<Date | null>(null);
  const [clicked, setClicked] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-3 py-2">
      <div className="h-[640px]">
        <Calendar
          view="month"
          defaultDate={REF}
          today={TODAY}
          events={FISCAL_EVENTS}
          legend={FISCAL_LEGEND}
          selectedDate={selected}
          onDayClick={setSelected}
          onEventClick={(ev) => setClicked(String(ev.title))}
        />
      </div>
      <div className="flex flex-wrap gap-4 text-xs text-fg-muted">
        <span>
          Dia selecionado:{" "}
          <code className="font-mono">
            {selected ? selected.toLocaleDateString("pt-BR") : "—"}
          </code>
        </span>
        <span>
          Último evento:{" "}
          <code className="font-mono">{clicked ?? "—"}</code>
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Semana — eventos em coluna
// ──────────────────────────────────────────────────────────────────

export function WeekRow(): React.ReactElement {
  return (
    <div className="h-[500px] py-2">
      <Calendar
        view="week"
        defaultDate={new Date(2025, 10, 12)}
        today={TODAY}
        events={FISCAL_EVENTS}
        legend={FISCAL_LEGEND}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Agenda — lista cronológica
// ──────────────────────────────────────────────────────────────────

export function AgendaRow(): React.ReactElement {
  return (
    <div className="h-[560px] py-2">
      <Calendar
        view="agenda"
        defaultDate={REF}
        today={TODAY}
        events={FISCAL_EVENTS}
        title="Agenda de Novembro"
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Números de semana — weekStartsOn={1} + showWeekNumbers
// ──────────────────────────────────────────────────────────────────

export function WeekNumbersRow(): React.ReactElement {
  return (
    <div className="h-[600px] py-2">
      <Calendar
        view="month"
        defaultDate={REF}
        today={TODAY}
        events={FISCAL_EVENTS.slice(0, 6)}
        weekStartsOn={1}
        showWeekNumbers
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Vazio — planejamento sem eventos
// ──────────────────────────────────────────────────────────────────

export function EmptyRow(): React.ReactElement {
  return (
    <div className="h-[500px] py-2">
      <Calendar
        view="month"
        defaultDate={REF}
        today={TODAY}
        events={[]}
        maxEventsPerDay={0}
      />
    </div>
  );
}
