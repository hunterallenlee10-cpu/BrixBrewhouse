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
    const ro = new ResizeObserver(([entry]) => setTravel(Math.max(0, entry.contentRect.width * 0.925 - 40)));
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
    const puck = w.querySelector<HTMLElement>(`.dsp-puck:not(.dsp-puck-red)`);
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
          {/* scoring is painted at both ends of a real table: 3-2-1 . . . 1-2-3 */}
          {[
            { n: "3", left: "0%", end: "near" },
            { n: "2", left: "9%", end: "near" },
            { n: "1", left: "18%", end: "near" },
            { n: "1", left: "73%", end: "far" },
            { n: "2", left: "82%", end: "far" },
            { n: "3", left: "91%", end: "far" },
          ].map((z) => (
            <span key={z.end + z.n} className={`dsp-zone dsp-zone-${z.end}`} style={{ left: z.left, width: "9%" }}>
              {z.n}
            </span>
          ))}
          <span className="dsp-foul" style={{ left: "27%" }} />
          <span className="dsp-foul" style={{ left: "73%" }} />
          {/* the other team's weight, already sitting in the 2 */}
          <span className="dsp-puck dsp-puck-red" style={{ left: "84.5%" }} />
          <span className="dsp-puck" />
        </div>
      </div>
    </div>
  );
}
