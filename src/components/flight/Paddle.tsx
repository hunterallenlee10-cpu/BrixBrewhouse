"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";
import { X } from "@phosphor-icons/react";
import type { Beer } from "@/lib/data";
import type { FlightRenderer, Pourable } from "./liquidRenderer";

export type PaddleHandle = {
  pour: (slot: number, b: Pourable, instant?: boolean) => void;
  drain: (slot: number, instant?: boolean) => void;
  shake: () => void;
};

/** The walnut flight paddle with four tasters. Liquid is canvas; the glass is crisp SVG on top. */
export const Paddle = forwardRef<
  PaddleHandle,
  { slots: (Beer | null)[]; reducedMotion: boolean; onRemove: (slot: number) => void; onReady?: () => void }
>(function Paddle({ slots, reducedMotion, onRemove, onReady }, ref) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const renderer = useRef<FlightRenderer | null>(null);
  const queue = useRef<((r: FlightRenderer) => void)[]>([]);

  const run = (fn: (r: FlightRenderer) => void) => (renderer.current ? fn(renderer.current) : queue.current.push(fn));

  useImperativeHandle(ref, () => ({
    pour: (slot, b, instant) => run((r) => r.pour(slot, b, instant)),
    drain: (slot, instant) => run((r) => r.drain(slot, instant)),
    shake: () => {
      const el = wrap.current;
      if (!el || reducedMotion) return;
      el.classList.remove("flt-shake");
      void el.offsetWidth;
      el.classList.add("flt-shake");
    },
  }));

  // the liquid renderer is code-split and only starts when the paddle comes within a screen of view
  // (it sizes its canvases on start; doing that during hydration forced a full-page layout)
  useEffect(() => {
    let alive = true;
    let io: IntersectionObserver | null = null;
    const start = () => {
      import("./liquidRenderer").then(({ FlightRenderer }) => {
        if (!alive) return;
        const r = new FlightRenderer(canvases.current.filter(Boolean) as HTMLCanvasElement[], reducedMotion);
        renderer.current = r;
        queue.current.splice(0).forEach((fn) => fn(r));
        io = new IntersectionObserver(([e]) => r.setVisible(e.isIntersecting), { rootMargin: "120px" });
        if (wrap.current) io.observe(wrap.current);
        onReady?.();
      });
    };
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        near.disconnect();
        start();
      },
      { rootMargin: "100% 0px" },
    );
    if (wrap.current) near.observe(wrap.current);
    return () => {
      alive = false;
      near.disconnect();
      io?.disconnect();
      renderer.current?.destroy();
      renderer.current = null;
    };
  }, [reducedMotion, onReady]);

  return (
    <div ref={wrap} className={`flt-paddle px-[5%] pb-[7%] pt-[4%] md:px-[6%]`}>
      <ol className="relative z-10 grid grid-cols-4 gap-[4%]" aria-label="Your flight, four glasses">
        {slots.map((b, i) => (
          <li key={i} className="relative flex flex-col items-center">
            <div className="flt-glass">
              <div aria-hidden className="flt-well" />
              <canvas ref={(el) => void (canvases.current[i] = el)} aria-hidden />
              <GlassSvg />
            </div>
            <p className="t-mono mt-2 min-h-[2.2em] text-center text-[0.58rem] leading-tight text-foam/90 md:text-[0.64rem]">
              {b ? b.short.toUpperCase() : <span className="text-foam/45">Empty</span>}
            </p>
            {b ? (
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${b.name} from glass ${i + 1}`}
                className="absolute -right-1 top-[18%] grid h-11 w-11 place-items-center text-foam/70 transition-colors hover:text-foam md:-right-2"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full border border-foam/40 bg-black/70">
                  <X size={14} aria-hidden />
                </span>
              </button>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
});

/** A taster glass: thin walls, a rim ellipse, a heavy base and two highlights. */
function GlassSvg() {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 240" aria-hidden fill="none">
      <defs>
        <linearGradient id={`${id}w`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.18" stopColor="#fff" stopOpacity="0.03" />
          <stop offset="0.82" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* wall */}
      <path
        d="M15 60 L85 60 C84 120 78 170 75 214 Q74.4 224 67 225 L33 225 Q25.6 224 25 214 C22 170 16 120 15 60 Z"
        fill={`url(#${id}w)`}
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="1.1"
      />
      {/* heavy base */}
      <path d="M33 225 L67 225 Q72 225 72 230 L72 233 Q72 237 67 237 L33 237 Q28 237 28 233 L28 230 Q28 225 33 225 Z" fill={`url(#${id}b)`} stroke="#fff" strokeOpacity="0.4" strokeWidth="0.8" />
      {/* rim */}
      <ellipse cx="50" cy="60" rx="35" ry="3.2" stroke="#fff" strokeOpacity="0.7" strokeWidth="1" />
      {/* highlights */}
      <path d="M21 72 C21.5 120 25 165 28.5 205" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M78 80 C77.5 110 75.5 140 73.5 165" stroke="#fff" strokeOpacity="0.2" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
