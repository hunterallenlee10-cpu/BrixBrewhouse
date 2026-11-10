"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { TapHandleButton } from "@/components/ui/TapHandleButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { Illustrative } from "@/components/ui/primitives";
import { weekSummary } from "@/lib/hours";

const hoursLine = weekSummary()
  .map((g) => `${g.days} ${g.time}`)
  .join(" · ");

const VIDEO_LABEL =
  "Illustrative render: a red firehouse bay door rolls up at dusk, the camera moves through steam past stainless tanks to a brass tap that pours a golden pint.";

export function Hero() {
  const { reducedMotion } = useSite();

  return (
    <section id="top" aria-label="Brix Brewhouse, a restored firehouse pouring again" className="relative min-h-[100svh] overflow-hidden bg-black">
      {reducedMotion ? (
        // reduced motion: the bay door held open, no video
        <picture>
          <source media="(max-width: 767px)" srcSet="/frames/mobile/f_0090.webp" />
          <img
            src="/frames/desktop/f_0090.webp"
            alt="Illustrative render: a red firehouse bay door rolled open at dusk, a glowing brewhouse inside."
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      ) : (
        <HeroVideo />
      )}

      {/* legibility: top and bottom shading */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-black/25 to-black/70" />

      {/* copy on top, the wordmark below it in flow: it can never cover the CTA */}
      <div className="relative flex min-h-[100svh] flex-col md:h-[100svh]">
        <div className="wrap relative flex flex-col gap-5 pt-[calc(var(--nav-h)+3rem)] md:shrink-0">
          <p className="t-serif max-w-[18ch] text-[clamp(2rem,5vw,4.2rem)] text-foam [text-shadow:0_4px_30px_rgb(0_0_0/0.7)]">
            A 1953 Firehouse. <span className="text-gold-hi">A New Pour.</span>
          </p>
          <p className="max-w-[44ch] text-lg text-foam/90 [text-shadow:0_2px_16px_rgb(0_0_0/0.7)]">
            The walls hold stories. The taps pour something new. Small batch, brewed in-house, nine taps. Good beer isn&rsquo;t rushed.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <TapHandleButton size="lg" />
            <StatusPill tone="glass" />
          </div>
          <p className="t-mono text-[0.72rem] text-foam/85">{hoursLine}</p>
        </div>
        <div className="relative mt-auto pt-12 pb-[calc(56px+env(safe-area-inset-bottom)+2rem)] md:pb-[clamp(2rem,7vh,4.5rem)]">
          <Wordmark />
        </div>
      </div>

      <Illustrative className="absolute right-4 top-[calc(var(--nav-h)+10px)] [text-shadow:0_1px_6px_rgb(0_0_0/0.9)]" />
    </section>
  );
}

/**
 * Silent background loop of the firehouse render.
 * - the poster stays up (it's the LCP) until the video is actually playing
 * - nothing is fetched while the age gate is up; the gate's "Yes" primes it
 * - portrait cut on narrow screens, paused while off-screen
 */
function HeroVideo() {
  const { gatePassed } = useSite();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const load = () => {
      if (loaded.current) return;
      loaded.current = true;
      const kind = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
      const webm = document.createElement("source");
      webm.src = `/video/hero-${kind}.webm`;
      webm.type = "video/webm";
      const mp4 = document.createElement("source");
      mp4.src = `/video/hero-${kind}.mp4`;
      mp4.type = "video/mp4";
      v.append(webm, mp4);
      v.load();
      v.play().catch(() => undefined);
    };
    if (gatePassed) load();
    window.addEventListener("brix:prime", load);
    return () => window.removeEventListener("brix:prime", load);
  }, [gatePassed]);

  // only play while on screen
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (!loaded.current) return;
      if (e.isIntersecting) v.play().catch(() => undefined);
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <video
        ref={ref}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        aria-label={VIDEO_LABEL}
        onPlaying={() => setPlaying(true)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <picture>
        <source media="(max-width: 767px)" srcSet="/frames/mobile/poster.jpg" />
        <img
          src="/frames/desktop/poster.jpg"
          alt=""
          fetchPriority="high"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-0" : "opacity-100"}`}
        />
      </picture>
    </>
  );
}

/** "Brix Brewhouse" in white, sized to sit inside the frame rather than fill it. */
function Wordmark() {
  return (
    <div className="wrap flex flex-col items-start">
      <p className="t-mono mb-4 text-[0.6875rem] text-foam/90 [text-shadow:0_1px_8px_rgb(0_0_0/0.9)] md:mb-5 md:text-[0.8rem]">
        Brodheadsville, PA · Est. 2026
      </p>
      <h1 className="wait-font t-display text-[clamp(3.5rem,15vw,5.5rem)] leading-[0.9] tracking-[0.01em] text-foam [text-shadow:0_4px_40px_rgb(0_0_0/0.6)] md:text-[clamp(5rem,8vw,8.5rem)]">
        Brix <span className="block md:inline">Brewhouse</span>
      </h1>
      <span aria-hidden className="mt-5 block h-px w-16 bg-gold-hi/80 md:mt-6 md:w-24" />
    </div>
  );
}
