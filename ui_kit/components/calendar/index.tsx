"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Calendar — calendário grande para visualização de eventos em painéis.
 *
 * Diferente do `DatePicker` (compacto, seletor de input em popover — ver
 * ADR-004), o Calendar é a superfície de **agenda**: fechamento mensal,
 * prazos fiscais, agenda da equipe. Três visões (`month` · `week` · `agenda`),
 * eventos tipados por tom semântico, suporte a multi-dia e all-day, legenda e
 * truncamento automático de dias lotados com "+N mais".
 *
 * Para selecionar uma data em um campo de formulário, use `DatePicker`.
 *
 * A API espelha `ux_references/ui_kits/components/Calendar/` (referência
 * legacy), trocando o CSS prefixado `.grd-cal-*` (que usava vars cruas
 * `--violet-500`, `--signal-*`, `--orange-500`) por tokens semânticos
 * Tailwind v4 — zero cor hardcoded. O mapa tom → token está documentado em
 * `docs/adr/ADR-022-calendar-v0.1.0-dod-migration.md`.
 *
 * Public surface: `Calendar` (named export) + tipos `CalendarEvent`,
 * `CalendarView`, `CalendarTone`, `CalendarLegendItem`, `CalendarProps`.
 * `calendarEventVariants` é exportado como acessor CVA para consumidores que
 * precisem reproduzir a pílula fora do grid.
 */

// ──────────────────────────────────────────────────────────────────
// Types — view + event model
// ──────────────────────────────────────────────────────────────────

export type CalendarView = "month" | "week" | "agenda";

export type CalendarTone =
  | "violet"
  | "orange"
  | "blue"
  | "green"
  | "red"
  | "yellow"
  | "neutral";

/**
 * Component shape for an event icon. Accepts any `lucide-react`-shaped
 * component. Color is never the only signal — the time/title text always
 * carries the meaning, the icon only reinforces it.
 */
export type CalendarIconComponent = React.ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface CalendarEvent {
  /** Stable id used as React key. */
  id: string;
  /** Start date — `Date` or `"YYYY-MM-DD"`. */
  date: Date | string;
  /** End date for multi-day events — `Date` or `"YYYY-MM-DD"`. */
  endDate?: Date | string;
  /** Event label. */
  title: React.ReactNode;
  /** Semantic tone of the pill. Default `"neutral"`. */
  tone?: CalendarTone;
  /** Icon shown before the title. */
  icon?: CalendarIconComponent;
  /** Event time, e.g. `"14:00"`. */
  time?: string;
  /** All-day event — filled pill without a time. */
  allDay?: boolean;
  /** Free-form passthrough metadata. */
  meta?: unknown;
}

export interface CalendarLegendItem {
  label: React.ReactNode;
  tone: CalendarTone;
}

// ──────────────────────────────────────────────────────────────────
// Tone → semantic-token map (lex-brand-colors: zero hardcoded color)
// ──────────────────────────────────────────────────────────────────

/**
 * Per-tone class fragments resolved exclusively from semantic / brand-scale
 * design tokens. `chip` is the in-cell pill (soft fill + colored left border);
 * `solid` is the all-day filled pill; `border` is the left rail for the agenda
 * row; `dot` is the legend swatch.
 *
 * `orange` and `yellow` consume the brand colour scales (`guardia-orange-*`,
 * `guardia-yellow-*`) and the signal/semantic families so the seven legacy
 * tones stay visually distinct. Every text-over-fill pairing clears WCAG AA
 * (≥ 4.5:1): the soft `chip` text uses the `*-fg` high-contrast tokens; the
 * `solid` (all-day) text follows the Badge-canonical foreground overrides
 * (`text-white` fails AA over orange/green/red/yellow — see Badge `solid`
 * compoundVariants + ADR-003). Contrast figures recorded in ADR-022.
 */
const TONE_MAP: Record<
  CalendarTone,
  { chip: string; solid: string; border: string; dot: string }
