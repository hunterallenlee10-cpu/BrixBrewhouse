// One open/closed engine for every status display on the site.
// Times are wall-clock in America/New_York; Intl handles DST.
import hoursData from "../../data/hours.json";

export type DayHours = { day: number; label: string; open: string; close: string };
/** Nights that run late for a game: last call replaces the usual close, and the doors stay open until the game ends. */
export type GameNights = { active: boolean; days: number[]; lastCall: string; short: string; note: string };
/** A single calendar date (YYYY-MM-DD, venue time) the taproom is closed all day. */
export type Closure = { date: string; label: string };
export type HoursConfig = { timezone: string; holidayNote: string; days: DayHours[]; gameNights?: GameNights; closures?: Closure[] };

export type Status =
  | { state: "open"; closesAt: string; day: number; label: string; lastCall?: boolean }
  | { state: "later-today"; opensAt: string; day: number; label: string }
  | { state: "closed"; opensAt: string; opensWhen: string; day: number; label: string; reason?: string };

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

const DATE_FORMATTERS = new Map<string, Intl.DateTimeFormat>();
/** Calendar date in the venue's zone, "YYYY-MM-DD". */
export function zonedDate(now: Date, timeZone = HOURS.timezone): string {
  let f = DATE_FORMATTERS.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" });
    DATE_FORMATTERS.set(timeZone, f);
  }
  return f.format(now);
}

const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** The all-day closure on that date ("YYYY-MM-DD"), if there is one. */
export const closureOn = (date: string, cfg: HoursConfig = HOURS) => cfg.closures?.find((c) => c.date === date);
/** The all-day closure in effect right now, if there is one. */
export const closureToday = (now: Date, cfg: HoursConfig = HOURS) => closureOn(zonedDate(now, cfg.timezone), cfg);

/** True when that weekday (0 = Sunday) is a game night and game nights are switched on. */
export const isGameNight = (day: number, cfg: HoursConfig = HOURS) => !!cfg.gameNights?.active && cfg.gameNights.days.includes(day);

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
  const date = zonedDate(now, cfg.timezone);
  const closure = closureOn(date, cfg);

  // closed now: find the next day that is not an all-day closure
  const nextOpen = (): Status => {
    let i = 1;
    while (i < 14 && closureOn(addDays(date, i), cfg)) i++;
    const next = byDay(day + i);
    return {
      state: "closed",
      opensAt: next.open,
      opensWhen: i === 1 ? "tomorrow" : next.label,
      day: next.day,
      label: next.label,
      ...(closure ? { reason: closure.label } : {}),
    };
  };

  // a close time past midnight (e.g. "25:00") keeps yesterday open into today
  const yClose = toMinutes(yesterday.close);
  if (yClose > 1440 && minutes < yClose - 1440 && !closureOn(addDays(date, -1), cfg)) {
    return { state: "open", closesAt: yesterday.close, day: yesterday.day, label: yesterday.label };
  }
  if (closure) return nextOpen();
  const open = toMinutes(today.open);
  // on a game night the bar pours until last call, past the usual close
  const late = isGameNight(day, cfg) && toMinutes(cfg.gameNights!.lastCall) > toMinutes(today.close);
  const closesAt = late ? cfg.gameNights!.lastCall : today.close;
  if (minutes >= open && minutes < toMinutes(closesAt)) {
    return { state: "open", closesAt, day, label: today.label, ...(late ? { lastCall: true } : {}) };
  }
  if (minutes < open) {
    return { state: "later-today", opensAt: today.open, day, label: today.label };
  }
  return nextOpen();
}

/** The pill copy. Kept here so every surface says the same thing. */
export function statusText(s: Status): { lead: string; rest: string } {
  if (s.state === "open") return { lead: "Open now", rest: s.lastCall ? `last call ${formatTime(s.closesAt)}` : `pouring until ${formatTime(s.closesAt)}` };
  if (s.state === "later-today") return { lead: "Opens today", rest: `at ${formatTime(s.opensAt)}` };
  return { lead: s.reason ? `Closed for ${s.reason}` : "Closed", rest: `opens ${s.opensWhen} ${formatTime(s.opensAt)}` };
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
