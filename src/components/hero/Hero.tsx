"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { TapHandleButton } from "@/components/ui/TapHandleButton";
import { StatusPill } from "@/components/ui/StatusPill";
import { weekSummary } from "@/lib/hours";
import { SITE } from "@/lib/site";

const hoursLine = weekSummary()
  .map((g) => `${g.days} ${g.time}`)
  .join(" · ");

const POSTER = "/img/video-poster.webp";
const POSTER_ALT = "Inside Brix Brewhouse: guests with pints walk a brick-lined hallway hung with local art.";

export function Hero() {
  const { reducedMotion } = useSite();

  return (
    <section id="top" aria-label="Brix Brewhouse, a restored firehouse pouring again" className="relative min-h-[100svh] overflow-hidden bg-black">
      {reducedMotion ? (
        // reduced motion: a still from the footage, no video
        <img src={POSTER} alt={POSTER_ALT} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <HeroFootage />
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
            The walls hold stories. The taps pour something new. Small batch, brewed in-house, 16 taps. Good beer isn&rsquo;t rushed.
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
    </section>
  );
}

/** YouTube's player reports its state over postMessage once it has been told someone is listening. */
const YT_ORIGIN = "https://www.youtube-nocookie.com";
const YT_PLAYING = 1;
const command = (frame: HTMLIFrameElement | null, func: "playVideo" | "pauseVideo") =>
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), YT_ORIGIN);
const ytSrc = (id: string) =>
  `${YT_ORIGIN}/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1`;

/**
 * The real footage of Brix, playing silently behind the hero. It streams from
 * the Brix Brewhouse YouTube channel until the original file is on hand.
 * - the poster (a frame of the same footage) is the LCP and stays up until the video is actually playing
 * - nothing loads from YouTube while the age gate is up; the gate's "Yes" primes it
 * - sized to cover the hero like object-fit: cover, paused while off-screen
 */
function HeroFootage() {
  const { gatePassed } = useSite();
  const frame = useRef<HTMLIFrameElement>(null);
  const [primed, setPrimed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ready = useRef(false); // the player takes commands only after its onReady
  const onScreen = useRef(true);
  const load = gatePassed || primed;

  useEffect(() => {
    const prime = () => setPrimed(true);
    window.addEventListener("brix:prime", prime);
    return () => window.removeEventListener("brix:prime", prime);
  }, []);

  // show the footage only once it is really playing, and after YouTube's title strip has faded
  useEffect(() => {
    if (!load) return;
    let timer = 0;
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGIN || e.source !== frame.current?.contentWindow || typeof e.data !== "string") return;
      try {
        const msg = JSON.parse(e.data) as { event?: string; info?: { playerState?: number } | null };
        if (msg.event === "onReady") {
          ready.current = true;
          if (!onScreen.current) command(frame.current, "pauseVideo");
        }
        if (msg.info?.playerState === YT_PLAYING && !timer) timer = window.setTimeout(() => setPlaying(true), 3200);
      } catch {}
    };
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
    };
  }, [load]);

  // only play while on screen
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      onScreen.current = e.isIntersecting;
      if (ready.current) command(el, e.isIntersecting ? "playVideo" : "pauseVideo");
    });
    io.observe(el);
    return () => io.disconnect();
  }, [load]);

  return (
    <>
      {load ? (
        <div aria-hidden className="hero-footage pointer-events-none absolute inset-0 overflow-hidden">
          <iframe
            ref={frame}
            src={ytSrc(SITE.youtubeId)}
            title=""
            tabIndex={-1}
            allow="autoplay; encrypted-media"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: "hero", channel: "widget" }), YT_ORIGIN)}
          />
        </div>
      ) : null}
      <img
        src={POSTER}
        alt={playing ? "" : POSTER_ALT}
        fetchPriority="high"
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${playing ? "opacity-0" : "opacity-100"}`}
      />
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
