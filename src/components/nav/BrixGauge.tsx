"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "@/components/providers/SiteProvider";
import { ROOMS } from "./sections";

gsap.registerPlugin(ScrollTrigger);

const TICKS = Array.from({ length: 21 }, (_, i) => i); // 0..20 °Bx, decoration only

/**
 * The Brix Gauge: a refractometer scale on the right edge. The gold level rises
 * with page progress. Rooms sit on the scale as notches you can jump to.
 * Decorative + navigation only. It never claims a beer's actual reading.
 */
export function BrixGauge() {
  const { scrollTo, gatePassed } = useSite();
  const fill = useRef<HTMLDivElement>(null);
  const [marks, setMarks] = useState<{ id: string; label: string; at: number }[]>([]);
  const [active, setActive] = useState("top");

  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      setMarks(
        ROOMS.map((r) => {
          const el = document.getElementById(r.id);
          return { id: r.id, label: r.label, at: el ? Math.min(1, el.offsetTop / max) : 0 };
        }),
      );
    };
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (fill.current) fill.current.style.transform = `scaleY(${self.progress.toFixed(4)})`;
      },
      onRefresh: measure,
    });
    measure();
    const triggers = ROOMS.map((r) =>
      ScrollTrigger.create({
        trigger: `#${r.id}`,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: (self) => self.isActive && setActive(r.id),
      }),
    );
    return () => {
      st.kill();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <nav
      aria-label="Brix gauge: jump to a room"
      className={`fixed right-4 top-1/2 hidden h-[64vh] w-12 -translate-y-1/2 transition-opacity duration-700 lg:block ${gatePassed ? "opacity-100" : "opacity-0"}`}
      style={{ zIndex: "var(--z-gauge)" as unknown as number }}
    >
      {/* tube */}
      <div className="absolute bottom-0 right-1 top-0 w-[9px] overflow-hidden border border-line-strong bg-black/40">
        <div ref={fill} className="absolute inset-0 origin-bottom bg-gradient-to-t from-[#9c6c08] via-gold to-gold-hi" style={{ transform: "scaleY(0)" }}>
          <div className="absolute inset-x-0 top-0 h-[3px] bg-foam/80" />
        </div>
      </div>
      {/* °Bx ticks, read bottom (0) to top (20) */}
      <div aria-hidden className="absolute bottom-0 right-[14px] top-0 w-4">
        {TICKS.map((t) => (
          <span
            key={t}
            className={`absolute right-0 h-px ${t % 5 === 0 ? "w-4 bg-foam/60" : "w-2 bg-foam/30"}`}
            style={{ bottom: `${(t / 20) * 100}%` }}
          />
        ))}
        {[0, 5, 10, 15, 20].map((t) => (
          <span key={t} className="t-mono absolute right-5 translate-y-1/2 text-[0.55rem] text-foam/45" style={{ bottom: `${(t / 20) * 100}%` }}>
            {t}
          </span>
        ))}
        <span className="t-mono absolute -top-6 right-0 text-[0.55rem] text-foam/45">°Bx</span>
      </div>
      {/* room notches (top of page = bottom of scale, like a rising level) */}
      <ul className="absolute bottom-0 right-0 top-0 w-full">
        {marks.map((m) => (
          <li key={m.id} className="absolute right-0" style={{ bottom: `calc(${(m.at * 100).toFixed(2)}% - 10px)` }}>
            <button
              type="button"
              onClick={() => scrollTo(`#${m.id}`, { duration: 1.6 })}
              aria-current={active === m.id ? "true" : undefined}
              className="group relative flex h-5 w-12 items-center justify-end"
            >
              <span className={`mr-[3px] block h-[3px] w-[13px] transition-colors ${active === m.id ? "bg-red" : "bg-foam/0 group-hover:bg-foam/70"}`} />
              <span
                className={`t-mono pointer-events-none absolute right-14 whitespace-nowrap bg-black/80 px-2 py-1 text-[0.62rem] transition-opacity ${
                  active === m.id
                    ? "text-gold-hi opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 min-[1600px]:opacity-100"
                    : "text-foam opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                }`}
              >
                {m.label}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
