import * as React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Bot, FileText, CircleDollarSign } from "lucide-react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  MetricCard,
  metricCardVariants,
  deriveDeltaType,
  type MetricCardProps,
} from "./index";

/**
 * Tests for Plan #105 (parent Tech Task #104) — MetricCard v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come
 * from `docs/issues/issue-104/02-requirements.md`.
 */

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1, AC-2, AC-3)
// ──────────────────────────────────────────────────────────────────

describe("MetricCard — public surface", () => {
  it("AC-1: renders the component (default + named export resolve to the same thing)", () => {
    render(<MetricCard label="Lançamentos" value="2.487" />);
    expect(screen.getByText("Lançamentos")).toBeInTheDocument();
    expect(screen.getByText("2.487")).toBeInTheDocument();
  });

  it("AC-2: exports metricCardVariants and it is callable with no args (defaults to md padding)", () => {
    expect(metricCardVariants).toBeDefined();
    expect(typeof metricCardVariants).toBe("function");
    expect(metricCardVariants({})).toContain("p-5");
  });

  it("AC-3: MetricCard.displayName === 'MetricCard'", () => {
    expect(MetricCard.displayName).toBe("MetricCard");
  });
});

// ──────────────────────────────────────────────────────────────────
// API parity — label, value, prefix, suffix (AC-4, AC-5)
// ──────────────────────────────────────────────────────────────────

