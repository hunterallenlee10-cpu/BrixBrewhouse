"use client";

import { useEffect, useRef } from "react";

/** Scoring zones at the far end, left to right as a player sees them: 1, 2, then 3 at the edge. */
const ZONES = ["1", "2", "3"];

/**
 * The firemen's shuffleboard, drawn as a lane seen from above. Once the whole
 * lane is on screen, one puck slides into the 3 and stays there.
 */
export function Shuffleboard() {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = wrap.current;
    if (!w) return;
    // wait until the lane is fully in view and clear of the bottom edge, so the slide is seen
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          w.classList.add("elx-slid");
          io.disconnect();
        }
      },
      { threshold: 1, rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(w);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="elx-gutter">
      <div aria-hidden className="elx-lane">
        <span className="elx-foul" />
        <span className="elx-zones">
          {ZONES.map((n) => (
            <span key={n} className="elx-zone">
              {n}
            </span>
          ))}
        </span>
        <span className="elx-run">
          <span className="elx-puck" />
        </span>
      </div>
    </div>
  );
}
