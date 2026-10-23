"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SPECIALS } from "@/lib/data";
import { zonedNow } from "@/lib/hours";

const noopSubscribe = () => () => {};

/** A chalk heading that writes itself: SVG text stroke reveal, then the fill comes in. */
function ChalkHeading({ text, delay = 0 }: { text: string; delay?: number }) {
  return (
    <h3 className="kit-chalkHead">
      <span className="sr-only">{text}</span>
      <svg aria-hidden viewBox="0 0 400 58" className="kit-chalkSvg" style={{ "--d": `${delay}s` } as React.CSSProperties}>
        <text x="4" y="44" className="kit-chalkStroke">
          {text}
        </text>
      </svg>
    </h3>
  );
}

function ChalkRule({ delay = 0 }: { delay?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 400 14" preserveAspectRatio="none" className="kit-chalkRule" style={{ "--d": `${delay}s` } as React.CSSProperties}>
      <path d="M3 8 C 60 4, 110 11, 170 7 S 290 4, 340 8 S 390 9, 397 6" pathLength={1} />
    </svg>
  );
}

/**
 * The daily chalkboard, driven by /data/specials.json.
 * Writes itself in when it scrolls into view. Taco Tuesday lights up on
 * Tuesdays in America/New_York.
 */
export function Chalkboard() {
  const board = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  // server renders "not Tuesday"; the client reads the real day in America/New_York
  const tuesday = useSyncExternalStore(
    noopSubscribe,
    () => zonedNow(new Date()).day === 2,
    () => false,
  );

  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
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

  return (
    <figure className="kit-frame" aria-label="Today's chalkboard">
      <div ref={board} className={`mat-chalk kit-board ${drawn ? "kit-drawn" : ""}`}>
        <p className={`t-mono kit-boardKicker`}>John&rsquo;s Chef Table · on the board</p>

        <ChalkHeading text="Today's special" delay={0} />
        <p className="kit-chalkLine" style={{ "--d": "1.1s" } as React.CSSProperties}>
          {SPECIALS.todaysSpecial}
        </p>

        <ChalkRule delay={1.6} />

        <ChalkHeading text="Soup of the day" delay={1.9} />
        <p className="kit-chalkLine" style={{ "--d": "3s" } as React.CSSProperties}>
          {SPECIALS.soupOfTheDay}
        </p>
        <p className="kit-chalkNote" style={{ "--d": "3.5s" } as React.CSSProperties}>
          {SPECIALS.soupNote}
        </p>

        <ChalkRule delay={3.9} />

        <p data-taco={tuesday ? "today" : "tuesdays"} className={`kit-taco ${tuesday ? "kit-tacoOn" : ""}`} style={{ "--d": "4.2s" } as React.CSSProperties}>
          <span className="kit-tacoWord">{SPECIALS.tacoTuesday}</span>
          <span className="kit-tacoWhen">{tuesday ? "Today!" : "Tuesdays"}</span>
          {tuesday ? (
            <svg aria-hidden viewBox="0 0 300 90" preserveAspectRatio="none" className="kit-tacoCircle">
              <path d="M150 6 C 60 4, 8 22, 10 46 C 12 74, 90 86, 160 84 C 238 82, 292 66, 290 40 C 288 16, 220 6, 140 9" pathLength={1} />
            </svg>
          ) : null}
        </p>
      </div>
      {/* chalk tray */}
      <div aria-hidden className="kit-tray">
        <span className="kit-stick" />
      </div>
    </figure>
  );
}
