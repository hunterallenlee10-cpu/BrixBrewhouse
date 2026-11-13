import { describe, expect, it } from "vitest";
import { addMonths, dayLabel, monthGrid, monthLabel } from "./calendar";

const data = {
  weekly: [{ title: "Taco Tuesday", weekday: "TUE" as const, description: "Tacos." }],
  events: [{ title: "Trivia", date: "2026-11-17", time: "7 PM", description: "Teams of six." }],
};

describe("calendar", () => {
  it("steps across a year boundary", () => {
    expect(addMonths("2026-11", 2)).toBe("2027-01");
    expect(addMonths("2027-01", -1)).toBe("2026-12");
  });
  it("labels months and days", () => {
    expect(monthLabel("2026-11")).toBe("November 2026");
    expect(dayLabel("2026-11-14")).toBe("Sat, Nov 14");
  });
  it("lays November 2026 out Sunday first", () => {
    const grid = monthGrid("2026-11", data);
    expect(grid).toHaveLength(5);
    expect(grid[0][0]?.date).toBe("2026-11-01"); // Nov 1, 2026 is a Sunday
    expect(grid[4][1]?.date).toBe("2026-11-30");
    expect(grid[4][2]).toBeNull();
  });
  it("puts weekly events on every matching weekday, before that day's one-offs", () => {
    const days = monthGrid("2026-11", data).flat().filter((c) => c?.events.length);
    expect(days.map((c) => c!.date)).toEqual(["2026-11-03", "2026-11-10", "2026-11-17", "2026-11-24"]);
    expect(days[2]!.events.map((e) => e.title)).toEqual(["Taco Tuesday", "Trivia"]);
  });
});
