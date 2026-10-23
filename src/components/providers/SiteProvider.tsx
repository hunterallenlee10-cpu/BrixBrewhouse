"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type PourTab = "visit" | "group" | "event";

type Ctx = {
  gatePassed: boolean;
  passGate: () => void;
  pour: { open: boolean; tab: PourTab };
  openPour: (tab?: PourTab, opener?: HTMLElement | null) => void;
  closePour: () => void;
  reducedMotion: boolean;
  lenis: React.RefObject<Lenis | null>;
  scrollTo: (target: string | number | HTMLElement, opts?: { duration?: number; offset?: number; easing?: (t: number) => number }) => void;
  sound: boolean;
  setSound: (on: boolean) => void;
};

const SiteCtx = createContext<Ctx | null>(null);

export const useSite = () => {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSite outside SiteProvider");
  return c;
};

/** Heavy, weighted ease for doors (matches --ease-door). */
export const doorEase = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [gatePassed, setGatePassed] = useState(false);
  const [pour, setPour] = useState<{ open: boolean; tab: PourTab }>({ open: false, tab: "visit" });
  const [reducedMotion, setReduced] = useState(false);
  const [sound, setSoundState] = useState(false);
  const lenis = useRef<Lenis | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  // returning guest (boot script already hid the gate before paint)
  useEffect(() => {
    if (document.documentElement.dataset.gate === "passed") setGatePassed(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Lenis smooth scroll driven by GSAP's ticker so ScrollTrigger stays in lockstep.
  useEffect(() => {
    if (reducedMotion) return;
    const l = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
    lenis.current = l;
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
      lenis.current = null;
    };
  }, [reducedMotion]);

  // Freeze scrolling while the gate or modal is up.
  const locked = !gatePassed || pour.open;
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

  const passGate = useCallback(() => {
    try {
      sessionStorage.setItem("brix-21", "yes");
    } catch {}
    document.documentElement.dataset.gate = "passed";
    setGatePassed(true);
  }, []);

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
      if (l && !reducedMotion) {
        l.scrollTo(target as never, { duration: opts.duration ?? 1.4, offset: opts.offset ?? 0, easing: opts.easing, force: true });
        return;
      }
      const el = typeof target === "string" ? document.querySelector(target) : target;
      const y =
        typeof el === "number" ? el : el instanceof HTMLElement ? el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0) : 0;
      window.scrollTo({ top: y, behavior: "auto" });
    },
    [reducedMotion],
  );

  const setSound = useCallback((on: boolean) => {
    setSoundState(on);
    try {
      localStorage.setItem("brix-sound", on ? "on" : "off");
    } catch {}
  }, []);

  const value = useMemo(
    () => ({ gatePassed, passGate, pour, openPour, closePour, reducedMotion, lenis, scrollTo, sound, setSound }),
    [gatePassed, passGate, pour, openPour, closePour, reducedMotion, scrollTo, sound, setSound],
  );
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}
