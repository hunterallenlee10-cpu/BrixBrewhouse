"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BayLabel, Illustrative, PhotoSlot } from "@/components/ui/primitives";
import { Cap } from "./Cap";
import { STORIES } from "./stories";

type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

/**
 * BAY 03. The whole room is the bar top: caps under glass, with a slow
 * specular glare that follows the cursor (or the phone's tilt) like light
 * sweeping across a glossy surface. Six highlighted caps flip to their stories.
 */
export function BarTop() {
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set());
  const field = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0.3, y: 0.25, at: 0 });
  const tiltAsked = useRef(false);

  const onTilt = useCallback((e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    target.current = {
      x: Math.min(1, Math.max(0, 0.5 + e.gamma / 70)),
      y: Math.min(1, Math.max(0, 0.5 + (e.beta - 40) / 80)),
      at: performance.now(),
    };
  }, []);

  // glare loop: lerp toward the pointer/tilt; drift slowly when nothing is steering it
  useEffect(() => {
    const el = glare.current;
    const host = field.current;
    if (!el || !host) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    let visible = false;
    let x = 0.3, y = 0.25;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    });
    const loop = (t: number) => {
      if (!visible) {
        raf = 0;
        return;
      }
      const idle = t - target.current.at > 3500;
      const tx = idle ? 0.5 + Math.sin(t / 5200) * 0.36 : target.current.x;
      const ty = idle ? 0.42 + Math.cos(t / 7300) * 0.26 : target.current.y;
      x += (tx - x) * (idle ? 0.02 : 0.09);
      y += (ty - y) * (idle ? 0.02 : 0.09);
      el.style.setProperty("--gx", `${(x * 100).toFixed(2)}%`);
      el.style.setProperty("--gy", `${(y * 100).toFixed(2)}%`);
      el.style.setProperty("--ga", `${(-24 + (x - 0.5) * 30).toFixed(1)}deg`);
      raf = requestAnimationFrame(loop);
    };
    io.observe(host);

    // phones without a permission prompt (Android) can stream tilt straight away
    const Ctor = (typeof window !== "undefined" ? window.DeviceOrientationEvent : undefined) as OrientationCtor | undefined;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse && Ctor && typeof Ctor.requestPermission !== "function") {
      window.addEventListener("deviceorientation", onTilt, { passive: true });
    }
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [onTilt]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !field.current) return;
    const r = field.current.getBoundingClientRect();
    target.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, at: performance.now() };
  };

  // iOS asks for motion permission; only ever inside a tap, and silently ignore a "no"
  const askTilt = () => {
    if (tiltAsked.current) return;
    tiltAsked.current = true;
    const Ctor = window.DeviceOrientationEvent as OrientationCtor | undefined;
    if (Ctor && typeof Ctor.requestPermission === "function") {
      Ctor.requestPermission()
        .then((s) => s === "granted" && window.addEventListener("deviceorientation", onTilt, { passive: true }))
        .catch(() => undefined);
    }
  };

  const toggle = (id: string) => {
    askTilt();
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section id="bar-top" aria-labelledby="bartop-title" className="relative overflow-hidden bg-black pt-[clamp(5rem,11vw,9rem)]">
      <div className="wrap relative z-10">
        <BayLabel n="03">The bar top</BayLabel>
        <h2 id="bartop-title" className="t-serif mt-6 max-w-[15ch] pb-2 text-[clamp(2.8rem,7vw,6.4rem)] leading-[1.04] text-foam">
          Some breweries are built. <span className="text-gold-hi">This one was made.</span>
        </h2>
        <p className="mt-6 max-w-[46ch] text-lg text-text-2">
          Every highlighted cap under the glass holds a piece of the building&rsquo;s story. Flip one.
        </p>
      </div>

      <div ref={field} onPointerMove={onPointerMove} className="bt-field">
        {/* the bar top itself: caps under glass */}
        <picture>
          <source srcSet="/tex/caps.avif" type="image/avif" />
          <img src="/tex/caps.webp" alt="" loading="lazy" decoding="async" className="bt-mosaic" />
        </picture>
        <div aria-hidden className="bt-shade" />
        <div aria-hidden className="bt-glass" />
        <div ref={glare} aria-hidden className="bt-glare" />

        <div className={`wrap bt-layout`}>
          <ul className="bt-caps" aria-label="Stories under the glass">
            {STORIES.map((s, i) => (
              <li key={s.id} className="bt-slot" data-slot={i}>
                <Cap story={s} index={i} flipped={flipped.has(s.id)} onToggle={() => toggle(s.id)} />
              </li>
            ))}
          </ul>

          <div data-prints className="bt-prints">
            <PhotoSlot label="the bottle-cap bar" note="Lindsay's 40 hours, the real thing" ratio="4 / 3" tilt={-3.5} className="bt-print" />
            <PhotoSlot label="Eli's Lounge woodwork" note="107 days of carpentry" ratio="4 / 5" tilt={2.5} className="bt-print" />
            <PhotoSlot label="Larry Meag mural" note="The back wall, by the artist" ratio="4 / 3" tilt={-1.5} className="bt-print" />
          </div>
        </div>

        <Illustrative className="absolute bottom-4 left-4 z-10 [text-shadow:0_1px_6px_rgb(0_0_0/0.9)] md:left-6">
          Illustrative render. Real bar top in the photo slot.
        </Illustrative>
      </div>
    </section>
  );
}
