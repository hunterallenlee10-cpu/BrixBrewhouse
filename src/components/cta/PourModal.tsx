"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPin, Phone, X } from "@phosphor-icons/react";
import { useSite, type PourTab } from "@/components/providers/SiteProvider";
import { StatusPill } from "@/components/ui/StatusPill";
import { Confirm } from "@/components/ui/primitives";
import { HOURS, formatTime, zonedNow } from "@/lib/hours";
import { SITE } from "@/lib/site";

const TABS: { id: PourTab; label: string }[] = [
  { id: "visit", label: "Visit" },
  { id: "group", label: "Large group" },
  { id: "event", label: "Private event" },
];

export function PourModal() {
  const { pour, closePour, openPour } = useSite();
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const mounted = pour.open || shown;
  const raised = pour.open && shown;

  // open: mount, then raise on the next frame. close: lower, then unmount after the door has dropped.
  useEffect(() => {
    if (pour.open) {
      const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(r);
    }
    const t = window.setTimeout(() => setShown(false), 700);
    return () => window.clearTimeout(t);
  }, [pour.open]);

  // focus trap + Esc
  useEffect(() => {
    if (!pour.open || !mounted) return;
    const node = panel.current;
    window.setTimeout(() => node?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return closePour();
      if (e.key !== "Tab" || !node) return;
      const els = Array.from(node.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea, [tabindex="0"]')).filter(
        (el) => el.offsetParent !== null,
      );
      const [a, z] = [els[0], els[els.length - 1]];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pour.open, mounted, closePour]);

  if (!mounted) return null;

  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : -1) + TABS.length) % TABS.length];
    openPour(next.id);
    window.setTimeout(() => panel.current?.querySelector<HTMLElement>(`#tab-${next.id}`)?.focus(), 0);
  };

  return (
    <div className="fixed inset-0" style={{ zIndex: "var(--z-modal)" as unknown as number }}>
      <div
        aria-hidden
        onClick={closePour}
        className={`absolute inset-0 bg-black/75 backdrop-blur-[2px] transition-opacity duration-500 ${raised ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92svh] w-full max-w-3xl flex-col border-x border-t border-line-strong bg-ink-1 shadow-[0_-30px_80px_-20px_rgb(0_0_0/0.9)]"
        style={{
          transform: raised ? "translate3d(0,0,0)" : "translate3d(0,104%,0)",
          transition: "transform 0.75s var(--ease-door)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* sectional door header: panel seams + the gold seam of light */}
        <div aria-hidden className="h-3 w-full bg-[repeating-linear-gradient(180deg,var(--fire-red-deep)_0_5px,#7d0213_5px_6px)]" />
        <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-gold-hi to-transparent" />
        <div className="flex items-start justify-between gap-4 px-5 pt-6 sm:px-8">
          <div>
            <p className="t-mono text-[0.68rem] text-gold">Brix Brewhouse · 128 PA-715</p>
            <h2 id={titleId} className="t-display mt-1 text-[clamp(2.4rem,7vw,3.6rem)] text-foam">
              Pour one with us
            </h2>
          </div>
          <button type="button" onClick={closePour} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center border border-line text-foam hover:border-foam">
            <X size={20} aria-hidden />
          </button>
        </div>

        <div role="tablist" aria-label="How can we help?" className="mt-5 flex gap-1 border-b border-line px-5 sm:px-8">
          {TABS.map((t, i) => {
            const on = pour.tab === t.id;
            return (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                role="tab"
                type="button"
                aria-selected={on}
                aria-controls={`panel-${t.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => openPour(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`t-mono relative h-12 px-3 text-[0.7rem] transition-colors sm:px-4 ${on ? "text-gold-hi" : "text-text-2 hover:text-foam"}`}
              >
                {t.label}
                <span aria-hidden className={`absolute inset-x-2 -bottom-px h-[2px] bg-gold-hi transition-transform duration-300 ${on ? "scale-x-100" : "scale-x-0"}`} />
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 pb-8 pt-6 sm:px-8" data-lenis-prevent>
          {pour.tab === "visit" && <VisitTab />}
          {pour.tab === "group" && <GroupForm />}
          {pour.tab === "event" && <EventForm />}
        </div>
      </div>
    </div>
  );
}

function VisitTab() {
  // the modal only ever renders on the client, after a click
  const [today] = useState(() => zonedNow(new Date()).day);
  return (
    <div role="tabpanel" id="panel-visit" aria-labelledby="tab-visit" className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <StatusPill />
        <address className="not-italic text-text-2">
          <span className="block text-lg text-foam">{SITE.street}</span>
          {SITE.city}, {SITE.region} {SITE.zip}
          <span className="t-mono mt-1 block text-[0.6875rem] text-text-3">{SITE.formerly}</span>
        </address>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          <a href={SITE.directions} target="_blank" rel="noopener noreferrer" className="flex h-13 min-h-12 items-center justify-center gap-2 bg-red px-5 font-display text-[1.2rem] font-extrabold uppercase text-foam hover:bg-red-deep">
            <MapPin size={20} aria-hidden /> Get directions
          </a>
          <a href={SITE.phoneHref} className="flex min-h-12 items-center justify-center gap-2 border border-line-strong px-5 font-display text-lg font-bold uppercase text-foam hover:border-foam">
            <Phone size={20} aria-hidden /> Call {SITE.phone}
          </a>
        </div>
      </div>
      <div>
        <table className="w-full text-left">
          <caption className="t-mono mb-2 text-left text-[0.6875rem] text-text-3">Hours · {HOURS.holidayNote}</caption>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 0].map((d) => {
              const h = HOURS.days.find((x) => x.day === d)!;
              const on = d === today;
              return (
                <tr key={d} className={on ? "bg-gold/10" : ""} aria-current={on ? "date" : undefined}>
                  <th scope="row" className={`py-1.5 pl-2 font-normal ${on ? "text-gold-hi" : "text-text-2"}`}>
                    {h.label}
                    {on ? <span className="t-mono ml-2 text-[0.6875rem]">Today</span> : null}
                  </th>
                  <td className={`tabular py-1.5 pr-2 text-right ${on ? "text-foam" : "text-text-2"}`}>
                    {formatTime(h.open)} - {formatTime(h.close)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-4 text-sm text-text-2">Mostly first-come, first-served. Walk-ins always welcome.</p>
      </div>
    </div>
  );
}

/* ---------- forms (client-side only; nothing is sent) ---------- */

type Errors = Record<string, string>;
const field = "mt-1.5 block h-12 w-full border border-line-strong bg-ink-2 px-3 text-foam placeholder:text-text-3 focus:border-gold-hi focus:outline-none";
const labelCls = "t-mono text-[0.6875rem] text-text-2";

function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-text-3">{hint}</p> : null}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-sm text-[#ff6b7a]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const phoneOk = (v: string) => v.replace(/\D/g, "").length >= 10;
const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function useForm(validate: (d: FormData) => Errors) {
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate(new FormData(e.currentTarget));
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setDone(true);
  };
  const aria = (name: string) => ({ "aria-invalid": !!errors[name] || undefined, "aria-describedby": errors[name] ? `${name}-err` : undefined });
  return { errors, done, setDone, onSubmit, aria };
}

function Success({ title, body, onReset }: { title: string; body: React.ReactNode; onReset: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="py-6 outline-none">
      <p className="t-serif text-[clamp(1.8rem,5vw,2.6rem)] text-gold-hi">{title}</p>
      <div className="mt-3 max-w-[48ch] text-text-2">{body}</div>
      <p className="t-mono mt-6 text-[0.6875rem] text-text-3">Concept preview: this form doesn&rsquo;t send anything yet.</p>
      <button type="button" onClick={onReset} className="t-mono mt-4 h-11 border border-line-strong px-4 text-[0.6875rem] text-foam hover:border-foam">
        Start over
      </button>
    </div>
  );
}

function GroupForm() {
  const f = useForm((d) => {
    const e: Errors = {};
    if (!String(d.get("g-name")).trim()) e["g-name"] = "Add a name so we know who to ask for.";
    if (!phoneOk(String(d.get("g-phone")))) e["g-phone"] = "Add a phone number with area code.";
    const n = Number(d.get("g-size"));
    if (!n || n < 2) e["g-size"] = "How many are coming?";
    if (!d.get("g-when")) e["g-when"] = "Pick a date and time.";
    return e;
  });
  if (f.done)
    return (
      <div role="tabpanel" id="panel-group" aria-labelledby="tab-group">
        <Success
          title="We'll call to confirm."
          body={
            <>
              Walk-ins always welcome. Expect a call back <Confirm title="Owners to set a response time" />.
            </>
          }
          onReset={() => f.setDone(false)}
        />
      </div>
    );
  return (
    <form role="tabpanel" id="panel-group" aria-labelledby="tab-group" noValidate onSubmit={f.onSubmit} className="grid gap-4 sm:grid-cols-2">
      <p className="text-text-2 sm:col-span-2">Coming with a crowd? Give us a heads-up and we&rsquo;ll do our best to make room.</p>
      <Field id="g-name" label="Name" error={f.errors["g-name"]}>
        <input id="g-name" name="g-name" autoComplete="name" className={field} {...f.aria("g-name")} />
      </Field>
      <Field id="g-phone" label="Phone" error={f.errors["g-phone"]}>
        <input id="g-phone" name="g-phone" type="tel" autoComplete="tel" inputMode="tel" className={field} {...f.aria("g-phone")} />
      </Field>
      <Field id="g-size" label="Party size" error={f.errors["g-size"]}>
        <input id="g-size" name="g-size" type="number" min={2} inputMode="numeric" className={field} {...f.aria("g-size")} />
      </Field>
      <Field id="g-when" label="Date and time" error={f.errors["g-when"]}>
        <input id="g-when" name="g-when" type="datetime-local" className={field} {...f.aria("g-when")} />
      </Field>
      <div className="sm:col-span-2">
        <Field id="g-notes" label="Notes (optional)">
          <textarea id="g-notes" name="g-notes" rows={3} className={`${field} h-auto py-2`} />
        </Field>
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button type="submit" className="h-13 min-h-12 bg-red px-7 font-display text-[1.2rem] font-extrabold uppercase text-foam hover:bg-red-deep">
          Send the heads-up
        </button>
        <a href={SITE.phoneHref} className="t-mono text-[0.68rem] text-text-2 underline hover:text-foam">
          Or call {SITE.phone}
        </a>
      </div>
    </form>
  );
}

const EVENT_TYPES = ["Birthday", "Shower", "Team night", "Fundraiser", "Watch party", "Something else"];

function EventForm() {
  const f = useForm((d) => {
    const e: Errors = {};
    if (!String(d.get("e-name")).trim()) e["e-name"] = "Add a name so we know who to ask for.";
    if (!phoneOk(String(d.get("e-phone")))) e["e-phone"] = "Add a phone number with area code.";
    if (!emailOk(String(d.get("e-email")))) e["e-email"] = "That email doesn't look complete.";
    if (!d.get("e-date")) e["e-date"] = "Pick a date.";
    const n = Number(d.get("e-guests"));
    if (!n || n < 1) e["e-guests"] = "How many guests?";
    else if (n > 50) e["e-guests"] = "Eli's Lounge seats 50. For a bigger crowd, give us a call.";
    return e;
  });
  if (f.done)
    return (
      <div role="tabpanel" id="panel-event" aria-labelledby="tab-event">
        <Success
          title="Eli's Lounge, penciled in."
          body={
            <>
              Thanks. We&rsquo;ll be in touch <Confirm title="Owners to set a response time" /> to talk dates and options.
            </>
          }
          onReset={() => f.setDone(false)}
        />
      </div>
    );
  return (
    <form role="tabpanel" id="panel-event" aria-labelledby="tab-event" noValidate onSubmit={f.onSubmit} className="grid gap-4 sm:grid-cols-2">
      <p className="text-text-2 sm:col-span-2">
        Eli&rsquo;s Lounge seats 50 and was built by hand. Tell us what you&rsquo;re celebrating.
      </p>
      <Field id="e-name" label="Name" error={f.errors["e-name"]}>
        <input id="e-name" name="e-name" autoComplete="name" className={field} {...f.aria("e-name")} />
      </Field>
      <Field id="e-phone" label="Phone" error={f.errors["e-phone"]}>
        <input id="e-phone" name="e-phone" type="tel" autoComplete="tel" inputMode="tel" className={field} {...f.aria("e-phone")} />
      </Field>
      <Field id="e-email" label="Email" error={f.errors["e-email"]}>
        <input id="e-email" name="e-email" type="email" autoComplete="email" className={field} {...f.aria("e-email")} />
      </Field>
      <Field id="e-type" label="Event type">
        <select id="e-type" name="e-type" className={field} defaultValue="Birthday">
          {EVENT_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field id="e-date" label="Date" error={f.errors["e-date"]}>
        <input id="e-date" name="e-date" type="date" className={field} {...f.aria("e-date")} />
      </Field>
      <Field id="e-guests" label="Guest count" error={f.errors["e-guests"]} hint="Up to 50 in Eli's Lounge.">
        <input id="e-guests" name="e-guests" type="number" min={1} max={50} inputMode="numeric" className={field} {...f.aria("e-guests")} />
      </Field>
      <div className="sm:col-span-2">
        <Field id="e-msg" label="Message (optional)">
          <textarea id="e-msg" name="e-msg" rows={3} className={`${field} h-auto py-2`} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <button type="submit" className="h-13 min-h-12 bg-red px-7 font-display text-[1.2rem] font-extrabold uppercase text-foam hover:bg-red-deep">
          Ask about the lounge
        </button>
      </div>
    </form>
  );
}
