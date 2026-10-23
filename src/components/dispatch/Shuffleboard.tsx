"use client";

import { useEffect, useRef } from "react";

/** Scoring zones at the far end, left to right as a player sees them: 1, 2, then 3 at the edge. */
const ZONES = ["1", "2", "3"];

/**
 * The firemen's shuffleboard, drawn as a lane seen from above. A puck slides
 * into the 3 when the lane scrolls into view, and again on hover.
 */
export function Shuffleboard() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    if (!w) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          w.classList.add("dsp-slid");
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(w);
    return () => io.disconnect();
  }, []);

  // replay: snap the puck home, then send it again
  const replay = () => {
    const w = wrap.current;
    const run = w?.querySelector<HTMLElement>(".dsp-run");
    if (!w || !run || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    w.classList.remove("dsp-slid");
    run.style.transition = "none";
    void run.offsetWidth;
    run.style.transition = "";
    requestAnimationFrame(() => w.classList.add("dsp-slid"));
  };

  return (
    <div ref={wrap} onPointerEnter={replay} className="dsp-gutter">
      <div aria-hidden className="dsp-lane">
        <span className="dsp-foul" />
        <span className="dsp-zones">
          {ZONES.map((n) => (
            <span key={n} className="dsp-zone">
              {n}
            </span>
          ))}
        </span>
        <span className="dsp-run">
          <span className="dsp-puck" />
        </span>
      </div>
    </div>
  );
}
