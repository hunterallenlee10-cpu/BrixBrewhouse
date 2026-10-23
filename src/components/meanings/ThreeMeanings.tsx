"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/components/providers/SiteProvider";
import { BayLabel, PhotoSlot } from "@/components/ui/primitives";
import { buildBricks, COURSE, type Brick, type Layout } from "./brickWord";

gsap.registerPlugin(ScrollTrigger);

const LEDGER: [string, string][] = [
  ["Town", "Saylorsburg, PA"],
  ["Year", "1894"],
  ["Goods", "Brick"],
  ["Standing", "Biggest supplier in the country"],
  ["Hometown of", "Joe Elias & Chris Pohorenco"],
];

const PHONE_Q = "(max-width: 767px)";
const isPhone = () => window.matchMedia(PHONE_Q).matches;
const subscribePhone = (cb: () => void) => {
  const mq = window.matchMedia(PHONE_Q);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** BAY 01: the word built brick by brick, then re-skinned three ways. */
export function ThreeMeanings() {
  const { reducedMotion, gatePassed } = useSite();
  // phones stack the word BR / IX so the bricks stay big enough to read
  const layout = useSyncExternalStore<Layout>(subscribePhone, () => (isPhone() ? "two" : "one"), () => "one");
  const word = useMemo(() => buildBricks(layout), [layout]);
  const stage = useRef<HTMLDivElement>(null);
  const wordEl = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);

  // the timeline (hundreds of bricks + a pin) is built once the gate is passed, in an idle slot:
  // its pin spacing lands far below the fold, so nothing visible moves
  useEffect(() => {
    if (!gatePassed || armed) return;
    const go = () => setArmed(true);
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(go, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(go, 400);
    return () => window.clearTimeout(t);
  }, [gatePassed, armed]);

  useEffect(() => {
    if (reducedMotion || !armed || !stage.current || !wordEl.current) return;
    const ctx = gsap.context(() => {
      const els = gsap.utils.toArray<HTMLElement>("[data-brick]");
      const w = wordEl.current!;
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage.current,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 3.4)}`,
          pin: true,
          scrub: 0.9,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      const courseStep = 3.2 / word.rows;

      // 1. bricklaying: bottom course first; each brick drops in and settles with weight
      els.forEach((el) => {
        const up = Number(el.dataset.up);
        const r = Number(el.dataset.rand);
        tl.fromTo(
          el,
          { y: () => -window.innerHeight * (0.5 + r * 0.45), x: (r - 0.5) * 200, rotation: (r - 0.5) * 46, autoAlpha: 0 },
          { y: 0, x: 0, rotation: 0, autoAlpha: 1, duration: 1, ease: "back.out(1.35)" },
          up * courseStep + r * 0.4,
        );
      });

      // 2. BRIX (°Bx): the letters fill like a hydrometer
      tl.to("[data-intro]", { autoAlpha: 0, y: -20, duration: 0.5 }, 3.6);
      tl.fromTo("[data-panel='0']", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 3.9);
      tl.fromTo("[data-scale]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 4.0);
      tl.fromTo(w, { "--lvl": 0 }, { "--lvl": word.rows + 0.4, duration: 1.8, ease: "power1.inOut" }, 4.2);
      tl.to("[data-panel='0']", { autoAlpha: 0, y: -30, duration: 0.5 }, 6.5);
      tl.to("[data-scale]", { autoAlpha: 0, duration: 0.4 }, 6.5);

      // 3. BRICK: the liquid drains, the brick stands alone, the ledger opens
      tl.to(w, { "--lvl": 0, duration: 0.9, ease: "power2.in" }, 6.5);
      tl.fromTo("[data-panel='1']", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 7.0);
      tl.fromTo("[data-ledger-row]", { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.12 }, 7.2);
      tl.to("[data-panel='1']", { autoAlpha: 0, y: -30, duration: 0.5 }, 8.7);

      // 4. THE FIREHOUSE: red enamel edge + stencilled bay plates
      tl.fromTo(w, { "--enamel": 0 }, { "--enamel": 1, duration: 0.8 }, 8.9);
      tl.fromTo("[data-plate]", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.12 }, 9.1);
      tl.fromTo("[data-panel='2']", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 9.2);
      tl.to({}, { duration: 1.2 }, 9.8); // hold before release
    }, stage);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [reducedMotion, armed, word]);

  const wordStyle = { aspectRatio: `${word.cols} / ${(word.rows * COURSE).toFixed(3)}` } as React.CSSProperties;
  // cqw resolves against the .word container, so --u lives on its child
  const unitStyle = { "--u": `calc(100cqw / ${word.cols})` } as React.CSSProperties;

  return (
    <section id="brix" aria-labelledby="brix-title" className="relative bg-black">
      <div ref={stage} className="relative flex min-h-[100svh] flex-col overflow-hidden pb-8 pt-[calc(var(--nav-h)+1.75rem)]">
        <div className="wrap">
          <BayLabel n="01">Three meanings of Brix</BayLabel>
          <h2 id="brix-title" data-intro className="t-serif mt-4 max-w-[24ch] text-[clamp(1.6rem,3.4vw,2.8rem)] text-text-2">
            One name, three ways in. <span className="text-foam">Every brick of it is true.</span>
          </h2>
        </div>

        {/* the brick word */}
        <div className="wrap mt-6 flex flex-1 items-center md:mt-2">
          <div className="relative mx-auto w-[min(100%,1200px)] pl-[9%] pr-[2%] pt-10 md:pl-[4%] md:pt-0">
            <div ref={wordEl} className="brk-word" style={wordStyle} role="img" aria-label="The word BRIX built from bricks">
              <div style={unitStyle} className="absolute inset-0">
                <div aria-hidden className="brk-rimLayer">
                  {word.bricks.map((b) => (
                    <Slot key={`r${b.id}`} b={b} cols={word.cols} rows={word.rows} rim />
                  ))}
                </div>
                {word.bricks.map((b) => (
                  <Slot key={b.id} b={b} cols={word.cols} rows={word.rows} />
                ))}
                {/* hydrometer scale (decoration: never a reading for any beer) */}
                <div aria-hidden data-scale className={`brk-scale ${reducedMotion ? "" : "invisible opacity-0"}`}>
                  {Array.from({ length: 11 }, (_, i) => (
                    <span key={i} className="brk-tick" style={{ bottom: `${i * 10}%`, width: i % 5 === 0 ? "100%" : "55%" }} />
                  ))}
                  <span className="t-mono absolute -top-6 left-0 text-[0.6875rem] text-gold-hi">°Bx</span>
                </div>
                {/* bay plates for the firehouse */}
                {word.letters.map((l, i) => (
                  <span key={i} aria-hidden className={`brk-plate-pos ${l.above ? "brk-plate-above" : ""}`} style={{ left: `${l.x}%`, top: `${l.y}%` }}>
                    <span data-plate className={`brk-plate ${reducedMotion ? "" : "invisible opacity-0"}`}>
                      {`BAY ${i + 1}`}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* the three meanings, stacked in one place */}
        <div className={`wrap relative ${reducedMotion ? "mt-20" : "mt-14 min-h-[17rem] md:mt-16 md:min-h-[12.5rem]"}`}>
          <Panel
            i={0}
            title={
              <>
                BRIX <span className="normal-case">(°Bx)</span>
              </>
            }
          >
            Degrees Brix is how a brewer measures the sugar in the wort, before yeast turns it into beer. It&rsquo;s where flavor starts.
          </Panel>
          <Panel i={1} title="Brick">
            <span className="block">Saylorsburg, home to both owners, was the biggest supplier of brick in the country in 1894.</span>
            <span className={`brk-ledger t-mono mt-4 block max-w-md text-[0.6875rem] text-mortar`}>
              {LEDGER.map(([k, v]) => (
                <span key={k} data-ledger-row className="brk-ledgerRow">
                  <span>{k}</span>
                  <span aria-hidden />
                  <span className="text-right text-foam">{v}</span>
                </span>
              ))}
            </span>
          </Panel>
          <Panel i={2} title="The Firehouse">
            The old West End Firehouse on Route 715 is brick inside and out. Most of the walls you&rsquo;ll drink beside are red brick.
          </Panel>
        </div>
      </div>

      {/* the founders line */}
      <div className="wrap grid items-end gap-12 pb-[clamp(5rem,12vw,10rem)] pt-12 md:grid-cols-[1.35fr_0.65fr] md:gap-16">
        <blockquote className="t-serif pb-1 text-[clamp(2rem,4.6vw,4.1rem)] leading-[1.12] text-foam">
          Joe Elias and Chris Pohorenco met picking their kids up from school. Both had made beer and wine.{" "}
          <span className="text-gold-hi">Brix is what happened next.</span>
        </blockquote>
        <PhotoSlot label="Joe & Chris" ratio="4 / 5" tilt={1.5} className="mx-auto w-[min(100%,320px)]" />
      </div>
    </section>
  );
}

function Slot({ b, cols, rows, rim = false }: { b: Brick; cols: number; rows: number; rim?: boolean }) {
  const style = {
    left: `${(b.col / cols) * 100}%`,
    width: `${(b.w / cols) * 100}%`,
    top: `${(b.row / rows) * 100}%`,
    height: `${100 / rows}%`,
    "--up": b.up,
  } as React.CSSProperties;
  if (rim) {
    return (
      <span className="brk-slot" style={style}>
        <span className="brk-rim" />
      </span>
    );
  }
  return (
    <span data-brick data-up={b.up} data-rand={b.rand.toFixed(3)} className="brk-slot" style={style}>
      <span className="brk-face" style={{ backgroundImage: b.bg, backgroundSize: b.size, backgroundPosition: b.pos }}>
        <span className="brk-fill" />
      </span>
    </span>
  );
}

function Panel({ i, title, children }: { i: number; title: React.ReactNode; children: React.ReactNode }) {
  const { reducedMotion } = useSite();
  return (
    <div
      data-panel={i}
      className={
        reducedMotion
          ? "relative mb-12 grid gap-3 md:grid-cols-[0.8fr_1.2fr] md:gap-10"
          : "invisible absolute inset-x-[clamp(1rem,4vw,3rem)] top-0 grid gap-3 opacity-0 md:grid-cols-[0.8fr_1.2fr] md:gap-10 lg:right-[max(clamp(1rem,4vw,3rem),72px)]"
      }
    >
      <h3 className="t-display text-[clamp(3rem,7vw,6rem)] text-foam">{title}</h3>
      <div className="max-w-[46ch] text-[1.05rem] leading-relaxed text-text-2 md:pt-4 md:text-lg">{children}</div>
    </div>
  );
}