> = {
  violet: {
    chip: "bg-guardia-purple-100 text-guardia-purple-700",
    solid: "bg-guardia-purple-500 text-white",
    border: "border-l-primary",
    dot: "bg-primary",
  },
  orange: {
    chip: "bg-guardia-orange-100 text-guardia-orange-900",
    solid: "bg-guardia-orange-500 text-guardia-gray-900",
    border: "border-l-guardia-orange-500",
    dot: "bg-guardia-orange-500",
  },
  blue: {
    chip: "bg-info-soft text-info-fg",
    solid: "bg-signal-blue text-white",
    border: "border-l-info",
    dot: "bg-info",
  },
  green: {
    chip: "bg-success-soft text-success-fg",
    solid: "bg-signal-green text-guardia-gray-900",
    border: "border-l-success",
    dot: "bg-success",
  },
  red: {
    chip: "bg-danger-soft text-danger-fg",
    solid: "bg-signal-red text-guardia-gray-900",
    border: "border-l-danger",
    dot: "bg-danger",
  },
  yellow: {
    chip: "bg-warning-soft text-warning-fg",
    solid: "bg-signal-yellow text-guardia-purple-900",
    border: "border-l-warning",
    dot: "bg-warning",
  },
  neutral: {
    chip: "bg-muted text-fg",
    solid: "bg-guardia-gray-500 text-white",
    border: "border-l-border-strong",
    dot: "bg-fg-muted",
  },
};

// ──────────────────────────────────────────────────────────────────
// CVA — event pill kinds (chip in month cell, block in week column)
// ──────────────────────────────────────────────────────────────────

const calendarEventVariants = cva(
  [
    "inline-flex w-full min-w-0 items-center gap-1.5 text-left",
    "font-sans font-semibold leading-tight border-0",
    "cursor-pointer rounded-[3px]",
    "transition-[filter] duration-150 hover:brightness-[0.97]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
  ].join(" "),
  {
    variants: {
      kind: {
        chip: "border-l-[3px] px-1.5 py-[3px] text-[11.5px]",
        block:
          "items-start flex-wrap gap-x-1.5 gap-y-1 border-l-[3px] rounded px-2 py-1.5 text-xs",
        allday: "px-2 py-[3px] text-[11.5px]",
      },
    },
    defaultVariants: { kind: "chip" },
  },
);

// ──────────────────────────────────────────────────────────────────
// Date helpers (pure, deterministic — clock injected via `today`)
// ──────────────────────────────────────────────────────────────────

