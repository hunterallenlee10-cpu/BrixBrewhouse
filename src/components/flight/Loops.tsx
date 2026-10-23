"use client";

import { useEffect, useRef } from "react";
import { useSite } from "@/components/providers/SiteProvider";

const CLIPS = ["bubbles", "cascade"] as const;

/** P1 + P2 macro loops glowing faintly behind the paddle. Play only while on screen. */
export function Loops() {
  const { reducedMotion } = useSite();
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const vids = Array.from(wrap.current?.querySelectorAll("video") ?? []);
    if (reducedMotion) {
      vids.forEach((v) => v.pause());
      return;
    }
    const io = new IntersectionObserver(
      ([e]) =>
        vids.forEach((v) => {
          if (e.isIntersecting) {
            if (v.preload !== "auto") v.preload = "auto";
            v.play().catch(() => undefined);
          } else v.pause();
        }),
      { rootMargin: "80px" },
    );
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={wrap}
      aria-hidden
      className="pointer-events-none absolute -inset-x-[8%] -bottom-[6%] -top-[38%] grid grid-cols-2 opacity-[0.34] [mask-image:radial-gradient(75%_70%_at_50%_40%,black,transparent)]"
    >
      {CLIPS.map((c) => (
        <video key={c} className="h-full w-full object-cover" muted loop playsInline preload="none" poster={`/video/${c}-poster.jpg`}>
          <source src={`/video/${c}.webm`} type="video/webm" />
          <source src={`/video/${c}.mp4`} type="video/mp4" />
        </video>
      ))}
    </div>
  );
}
