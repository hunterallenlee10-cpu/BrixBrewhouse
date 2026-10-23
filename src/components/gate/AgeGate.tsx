"use client";

import { useEffect, useRef, useState } from "react";
import { doorEase, useSite } from "@/components/providers/SiteProvider";
import { SITE } from "@/lib/site";

/**
 * BAY 00. The age check is the closed bay door. "Yes" rolls the panel up and
 * carries the visitor ~15% into the hero sequence (the door starts opening).
 */
export function AgeGate({ logo }: { logo: React.ReactNode }) {
  const { gatePassed, passGate, scrollTo, reducedMotion } = useSite();
  const [phase, setPhase] = useState<"ask" | "under" | "opening" | "gone">("ask");
  const dialog = useRef<HTMLDivElement>(null);
  const yesBtn = useRef<HTMLButtonElement>(null);

  const hidden = phase === "gone" || (gatePassed && phase === "ask");

  // initial focus + focus trap
  useEffect(() => {
    if (hidden || phase === "opening") return;
    const first = dialog.current?.querySelector<HTMLElement>("[data-autofocus]") ?? yesBtn.current;
    first?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dialog.current) return;
      const els = Array.from(dialog.current.querySelectorAll<HTMLElement>("button, a[href]"));
      if (!els.length) return;
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
  }, [phase, hidden]);

  const prime = () => window.dispatchEvent(new Event("brix:prime"));

  const openDoor = () => {
    prime();
    passGate();
    if (reducedMotion) {
      setPhase("gone");
      return;
    }
    setPhase("opening");
    // let Lenis start, then roll the visitor into the first stretch of the sequence
    window.setTimeout(() => {
      const hero = document.getElementById("top");
      if (hero) scrollTo(Math.round((hero.offsetHeight - window.innerHeight) * 0.15), { duration: 2.8, easing: doorEase });
    }, 380);
    window.setTimeout(() => setPhase("gone"), 1400);
  };

  if (hidden) return null;

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      aria-describedby="gate-desc"
      className="age-gate fixed inset-0 overflow-hidden"
      style={{
        zIndex: "var(--z-gate)" as unknown as number,
        transform: phase === "opening" ? "translate3d(0,-102%,0)" : "translate3d(0,0,0)",
        transition: "transform 1.25s var(--ease-door)",
      }}
    >
      <picture>
        <source media="(max-width: 767px)" srcSet="/frames/mobile/poster.jpg" />
        <img src="/frames/desktop/poster.jpg" alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      </picture>
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,rgb(11_12_13/0.35),rgb(11_12_13/0.88))]" />
      {/* the door's bottom edge: a gold seam of light */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-gold-hi to-transparent opacity-80 shadow-[0_0_30px_6px_rgb(240_191_69/0.45)]" />

      <div className="relative flex h-full flex-col items-center justify-center px-5 text-center">
        <div className="h-[clamp(120px,22vw,176px)] [filter:drop-shadow(0_0_28px_rgb(214_158_20/0.45))_drop-shadow(0_10px_30px_rgb(0_0_0/0.7))]">
          {logo}
        </div>
        <p className="mt-8 flex items-baseline gap-3 text-gold">
          <span className="t-stencil text-[1.25rem] leading-none tracking-[0.12em]">BAY 00</span>
          <span aria-hidden className="h-px w-8 translate-y-[-0.3em] bg-current opacity-60" />
          <span className="t-mono text-[0.72rem]">Age check</span>
        </p>

        {phase === "ask" || phase === "opening" ? (
          <>
            <h2 id="gate-title" className="t-display mt-4 text-[clamp(2.8rem,8vw,6rem)] text-foam">
              Are you 21 or older?
            </h2>
            <p id="gate-desc" className="mt-3 max-w-[40ch] text-text-2">
              Brix is a working brewery. We&rsquo;ll only ask once per visit.
            </p>
            <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                ref={yesBtn}
                type="button"
                data-cursor="cap"
                onClick={openDoor}
                onPointerEnter={prime}
                onFocus={prime}
                className="h-14 bg-red px-7 font-display text-[1.2rem] font-extrabold uppercase tracking-[0.04em] text-foam shadow-[0_14px_30px_-14px_rgb(0_0_0/0.85)] transition-colors hover:bg-red-deep"
              >
                Yes, open the door
              </button>
              <button
                type="button"
                data-cursor="cap"
                onClick={() => setPhase("under")}
                className="h-14 border border-line-strong px-7 font-display text-[1.2rem] font-bold uppercase tracking-[0.04em] text-foam transition-colors hover:border-foam hover:bg-foam/5"
              >
                Not yet
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="gate-title" className="t-serif mt-5 max-w-[18ch] text-[clamp(2.2rem,6vw,4.4rem)] text-foam">
              Come back when you&rsquo;re 21. The Birch Beer will be waiting.
            </h2>
            <p id="gate-desc" className="mt-5 max-w-[46ch] text-text-2">
              Our house-made Birch Beer is non-alcoholic and Brix is family-friendly, so you&rsquo;re welcome to visit with a grown-up.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
              <a
                data-autofocus
                href={SITE.responsibility}
                target="_blank"
                rel="noopener noreferrer"
                className="t-mono inline-flex h-12 items-center border border-gold px-5 text-[0.72rem] text-gold-hi transition-colors hover:bg-gold hover:text-black"
              >
                Learn about responsible drinking
              </a>
              <button type="button" onClick={() => setPhase("ask")} className="t-mono h-12 px-4 text-[0.72rem] text-text-2 underline underline-offset-4 hover:text-foam">
                Go back
              </button>
            </div>
          </>
        )}
      </div>
      <span className="t-mono absolute bottom-3 left-4 text-[0.6875rem] tracking-[0.14em] text-foam/70">Illustrative render</span>
    </div>
  );
}
