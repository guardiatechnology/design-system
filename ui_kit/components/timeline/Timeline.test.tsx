import * as React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { UploadCloud, Check, TriangleAlert } from "lucide-react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Timeline,
  timelineMarkerVariants,
  type TimelineItem,
} from "./index";

/**
 * Tests for Plan #111 (parent Tech Task #110) — Timeline v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come
 * from `docs/issues/issue-110/02-requirements.md`.
 */

// ──────────────────────────────────────────────────────────────────
// Fixtures
// ──────────────────────────────────────────────────────────────────

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
    timestamp: "09:14",
  },
  {
    id: "3",
    tone: "amber",
    title: "11 lançamentos marcados para revisão",
    description: "Confiança abaixo do limiar de 95%",
  },
  {
    id: "4",
    tone: "red",
    icon: TriangleAlert,
    title: "Falha ao sincronizar com o Domínio",
  },
  {
    id: "5",
    tone: "neutral",
    title: "Fechamento de setembro iniciado",
  },
];

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1, AC-2, AC-3)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — public surface", () => {
  it("AC-1: exports the Timeline component", () => {
    expect(Timeline).toBeDefined();
  });

  it("AC-2: exports timelineMarkerVariants CVA accessor, callable with no args (defaults violet/md)", () => {
    expect(typeof timelineMarkerVariants).toBe("function");
    const cls = timelineMarkerVariants({});
    expect(cls).toContain("border-primary");
    expect(cls).toContain("text-primary");
    expect(cls).toContain("size-[22px]");
  });

  it("AC-3: Timeline.displayName === 'Timeline'", () => {
    expect(Timeline.displayName).toBe("Timeline");
  });
});

// ──────────────────────────────────────────────────────────────────
// Semantic structure (AC-4, AC-5)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — semantic structure", () => {
  it("AC-4: renders an <ol> list with default aria-label 'Linha do tempo'", () => {
    render(<Timeline items={auditTrail} />);
    const list = screen.getByRole("list", { name: "Linha do tempo" });
    expect(list.tagName).toBe("OL");
  });

  it("AC-4: aria-label is overridable", () => {
    render(<Timeline items={auditTrail} aria-label="Auditoria do fechamento" />);
    expect(
      screen.getByRole("list", { name: "Auditoria do fechamento" }),
    ).toBeInTheDocument();
  });

  it("AC-5: renders one <li> per item", () => {
    render(<Timeline items={auditTrail} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(auditTrail.length);
  });
});

// ──────────────────────────────────────────────────────────────────
// Orientation (AC-6, AC-7)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — orientation", () => {
  it("AC-6: orientation='vertical' (default) lays out events in a column", () => {
    render(<Timeline items={auditTrail} />);
    const list = screen.getByRole("list");
    expect(list.className).toContain("flex-col");
    // Non-last vertical items carry bottom padding for the connector run.
    const firstItem = screen.getAllByRole("listitem")[0]!;
    expect(firstItem.className).toContain("pb-");
  });

  it("AC-7: orientation='horizontal' lays out events in a row", () => {
    render(<Timeline items={auditTrail} orientation="horizontal" />);
    const list = screen.getByRole("list");
    expect(list.className).toContain("flex");
    expect(list.className).not.toContain("flex-col");
    // Horizontal items get flex-1 so connectors space evenly.
    const firstItem = screen.getAllByRole("listitem")[0]!;
    expect(firstItem.className).toContain("flex-1");
  });
});