const CAL_MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const CAL_WDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function toDate(v: Date | string): Date {
  if (v instanceof Date) return v;
  const [y, m, d] = v.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(d: Date, weekStart: 0 | 1): Date {
  const day = d.getDay();
  const diff = (day - weekStart + 7) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
}

function getISOWeek(d: Date): number {
  const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  return Math.ceil(((+tmp - +yearStart) / 86400000 + 1) / 7);
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function weekTitle(d: Date, ws: 0 | 1): string {
  const start = startOfWeek(d, ws);
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const fmt = (x: Date) => `${x.getDate()} ${CAL_MONTHS[x.getMonth()].slice(0, 3).toLowerCase()}`;
  if (sameMonth) {
    return `${start.getDate()}–${end.getDate()} ${CAL_MONTHS[start.getMonth()]} ${start.getFullYear()}`;
  }
  return `${fmt(start)} – ${fmt(end)} ${start.getFullYear()}`;
}

function isWeekend(d: Date): boolean {
  return d.getDay() === 0 || d.getDay() === 6;
}

// ──────────────────────────────────────────────────────────────────
// CalendarProps
// ──────────────────────────────────────────────────────────────────

export interface CalendarProps {
  /** Controlled view. Pair with `onViewChange`. Default (uncontrolled) `"month"`. */
  view?: CalendarView;
  /** Initial view when uncontrolled. Default `"month"`. */
  defaultView?: CalendarView;
  /** Fired when the user switches view via the toolbar switcher. */
  onViewChange?: (view: CalendarView) => void;
  /** Displayed month/week (controlled). */
  date?: Date;
  /** Displayed month/week (uncontrolled initial value). Default: today. */
  defaultDate?: Date;
  /** Fired when navigating (prev / next / today). */
  onDateChange?: (date: Date) => void;
  /** Events to render; multi-day via `endDate`. */
  events?: CalendarEvent[];
  /** Click on an event pill. */
  onEventClick?: (event: CalendarEvent) => void;
  /** Click on a day cell. */
  onDayClick?: (date: Date) => void;
  /** Highlights a cell as selected. */
  selectedDate?: Date | null;
  /** Events shown before condensing into "+N mais". Default `3`. */
  maxEventsPerDay?: number;
  /** First column: 0 (Sunday, default) or 1 (Monday). */
  weekStartsOn?: 0 | 1;
  /** Extra column with the ISO week number (month view). */
  showWeekNumbers?: boolean;
  /** Toolbar with "Hoje", navigation, title and view switcher. Default `true`. */
  toolbar?: boolean;
  /** Overrides the "Month Year" toolbar title. */
  title?: string;
  /** Tone legend below the grid. */
  legend?: CalendarLegendItem[];
  /**
   * Today's date — injected for deterministic rendering in tests/previews.
   * Defaults to `new Date()`.
   */
  today?: Date;
  /** Accessible label for the calendar region. Default `"Calendário"`. */
  "aria-label"?: string;
  className?: string;
}

// ──────────────────────────────────────────────────────────────────
// Calendar — main component
// ──────────────────────────────────────────────────────────────────

function Calendar({
  view: viewProp,
  defaultView = "month",
  onViewChange,
  date,
  defaultDate,
  onDateChange,
  events = [],
  onEventClick,
  onDayClick,
  selectedDate,
  maxEventsPerDay = 3,
  weekStartsOn = 0,
  showWeekNumbers = false,
  toolbar = true,
  title,
  legend,
  today: todayProp,
  "aria-label": ariaLabel = "Calendário",
  className,
}: CalendarProps) {
  const [internalDate, setInternalDate] = React.useState<Date>(
    defaultDate ?? new Date(),
  );
  const current = date !== undefined ? date : internalDate;

  const [internalView, setInternalView] =
    React.useState<CalendarView>(defaultView);
  const view = viewProp !== undefined ? viewProp : internalView;

  const today = todayProp ?? new Date();

  function setDate(next: Date) {
    if (date === undefined) setInternalDate(next);
    onDateChange?.(next);
  }

  function setView(next: CalendarView) {
    if (viewProp === undefined) setInternalView(next);
    onViewChange?.(next);
  }

  function goPrev() {
    if (view === "week") {
      setDate(new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7));
    } else {
      setDate(new Date(current.getFullYear(), current.getMonth() - 1, 1));
    }
  }
  function goNext() {
    if (view === "week") {
      setDate(new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7));
    } else {
      setDate(new Date(current.getFullYear(), current.getMonth() + 1, 1));
    }
  }
  function goToday() {
    setDate(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  }

  const wdaysOrdered =
    weekStartsOn === 1
      ? [...CAL_WDAYS_SHORT.slice(1), CAL_WDAYS_SHORT[0]]
      : CAL_WDAYS_SHORT;

  // Index events by day key — multi-day events fan out across their span.
  const eventsByDay = React.useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      const start = toDate(ev.date);
      const end = ev.endDate ? toDate(ev.endDate) : start;
      const cursor = new Date(start);
      while (cursor <= end) {
        const key = dayKey(cursor);
        (map[key] ||= []).push(ev);
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    for (const k in map) {
      map[k].sort((a, b) => {
        if (!!a.allDay !== !!b.allDay) return a.allDay ? -1 : 1;
        return (a.time || "").localeCompare(b.time || "");
      });
    }
    return map;
  }, [events]);

  const titleText =
    title ??
    (view === "week"
      ? weekTitle(current, weekStartsOn)
      : `${CAL_MONTHS[current.getMonth()]} ${current.getFullYear()}`);

  return (
    <section
      aria-label={ariaLabel}
      className={cn(
        "flex flex-col overflow-hidden font-sans text-fg",
        "rounded-lg border border-border bg-card",
        className,
      )}
    >
      {toolbar && (
        <div className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={goToday}
              className={cn(
                "h-8 rounded-md border border-border-strong bg-card px-3 text-[13px] font-semibold text-fg",
                "transition-colors duration-150 hover:bg-muted",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              )}
            >
              Hoje
            </button>
            <div className="inline-flex h-8 overflow-hidden rounded-md border border-border-strong">
              <button
                type="button"
                onClick={goPrev}
                aria-label={view === "week" ? "Semana anterior" : "Mês anterior"}
                className={cn(
                  "flex h-full w-8 items-center justify-center bg-card text-fg",
                  "transition-colors duration-150 hover:bg-muted",
                  "focus-visible:outline-none focus-visible:bg-primary/10 focus-visible:text-primary",
                )}
              >
                <ChevronLeft aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={view === "week" ? "Próxima semana" : "Próximo mês"}
                className={cn(
                  "flex h-full w-8 items-center justify-center border-l border-border-strong bg-card text-fg",
                  "transition-colors duration-150 hover:bg-muted",
                  "focus-visible:outline-none focus-visible:bg-primary/10 focus-visible:text-primary",
                )}
              >
                <ChevronRight aria-hidden="true" className="size-4" />
              </button>
            </div>
            <h2 className="m-0 truncate text-lg font-bold tracking-tight text-fg">
              {titleText}
            </h2>
          </div>
          <ViewSwitcher value={view} onChange={setView} />
        </div>
      )}

      {view === "month" && (
        <MonthGrid
          viewDate={current}
          today={today}
          eventsByDay={eventsByDay}
          weekStartsOn={weekStartsOn}
          wdaysOrdered={wdaysOrdered}
          showWeekNumbers={showWeekNumbers}
          maxEventsPerDay={maxEventsPerDay}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          selectedDate={selectedDate}
        />
      )}

      {view === "week" && (
        <WeekStrip
          viewDate={current}
          today={today}
          eventsByDay={eventsByDay}
          weekStartsOn={weekStartsOn}
          wdaysOrdered={wdaysOrdered}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          selectedDate={selectedDate}
        />
      )}

      {view === "agenda" && (
        <Agenda
          viewDate={current}
          today={today}
          events={events}
          onEventClick={onEventClick}
        />
      )}

      {legend && legend.length > 0 && (
        <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-3.5 border-t border-border bg-muted px-4 py-3">
          {legend.map((l, i) => (
            <li
              key={i}
              className="inline-flex items-center gap-2 text-[12.5px] text-fg"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "inline-block size-2.5 rounded-[3px]",
                  TONE_MAP[l.tone ?? "neutral"].dot,
                )}
              />
              {l.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
Calendar.displayName = "Calendar";

// ──────────────────────────────────────────────────────────────────
// View switcher — controls `view`
// ──────────────────────────────────────────────────────────────────

const VIEW_LABELS: Array<{ id: CalendarView; label: string }> = [
  { id: "month", label: "Mês" },
  { id: "week", label: "Semana" },
  { id: "agenda", label: "Agenda" },
];

function ViewSwitcher({
  value,
  onChange,
}: {
  value: CalendarView;
  onChange: (view: CalendarView) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Visualização do calendário"
      className="inline-flex gap-0.5 rounded-md bg-muted p-[3px]"
    >
      {VIEW_LABELS.map((v) => {
        const active = value === v.id;
        return (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(v.id)}
            className={cn(
              "rounded-[calc(var(--radius-md)-3px)] px-3 py-[5px] text-[12.5px] font-semibold",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              active
                ? "bg-card text-fg shadow-sm"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Event pill — shared chip / block / allday renderer
// ──────────────────────────────────────────────────────────────────

function EventPill({
  event,
  kind,
  onClick,
}: {
  event: CalendarEvent;
  kind: "chip" | "block";
  onClick?: (event: CalendarEvent) => void;
}) {
  const tone = event.tone ?? "neutral";
  const Icon = event.icon;
  const isAllDay = Boolean(event.allDay);
  // In a month cell, all-day events render as a solid filled chip (no rail);
  // in a week column they keep the block layout with the colored rail.
  const resolvedKind: "chip" | "block" | "allday" =
    kind === "chip" && isAllDay ? "allday" : kind;
  const toneClass = isAllDay
    ? TONE_MAP[tone].solid
    : cn(TONE_MAP[tone].chip, TONE_MAP[tone].border);
  const titleStr = typeof event.title === "string" ? event.title : undefined;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      title={titleStr}
      className={cn(calendarEventVariants({ kind: resolvedKind }), toneClass)}
    >
      {Icon && (
        <span className="inline-flex shrink-0 opacity-90">
          <Icon aria-hidden="true" className="size-3" />
        </span>
      )}
      {(event.time || isAllDay) && (
        <span className="shrink-0 opacity-90 [font-feature-settings:'tnum']">
          {isAllDay ? "Dia inteiro" : event.time}
        </span>
      )}
      <span
        className={cn(
          "min-w-0 flex-1 overflow-hidden",
          kind === "block"
            ? "[overflow-wrap:anywhere] whitespace-normal"
            : "truncate whitespace-nowrap",
        )}
      >
        {event.title}
      </span>
    </button>
  );
}

// ──────────────────────────────────────────────────────────────────
// Shared view-body prop shape
// ──────────────────────────────────────────────────────────────────

interface ViewBodyProps {
  viewDate: Date;
  today: Date;
  eventsByDay: Record<string, CalendarEvent[]>;
  weekStartsOn: 0 | 1;
  wdaysOrdered: string[];
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  selectedDate?: Date | null;
}

// ──────────────────────────────────────────────────────────────────
// Month grid
// ──────────────────────────────────────────────────────────────────

function MonthGrid({
  viewDate,
  today,
  eventsByDay,
  weekStartsOn,
  wdaysOrdered,
  showWeekNumbers,
  maxEventsPerDay,
  onDayClick,
  onEventClick,
  selectedDate,
}: ViewBodyProps & { showWeekNumbers: boolean; maxEventsPerDay: number }) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay.getDay() - weekStartsOn + 7) % 7;

  const cells: Array<{ date: Date; inMonth: boolean }> = [];
  for (let i = offset - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month, -i), inMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), inMonth: true });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date;
    cells.push({
      date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1),
      inMonth: false,
    });
  }

  const rows: Array<typeof cells> = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const colTemplate = showWeekNumbers
    ? "42px repeat(7, minmax(0, 1fr))"
    : "repeat(7, minmax(0, 1fr))";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="grid gap-px border-b border-border bg-border"
        style={{ gridTemplateColumns: colTemplate }}
      >
        {showWeekNumbers && <div aria-hidden="true" className="bg-muted" />}
        {wdaysOrdered.map((w, i) => (
          <div
            key={`h${i}`}
            className="bg-card px-3 pt-2.5 pb-2 text-[11px] font-bold uppercase tracking-wider text-fg-muted"
          >
            {w}
          </div>
        ))}
      </div>

      <div
        className="grid min-h-0 flex-1 gap-px bg-border [grid-auto-rows:minmax(112px,1fr)]"
        style={{ gridTemplateColumns: colTemplate }}
      >
        {rows.map((row, ri) => (
          <React.Fragment key={`r${ri}`}>
            {showWeekNumbers && (
              <div className="flex items-start justify-center bg-muted pt-2.5 text-[11px] font-semibold text-fg-muted [font-feature-settings:'tnum']">
                {getISOWeek(row[0].date)}
              </div>
            )}
            {row.map((c, ci) => {
              const key = dayKey(c.date);
              const dayEvents = eventsByDay[key] || [];
              const isToday = sameDay(c.date, today);
              const isSel = selectedDate ? sameDay(c.date, selectedDate) : false;
              const visible = dayEvents.slice(0, maxEventsPerDay);
              const hidden = dayEvents.length - visible.length;
              const clickable = Boolean(onDayClick);

              // The day cell is NOT itself a control: it holds event-pill
              // buttons, and a control containing focusable controls is a
              // nested-interactive a11y violation. Instead, the day NUMBER is
              // the day-click affordance (a real <button> when onDayClick is
              // set), keeping the pills as siblings.
              const dayLabel = `${c.date.getDate()} de ${CAL_MONTHS[c.date.getMonth()]}${
                isToday ? " (hoje)" : ""
              }${isSel ? ", selecionado" : ""}`;
              const numberBadge = (
                <span
                  className={cn(
                    "inline-flex items-center justify-center text-[13px] font-semibold leading-none [font-feature-settings:'tnum']",
                    isToday
                      ? "size-[22px] rounded-full bg-primary text-[12.5px] font-bold text-primary-foreground"
                      : c.inMonth
                        ? "text-fg"
                        : "text-fg-subtle",
                  )}
                >
                  {c.date.getDate()}
                </span>
              );

              return (
                <div
                  key={`c${ri}${ci}`}
                  aria-current={isToday ? "date" : undefined}
                  className={cn(
                    "relative flex min-h-0 min-w-0 flex-col gap-1 bg-card px-2 pt-1.5 pb-2",
                    "transition-colors duration-150",
                    !c.inMonth && "bg-muted",
                    isSel && "bg-primary/10 ring-2 ring-inset ring-primary",
                  )}
                >
                  <div className="flex min-h-[22px] items-center">
                    {clickable ? (
                      <button
                        type="button"
                        aria-label={dayLabel}
                        aria-pressed={isSel}
                        onClick={() => onDayClick?.(c.date)}
                        className={cn(
                          "inline-flex items-center justify-center rounded-md",
                          "transition-colors duration-150 hover:bg-muted",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                          isToday ? "p-0" : "px-1",
                        )}
                      >
                        {numberBadge}
                      </button>
                    ) : (
                      numberBadge
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 overflow-hidden">
                    {visible.map((ev, ei) => (
                      <EventPill
                        key={ev.id + ei}
                        event={ev}
                        kind="chip"
                        onClick={onEventClick}
                      />
                    ))}
                    {hidden > 0 && (
                      <button
                        type="button"
                        onClick={() => onDayClick?.(c.date)}
                        className={cn(
                          "rounded-[3px] px-1.5 py-0.5 text-left text-[11px] font-semibold text-fg-muted",
                          "transition-colors duration-150 hover:bg-muted hover:text-fg",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        )}
                      >
                        +{hidden} mais
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Week strip
// ──────────────────────────────────────────────────────────────────

function WeekStrip({
  viewDate,
  today,
  eventsByDay,
  weekStartsOn,
  wdaysOrdered,
  onDayClick,
  onEventClick,
  selectedDate,
}: ViewBodyProps) {
  const start = startOfWeek(viewDate, weekStartsOn);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid grid-cols-7 gap-px border-b border-border bg-border">
        {days.map((d, i) => {
          const isToday = sameDay(d, today);
          const clickable = Boolean(onDayClick);
          const numberBadge = (
            <span
              className={cn(
                "text-[22px] font-bold leading-none tracking-tight text-fg [font-feature-settings:'tnum']",
                isToday &&
                  "inline-flex size-8 items-center justify-center rounded-full bg-primary text-base text-primary-foreground",
              )}
            >
              {d.getDate()}
            </span>
          );
          return (
            <div
              key={i}
              aria-current={isToday ? "date" : undefined}
              className={cn(
                "flex flex-col items-start gap-1.5 bg-card px-3 pt-3.5 pb-3",
                isWeekend(d) && "bg-muted",
              )}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-fg-muted">
                {wdaysOrdered[i]}
              </span>
              {clickable ? (
                <button
                  type="button"
                  aria-label={`${d.getDate()} de ${CAL_MONTHS[d.getMonth()]}${
                    isToday ? " (hoje)" : ""
                  }`}
                  onClick={() => onDayClick?.(d)}
                  className={cn(
                    "rounded-md transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    !isToday && "px-0.5 hover:bg-muted",
                  )}
                >
                  {numberBadge}
                </button>
              ) : (
                numberBadge
              )}
            </div>
          );
        })}
      </div>
      <div className="grid min-h-[280px] flex-1 grid-cols-7 gap-px bg-border">
        {days.map((d, i) => {
          const key = dayKey(d);
          const dayEvents = eventsByDay[key] || [];
          const isSel = selectedDate ? sameDay(d, selectedDate) : false;
          return (
            <div
              key={i}
              className={cn(
                "flex min-h-0 flex-col gap-1.5 overflow-hidden bg-card px-2.5 pt-2.5 pb-3",
                isWeekend(d) && "bg-muted",
                isSel && "ring-2 ring-inset ring-primary",
              )}
            >
              {dayEvents.length === 0 && (
                <div className="py-1 text-xs text-fg-subtle">—</div>
              )}
              {dayEvents.map((ev, ei) => (
                <EventPill
                  key={ev.id + ei}
                  event={ev}
                  kind="block"
                  onClick={onEventClick}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Agenda
// ──────────────────────────────────────────────────────────────────

function Agenda({
  viewDate,
  today,
  events,
  onEventClick,
}: {
  viewDate: Date;
  today: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthEvents = events
    .map((ev) => ({ ev, d: toDate(ev.date) }))
    .filter(({ d }) => d.getFullYear() === year && d.getMonth() === month)
    .sort(
      (a, b) => +a.d - +b.d || (a.ev.time || "").localeCompare(b.ev.time || ""),
    );

  const byDay: Record<string, { d: Date; events: CalendarEvent[] }> = {};
  for (const { ev, d } of monthEvents) {
    const k = dayKey(d);
    (byDay[k] ||= { d, events: [] }).events.push(ev);
  }
  const days = Object.values(byDay);

  if (days.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-fg-muted">
        Nenhum evento neste mês.
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-auto py-1.5">
      {days.map(({ d, events: dayEvents }, i) => {
        const isToday = sameDay(d, today);
        return (
          <div
            key={i}
            className="grid grid-cols-[88px_1fr] gap-4 border-b border-muted px-5 py-3.5 last:border-b-0"
          >
            <div className="flex flex-col items-start gap-0.5 pt-0.5">
              <span
                className={cn(
                  "text-[26px] font-bold leading-none tracking-tight [font-feature-settings:'tnum']",
                  isToday ? "text-primary" : "text-fg",
                )}
              >
                {d.getDate()}
              </span>
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-wider",
                  isToday ? "text-primary" : "text-fg-muted",
                )}
              >
                {CAL_WDAYS_SHORT[d.getDay()]}
              </span>
            </div>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {dayEvents.map((ev, ei) => {
                const tone = ev.tone ?? "neutral";
                const Icon = ev.icon;
                return (
                  <li key={ev.id + ei}>
                    <button
                      type="button"
                      onClick={() => onEventClick?.(ev)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md border border-border bg-card px-3.5 py-2.5 text-left",
                        "border-l-[3px] font-sans text-[13px] font-semibold text-fg",
                        "transition-colors duration-150 hover:bg-muted",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        TONE_MAP[tone].border,
                      )}
                    >
                      {Icon && (
                        <span className="inline-flex shrink-0 text-fg-muted">
                          <Icon aria-hidden="true" className="size-3.5" />
                        </span>
                      )}
                      <span className="w-[72px] shrink-0 text-[12.5px] font-semibold text-fg-muted [font-feature-settings:'tnum']">
                        {ev.allDay ? "Dia inteiro" : ev.time || "—"}
                      </span>
                      <span className="min-w-0 flex-1 font-semibold text-fg">
                        {ev.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { Calendar, calendarEventVariants };
export type { VariantProps };
