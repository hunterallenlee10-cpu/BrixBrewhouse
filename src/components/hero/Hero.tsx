"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SequenceCanvas, type SequenceHandle } from "./SequenceCanvas";
import { useSite } from "@/components/providers/SiteProvider";
import { TapHandleButton } from "@/components/ui/TapHandleButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { Confirm, Illustrative } from "@/components/ui/primitives";
import { weekSummary } from "@/lib/hours";
import { whenIdle } from "@/lib/idle";

gsap.registerPlugin(ScrollTrigger);

/** [fadeInStart, fullStart, fullEnd, fadeOutEnd] in scroll progress (0..1). */
const RANGES: Record<string, [number, number, number, number]> = {
  brix: [-1, 0, 0.21, 0.26],
  firehouse: [0.25, 0.3, 0.5, 0.56],
  batch: [0.55, 0.6, 0.8, 0.86],
  cta: [0.85, 0.9, 2, 3],
};

const hoursLine = weekSummary()
  .map((g) => `${g.days} ${g.time}`)
  .join(" · ");

export function Hero() {
  const { reducedMotion, gatePassed } = useSite();
  const section = useRef<HTMLElement>(null);
  const seq = useRef<SequenceHandle>(null);
  const overlays = useRef<Record<string, HTMLDivElement | null>>({});
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  // the gate asks for frames as soon as the visitor reaches for "Yes"
  useEffect(() => {
    const prime = () => seq.current?.prime();
    window.addEventListener("brix:prime", prime);
    return () => window.removeEventListener("brix:prime", prime);
  }, []);

  // scroll -> sequence target
  useEffect(() => {
    if (reducedMotion || !section.current) return;
    let st: ScrollTrigger | null = null;
    const cancel = whenIdle(() => {
      st = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => seq.current?.setTarget(self.progress),
      });
      seq.current?.setTarget(st.progress);
    }, 300);
    return () => {
      cancel();
      st?.kill();
    };
  }, [reducedMotion]);

  // overlays follow the eased picture, not the raw scroll, so text and image move together
  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    let last = -1;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = seq.current?.getProgress() ?? 0;
      if (Math.abs(p - last) < 0.0002) return; // nothing moved: no style writes
      last = p;
      for (const [key, [a, b, c, d]] of Object.entries(RANGES)) {
        const el = overlays.current[key];
        if (!el) continue;
        let o = 0;
        if (p >= b && p <= c) o = 1;
        else if (p > a && p < b) o = (p - a) / (b - a);
        else if (p > c && p < d) o = 1 - (p - c) / (d - c);
        const y = p < b ? (1 - o) * 28 : -(1 - o) * 28;
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
        el.style.visibility = o < 0.01 ? "hidden" : "visible";
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const brixRef = useCallback((el: HTMLDivElement | null) => void (overlays.current.brix = el), []);
  const firehouseRef = useCallback((el: HTMLDivElement | null) => void (overlays.current.firehouse = el), []);
  const batchRef = useCallback((el: HTMLDivElement | null) => void (overlays.current.batch = el), []);
  const ctaRef = useCallback((el: HTMLDivElement | null) => void (overlays.current.cta = el), []);

  if (reducedMotion) return <StaticHero />;

  return (
    <section ref={section} id="top" aria-label="Brix Brewhouse, a restored firehouse pouring again" className="relative h-[460vh] bg-black md:h-[520vh]">
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* poster is the LCP; it hides once frames are drawing */}
        <picture>
          <source media="(max-width: 767px)" srcSet="/frames/mobile/poster.jpg" />
          <img
            src="/frames/desktop/poster.jpg"
            alt=""
            fetchPriority="high"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}
          />
        </picture>
        <SequenceCanvas
          ref={seq}
          armed={gatePassed}
          onReady={onReady}
          label="Illustrative render: a red firehouse bay door rolls up at dusk, the camera moves through steam past stainless tanks to a brass tap that pours a golden pint."
          className="absolute inset-0 h-full w-full"
        />
        {/* legibility: bottom + edge shading */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_40%,transparent_40%,rgb(11_12_13/0.75))]" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {/* 0-25%: BRIX, wider than the viewport and sunk below the bottom edge: cropped on three sides on purpose */}
        <div ref={brixRef} className="absolute inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] will-change-transform md:bottom-0">
          {/* the whole block sinks below the fold in em units of the word, so the mono line stays attached */}
          <div className="relative bottom-[-0.1em] flex flex-col items-center text-[66vw] md:bottom-[-0.27em] md:text-[73vw]">
            <p className="t-mono mb-[0.035em] text-center text-[0.68rem] text-foam/90 [text-shadow:0_2px_12px_rgb(0_0_0/0.8)] md:text-[0.8rem]">
              Brewhouse · Brodheadsville, PA · Est. 2026
            </p>
            <h1 className="wait-font t-display flex w-[100vw] justify-center overflow-x-clip whitespace-nowrap text-[1em] leading-[0.74] text-foam [text-shadow:0_-10px_80px_rgb(0_0_0/0.5)]">
              <span className="shrink-0 tracking-[-0.02em]">BRIX</span>
              <span className="sr-only"> Brewhouse</span>
            </h1>
          </div>
        </div>

        {/* 25-55%: the firehouse */}
        <div ref={firehouseRef} className="invisible absolute inset-x-0 bottom-[12svh] opacity-0 will-change-transform">
          <div className="wrap">
            <p className="t-serif max-w-[16ch] text-[clamp(2.6rem,7.4vw,7rem)] text-foam [text-shadow:0_4px_40px_rgb(0_0_0/0.6)]">
              A{" "}
              <span className="whitespace-nowrap">
                1953<sup className="ml-1 align-super text-[0.4em]"><Confirm title="Their site says 1953; a listing says 1932, when the fire company was chartered." /></sup>
              </span>{" "}
              Firehouse. <span className="text-gold-hi">A New Pour.</span>
            </p>
            <p className="mt-6 max-w-[38ch] text-lg text-foam/90 md:text-xl">The walls hold stories. The taps pour something new.</p>
          </div>
        </div>

        {/* 55-85%: the brewing */}
        <div ref={batchRef} className="invisible absolute inset-x-0 bottom-[12svh] opacity-0 will-change-transform">
          <div className="wrap flex flex-col items-start gap-5">
            <p className="t-mono bg-black/70 px-2 py-1 text-[0.78rem] text-gold-hi">Small batch. Brewed in-house. Nine taps.</p>
            <p className="t-display max-w-[11ch] text-[clamp(3.4rem,10vw,9.5rem)] text-foam [text-shadow:0_6px_50px_rgb(0_0_0/0.5)]">
              Good beer isn&rsquo;t rushed.
            </p>
          </div>
        </div>

        {/* 85-100%: the door's open */}
        <div ref={ctaRef} className="invisible absolute inset-x-0 bottom-[11svh] opacity-0 will-change-transform">
          <div className="wrap flex flex-col items-start gap-5">
            <p className="t-serif text-[clamp(2.2rem,5.6vw,5rem)] text-foam [text-shadow:0_4px_40px_rgb(0_0_0/0.6)]">
              Drink local.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <TapHandleButton size="lg" />
              <StatusPill tone="glass" />
            </div>
            <p className="t-mono text-[0.72rem] text-foam/85">{hoursLine}</p>
          </div>
        </div>

        <Illustrative className="absolute left-4 top-[calc(var(--nav-h)+10px)] [text-shadow:0_1px_6px_rgb(0_0_0/0.9)] md:left-6" />
      </div>
    </section>
  );
}

