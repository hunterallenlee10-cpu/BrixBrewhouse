import { describe, expect, it } from "vitest";
import { formatTime, getStatus, statusText, weekSummary, zonedNow, type HoursConfig } from "./hours";

// Helper: build a UTC instant from a New York wall-clock time with an explicit offset.
const ny = (isoLocal: string, offset: "-04:00" | "-05:00") => new Date(`${isoLocal}${offset}`);

describe("formatTime", () => {
  it("formats on-the-hour and minutes", () => {
    expect(formatTime("21:00")).toBe("9 PM");
    expect(formatTime("12:00")).toBe("12 PM");
    expect(formatTime("12:30")).toBe("12:30 PM");
    expect(formatTime("00:00")).toBe("12 AM");
    expect(formatTime("24:00")).toBe("12 AM");
  });
});

describe("getStatus (real Brix hours)", () => {
  it("Tue 1 PM is open until 9 PM", () => {
    const s = getStatus(ny("2026-10-20T13:00:00", "-04:00"));
    expect(s.state).toBe("open");
    expect(statusText(s)).toEqual({ lead: "Open now", rest: "pouring until 9 PM" });
  });
  it("Fri 10:30 PM is open until 11 PM (late close)", () => {
    const s = getStatus(ny("2026-10-23T22:30:00", "-04:00"));
    expect(statusText(s)).toEqual({ lead: "Open now", rest: "pouring until 11 PM" });
  });
  it("Sun 9:30 PM is closed, opens tomorrow 12 PM", () => {
    const s = getStatus(ny("2026-10-25T21:30:00", "-04:00"));
    expect(s.state).toBe("closed");
    expect(statusText(s)).toEqual({ lead: "Closed", rest: "opens tomorrow 12 PM" });
  });
  it("closing minute itself counts as closed (Sat 11:00 PM)", () => {
    expect(getStatus(ny("2026-10-24T23:00:00", "-04:00")).state).toBe("closed");
  });
  it("one minute before close is open (Thu 8:59 PM)", () => {
    expect(getStatus(ny("2026-10-22T20:59:00", "-04:00")).state).toBe("open");
  });
  it("just after midnight Saturday (Fri night) opens later today", () => {
    const s = getStatus(ny("2026-10-24T00:15:00", "-04:00"));
    expect(s.state).toBe("later-today");
    expect(statusText(s)).toEqual({ lead: "Opens today", rest: "at 12 PM" });
  });
  it("Sunday morning opens today at 12 PM", () => {
    expect(statusText(getStatus(ny("2026-10-25T10:00:00", "-04:00")))).toEqual({ lead: "Opens today", rest: "at 12 PM" });
  });
  it("Saturday 11:30 PM rolls to Sunday", () => {
    const s = getStatus(ny("2026-10-24T23:30:00", "-04:00"));
    expect(s.state).toBe("closed");
    if (s.state === "closed") expect(s.label).toBe("Sunday");
  });
});

describe("DST", () => {
  it("spring forward: Sun 8 Mar 2026, 12:30 PM EDT is open", () => {
    // 16:30 UTC == 12:30 EDT (after the 2 AM jump)
    const d = new Date("2026-03-08T16:30:00Z");
    expect(zonedNow(d)).toEqual({ day: 0, minutes: 12 * 60 + 30 });
    expect(getStatus(d).state).toBe("open");
  });
  it("fall back: Sun 1 Nov 2026, 11:59 AM EST is not yet open", () => {
    // 16:59 UTC == 11:59 EST (after the 2 AM fall back)
    const d = new Date("2026-11-01T16:59:00Z");
    expect(zonedNow(d)).toEqual({ day: 0, minutes: 11 * 60 + 59 });
    expect(getStatus(d).state).toBe("later-today");
  });
  it("same UTC hour reads differently across the DST boundary", () => {
    expect(zonedNow(new Date("2026-10-31T01:30:00Z")).minutes).toBe(21 * 60 + 30); // EDT: Fri 9:30 PM
    expect(zonedNow(new Date("2026-11-07T01:30:00Z")).minutes).toBe(20 * 60 + 30); // EST: Fri 8:30 PM
  });
});

describe("past-midnight closes", () => {
  const cfg: HoursConfig = {
    timezone: "America/New_York",
    holidayNote: "",
    days: [0, 1, 2, 3, 4, 5, 6].map((d) => ({ day: d, label: String(d), open: "12:00", close: d === 5 ? "25:00" : "21:00" })),
  };
  it("Friday late close carries past midnight into Saturday", () => {
    const s = getStatus(ny("2026-10-24T00:30:00", "-04:00"), cfg);
    expect(s.state).toBe("open");
    expect(statusText(s).rest).toBe("pouring until 1 AM");
  });
});

describe("weekSummary", () => {
  it("groups the real week", () => {
    expect(weekSummary()).toEqual([
      { days: "Sun-Thu", time: "12-9" },
      { days: "Fri-Sat", time: "12-11" },
    ]);
  });
});
