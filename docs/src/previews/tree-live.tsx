import { useState } from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";
import { CodeEditor } from "@ds/components/code-editor";
import { Tree } from "@ds/components/tree";

const DEFAULT_CODE = `<div style={{ maxWidth: 320 }}>
  <Tree
    aria-label="Plano de contas"
    mode="single"
    nodes={[
      { id: "1", label: "Ativo", defaultExpanded: true, children: [
        { id: "1.1", label: "Circulante", defaultExpanded: true, children: [
          { id: "1.1.01", label: "Caixa", meta: "R$ 12.400" },
          { id: "1.1.02", label: "Bancos", meta: "R$ 88.120" },
        ]},
        { id: "1.2", label: "Não circulante" },
      ]},
      { id: "2", label: "Passivo", children: [
        { id: "2.1", label: "Fornecedores", meta: "R$ 31.900" },
      ]},
    ]}
  />
</div>`;

const scope = { Tree };

export function LiveTreeSnippet() {
  const [code, setCode] = useState(DEFAULT_CODE);
  return (
    <LiveProvider code={code} scope={scope}>
      <div className="grid gap-3 md:grid-cols-2">
        <CodeEditor
          value={code}
          onChange={setCode}
          language="tsx"
          filename="playground.tsx"
          minHeight="260px"
          maxHeight="480px"
        />
        <div className="flex min-h-[300px] flex-col overflow-hidden rounded-md border border-border bg-background">
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
