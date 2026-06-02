import * as React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertTriangle } from "lucide-react";

import { axeInThemes } from "@/test-utils/a11y";
import {
  Calendar,
  calendarEventVariants,
  type CalendarEvent,
} from "./index";

/**
 * Tests for Plan #93 (parent Issue #92) — Calendar v0.1.0 DoD.
 *
 * Calendar is the events/agenda surface (month/week/agenda) mirroring the
 * legacy reference; date selection stays in DatePicker (ADR-004 / ADR-022).
 *
 * Each `it(...)` carries `AC-N:` so `lex-issue-driven` Rule 3 (bidirectional
 * AC ↔ test traceability) passes at Gate 2. ACs come from
 * `docs/issues/issue-92/02-requirements.md`. Behavioral, user-POV, accessible
 * queries; no mocking of internal collaborators. The clock is injected via the
 * `today` prop for determinism (teste de unidade).
 */

// ──────────────────────────────────────────────────────────────────
// Fixtures — a stable reference month (Novembro 2025) + a fixed "today"
// ──────────────────────────────────────────────────────────────────

const REF = new Date(2025, 10, 1); // Novembro 2025
const TODAY = new Date(2025, 10, 14); // 14 Nov 2025 — inside the ref month

const EVENTS: CalendarEvent[] = [
  { id: "e1", date: "2025-11-07", time: "23:59", title: "DCTFWeb Outubro", tone: "red", icon: AlertTriangle },
  { id: "e2", date: "2025-11-10", time: "09:00", title: "Revisão Porto Brasil", tone: "violet" },
  { id: "e3", date: "2025-11-14", time: "14:00", title: "Call Tech Ltda", tone: "blue" },
  { id: "e4", date: "2025-11-14", time: "10:30", title: "Conferência folha", tone: "yellow" },
  { id: "e5", date: "2025-11-14", time: "16:00", title: "Review Rafa Costa", tone: "neutral" },
  { id: "e6", date: "2025-11-14", time: "18:00", title: "Quarto evento lotado", tone: "orange" },
  { id: "e7", date: "2025-11-21", allDay: true, title: "Offsite São Paulo", tone: "violet" },
];

const LEGEND = [
  { label: "Prazo crítico", tone: "red" as const },
  { label: "Reunião cliente", tone: "violet" as const },
];

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

afterEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

// ──────────────────────────────────────────────────────────────────
// Public surface (AC-1)
// ──────────────────────────────────────────────────────────────────