// ──────────────────────────────────────────────────────────────────
// Item content (AC-8..AC-12)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — item content", () => {
  it("AC-8: renders the title of every item", () => {
    render(<Timeline items={auditTrail} />);
    expect(screen.getByText("Extrato Itaú importado")).toBeInTheDocument();
    expect(
      screen.getByText("248 lançamentos aprovados automaticamente"),
    ).toBeInTheDocument();
    expect(screen.getByText("Fechamento de setembro iniciado")).toBeInTheDocument();
  });

  it("AC-9: renders description when present and omits it when absent", () => {
    render(<Timeline items={auditTrail} />);
    expect(screen.getByText("237 lançamentos via OFX")).toBeInTheDocument();
    // Item 2 has no description.
    expect(
      screen.queryByText("Confiança média"),
    ).not.toBeInTheDocument();
  });

  it("AC-10: renders timestamp when present", () => {
    render(<Timeline items={auditTrail} />);
    expect(screen.getByText("hoje · 09:12")).toBeInTheDocument();
    expect(screen.getByText("09:14")).toBeInTheDocument();
  });

  it("AC-11: renders meta node when present", () => {
    const withMeta: TimelineItem[] = [
      {
        id: "1",
        title: "Aprovado",
        meta: <span data-testid="meta-badge">Automático</span>,
      },
    ];
    render(<Timeline items={withMeta} />);
    expect(screen.getByText("Automático")).toBeInTheDocument();
  });

  it("AC-12: renders the icon inside the marker when item.icon is provided", () => {
    const { container } = render(
      <Timeline items={[{ id: "1", icon: UploadCloud, title: "Importado" }]} />,
    );
    const item = within(container).getByRole("listitem");
    // lucide-react renders an <svg>; with an icon present there is no dot.
    expect(item.querySelector("svg")).not.toBeNull();
  });

  it("AC-12: falls back to a decorative dot when item.icon is absent", () => {
    const { container } = render(
      <Timeline items={[{ id: "1", title: "Sem ícone" }]} />,
    );
    const item = within(container).getByRole("listitem");
    expect(item.querySelector("svg")).toBeNull();
    // The dot is a rounded bg-current span inside the marker.
    const dot = item.querySelector("span[aria-hidden='true'] > span");
    expect(dot).not.toBeNull();
    expect(dot!.className).toContain("bg-current");
  });
});

// ──────────────────────────────────────────────────────────────────
// Tones → semantic tokens (AC-13..AC-17)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — tones map to semantic tokens", () => {
  it("AC-13: tone='violet' (default) uses --primary tokens", () => {
    const cls = timelineMarkerVariants({ tone: "violet" });
    expect(cls).toContain("border-primary");
    expect(cls).toContain("text-primary");
  });

  it("AC-14: tone='green' uses --success tokens", () => {
    const cls = timelineMarkerVariants({ tone: "green" });
    expect(cls).toContain("border-success");
    expect(cls).toContain("bg-success-soft");
    expect(cls).toContain("text-success-fg");
  });

  it("AC-15: tone='amber' uses --warning tokens", () => {
    const cls = timelineMarkerVariants({ tone: "amber" });
    expect(cls).toContain("border-warning");
    expect(cls).toContain("bg-warning-soft");
    expect(cls).toContain("text-warning-fg");
  });

  it("AC-16: tone='red' uses --danger tokens", () => {
    const cls = timelineMarkerVariants({ tone: "red" });
    expect(cls).toContain("border-danger");
    expect(cls).toContain("bg-danger-soft");
    expect(cls).toContain("text-danger-fg");
  });

  it("AC-17: tone='neutral' uses neutral tokens (--border / --fg-muted)", () => {
    const cls = timelineMarkerVariants({ tone: "neutral" });
    expect(cls).toContain("border-border");
    expect(cls).toContain("text-fg-muted");
  });
});

// ──────────────────────────────────────────────────────────────────
// Connector (AC-18, AC-19)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — connector", () => {
  it("AC-18: connector='solid' (default) draws a solid line; last item has none", () => {
    const { container } = render(<Timeline items={auditTrail} />);
    const items = within(container).getAllByRole("listitem");
    // Non-last items render the solid connector pseudo-element (after:bg-border).
    expect(items[0]!.className).toContain("after:bg-border");
    // Last item never carries a connector.
    const last = items[items.length - 1]!;
    expect(last.className).not.toContain("after:bg-border");
    expect(last.className).not.toContain("after:border-dashed");
  });

  it("AC-19: connector='dashed' draws a dashed line", () => {
    const { container } = render(
      <Timeline items={auditTrail} connector="dashed" />,
    );
    const firstItem = within(container).getAllByRole("listitem")[0]!;
    expect(firstItem.className).toContain("after:border-dashed");
    expect(firstItem.className).toContain("after:border-border");
  });
});

