"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import manifest from "./frames.json";

export type SequenceHandle = {
  /** 0..1 target progress; the canvas eases toward it. */
  setTarget: (p: number) => void;
  /** current eased progress, for overlays that want to follow the picture */
  getProgress: () => number;
  /** start fetching frames now (idempotent), e.g. when the visitor reaches for "Yes" */
  prime: () => void;
};

type Set = { count: number; width: number; height: number; dir: string };

const pad = (n: number) => String(n).padStart(4, "0");

/**
 * The opening stretch first (the gate's "Yes" auto-plays it), then every 16th frame,
 * then 8th, 4th, 2nd and the rest: the sequence is scrubbable almost at once.
 */
function loadOrder(count: number) {
  const seen = new Set<number>();
  const order: number[] = [];
  const opening = Math.ceil(count * 0.2);
  for (let i = 0; i < opening; i += 3) {
    seen.add(i);
    order.push(i);
  }
  for (const step of [16, 8, 4, 2, 1]) {
    for (let i = 0; i < count; i += step) {
      if (seen.has(i)) continue;
      seen.add(i);
      order.push(i);
    }
  }
  if (!seen.has(count - 1)) order.push(count - 1);
  return order;
}

/**
 * Canvas frame sequence for the hero. Never scrubs a <video>.
 * - preloaded Image objects, progressive load order, nothing fetched until armed
 * - eased lerp toward the scroll target; the rAF loop sleeps once settled
 * - DPR capped at 2, cover fit, portrait frame set on narrow screens
 * - no work while off-screen
 */
export const SequenceCanvas = forwardRef<SequenceHandle, { className?: string; label: string; armed: boolean; onReady?: () => void }>(
  function SequenceCanvas({ className = "", label, armed, onReady }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const target = useRef(0);
    const current = useRef(0);
    const kickRef = useRef<() => void>(() => {});
    const startRef = useRef<() => void>(() => {});

    useImperativeHandle(ref, () => ({
      setTarget: (p) => {
        target.current = Math.min(1, Math.max(0, p));
        kickRef.current();
      },
      getProgress: () => current.current,
      prime: () => startRef.current(),
    }));

    useEffect(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d", { alpha: false })!;
      const portrait = window.matchMedia("(max-width: 767px)").matches;
      const set: Set = portrait ? manifest.mobile : manifest.desktop;
      const imgs: (HTMLImageElement | null)[] = new Array(set.count).fill(null);
      let alive = true;
      let lastDrawn = -1;
      let visible = true;
      let raf = 0;
      let running = false;
      let readyFired = false;
      let started = false;

      const want = () => Math.round(current.current * (set.count - 1));

      // size the backing store to the element, DPR capped at 2
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const { clientWidth: w, clientHeight: h } = canvas;
        canvas.width = Math.max(1, Math.round(w * dpr));
        canvas.height = Math.max(1, Math.round(h * dpr));
        lastDrawn = -1;
        kick();
      };

      const nearestLoaded = (i: number) => {
        if (imgs[i]) return i;
        for (let d = 1; d < set.count; d++) {
          if (i - d >= 0 && imgs[i - d]) return i - d;
          if (i + d < set.count && imgs[i + d]) return i + d;
        }
        return -1;
      };

      const draw = (i: number) => {
        const img = imgs[i];
        if (!img) return;
        const cw = canvas.width, ch = canvas.height;
        const sc = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        const dw = img.naturalWidth * sc, dh = img.naturalHeight * sc;
        ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      };

      const loop = () => {
        // eased lerp: heavier when far away, settles softly
        const delta = target.current - current.current;
        const settled = Math.abs(delta) < 0.0005;
        current.current += settled ? delta : delta * 0.14;
        const idx = nearestLoaded(want());
        if (idx !== -1 && idx !== lastDrawn) {
          draw(idx);
          lastDrawn = idx;
        }
        if (settled || !visible) {
          running = false; // sleep until the next kick
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      const kick = () => {
        if (running || !alive) return;
        running = true;
        raf = requestAnimationFrame(loop);
      };
      kickRef.current = kick;

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      // progressive loading with a small concurrency pool
      const order = loadOrder(set.count);
      let cursor = 0;
      const pump = () => {
        if (!alive || cursor >= order.length) return;
        const idx = order[cursor++];
        const img = new Image();
        img.decoding = "async";
        img.src = `${set.dir}/f_${pad(idx + 1)}.webp`;
        img
          .decode()
          .catch(() => undefined)
          .then(() => {
            if (!alive) return;
            if (img.naturalWidth) imgs[idx] = img;
            if (!readyFired && imgs[0]) {
              readyFired = true;
              onReady?.();
            }
            // repaint only if this frame is closer to where we are than what's on screen
            const w = want();
            if (lastDrawn === -1 || Math.abs(idx - w) < Math.abs(lastDrawn - w)) {
              lastDrawn = -1;
              kick();
            }
            pump();
          });
      };
      const start = () => {
        if (started || !alive) return;
        started = true;
        for (let k = 0; k < 6; k++) pump();
      };
      startRef.current = start;

      const io = new IntersectionObserver(
        ([e]) => {
          visible = e.isIntersecting;
          if (visible) kick();
        },
        { rootMargin: "100px" },
      );
      io.observe(canvas);

      return () => {
        alive = false;
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
      };
    }, [onReady]);

    // nothing is fetched while the gate is up; once armed, wait for load + an idle slot
    useEffect(() => {
      if (!armed) return;
      const go = () => startRef.current();
      const idle = () => {
        if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(go, { timeout: 1200 });
        else setTimeout(go, 200);
      };
      if (document.readyState === "complete") idle();
      else window.addEventListener("load", idle, { once: true });
      return () => window.removeEventListener("load", idle);
    }, [armed]);

    return <canvas ref={canvasRef} role="img" aria-label={label} className={className} />;
  },
);
