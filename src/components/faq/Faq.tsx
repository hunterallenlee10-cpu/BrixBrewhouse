"use client";

import { useId, useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { Confirm } from "@/components/ui/primitives";
import { FAQ } from "@/lib/data";
import { SITE } from "@/lib/site";
import "./faq.css";

/** Answers come from /data/faq.json; any {{CONFIRM}} renders as the visible token. */
function Answer({ text }: { text: string }) {
  const parts = text.split("{{CONFIRM}}");
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 ? <Confirm /> : null}
        </span>
      ))}
    </>
  );
}

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();
  return (
    <section id="faq" aria-labelledby="faq-title" className="section bg-black">
      <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+3rem)]">
            <h2 id="faq-title" className="t-display text-[clamp(3rem,7vw,6rem)] text-foam">
              Before your first pour
            </h2>
            <p className="mt-6 max-w-[32ch] text-text-2">Everything people ask us at the door. Still wondering? We&rsquo;re always happy to help.</p>
            <div className="mt-6 flex flex-col gap-1">
              <a href={SITE.phoneHref} className="t-mono inline-flex min-h-11 items-center text-[0.72rem] text-gold-hi underline-offset-4 hover:underline">
                Call {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="t-mono inline-flex min-h-11 items-center text-[0.72rem] text-gold-hi underline-offset-4 hover:underline">
                {SITE.email}
              </a>
            </div>
          </div>
        </div>

        <ul className="border-t border-line-strong lg:col-span-8">
          {FAQ.items.map((f, i) => {
            const isOpen = open === i;
            const btn = `${base}-q${i}`;
            const panel = `${base}-a${i}`;
            return (
              <li key={f.q} className="border-b border-line">
                <h3>
                  <button
                    id={btn}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex min-h-16 w-full items-center justify-between gap-6 py-4 text-left"
                  >
                    <span className={`font-display text-[clamp(1.35rem,2.4vw,1.9rem)] font-bold uppercase leading-tight transition-colors ${isOpen ? "text-gold-hi" : "text-foam group-hover:text-gold-hi"}`}>
                      {f.q}
                    </span>
                    <span aria-hidden className={`grid h-10 w-10 shrink-0 place-items-center border transition-colors duration-300 ${isOpen ? "border-gold-hi text-gold-hi" : "border-line-strong text-foam"}`}>
                      <Plus size={18} weight="bold" className={`transition-transform duration-500 ease-[var(--ease-door)] ${isOpen ? "rotate-45" : ""}`} />
                    </span>
                  </button>
                </h3>
                <div id={panel} role="region" aria-labelledby={btn} className={`faq-panel ${isOpen ? "faq-open" : ""}`} inert={!isOpen}>
                  <div className="overflow-hidden">
                    <p className="max-w-[62ch] pb-6 pr-14 text-[1.05rem] leading-relaxed text-text-2">
                      <Answer text={f.a} />
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
