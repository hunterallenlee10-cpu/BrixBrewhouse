import { describe, expect, it } from "vitest";
import { buildEmail, formatWhen, validateEvent, validateGroup } from "./inquiry";

const fd = (o: Record<string, string>) => {
  const d = new FormData();
  for (const [k, v] of Object.entries(o)) d.set(k, v);
  return d;
};

describe("formatWhen", () => {
  it("formats dates and date-times as wall-clock time", () => {
    expect(formatWhen("2026-11-14")).toBe("Sat, Nov 14, 2026");
    expect(formatWhen("2026-11-14T19:30")).toBe("Sat, Nov 14, 2026, 7:30 PM");
  });
  it("passes anything else through", () => {
    expect(formatWhen("next friday")).toBe("next friday");
  });
});

describe("validation", () => {
  it("flags missing group fields", () => {
    expect(Object.keys(validateGroup(fd({})))).toEqual(["g-name", "g-phone", "g-size", "g-when"]);
  });
  it("asks for a guest count on the event form", () => {
    const e = validateEvent(fd({ "e-name": "A", "e-phone": "5702139298", "e-email": "a@b.co", "e-date": "2026-12-01", "e-guests": "0" }));
    expect(Object.keys(e)).toEqual(["e-guests"]);
  });
  it("accepts a repast", () => {
    const d = fd({ "e-name": "A", "e-phone": "5702139298", "e-email": "a@b.co", "e-date": "2026-12-01", "e-guests": "60", "e-type": "Repast" });
    expect(validateEvent(d)).toEqual({});
    expect(buildEmail("event", d).subject).toContain("Repast for 60");
  });
});

describe("buildEmail", () => {
  it("builds the large group email", () => {
    const m = buildEmail("group", fd({ "g-name": "Sam", "g-phone": "570-555-0100", "g-size": "12", "g-when": "2026-11-14T19:30", "g-notes": "" }));
    expect(m.subject).toBe("Large group heads-up: Sam, party of 12, Sat, Nov 14, 2026, 7:30 PM");
    expect(m.text).toContain("Phone: 570-555-0100");
    expect(m.text).not.toContain("Notes:");
    expect(m.replyTo).toBeUndefined();
  });
  it("builds the event email with the guest as reply-to", () => {
    const m = buildEmail("event", fd({ "e-name": "Jo", "e-phone": "5705550100", "e-email": "jo@example.com", "e-type": "Birthday", "e-date": "2026-12-05", "e-guests": "30", "e-msg": "<b>hi</b>" }));
    expect(m.subject).toBe("Eli's Lounge inquiry: Birthday for 30, Sat, Dec 5, 2026 (Jo)");
    expect(m.replyTo).toBe("jo@example.com");
    expect(m.text).toContain("Message: <b>hi</b>");
  });
  it("falls back for an unknown event type", () => {
    expect(buildEmail("event", fd({ "e-type": "Rave" })).text).toContain("Event type: Something else");
  });
});
