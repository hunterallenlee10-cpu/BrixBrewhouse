"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whenIdle } from "@/lib/idle";

gsap.registerPlugin(ScrollTrigger);

export type PourTab = "visit" | "group" | "event";

type Ctx = {
  pour: { open: boolean; tab: PourTab };
  openPour: (tab?: PourTab, opener?: HTMLElement | null) => void;
  closePour: () => void;
  reducedMotion: boolean;
  lenis: React.RefObject<Lenis | null>;
  scrollTo: (target: string | number | HTMLElement, opts?: { duration?: number; offset?: number; easing?: (t: number) => number }) => void;
};

const SiteCtx = createContext<Ctx | null>(null);

export const useSite = () => {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSite outside SiteProvider");
  return c;
};

/** Heavy, weighted ease for doors (matches --ease-door). */
export const doorEase = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const MOTION_Q = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia(MOTION_Q);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const readMotion = () => window.matchMedia(MOTION_Q).matches;

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [pour, setPour] = useState<{ open: boolean; tab: PourTab }>({ open: false, tab: "visit" });
  const reducedMotion = useSyncExternalStore(subscribeMotion, readMotion, () => false);
  const lenis = useRef<Lenis | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  // Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays in lockstep.
  useEffect(() => {
    if (reducedMotion) return;
    // Lenis measures the page when it starts: do it in an idle slot, not inside hydration
    let l: Lenis | null = null;
    const tick = (t: number) => l?.raf(t * 1000);
    const cancel = whenIdle(() => {
      l = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
      lenis.current = l;
      l.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }, 500);
    return () => {
      cancel();
      gsap.ticker.remove(tick);
      l?.destroy();
      lenis.current = null;
    };
  }, [reducedMotion]);

  // Freeze scrolling while the modal is up.
  const locked = pour.open;
  useEffect(() => {
    const l = lenis.current;
    if (locked) {
      l?.stop();
      document.documentElement.style.overflow = "hidden";
    } else {
      l?.start();
      document.documentElement.style.overflow = "";
    }
  }, [locked]);

  const openPour = useCallback((tab: PourTab = "visit", el?: HTMLElement | null) => {
    opener.current = el ?? (document.activeElement as HTMLElement | null);
    setPour({ open: true, tab });
  }, []);
  const closePour = useCallback(() => {
    setPour((p) => ({ ...p, open: false }));
    requestAnimationFrame(() => opener.current?.focus?.());
  }, []);

  const scrollTo = useCallback<Ctx["scrollTo"]>(
    (target, opts = {}) => {
      const l = lenis.current;
      const offset = opts.offset ?? 0;
      const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
      // rooms below render lazily (content-visibility), so a long jump can land a little off:
      // once there, check the real position and settle onto it
      const missed = () => el instanceof HTMLElement && Math.abs(el.getBoundingClientRect().top + offset) > 4;
      if (l && !reducedMotion) {
        l.scrollTo(target as never, {
          duration: opts.duration ?? 1.4,
          offset,
          easing: opts.easing,
          force: true,
          onComplete: () => {
            if (missed()) l.scrollTo(target as never, { duration: 0.6, offset, force: true });
          },
        });
        return;
      }
      const jump = () => {
        const y = typeof el === "number" ? el : el instanceof HTMLElement ? el.getBoundingClientRect().top + window.scrollY + offset : 0;
        window.scrollTo({ top: y, behavior: "auto" });
      };
      jump();
      requestAnimationFrame(() => requestAnimationFrame(() => missed() && jump()));
    },
    [reducedMotion],
  );

  const value = useMemo(
    () => ({ pour, openPour, closePour, reducedMotion, lenis, scrollTo }),
    [pour, openPour, closePour, reducedMotion, scrollTo],
  );
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}
