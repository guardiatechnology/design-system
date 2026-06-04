import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

import { CodeEditor } from "@ds/components/code-editor";
import { Kanban } from "@ds/components/kanban";

/* Interactive drag demo. The board is controlled: `onCardMove` rewrites the
   card list so users can drag cards between columns in the live playground and
   see the move persist (mirrors real consumer code). */

const DEFAULT_CODE = `function Demo() {
  const columns = [
    { id: "todo", title: "A fazer", color: "var(--guardia-orange-500)" },
    { id: "doing", title: "Em andamento", color: "var(--guardia-purple-500)" },
    { id: "done", title: "Concluído", color: "var(--signal-green)" },
  ];

  const [cards, setCards] = useState([
    { id: "a", columnId: "todo", title: "Conciliar Itaú", priority: "high", confidence: 0.96 },
    { id: "b", columnId: "todo", title: "Importar NF-e", priority: "med", confidence: 0.8 },
    { id: "c", columnId: "doing", title: "Revisar duplicados", priority: "low", progress: 0.5 },
  ]);

  function onCardMove(cardId, toColumnId, _toLaneId, toIndex) {
    setCards((prev) => {
      const moved = prev.find((c) => c.id === cardId);
      if (!moved) return prev;
      const without = prev.filter((c) => c.id !== cardId);
      const updated = { ...moved, columnId: toColumnId };
      const siblings = without.filter((c) => c.columnId === toColumnId);
      const anchor = siblings[toIndex];
      if (!anchor) return [...without, updated];
      const at = without.indexOf(anchor);
      return [...without.slice(0, at), updated, ...without.slice(at)];
    });
  }

  return (
    <Kanban
      title="Arraste os cards"
      columns={columns}
      cards={cards}
      onCardMove={onCardMove}
    />
  );
}

render(<Demo />);`;

const scope = { Kanban, useState };

export function LiveKanbanSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope} noInline>
      <div className="grid gap-3 lg:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="360px"
          maxHeight="560px"
        />
        <div className="flex min-h-[360px] flex-col overflow-hidden rounded-md border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Preview ao vivo</span>
            <span className="font-mono normal-case tracking-normal">react-live</span>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-6">
            <LivePreview />
          </div>
          <LiveError className="m-3 rounded-md border border-destructive/20 bg-destructive/5 p-3 font-mono text-[12px] text-destructive" />
        </div>
      </div>
    </LiveProvider>
  );
}
