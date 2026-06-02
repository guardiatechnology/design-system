import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { Calendar } from "@ds/components/calendar";

/* Interactive playground (noInline + useState) for the events calendar.
   Consumers experiment with the events model, view switching and day
   selection against the real Calendar component. */

const DEFAULT_CODE = `function App() {
  const [view, setView] = useState("month");
  const [selected, setSelected] = useState(null);

  const events = [
    { id: "1", date: "2025-11-07", time: "23:59", title: "DCTFWeb", tone: "red" },
    { id: "2", date: "2025-11-10", time: "09:00", title: "Revisão cliente", tone: "violet" },
    { id: "3", date: "2025-11-14", time: "14:00", title: "Call Tech Ltda", tone: "blue" },
    { id: "4", date: "2025-11-17", time: "11:30", title: "Onboarding", tone: "green" },
    { id: "5", date: "2025-11-21", allDay: true, title: "Offsite", tone: "violet" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ height: 560 }}>
        <Calendar
          view={view}
          onViewChange={setView}
          defaultDate={new Date(2025, 10, 1)}
          today={new Date(2025, 10, 14)}
          events={events}
          selectedDate={selected}
          onDayClick={setSelected}
        />
      </div>
      <p style={{ fontSize: 13 }}>
        {selected
          ? "Dia selecionado: " + selected.toLocaleDateString("pt-BR")
          : "Clique em um dia para selecionar"}
      </p>
    </div>
  );
}

render(<App />);`;

const scope = { Calendar, useState };

export function LiveCalendarSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope} noInline>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="280px"
          maxHeight="520px"
        />
        <div className="flex min-h-[280px] flex-col overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Preview ao vivo</span>
            <span className="font-mono normal-case tracking-normal">
              react-live
            </span>
          </div>
          <div className="flex flex-1 items-start justify-center p-6">
            <LivePreview />
          </div>
          <LiveError className="m-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive" />
        </div>
      </div>
    </LiveProvider>
  );
}
