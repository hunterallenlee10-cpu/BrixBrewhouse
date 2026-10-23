"use client";

import { useEffect, useRef } from "react";

const SEL = "a, button, [data-cursor], summary, label[for], select";

/** 21-crimp bottle cap outline, generated once. */
const CAP_PATH = (() => {
  const n = 21, R = 20, r = 17.2, pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2;
    const rad = i % 2 ? r : R;
    pts.push(`${(22 + rad * Math.cos(a)).toFixed(2)},${(22 + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
})();

/**
 * Desktop only, subtle: a bottle-cap ring appears over interactive things.
 * The native cursor stays everywhere. Off for touch and reduced motion.
 */
export function CapCursor() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !el.current) return;
    const node = el.current;
    let x = -100, y = -100, cx = -100, cy = -100, on = false, raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const hit = (e.target as Element | null)?.closest?.(SEL);
      if (!!hit !== on) {
        on = !!hit;
        node.dataset.on = String(on);
      }
    };
    const loop = () => {
      cx += (x - cx) * 0.28;
      cy += (y - cy) * 0.28;
      node.style.transform = `translate3d(${cx}px, ${cy}px, 0) scale(${on ? 1 : 0.6})`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div ref={el} aria-hidden className="cap-cursor" data-on="false">
      <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d={CAP_PATH} />
        <circle cx="22" cy="22" r="13" strokeOpacity="0.5" />
      </svg>
    </div>
  );
}
