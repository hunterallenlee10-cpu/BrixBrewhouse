"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Confirm } from "@/components/ui/primitives";
import { EVENTS } from "@/lib/data";
import { zonedNow } from "@/lib/hours";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const noop = () => () => {};
const DAY_INDEX: Record<string, number> = { SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6 };

/**
 * Split-flap tiles. The real text lives in an sr-only span; the tiles are
 * decoration that shuffle through glyphs and settle when `run` flips true.
 */
function Flap({ text, run, delay, gold, small }: { text: string; run: boolean; delay: number; gold?: boolean; small?: boolean }) {
  const tiles = useRef<(HTMLSpanElement | null)[]>([]);
  const chars = text.toUpperCase().split("");

  useEffect(() => {
    if (!run) return;
    const timers: number[] = [];
    chars.forEach((final, i) => {
      const el = tiles.current[i];
      if (!el || final === " ") return;
      const flips = 5 + ((i * 7 + delay) % 9);
      let n = 0;
      const step = () => {
        n += 1;
        el.classList.remove("dsp-flip");
        void el.offsetWidth; // restart the flap keyframe
        el.classList.add("dsp-flip");
        el.textContent = n >= flips ? final : GLYPHS[(i * 13 + n * 5 + delay) % GLYPHS.length];
        if (n < flips) timers.push(window.setTimeout(step, 62));
      };
      timers.push(window.setTimeout(step, delay + i * 38));
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className={`dsp-tiles ${small ? "dsp-small" : ""}`}>
        {chars.map((c, i) => (
          <span
            key={i}
            ref={(el) => {
              tiles.current[i] = el;
            }}
            className={`dsp-tile ${c === " " ? "dsp-blank" : ""} ${gold ? "dsp-gold" : ""}`}
          >
            {c === " " ? "" : c}
          </span>
        ))}
      </span>
    </>
  );
}

/** The firehouse run board: DAY / EVENT / STATUS, driven by /data/events.json. */
export function FlapBoard() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);
  // today's weekday in America/New_York; null while server rendering
  const today = useSyncExternalStore(
    noop,
    () => zonedNow(new Date()).day,
    () => null,
  );

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (!el || reduce) return; // tiles already show their final text
    // start blank-ish: shuffle from a scrambled state when the board comes into view
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setRun(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="dsp-frame">
      <div className="dsp-panel px-1 py-2 sm:px-4 sm:py-4">
        <table className="dsp-table" role="table">
          <caption className="sr-only">Dispatch board: what&rsquo;s happening at Brix each week</caption>
          <thead>
            <tr role="row">
              {["Day", "Event", "Status"].map((h) => (
                <th key={h} role="columnheader" scope="col" className="t-stencil px-3 pb-3 pt-1 text-left text-[0.95rem] tracking-[0.16em] text-gold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EVENTS.rows.map((r, row) => {
              const isToday = r.confirmed && r.day !== null && today !== null && DAY_INDEX[r.day] === today;
              return (
                <tr key={r.event} role="row" className={isToday ? "dsp-today" : undefined} aria-current={isToday ? "date" : undefined}>
                  <td role="cell" className="dsp-cDay px-3 py-3 align-middle">
                    {r.day ? (
                      <Flap text={r.day} run={run} delay={row * 90} gold={isToday} />
                    ) : (
                      <span className="inline-flex min-w-[5.2rem] items-center">
                        <Confirm title="Day not published yet" />
                      </span>
                    )}
                  </td>
                  <td role="cell" className="dsp-cEvent px-3 py-3 align-middle">
                    <span className="flex flex-wrap items-center gap-3">
                      <Flap text={r.event} run={run} delay={row * 90 + 120} small />
                      {isToday ? <span className="t-mono bg-gold px-2 py-1 text-[0.62rem] font-bold text-black">Today</span> : null}
                    </span>
                  </td>
                  <td role="cell" className="dsp-cStatus px-3 py-3 align-middle">
                    <Flap text={r.status} run={run} delay={row * 90 + 260} gold={r.confirmed} small />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
