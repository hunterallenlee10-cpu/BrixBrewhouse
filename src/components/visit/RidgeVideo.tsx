"use client";

import { useEffect, useRef } from "react";

/**
 * The V1 Pocono ridge loop. Plays only while on screen; reduced motion keeps the poster.
 * Loaded lazily (preload none) so it never competes with the hero.
 */
export function RidgeVideo({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (v.preload === "none") v.preload = "auto";
          v.play().catch(() => undefined);
        } else v.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      poster="/video/ridge-poster.jpg"
      muted
      loop
      playsInline
      preload="none"
      aria-label="Illustrative render: Pocono ridgelines at golden hour, mist drifting through the valleys."
    >
      <source src="/video/ridge.webm" type="video/webm" />
      <source src="/video/ridge.mp4" type="video/mp4" />
    </video>
  );
}
