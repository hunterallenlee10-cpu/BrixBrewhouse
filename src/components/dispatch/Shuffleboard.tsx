"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The firemen's shuffleboard, drawn as a lane. A puck slides to the far
 * zone when the lane scrolls into view, and again on hover or focus.
 */
export function Shuffleboard() {
  const wrap = useRef<HTMLDivElement>(null);
  const lane = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    const l = lane.current;
    const w = wrap.current;
    if (!l || !w) return;
    // ResizeObserver reports the lane width asynchronously (no forced layout at mount)
    const ro = new ResizeObserver(([entry]) => setTravel(Math.max(0, entry.contentRect.width * 0.94 - 40)));
    ro.observe(l);
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
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  // replay: snap the puck home, then send it again
  const replay = () => {
    const w = wrap.current;
    if (!w || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    w.classList.remove("dsp-slid");
    const puck = w.querySelector<HTMLElement>(`.dsp-puck`);
    if (puck) {
      puck.style.transition = "none";
      void puck.offsetWidth;
      puck.style.transition = "";
    }
    requestAnimationFrame(() => w.classList.add("dsp-slid"));
  };

  return (
    <div
      ref={wrap}
      onPointerEnter={replay}
      className="relative"
      style={{ "--travel": `${travel}px` } as React.CSSProperties}
    >
      <div aria-hidden className="dsp-gutter">
        <div ref={lane} className="dsp-lane">
          {[
            { n: "1", left: "64%" },
            { n: "2", left: "76%" },
            { n: "3", left: "88%" },
          ].map((z) => (
            <span
              key={z.n}
              className="dsp-zone"
              style={{ left: z.left, width: "12%" }}
            >
              {z.n}
            </span>
          ))}
          <span className="dsp-puck" />
        </div>
      </div>
    </div>
  );
}
