import * as React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Progress,
  progressFillVariants,
  type ProgressTone,
} from "./index";

/**
 * Tests for Plan #107 (parent Tech Task #106) — Progress v0.1.0 DoD.
 *
 * Each `it(...)` carries `AC-N:` so that `lex-issue-driven` Rule 3
 * (bidirectional AC ↔ test traceability) passes at Gate 2. ACs come
 * from `docs/issues/issue-106/02-requirements.md`.
 */

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1, AC-2)
// ──────────────────────────────────────────────────────────────────

describe("Progress — public surface", () => {
  it("AC-1: exports Progress component + progressFillVariants CVA accessor", () => {
    expect(Progress).toBeDefined();
    expect(progressFillVariants).toBeDefined();
    expect(typeof progressFillVariants).toBe("function");
  });

  it("AC-1: progressFillVariants is callable with no args (defaults to violet → bg-primary)", () => {
    const cls = progressFillVariants({});
    expect(cls).toContain("bg-primary");
  });

  it("AC-8: progressFillVariants maps each tone to its semantic token", () => {
    expect(progressFillVariants({ tone: "violet" })).toContain("bg-primary");
    expect(progressFillVariants({ tone: "green" })).toContain("bg-success");
    expect(progressFillVariants({ tone: "amber" })).toContain("bg-warning");
    expect(progressFillVariants({ tone: "red" })).toContain("bg-danger");
  });

  it("AC-2: Progress.displayName === 'Progress'", () => {
    expect(Progress.displayName).toBe("Progress");
  });
});

// ──────────────────────────────────────────────────────────────────
// Linear variant (AC-3, AC-5)
// ──────────────────────────────────────────────────────────────────

