// One open/closed engine for every status display on the site.
// Times are wall-clock in America/New_York; Intl handles DST.
import hoursData from "../../data/hours.json";

export type DayHours = { day: number; label: string; open: string; close: string };
export type HoursConfig = { timezone: string; holidayNote: string; days: DayHours[] };

export type Status =
  | { state: "open"; closesAt: string; day: number; label: string }
  | { state: "later-today"; opensAt: string; day: number; label: string }
  | { state: "closed"; opensAt: string; opensWhen: string; day: number; label: string };

export const HOURS = hoursData as HoursConfig;

const WEEKDAY: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Day of week (0 = Sunday) and minutes since local midnight in the venue's zone. */
const FORMATTERS = new Map<string, Intl.DateTimeFormat>();
const formatterFor = (timeZone: string) => {
  let f = FORMATTERS.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    FORMATTERS.set(timeZone, f);
  }
  return f;
};

export function zonedNow(now: Date, timeZone = HOURS.timezone): { day: number; minutes: number } {
  const parts = formatterFor(timeZone).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "0";
  return { day: WEEKDAY[get("weekday")], minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** "21:00" -> "9 PM", "12:30" -> "12:30 PM", "24:00" -> "12 AM" */
export function formatTime(hhmm: string): string {
  const total = toMinutes(hhmm) % (24 * 60);
  const h = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
}

export function getStatus(now: Date, cfg: HoursConfig = HOURS): Status {
  const { day, minutes } = zonedNow(now, cfg.timezone);
  const byDay = (d: number) => cfg.days.find((x) => x.day === ((d + 7) % 7))!;
  const today = byDay(day);
  const yesterday = byDay(day - 1);

  // a close time past midnight (e.g. "25:00") keeps yesterday open into today
  const yClose = toMinutes(yesterday.close);
  if (yClose > 1440 && minutes < yClose - 1440) {
    return { state: "open", closesAt: yesterday.close, day: yesterday.day, label: yesterday.label };
  }
  const open = toMinutes(today.open);
  const close = toMinutes(today.close);
  if (minutes >= open && minutes < close) {
    return { state: "open", closesAt: today.close, day, label: today.label };
  }
  if (minutes < open) {
    return { state: "later-today", opensAt: today.open, day, label: today.label };
  }
  const tomorrow = byDay(day + 1);
  return { state: "closed", opensAt: tomorrow.open, opensWhen: "tomorrow", day: tomorrow.day, label: tomorrow.label };
}

/** The pill copy. Kept here so every surface says the same thing. */
export function statusText(s: Status): { lead: string; rest: string } {
  if (s.state === "open") return { lead: "Open now", rest: `pouring until ${formatTime(s.closesAt)}` };
  if (s.state === "later-today") return { lead: "Opens today", rest: `at ${formatTime(s.opensAt)}` };
  return { lead: "Closed", rest: `opens ${s.opensWhen} ${formatTime(s.opensAt)}` };
}

/** Compact weekly summary, e.g. "Sun–Thu 12–9 · Fri–Sat 12–11" built from the data. */
export function weekSummary(cfg: HoursConfig = HOURS): { days: string; time: string }[] {
  const short = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const groups: { start: number; end: number; open: string; close: string }[] = [];
  for (const d of [...cfg.days].sort((a, b) => a.day - b.day)) {
    const g = groups[groups.length - 1];
    if (g && g.open === d.open && g.close === d.close && g.end === d.day - 1) g.end = d.day;
    else groups.push({ start: d.day, end: d.day, open: d.open, close: d.close });
  }
  const strip = (t: string) => formatTime(t).replace(/ (AM|PM)$/, "");
  return groups.map((g) => ({
    days: g.start === g.end ? short[g.start] : `${short[g.start]}-${short[g.end]}`,
    time: `${strip(g.open)}-${strip(g.close)}`,
  }));
}