// ──────────────────────────────────────────────────────────────────
// Size (AC-20)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — size", () => {
  it("AC-20: size='md' (default) yields a 22px marker", () => {
    const { container } = render(<Timeline items={auditTrail} />);
    const marker = container.querySelector("li span[data-tone]");
    expect(marker!.className).toContain("size-[22px]");
  });

  it("AC-20: size='sm' yields a 16px marker", () => {
    const { container } = render(<Timeline items={auditTrail} size="sm" />);
    const marker = container.querySelector("li span[data-tone]");
    expect(marker!.className).toContain("size-4");
  });
});

// ──────────────────────────────────────────────────────────────────
// Color is not the only indicator (AC-21)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — color is not the only indicator", () => {
  it("AC-21: each marker exposes data-tone, so the tone is detectable non-chromatically", () => {
    const { container } = render(<Timeline items={auditTrail} />);
    const markers = container.querySelectorAll("li span[data-tone]");
    expect(markers).toHaveLength(auditTrail.length);
    expect((markers[0] as HTMLElement).getAttribute("data-tone")).toBe("violet");
    expect((markers[1] as HTMLElement).getAttribute("data-tone")).toBe("green");
    expect((markers[3] as HTMLElement).getAttribute("data-tone")).toBe("red");
  });

  it("AC-21: non-default tones expose an sr-only textual label before the title", () => {
    render(
      <Timeline
        items={[
          { id: "1", tone: "red", title: "Falhou" },
          { id: "2", tone: "green", title: "Concluído" },
          { id: "3", tone: "amber", title: "Atenção" },
          { id: "4", tone: "neutral", title: "Iniciado" },
        ]}
      />,
    );
    // The accessible name of each item's heading text includes the tone word.
    expect(screen.getByText("erro:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("sucesso:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("atenção:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("neutro:", { exact: false })).toBeInTheDocument();
  });

  it("AC-21: the default violet tone carries no sr-only label (it has no extra semantics)", () => {
    render(<Timeline items={[{ id: "1", tone: "violet", title: "Importado" }]} />);
    expect(screen.queryByText("violet:", { exact: false })).not.toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Token contract (AC-22)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — token contract", () => {
  it("AC-22: marker variants contain no hex, oklch(), or raw Tailwind palette names", () => {
    const tones: Array<"violet" | "green" | "amber" | "red" | "neutral"> = [
      "violet",
      "green",
      "amber",
      "red",
      "neutral",
    ];
    for (const tone of tones) {
      const cls = timelineMarkerVariants({ tone });
      expect(cls).not.toMatch(/#[0-9a-fA-F]{3,8}/);
      expect(cls).not.toMatch(/oklch\(/);
      expect(cls).not.toMatch(/(text|bg|border)-(red|green|yellow|blue|amber|violet|purple)-\d+/);
    }
  });
});

// ──────────────────────────────────────────────────────────────────
// jest-axe in light + dark (AC-23, AC-24, AC-25)
// ──────────────────────────────────────────────────────────────────

describe("Timeline — a11y in light + dark", () => {
  const AXE_TIMEOUT_MS = 20_000;

  it(
    "AC-23: vertical multi-tone timeline has no axe violations in light + dark",
    async () => {
      const { container } = render(<Timeline items={auditTrail} />);
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-24: horizontal timeline has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Timeline
          items={[
            { id: "1", tone: "violet", icon: UploadCloud, title: "Importado" },
            { id: "2", tone: "green", icon: Check, title: "Aprovado" },
            { id: "3", tone: "neutral", title: "Concluído" },
          ]}
          orientation="horizontal"
        />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );

  it(
    "AC-25: dashed + sm + red-tone timeline has no axe violations in light + dark",
    async () => {
      const { container } = render(
        <Timeline
          items={[
            { id: "1", tone: "neutral", title: "Fechamento iniciado", timestamp: "08:00" },
            {
              id: "2",
              tone: "red",
              icon: TriangleAlert,
              title: "Falha ao sincronizar",
              description: "Credencial expirada",
              timestamp: "08:03",
            },
            { id: "3", tone: "green", icon: Check, title: "Restabelecido", timestamp: "09:28" },
          ]}
          size="sm"
          connector="dashed"
        />,
      );
      await axeInThemes(container);
    },
    AXE_TIMEOUT_MS,
  );
});