describe("Progress — linear (default)", () => {
  it("AC-3: renders a progressbar by default (linear)", () => {
    render(<Progress value={40} label="Carregando" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toBeInTheDocument();
  });

  it("AC-3: fill width reflects value/max as a percentage", () => {
    const { container } = render(<Progress value={40} />);
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe("40%");
  });

  it("AC-5: determinate linear exposes aria-valuenow / valuemin / valuemax", () => {
    render(<Progress value={63} label="Conciliando" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "63");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("AC-5: aria-valuenow is rounded to the nearest integer", () => {
    render(<Progress value={33.7} label="Processando" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "34");
  });
});

// ──────────────────────────────────────────────────────────────────
// Circular variant (AC-4, AC-5)
// ──────────────────────────────────────────────────────────────────

describe("Progress — circular", () => {
  it("AC-4: renders an SVG with background ring + foreground arc", () => {
    const { container } = render(<Progress value={50} variant="circular" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBe(2);
  });

  it("AC-4: the foreground arc stroke-dasharray reflects the percentage", () => {
    const { container } = render(<Progress value={50} variant="circular" size="md" />);
    const arc = container.querySelectorAll("circle")[1] as SVGCircleElement;
    // md: dim=48, stroke=4, r=22 → circumference ≈ 138.23; 50% → dash ≈ 69.1
    const dash = arc.getAttribute("stroke-dasharray") ?? "";
    const [drawn] = dash.split(" ").map(Number);
    expect(drawn).toBeGreaterThan(68);
    expect(drawn).toBeLessThan(70);
  });

  it("AC-5: determinate circular carries role=progressbar + aria-value* (divergence from reference)", () => {
    render(<Progress value={25} variant="circular" label="Upload" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "25");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });
});

// ──────────────────────────────────────────────────────────────────
// Indeterminate (AC-6)
// ──────────────────────────────────────────────────────────────────

describe("Progress — indeterminate", () => {
  it("AC-6: linear indeterminate keeps role + min/max but omits aria-valuenow", () => {
    render(<Progress indeterminate label="Aguardando" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });

  it("AC-6: circular indeterminate omits aria-valuenow", () => {
    render(<Progress indeterminate variant="circular" label="Aguardando" />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });

  it("AC-6: indeterminate never renders the numeric readout even with showValue", () => {
    render(<Progress indeterminate showValue value={80} label="Aguardando" />);
    expect(screen.queryByText("80%")).not.toBeInTheDocument();
  });

  it("AC-6: linear indeterminate fill carries the slide animation utility", () => {
    const { container } = render(<Progress indeterminate />);
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill.className).toContain("animate-progress-indeterminate");
  });
});

// ──────────────────────────────────────────────────────────────────
// Clamping + custom max (AC-7)
// ──────────────────────────────────────────────────────────────────

describe("Progress — clamping", () => {
  it("AC-7: value below 0 clamps to 0%", () => {
    const { container } = render(<Progress value={-20} />);
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill.style.width).toBe("0%");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("AC-7: value above max clamps to 100%", () => {
    const { container } = render(<Progress value={150} max={100} />);
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill.style.width).toBe("100%");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("AC-7: custom max is honored (value=50 max=200 → 25%)", () => {
    const { container } = render(<Progress value={50} max={200} />);
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill.style.width).toBe("25%");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  });

  it("AC-7: non-positive max falls back to 100 (no division by zero)", () => {
    const { container } = render(<Progress value={50} max={0} />);
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill.style.width).toBe("50%");
  });
});

// ──────────────────────────────────────────────────────────────────
// Tones (AC-8)
// ──────────────────────────────────────────────────────────────────

describe("Progress — tones (semantic tokens only)", () => {
  const cases: Array<[ProgressTone, string]> = [
    ["violet", "bg-primary"],
    ["green", "bg-success"],
    ["amber", "bg-warning"],
    ["red", "bg-danger"],
  ];

  it.each(cases)("AC-8: linear tone=%s fill uses %s", (tone, token) => {
    const { container } = render(<Progress value={50} tone={tone} />);
    const fill = container.querySelector('[role="progressbar"] > div') as HTMLElement;
    expect(fill.className).toContain(token);
  });

  it("AC-8: component markup carries no hardcoded hex/rgb color", () => {
    const { container } = render(
      <Progress value={50} tone="amber" variant="circular" showValue label="x" />,
    );
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
    expect(container.innerHTML).not.toMatch(/rgb\(/);
  });
});

// ──────────────────────────────────────────────────────────────────
// Sizes (AC-9)
// ──────────────────────────────────────────────────────────────────

describe("Progress — sizes", () => {
  it("AC-9: default linear size is md (h-1.5)", () => {
    const { container } = render(<Progress value={50} />);
    const track = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(track.className).toContain("h-1.5");
  });

  it("AC-9: linear size=sm uses h-1, size=lg uses h-2.5", () => {
    const { container: sm } = render(<Progress value={50} size="sm" />);
    expect((sm.querySelector('[role="progressbar"]') as HTMLElement).className).toContain("h-1");
    const { container: lg } = render(<Progress value={50} size="lg" />);
    expect((lg.querySelector('[role="progressbar"]') as HTMLElement).className).toContain("h-2.5");
  });

  it("AC-9: circular size changes the svg diameter (sm=36, md=48, lg=64)", () => {
    const { container: sm } = render(<Progress value={50} variant="circular" size="sm" />);
    expect(sm.querySelector("svg")).toHaveAttribute("width", "36");
    const { container: md } = render(<Progress value={50} variant="circular" size="md" />);
    expect(md.querySelector("svg")).toHaveAttribute("width", "48");
    const { container: lg } = render(<Progress value={50} variant="circular" size="lg" />);
    expect(lg.querySelector("svg")).toHaveAttribute("width", "64");
  });
});

// ──────────────────────────────────────────────────────────────────
// Label + value readout (AC-10)
// ──────────────────────────────────────────────────────────────────

describe("Progress — label + readout", () => {
  it("AC-10: label names the bar via aria-labelledby", () => {
    render(<Progress value={40} label="Conciliando lançamentos" />);
    const bar = screen.getByRole("progressbar", { name: "Conciliando lançamentos" });
    expect(bar).toBeInTheDocument();
  });

  it("AC-10: showValue renders the rounded percentage", () => {
    render(<Progress value={42.4} showValue label="x" />);
    expect(screen.getByText("42%")).toBeInTheDocument();
  });

  it("AC-10: no label and no showValue by default (no meta row text)", () => {
    render(<Progress value={40} />);
    expect(screen.queryByText("40%")).not.toBeInTheDocument();
  });

  it("AC-10: circular label is exposed to assistive tech (sr-only) and names the bar", () => {
    render(<Progress value={40} variant="circular" label="Upload em andamento" />);
    expect(
      screen.getByRole("progressbar", { name: "Upload em andamento" }),
    ).toBeInTheDocument();
  });

  it("AC-10: passes through arbitrary HTML attributes (data-*)", () => {
    render(<Progress value={40} data-testid="pg" label="x" />);
    expect(screen.getByTestId("pg")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// A11y (jest-axe) — light + dark (AC-11)
// ──────────────────────────────────────────────────────────────────

describe("Progress — a11y (jest-axe, light + dark)", () => {
  it("AC-11: linear determinate with label has no violations in light + dark", async () => {
    const { container } = render(
      <Progress value={60} label="Conciliando lançamentos" showValue />,
    );
    await axeInThemes(container);
  });

  it("AC-11: circular determinate has no violations in light + dark", async () => {
    const { container } = render(
      <Progress value={45} variant="circular" label="Upload" showValue />,
    );
    await axeInThemes(container);
  });

  it("AC-11: progressbar without a label still has an accessible name (aria-progressbar-name)", async () => {
    // A bare progressbar (no `label`) MUST still expose an accessible name,
    // else axe `aria-progressbar-name` fails — as the Circular/DarkTheme
    // stories do in browser-axe. The component supplies a safe default.
    const { container } = render(<Progress value={45} variant="circular" showValue />);
    expect(screen.getByRole("progressbar")).toHaveAccessibleName();
    await axeInThemes(container);
  });

  it("AC-11: indeterminate (linear) has no violations in light + dark", async () => {
    const { container } = render(<Progress indeterminate label="Aguardando" />);
    await axeInThemes(container);
  });

  it("AC-11: every tone has no violations in light + dark", async () => {
    const { container } = render(
      <div>
        <Progress value={60} tone="violet" label="Violet" />
        <Progress value={60} tone="green" label="Green" />
        <Progress value={60} tone="amber" label="Amber" />
        <Progress value={60} tone="red" label="Red" />
      </div>,
    );
    await axeInThemes(container);
  });
});