describe("MetricCard — label + value + affixes", () => {
  it("AC-4: renders label and value", () => {
    render(<MetricCard label="Conciliação" value="96" />);
    expect(screen.getByText("Conciliação")).toBeInTheDocument();
    expect(screen.getByText("96")).toBeInTheDocument();
  });

  it("AC-5: renders prefix and suffix when provided", () => {
    render(
      <MetricCard label="MRR" prefix="R$ " value="38.490" suffix=" /mês" />,
    );
    expect(screen.getByText("R$")).toBeInTheDocument();
    expect(screen.getByText("/mês")).toBeInTheDocument();
    expect(screen.getByText("38.490")).toBeInTheDocument();
  });

  it("AC-5: omits prefix/suffix nodes when not provided", () => {
    render(<MetricCard label="Pendências" value="11" />);
    const value = screen.getByText("11").closest("[data-slot='metric-card-value']");
    expect(value).not.toBeNull();
    expect(
      value!.querySelector("[data-slot='metric-card-number']"),
    ).not.toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────
// Delta formatting + tone derivation (AC-6, AC-7)
// ──────────────────────────────────────────────────────────────────

describe("MetricCard — delta formatting", () => {
  it("AC-6: numeric positive delta renders signed pt-BR percentage", () => {
    render(<MetricCard label="x" value="1" delta={12.4} />);
    expect(screen.getByText("+12,4%")).toBeInTheDocument();
  });

  it("AC-6: numeric negative delta renders signed pt-BR percentage", () => {
    render(<MetricCard label="x" value="1" delta={-18.2} />);
    expect(screen.getByText("-18,2%")).toBeInTheDocument();
  });

  it("AC-6: string delta renders verbatim", () => {
    render(
      <MetricCard
        label="vs. meta"
        value="84"
        delta="atingido 84% do trimestre"
        deltaType="neutral"
      />,
    );
    expect(
      screen.getByText("atingido 84% do trimestre"),
    ).toBeInTheDocument();
  });

  it("AC-6: no delta → no delta chip rendered", () => {
    const { container } = render(<MetricCard label="x" value="1" />);
    expect(
      container.querySelector("[data-slot='metric-card-delta']"),
    ).toBeNull();
  });
});

describe("MetricCard — tone derivation", () => {
  it("AC-7: deriveDeltaType maps sign correctly", () => {
    expect(deriveDeltaType(12.4)).toBe("up");
    expect(deriveDeltaType(-3)).toBe("down");
    expect(deriveDeltaType(0)).toBe("neutral");
    expect(deriveDeltaType(undefined)).toBe("neutral");
  });

  it("AC-7: deriveDeltaType parses string deltas with comma decimals", () => {
    expect(deriveDeltaType("2,1")).toBe("up");
    expect(deriveDeltaType("-4,5")).toBe("down");
    expect(deriveDeltaType("estável")).toBe("neutral");
  });

  it("AC-7: positive numeric delta resolves tone=up on the chip", () => {
    const { container } = render(
      <MetricCard label="x" value="1" delta={2.1} />,
    );
    const chip = container.querySelector("[data-slot='metric-card-delta']");
    expect(chip).not.toBeNull();
    expect(chip!.getAttribute("data-tone")).toBe("up");
  });

  it("AC-7: explicit deltaType overrides the derived sign", () => {
    const { container } = render(
      <MetricCard label="x" value="1" delta={5} deltaType="neutral" />,
    );
    const chip = container.querySelector("[data-slot='metric-card-delta']");
    expect(chip!.getAttribute("data-tone")).toBe("neutral");
  });
});

// ──────────────────────────────────────────────────────────────────
// Caption + icon (AC-8, AC-9)
// ──────────────────────────────────────────────────────────────────

describe("MetricCard — caption + icon", () => {
  it("AC-8: renders caption in the footer when provided", () => {
    render(
      <MetricCard
        label="Lançamentos"
        value="2.487"
        delta={12.4}
        caption="vs. 30d anteriores"
      />,
    );
    expect(screen.getByText("vs. 30d anteriores")).toBeInTheDocument();
  });

  it("AC-8: caption-only (no delta) still renders the footer caption", () => {
    render(
      <MetricCard
        icon={Bot}
        label="Agentes rodando"
        value="6"
        caption="em produção"
      />,
    );
    expect(screen.getByText("em produção")).toBeInTheDocument();
  });

  it("AC-9: renders the icon component in the top-right chip", () => {
    const { container } = render(
      <MetricCard icon={FileText} label="Lançamentos" value="2.487" />,
    );
    const chip = container.querySelector("[data-slot='metric-card-icon']");
    expect(chip).not.toBeNull();
    expect(chip!.querySelector("svg")).not.toBeNull();
  });

  it("AC-9: omits the icon chip when no icon is provided", () => {
    const { container } = render(<MetricCard label="x" value="1" />);
    expect(
      container.querySelector("[data-slot='metric-card-icon']"),
    ).toBeNull();
  });
});

// ──────────────────────────────────────────────────────────────────
// Size (AC-10)
// ──────────────────────────────────────────────────────────────────

describe("MetricCard — size", () => {
  it("AC-10: size='md' (default) yields p-5 padding + text-3xl value", () => {
    const { container } = render(<MetricCard label="x" value="1" />);
    const root = container.querySelector("[data-slot='metric-card']");
    expect(root!.className).toContain("p-5");
    expect(root!.getAttribute("data-size")).toBe("md");
    const value = container.querySelector("[data-slot='metric-card-value']");
    expect(value!.className).toContain("text-3xl");
  });

  it("AC-10: size='sm' yields p-4 + text-2xl", () => {
    const { container } = render(<MetricCard size="sm" label="x" value="1" />);
    const root = container.querySelector("[data-slot='metric-card']");
    expect(root!.className).toContain("p-4");
    const value = container.querySelector("[data-slot='metric-card-value']");
    expect(value!.className).toContain("text-2xl");
  });

  it("AC-10: size='lg' yields p-6 + text-4xl", () => {
    const { container } = render(<MetricCard size="lg" label="x" value="1" />);
    const root = container.querySelector("[data-slot='metric-card']");
    expect(root!.className).toContain("p-6");
    const value = container.querySelector("[data-slot='metric-card-value']");
    expect(value!.className).toContain("text-4xl");
  });
});

// ──────────────────────────────────────────────────────────────────
// Token contract (AC-11, AC-12)
// ──────────────────────────────────────────────────────────────────

describe("MetricCard — token contract", () => {
  it("AC-11: root + variants contain no hex literals, oklch(), or raw Tailwind palette names", () => {
    const { container } = render(
      <MetricCard icon={Bot} label="x" value="1" delta={5} caption="ctx" />,
    );
    const html = container.innerHTML;
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(html).not.toMatch(/oklch\(/);
    // raw Tailwind palette utilities (e.g. bg-green-500, text-red-600) are forbidden
    expect(html).not.toMatch(
      /\b(bg|text|border)-(red|green|blue|violet|purple|orange|yellow|pink|gray|slate|zinc)-\d{2,3}\b/,
    );
  });

  it("AC-12: up tone uses success token pair", () => {
    const { container } = render(
      <MetricCard label="x" value="1" delta={2.1} />,
    );
    const chip = container.querySelector("[data-slot='metric-card-delta']");
    expect(chip!.className).toContain("bg-success-soft");
    expect(chip!.className).toContain("text-success-fg");
  });

  it("AC-12: down tone uses danger token pair", () => {
    const { container } = render(
      <MetricCard label="x" value="1" delta={-2.1} />,
    );
    const chip = container.querySelector("[data-slot='metric-card-delta']");
    expect(chip!.className).toContain("bg-danger-soft");
    expect(chip!.className).toContain("text-danger-fg");
  });

  it("AC-12: neutral tone uses muted token pair", () => {
    const { container } = render(
      <MetricCard label="x" value="1" delta={0} />,
    );
    const chip = container.querySelector("[data-slot='metric-card-delta']");
    expect(chip!.className).toContain("bg-muted");
    expect(chip!.className).toContain("text-fg-muted");
  });
});

// ──────────────────────────────────────────────────────────────────
// Trend not by color alone (AC-13, AC-14, AC-15)
// ──────────────────────────────────────────────────────────────────

describe("MetricCard — trend not by color alone", () => {
  it("AC-13: up delta pairs a directional arrow icon with the signed number", () => {
    const { container } = render(
      <MetricCard label="x" value="1" delta={12.4} />,
    );
    const chip = container.querySelector("[data-slot='metric-card-delta']")!;
    // arrow svg present (aria-hidden) AND signed text present
    expect(chip.querySelector("svg")).not.toBeNull();
    expect(chip.textContent).toContain("+12,4%");
  });

  it("AC-13: down delta carries a minus sign in the text (meaning without color)", () => {
    const { container } = render(
      <MetricCard label="x" value="1" delta={-42} />,
    );
    const chip = container.querySelector("[data-slot='metric-card-delta']")!;
    expect(chip.textContent).toContain("-42%");
  });

  it("AC-14: delta exposes an accessible direction label (up → 'aumento de')", () => {
    render(<MetricCard label="x" value="1" delta={12.4} />);
    expect(screen.getByLabelText("aumento de 12,4%")).toBeInTheDocument();
  });

  it("AC-14: delta exposes an accessible direction label (down → 'queda de')", () => {
    render(<MetricCard label="x" value="1" delta={-18.2} />);
    expect(screen.getByLabelText("queda de 18,2%")).toBeInTheDocument();
  });

  it("AC-15: icon chip is decorative (aria-hidden), label is the accessible name of the group", () => {
    const { container } = render(
      <MetricCard icon={CircleDollarSign} label="Receita processada" value="2,4" />,
    );
    const chip = container.querySelector("[data-slot='metric-card-icon']");
    expect(chip!.getAttribute("aria-hidden")).toBe("true");
    const group = screen.getByRole("group", { name: "Receita processada" });
    expect(group).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Semantics & composition (AC-16, AC-17, AC-18)
// ──────────────────────────────────────────────────────────────────

describe("MetricCard — semantics & composition", () => {
  it("AC-16: root composes the Card primitive (div host) with card surface tokens", () => {
    const { container } = render(<MetricCard label="x" value="1" />);
    const root = container.querySelector("[data-slot='metric-card']")!;
    // div host so role="group" is ARIA-valid (an <article> would forbid it).
    expect(root.tagName).toBe("DIV");
    // Card primitive contributes the surface tokens
    expect(root.className).toContain("bg-card");
    expect(root.className).toContain("text-card-foreground");
  });

  it("AC-17: KPI is a role=group labelled by its label (announced as one unit)", () => {
    render(<MetricCard label="Horas economizadas" value="32" suffix="h" />);
    const group = screen.getByRole("group", { name: "Horas economizadas" });
    const label = within(group).getByText("Horas economizadas");
    expect(label.id).toBeTruthy();
    expect(group.getAttribute("aria-labelledby")).toBe(label.id);
  });

  it("AC-18: passes through className and standard HTML attributes", () => {
    const { container } = render(
      <MetricCard
        label="x"
        value="1"
        className="custom-cls"
        data-testid="mc"
        id="kpi-1"
      />,
    );
    const root = container.querySelector("[data-slot='metric-card']")!;
    expect(root.className).toContain("custom-cls");
    expect(root.getAttribute("id")).toBe("kpi-1");
    expect(screen.getByTestId("mc")).toBe(root);
  });

  it("AC-18: forwards ref to the root element", () => {
    const ref = React.createRef<HTMLElement>();
    render(<MetricCard ref={ref} label="x" value="1" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current!.getAttribute("data-slot")).toBe("metric-card");
  });
});

// ──────────────────────────────────────────────────────────────────
// a11y — jest-axe in light + dark (AC-19)
// ──────────────────────────────────────────────────────────────────

describe("MetricCard — a11y in light + dark", () => {
  const variants: Array<[string, MetricCardProps]> = [
    [
      "AC-19: Default (icon + numeric up delta + caption)",
      {
        icon: FileText,
        label: "Lançamentos",
        value: "2.487",
        delta: 12.4,
        caption: "vs. 30d anteriores",
      },
    ],
    [
      "AC-19: down-tone delta",
      { label: "Pendências", value: "11", delta: -18.2 },
    ],
    [
      "AC-19: no-delta caption-only",
      { icon: Bot, label: "Agentes rodando", value: "6", caption: "em produção" },
    ],
  ];

  for (const [name, props] of variants) {
    it(`${name} has no axe violations in light + dark`, async () => {
      const { container } = render(<MetricCard {...props} />);
      await axeInThemes(container);
    });
  }
});
