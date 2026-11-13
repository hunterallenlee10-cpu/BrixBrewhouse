// Pure month math for the events calendar (unit-tested). Dates are plain "YYYY-MM-DD" strings, no time zones.
import type { CalendarEvent } from "./data";

export type Weekday = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";
export const WEEKDAYS: Weekday[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export type CalendarData = {
  weekly: (CalendarEvent & { weekday: Weekday })[];
  events: (CalendarEvent & { date: string })[];
};
export type DayCell = { date: string; day: number; events: CalendarEvent[] };

const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-11" plus n months -> "2027-01" */
export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split("-").map(Number);
  const total = y * 12 + (m - 1) + n;
  return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`;
}

/** "2026-11" -> "November 2026" */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", { timeZone: "UTC", month: "long", year: "numeric" });
}

/** "2026-11-14" -> "Sat, Nov 14" */
export function dayLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleString("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
}

/**
 * The month as rows of seven, Sunday first. Cells outside the month are null.
 * Weekly events come first in a day, then that date's one-offs in the order they were written.
 */
export function monthGrid(ym: string, data: CalendarData): (DayCell | null)[][] {
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const count = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (DayCell | null)[] = Array(first).fill(null);
  for (let d = 1; d <= count; d++) {
    const date = `${ym}-${pad(d)}`;
    const weekday = WEEKDAYS[(first + d - 1) % 7];
    cells.push({
      date,
      day: d,
      events: [...data.weekly.filter((e) => e.weekday === weekday), ...data.events.filter((e) => e.date === date)],
    });
  }
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7));
}
