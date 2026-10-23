"use client";

import { useEffect, useRef, useState } from "react";

const DAYS = 107;

/**
 * 107 tally marks scratched into the board, one per day of Eli's carpentry.
 * Groups of five (four strokes and a slash). Draws once when it scrolls in.
 */
export function Tally() {
  const ref = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // hide the marks only if they are still below the fold, so the draw-in is seen.
    // The observer's first entry carries the position, so mount never forces a layout.
    let first = true;
    const io = new IntersectionObserver(
      ([e]) => {
        if (first) {
          first = false;
          if (!e.isIntersecting && e.boundingClientRect.top > 0) el.classList.add("elx-armed");
        }
        if (e.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const groups: number[][] = [];
  for (let d = 1; d <= DAYS; d += 5) groups.push(Array.from({ length: Math.min(5, DAYS - d + 1) }, (_, k) => d + k));

  return (
    <div ref={ref} aria-hidden className={`elx-tally ${drawn ? "elx-drawn" : ""}`}>
      {groups.map((g) => (
        <span key={g[0]} className="elx-group">
          {g.map((day) =>
            day % 5 === 0 ? (
              <span key={day} className="elx-slash" style={{ "--i": day } as React.CSSProperties} />
            ) : (
              <span key={day} className={`elx-mark ${day === DAYS ? "elx-last" : ""}`} style={{ "--i": day } as React.CSSProperties} />
            ),
          )}
        </span>
      ))}
    </div>
  );
}
