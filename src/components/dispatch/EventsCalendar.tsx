"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { EVENTS, type CalendarEvent } from "@/lib/data";
import { HOURS } from "@/lib/hours";
import { WEEKDAYS, addMonths, dayLabel, monthGrid, monthLabel } from "@/lib/calendar";

const noop = () => () => {};
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
/** how far ahead the calendar pages */
const MONTHS_AHEAD = 2;

const todayFormat = new Intl.DateTimeFormat("en-CA", { timeZone: HOURS.timezone, year: "numeric", month: "2-digit", day: "2-digit" });
/** today's date at the brewery, "YYYY-MM-DD" */
const readToday = () => todayFormat.format(new Date());

/**
 * The month at a glance, driven by /data/events.json. Hover, focus or tap an
 * event and its description pops up. Phones get dots on the grid and the same
 * events written out underneath.
 */
export function EventsCalendar() {
  // null while server rendering: the calendar opens on the month named in the data, then follows the real date
  const today = useSyncExternalStore(noop, readToday, () => null);
  const current = today && today.slice(0, 7) > EVENTS.month ? today.slice(0, 7) : EVENTS.month;
  const [ahead, setAhead] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const month = addMonths(current, ahead);
  const grid = monthGrid(month, EVENTS);
  const base = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const dated = grid.flat().filter((c): c is NonNullable<typeof c> => !!c && EVENTS.events.some((e) => e.date === c.date));

  return (
    <div className="dsp-frame">
      <div className="dsp-panel px-3 pb-4 pt-4 sm:px-5 sm:pb-6 sm:pt-5">
        <div className="flex items-center justify-between gap-4">
          <h3 aria-live="polite" className="t-display text-[clamp(2rem,4.4vw,3.4rem)] text-foam">
            {monthLabel(month)}
          </h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => setAhead((n) => n - 1)} disabled={ahead === 0} aria-label="Previous month" className="cal-nav">
              <CaretLeft aria-hidden size={18} weight="bold" />
            </button>
            <button type="button" onClick={() => setAhead((n) => n + 1)} disabled={ahead === MONTHS_AHEAD} aria-label="Next month" className="cal-nav">
              <CaretRight aria-hidden size={18} weight="bold" />
            </button>
          </div>
        </div>

        <table className="cal-table mt-4">
          <caption className="sr-only">Events at Brix Brewhouse, {monthLabel(month)}</caption>
          <thead>
            <tr>
              {WEEKDAYS.map((d, i) => (
                <th key={d} scope="col" className="t-stencil pb-2 text-center text-[0.8rem] tracking-[0.14em] text-gold sm:text-[0.95rem]">
                  <span aria-hidden>{d}</span>
                  <span className="sr-only">{DAY_NAMES[i]}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((week, r) => (
              <tr key={r}>
                {week.map((cell, c) => {
                  if (!cell) return <td key={c} className="cal-cell cal-out" />;
                  const isToday = cell.date === today;
                  const past = today !== null && cell.date < today;
                  return (
                    <td key={c} className={`cal-cell ${isToday ? "cal-today" : ""} ${past ? "cal-past" : ""}`} aria-current={isToday ? "date" : undefined}>
                      <span className="t-mono flex items-center gap-2 text-[0.72rem] text-text-2">
                        <span className={isToday ? "font-bold text-gold-hi" : undefined}>{cell.day}</span>
                        {isToday ? <span className="hidden text-[0.6rem] text-gold-hi sm:inline">Today</span> : null}
                      </span>
                      {cell.events.length ? (
                        <>
                          {/* phones: a dot per event; the events are written out under the grid */}
                          <span aria-hidden className="mt-1.5 flex flex-wrap gap-1 md:hidden">
                            {cell.events.map((e) => (
                              <span key={e.title} className="h-1.5 w-1.5 rounded-full bg-gold-hi" />
                            ))}
                          </span>
                          <ul className="mt-1.5 hidden flex-col gap-1 md:flex">
                            {cell.events.map((e) => {
                              const id = `${base}-${cell.date}-${e.title}`;
                              return (
                                <li key={e.title} className="cal-event" data-col={c} data-row={r >= grid.length - 2 ? "low" : "high"}>
                                  <button
                                    type="button"
                                    className="cal-chip"
                                    aria-describedby={id}
                                    aria-expanded={open === id}
                                    onClick={() => setOpen((v) => (v === id ? null : id))}
                                    onBlur={() => setOpen((v) => (v === id ? null : v))}
                                  >
                                    <span className="cal-chipTitle">{e.title}</span>
                                    {e.time ? <span className="t-mono cal-chipTime">{e.time}</span> : null}
                                  </button>
                                  <span role="tooltip" id={id} className="cal-pop" data-open={open === id || undefined}>
                                    <span className="t-mono block text-[0.6875rem] text-gold-hi">
                                      {dayLabel(cell.date)}
                                      {e.time ? ` · ${e.time}` : ""}
                                    </span>
                                    <span className="t-display mt-1 block text-[1.5rem] leading-none text-foam">{e.title}</span>
                                    <span className="mt-2 block text-[0.95rem] leading-snug text-text-2">{e.description}</span>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* phones: the month written out, since the grid only has room for dots */}
        <ul className="mt-5 border-t border-foam/15 md:hidden">
          {EVENTS.weekly.map((e) => (
            <Agenda key={e.title} when={`Every ${DAY_NAMES[WEEKDAYS.indexOf(e.weekday)]}`} event={e} />
          ))}
          {dated.flatMap((c) =>
            EVENTS.events.filter((e) => e.date === c.date).map((e) => <Agenda key={`${c.date}-${e.title}`} when={dayLabel(c.date)} event={e} />),
          )}
        </ul>
      </div>
    </div>
  );
}

function Agenda({ when, event }: { when: string; event: CalendarEvent }) {
  return (
    <li className="border-b border-foam/15 py-3.5">
      <p className="t-mono text-[0.6875rem] text-gold-hi">
        {when}
        {event.time ? ` · ${event.time}` : ""}
      </p>
      <p className="t-display mt-1 text-[1.6rem] leading-none text-foam">{event.title}</p>
      <p className="mt-1.5 text-[0.95rem] leading-snug text-text-2">{event.description}</p>
    </li>
  );
}