describe("Calendar — public surface", () => {
  it("AC-1: exports Calendar component + calendarEventVariants CVA accessor", () => {
    expect(Calendar).toBeDefined();
    expect(calendarEventVariants).toBeDefined();
    expect(typeof calendarEventVariants).toBe("function");
  });

  it("AC-1: calendarEventVariants is callable and defaults to the chip kind", () => {
    const cls = calendarEventVariants({});
    expect(cls).toContain("border-l-[3px]");
    expect(cls).toContain("cursor-pointer");
  });

  it("AC-1: Calendar.displayName === 'Calendar'", () => {
    expect(Calendar.displayName).toBe("Calendar");
  });

  it("AC-1: renders a labeled region (default aria-label 'Calendário')", () => {
    render(<Calendar date={REF} today={TODAY} events={EVENTS} />);
    expect(
      screen.getByRole("region", { name: "Calendário" }),
    ).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Toolbar — title, today, navigation (AC-4)
// ──────────────────────────────────────────────────────────────────

describe("Calendar — toolbar", () => {
  it("AC-4: month view shows the 'Month Year' title", () => {
    render(<Calendar date={REF} today={TODAY} />);
    expect(
      screen.getByRole("heading", { name: "Novembro 2025" }),
    ).toBeInTheDocument();
  });

  it("AC-4: a custom `title` overrides the month/year title", () => {
    render(<Calendar date={REF} today={TODAY} title="Agenda de Novembro" />);
    expect(
      screen.getByRole("heading", { name: "Agenda de Novembro" }),
    ).toBeInTheDocument();
  });

  it("AC-4: toolbar buttons are labeled (Hoje, Mês anterior, Próximo mês)", () => {
    render(<Calendar date={REF} today={TODAY} />);
    expect(screen.getByRole("button", { name: "Hoje" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Mês anterior" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Próximo mês" }),
    ).toBeInTheDocument();
  });

  it("AC-4: 'Próximo mês' fires onDateChange advancing one month", async () => {
    const onDateChange = vi.fn();
    const user = userEvent.setup();
    render(<Calendar date={REF} today={TODAY} onDateChange={onDateChange} />);

    await user.click(screen.getByRole("button", { name: "Próximo mês" }));
    expect(onDateChange).toHaveBeenCalledTimes(1);
    const next = onDateChange.mock.calls[0][0] as Date;
    expect(next.getMonth()).toBe(11); // Dezembro
    expect(next.getFullYear()).toBe(2025);
  });

  it("AC-4: 'Mês anterior' fires onDateChange going back one month", async () => {
    const onDateChange = vi.fn();
    const user = userEvent.setup();
    render(<Calendar date={REF} today={TODAY} onDateChange={onDateChange} />);

    await user.click(screen.getByRole("button", { name: "Mês anterior" }));
    const prev = onDateChange.mock.calls[0][0] as Date;
    expect(prev.getMonth()).toBe(9); // Outubro
  });

  it("AC-4: uncontrolled navigation updates the visible title", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultDate={REF} today={TODAY} />);
    expect(
      screen.getByRole("heading", { name: "Novembro 2025" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próximo mês" }));
    expect(
      screen.getByRole("heading", { name: "Dezembro 2025" }),
    ).toBeInTheDocument();
  });

  it("AC-4: 'Hoje' navigates to the injected today's month", async () => {
    const onDateChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Calendar
        date={new Date(2025, 0, 1)}
        today={TODAY}
        onDateChange={onDateChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Hoje" }));
    const d = onDateChange.mock.calls[0][0] as Date;
    expect(d.getMonth()).toBe(10); // Novembro (TODAY's month)
  });

  it("AC-4: toolbar={false} hides the toolbar (no title heading)", () => {
    render(<Calendar date={REF} today={TODAY} toolbar={false} />);
    expect(
      screen.queryByRole("heading", { name: "Novembro 2025" }),
    ).not.toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// View switching (AC-4)
// ──────────────────────────────────────────────────────────────────

describe("Calendar — view switching", () => {
  it("AC-4: the view switcher renders three tabs (Mês, Semana, Agenda)", () => {
    render(<Calendar date={REF} today={TODAY} />);
    const tablist = screen.getByRole("tablist", {
      name: "Visualização do calendário",
    });
    const tabs = within(tablist).getAllByRole("tab");
    expect(tabs.map((t) => t.textContent)).toEqual(["Mês", "Semana", "Agenda"]);
  });

  it("AC-4: month is the selected tab by default", () => {
    render(<Calendar date={REF} today={TODAY} />);
    expect(screen.getByRole("tab", { name: "Mês" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("AC-4: clicking 'Agenda' switches the view (uncontrolled)", async () => {
    const user = userEvent.setup();
    render(<Calendar date={REF} today={TODAY} events={EVENTS} />);

    await user.click(screen.getByRole("tab", { name: "Agenda" }));
    expect(screen.getByRole("tab", { name: "Agenda" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // Agenda lists the events of the month, e.g. the all-day Offsite.
    expect(
      screen.getByRole("button", { name: /Offsite São Paulo/ }),
    ).toBeInTheDocument();
  });

  it("AC-4: onViewChange fires with the chosen view", async () => {
    const onViewChange = vi.fn();
    const user = userEvent.setup();
    render(<Calendar date={REF} today={TODAY} onViewChange={onViewChange} />);
    await user.click(screen.getByRole("tab", { name: "Semana" }));
    expect(onViewChange).toHaveBeenCalledWith("week");
  });

  it("AC-4: controlled `view=week` switches navigation cadence to weeks", async () => {
    const onDateChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Calendar
        view="week"
        date={new Date(2025, 10, 12)}
        today={TODAY}
        onDateChange={onDateChange}
      />,
    );
    // In week view the prev/next labels change to weeks.
    await user.click(screen.getByRole("button", { name: "Próxima semana" }));
    const next = onDateChange.mock.calls[0][0] as Date;
    // +7 days from 12 Nov → 19 Nov
    expect(next.getDate()).toBe(19);
  });
});

// ──────────────────────────────────────────────────────────────────
// Month view — events, today, "+N mais", selection (AC-4)
// ──────────────────────────────────────────────────────────────────

describe("Calendar — month view", () => {
  it("AC-4: renders the weekday header (Sunday-first by default)", () => {
    render(<Calendar date={REF} today={TODAY} />);
    expect(screen.getByText("Dom")).toBeInTheDocument();
    expect(screen.getByText("Sáb")).toBeInTheDocument();
  });

  it("AC-4: renders event pills as buttons with their title", () => {
    render(<Calendar date={REF} today={TODAY} events={EVENTS} />);
    expect(
      screen.getByRole("button", { name: /Revisão Porto Brasil/ }),
    ).toBeInTheDocument();
  });

  it("AC-4: clicking an event pill fires onEventClick with the event", async () => {
    const onEventClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Calendar
        date={REF}
        today={TODAY}
        events={EVENTS}
        onEventClick={onEventClick}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: /Revisão Porto Brasil/ }),
    );
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick.mock.calls[0][0].id).toBe("e2");
  });

  it("AC-4: condenses overflow into a '+N mais' button (maxEventsPerDay)", () => {
    // Day 14 has 4 timed events; with maxEventsPerDay=2 → "+2 mais".
    render(
      <Calendar date={REF} today={TODAY} events={EVENTS} maxEventsPerDay={2} />,
    );
    expect(screen.getByRole("button", { name: "+2 mais" })).toBeInTheDocument();
  });

  it("AC-4: clicking '+N mais' fires onDayClick for that day", async () => {
    const onDayClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Calendar
        date={REF}
        today={TODAY}
        events={EVENTS}
        maxEventsPerDay={2}
        onDayClick={onDayClick}
      />,
    );
    await user.click(screen.getByRole("button", { name: "+2 mais" }));
    expect(onDayClick).toHaveBeenCalledTimes(1);
    expect((onDayClick.mock.calls[0][0] as Date).getDate()).toBe(14);
  });

  it("AC-4: marks the injected today's cell with aria-current='date'", () => {
    const { container } = render(
      <Calendar date={REF} today={TODAY} onDayClick={() => {}} />,
    );
    const todayCell = container.querySelector('[aria-current="date"]');
    expect(todayCell).not.toBeNull();
    expect(todayCell!.textContent).toContain("14");
  });

  it("AC-4: day cells are keyboard-operable when onDayClick is set", async () => {
    const onDayClick = vi.fn();
    const user = userEvent.setup();
    render(<Calendar date={REF} today={TODAY} onDayClick={onDayClick} />);
    const cell = screen.getByRole("button", { name: /15 de Novembro/ });
    cell.focus();
    await user.keyboard("{Enter}");
    expect(onDayClick).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onDayClick).toHaveBeenCalledTimes(2);
  });

  it("AC-4: selectedDate cell announces ', selecionado' and aria-pressed", () => {
    render(
      <Calendar
        date={REF}
        today={TODAY}
        selectedDate={new Date(2025, 10, 17)}
        onDayClick={() => {}}
      />,
    );
    const cell = screen.getByRole("button", {
      name: /17 de Novembro, selecionado/,
    });
    expect(cell).toHaveAttribute("aria-pressed", "true");
  });

  it("AC-4: showWeekNumbers renders the ISO week number", () => {
    render(
      <Calendar date={REF} today={TODAY} weekStartsOn={1} showWeekNumbers />,
    );
    // First week of Nov 2025 (Mon-start) is ISO week 44.
    expect(screen.getByText("44")).toBeInTheDocument();
  });

  it("AC-4: weekStartsOn=1 puts Monday as the first weekday header", () => {
    render(<Calendar date={REF} today={TODAY} weekStartsOn={1} />);
    expect(screen.getByText("Seg")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Week view (AC-4)
// ──────────────────────────────────────────────────────────────────

describe("Calendar — week view", () => {
  it("AC-4: renders events of the visible week as block pills", () => {
    render(
      <Calendar
        view="week"
        date={new Date(2025, 10, 12)}
        today={TODAY}
        events={EVENTS}
      />,
    );
    // Week of 9–15 Nov includes the day-14 events.
    expect(
      screen.getByRole("button", { name: /Call Tech Ltda/ }),
    ).toBeInTheDocument();
  });

  it("AC-4: clicking a week event fires onEventClick", async () => {
    const onEventClick = vi.fn();
    const user = userEvent.setup();
    render(
      <Calendar
        view="week"
        date={new Date(2025, 10, 12)}
        today={TODAY}
        events={EVENTS}
        onEventClick={onEventClick}
      />,
    );
    await user.click(screen.getByRole("button", { name: /Call Tech Ltda/ }));
    expect(onEventClick.mock.calls[0][0].id).toBe("e3");
  });
});

// ──────────────────────────────────────────────────────────────────
// Agenda view (AC-4)
// ──────────────────────────────────────────────────────────────────

describe("Calendar — agenda view", () => {
  it("AC-4: lists month events chronologically as buttons", () => {
    render(<Calendar view="agenda" date={REF} today={TODAY} events={EVENTS} />);
    expect(
      screen.getByRole("button", { name: /DCTFWeb Outubro/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Offsite São Paulo/ }),
    ).toBeInTheDocument();
  });

  it("AC-4: all-day events render the 'Dia inteiro' marker (not only color)", () => {
    render(<Calendar view="agenda" date={REF} today={TODAY} events={EVENTS} />);
    expect(
      screen.getByRole("button", { name: /Dia inteiro.*Offsite São Paulo/ }),
    ).toBeInTheDocument();
  });

  it("AC-4: empty month shows the 'Nenhum evento neste mês.' message", () => {
    render(<Calendar view="agenda" date={REF} today={TODAY} events={[]} />);
    expect(screen.getByText("Nenhum evento neste mês.")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// Legend (AC-4)
// ──────────────────────────────────────────────────────────────────

describe("Calendar — legend", () => {
  it("AC-4: renders the tone legend labels", () => {
    render(<Calendar date={REF} today={TODAY} legend={LEGEND} />);
    expect(screen.getByText("Prazo crítico")).toBeInTheDocument();
    expect(screen.getByText("Reunião cliente")).toBeInTheDocument();
  });
});

// ──────────────────────────────────────────────────────────────────
// A11y (jest-axe) — light + dark (AC-5)
// ──────────────────────────────────────────────────────────────────

describe("Calendar — accessibility (light + dark)", () => {
  it("AC-5: month view (events + legend) has no a11y violations", async () => {
    const { container } = render(
      <Calendar
        date={REF}
        today={TODAY}
        events={EVENTS}
        legend={LEGEND}
        onDayClick={() => {}}
        onEventClick={() => {}}
      />,
    );
    await axeInThemes(container);
  });

  it("AC-5: month view with a selected day has no a11y violations", async () => {
    const { container } = render(
      <Calendar
        date={REF}
        today={TODAY}
        events={EVENTS}
        selectedDate={new Date(2025, 10, 17)}
        onDayClick={() => {}}
      />,
    );
    await axeInThemes(container);
  });

  it("AC-5: week view has no a11y violations", async () => {
    const { container } = render(
      <Calendar
        view="week"
        date={new Date(2025, 10, 12)}
        today={TODAY}
        events={EVENTS}
      />,
    );
    await axeInThemes(container);
  });

  it("AC-5: agenda view has no a11y violations", async () => {
    const { container } = render(
      <Calendar view="agenda" date={REF} today={TODAY} events={EVENTS} />,
    );
    await axeInThemes(container);
  });
});
