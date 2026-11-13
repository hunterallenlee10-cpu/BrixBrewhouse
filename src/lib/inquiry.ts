// Shared by the pour modal forms (instant feedback) and the server action (the real check).

export type InquiryKind = "group" | "event";
export type Errors = Record<string, string>;

export const EVENT_TYPES = ["Birthday", "Shower", "Repast", "Team night", "Fundraiser", "Watch party", "Something else"];
/** Eli's Lounge is the only private room; space anywhere else in the brewery can be reserved. */
export const EVENT_SPACES = ["Eli's Lounge (private)", "Reserved space elsewhere in the brewery", "Not sure yet"];

const MAX_LEN = 2000;
const str = (d: FormData, k: string) => String(d.get(k) ?? "").trim().slice(0, MAX_LEN);

export const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;
export const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function validateGroup(d: FormData): Errors {
  const e: Errors = {};
  if (!str(d, "g-name")) e["g-name"] = "Add a name so we know who to ask for.";
  if (!phoneOk(str(d, "g-phone"))) e["g-phone"] = "Add a phone number with area code.";
  const n = Number(str(d, "g-size"));
  if (!n || n < 2) e["g-size"] = "How many are coming?";
  if (!str(d, "g-when")) e["g-when"] = "Pick a date and time.";
  return e;
}

export function validateEvent(d: FormData): Errors {
  const e: Errors = {};
  if (!str(d, "e-name")) e["e-name"] = "Add a name so we know who to ask for.";
  if (!phoneOk(str(d, "e-phone"))) e["e-phone"] = "Add a phone number with area code.";
  if (!emailOk(str(d, "e-email"))) e["e-email"] = "That email doesn't look complete.";
  if (!str(d, "e-date")) e["e-date"] = "Pick a date.";
  const n = Number(str(d, "e-guests"));
  if (!n || n < 1) e["e-guests"] = "How many guests?";
  return e;
}

export const validators: Record<InquiryKind, (d: FormData) => Errors> = { group: validateGroup, event: validateEvent };

// "2026-11-14" or "2026-11-14T19:30" -> "Sat, Nov 14, 2026" / "Sat, Nov 14, 2026, 7:30 PM".
// Read as wall-clock time so the server's time zone can't shift it.
export function formatWhen(v: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(v);
  if (!m) return v;
  const [, y, mo, d, h, mi] = m;
  const date = new Date(Date.UTC(+y, +mo - 1, +d, h ? +h : 0, mi ? +mi : 0));
  return date.toLocaleString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(h ? { hour: "numeric", minute: "2-digit" } : {}),
  });
}

export type InquiryEmail = { subject: string; text: string; replyTo?: string };

// Plain text only, so nothing a guest types can turn into HTML in the inbox.
export function buildEmail(kind: InquiryKind, d: FormData): InquiryEmail {
  const lines = (rows: [string, string][]) =>
    rows
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
  const footer = "\n\nSent from the form on brixbrewhouse.com.";

  if (kind === "group") {
    const name = str(d, "g-name");
    const size = str(d, "g-size");
    const when = formatWhen(str(d, "g-when"));
    return {
      subject: `Large group heads-up: ${name}, party of ${size}, ${when}`,
      text:
        "New large group heads-up from the website.\n\n" +
        lines([
          ["Name", name],
          ["Phone", str(d, "g-phone")],
          ["Party size", size],
          ["Date and time", when],
          ["Notes", str(d, "g-notes")],
        ]) +
        footer,
    };
  }

  const name = str(d, "e-name");
  const type = EVENT_TYPES.includes(str(d, "e-type")) ? str(d, "e-type") : "Something else";
  const space = EVENT_SPACES.includes(str(d, "e-space")) ? str(d, "e-space") : "Not sure yet";
  const date = formatWhen(str(d, "e-date"));
  const email = str(d, "e-email");
  return {
    subject: `Event inquiry: ${type} for ${str(d, "e-guests")}, ${date} (${name})`,
    text:
      "New event inquiry from the website.\n\n" +
      lines([
        ["Name", name],
        ["Phone", str(d, "e-phone")],
        ["Email", email],
        ["Event type", type],
        ["Space", space],
        ["Date", date],
        ["Guests", str(d, "e-guests")],
        ["Message", str(d, "e-msg")],
      ]) +
      "\n\nReply to this email to answer the guest directly." +
      footer,
    replyTo: emailOk(email) ? email : undefined,
  };
}