function StaticHero() {
  // reduced motion: the same first viewport, held still. The bay door stands open, BRIX bleeds off the edges.
  return (
    <section id="top" aria-label="Brix Brewhouse" className="relative min-h-[100svh] overflow-hidden bg-black">
      <picture>
        <source media="(max-width: 767px)" srcSet="/frames/mobile/f_0090.webp" />
        <img
          src="/frames/desktop/f_0090.webp"
          alt="Illustrative render: a red firehouse bay door rolled open at dusk, a glowing brewhouse inside."
          className="absolute inset-0 h-full w-full object-cover"
        />
      </picture>
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/70" />
      <div className="wrap relative flex flex-col gap-5 pt-[calc(var(--nav-h)+3rem)]">
        <p className="t-serif max-w-[18ch] text-[clamp(2rem,5vw,4.2rem)] text-foam [text-shadow:0_4px_30px_rgb(0_0_0/0.7)]">
          A 1953
          <sup className="ml-1 align-super text-[0.4em]">
            <Confirm title="Their site says 1953; a listing says 1932, when the fire company was chartered." />
          </sup>{" "}
          Firehouse. <span className="text-gold-hi">A New Pour.</span>
        </p>
        <p className="max-w-[44ch] text-lg text-foam/90">
          The walls hold stories. The taps pour something new. Small batch, brewed in-house, nine taps. Good beer isn&rsquo;t rushed.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <TapHandleButton size="lg" />
          <StatusPill tone="glass" />
        </div>
        <p className="t-mono text-[0.72rem] text-foam/85">{hoursLine}</p>
      </div>
      <div className="absolute inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] md:bottom-0">
        <div className="relative bottom-[-0.1em] flex flex-col items-center text-[66vw] md:bottom-[-0.27em] md:text-[73vw]">
          <p className="t-mono mb-[0.035em] text-center text-[0.6875rem] text-foam/90 md:text-[0.8rem]">Brewhouse · Brodheadsville, PA · Est. 2026</p>
          <h1 className="t-display flex w-[100vw] justify-center overflow-x-clip whitespace-nowrap text-[1em] leading-[0.74] text-foam">
            <span className="shrink-0 tracking-[-0.02em]">BRIX</span>
            <span className="sr-only"> Brewhouse</span>
          </h1>
        </div>
      </div>
      <Illustrative className="absolute right-4 top-[calc(var(--nav-h)+10px)] [text-shadow:0_1px_6px_rgb(0_0_0/0.9)]" />
    </section>
  );
}
