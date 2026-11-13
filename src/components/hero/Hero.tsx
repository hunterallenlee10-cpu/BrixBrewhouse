"use client";

import { useEffect, useRef, useState } from "react";
import { useSite } from "@/components/providers/SiteProvider";
import { whenIdle } from "@/lib/idle";
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
const YT = { ended: 0, playing: 1, paused: 2, buffering: 3 } as const;
type YtMessage = { event?: string; info?: { playerState?: number; currentTime?: number; duration?: number } | null };
const command = (frame: HTMLIFrameElement | null, func: "playVideo" | "pauseVideo" | "seekTo", args: unknown[] = []) =>
  frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), YT_ORIGIN);
const ytSrc = (id: string) =>
  `${YT_ORIGIN}/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&enablejsapi=1`;

/** how long the footage must have been playing before it is shown: longer the first time, while the player settles */
const SHOW_AFTER_FIRST_MS = 2500;
const SHOW_AFTER_MS = 600;
/** a stall longer than this goes back to the still rather than showing YouTube's spinner */
const STALL_MS = 1500;
/** jump back to the start this close to the end, so the player never reaches its end screen */
const LOOP_BEFORE_END_S = 1.2;

/**
 * The real footage of Brix, playing silently behind the hero. It streams from
 * the Brix Brewhouse YouTube channel until the original file is on hand.
 *
 * The still (a frame of the same footage) is the LCP and covers the player
 * whenever the player is not cleanly playing, so nothing of YouTube's own
 * (title strip, spinner, pause shelf, end screen) is ever on show:
 * - the player is only requested once the page has settled, so it never competes with the still
 * - the still lifts only once the video has been playing for a moment
 * - it loops by seeking back just before the end, not by letting the video finish
 * - off-screen it pauses behind the still, and the still lifts again after it resumes
 * - if it stalls, stops or fails, the still comes back
 */
function HeroFootage() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [load, setLoad] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => whenIdle(() => setLoad(true), 1500), []);

  useEffect(() => {
    const el = frame.current;
    if (!load || !el) return;
    let ready = false; // the player takes commands only after its onReady
    let onScreen = true;
    let state = -1;
    let duration = 0;
    let everShown = false;
    let visible = false;
    let showTimer = 0;
    let stallTimer = 0;

    const hide = () => {
      window.clearTimeout(showTimer);
      showTimer = 0;
      visible = false;
      setShown(false);
    };
    const showSoon = () => {
      if (visible || showTimer || !onScreen) return;
      showTimer = window.setTimeout(
        () => {
          showTimer = 0;
          visible = everShown = true;
          setShown(true);
        },
        everShown ? SHOW_AFTER_MS : SHOW_AFTER_FIRST_MS,
      );
    };
    const onState = (next: number) => {
      state = next;
      window.clearTimeout(stallTimer);
      if (next === YT.playing) showSoon();
      else if (next === YT.buffering) stallTimer = window.setTimeout(hide, STALL_MS);
      else hide(); // ended, paused, unstarted, cued
    };

    const onMessage = (e: MessageEvent) => {
      if (e.origin !== YT_ORIGIN || e.source !== el.contentWindow || typeof e.data !== "string") return;
      let msg: YtMessage;
      try {
        msg = JSON.parse(e.data) as YtMessage;
      } catch {
        return;
      }
      if (msg.event === "onReady") {
        ready = true;
        if (!onScreen) command(el, "pauseVideo");
      }
      const info = msg.info;
      if (!info) return;
      if (typeof info.duration === "number" && info.duration > 0) duration = info.duration;
      if (typeof info.playerState === "number") onState(info.playerState);
      if (typeof info.currentTime === "number" && duration > LOOP_BEFORE_END_S * 2 && info.currentTime >= duration - LOOP_BEFORE_END_S) {
        command(el, "seekTo", [0, true]);
      }
    };
    window.addEventListener("message", onMessage);

    // only play while on screen; the still covers the pause and the resume
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (!onScreen) hide();
      if (ready) command(el, onScreen ? "playVideo" : "pauseVideo");
      if (onScreen && state === YT.playing) showSoon();
    });
    io.observe(el);

    return () => {
      window.removeEventListener("message", onMessage);
      io.disconnect();
      window.clearTimeout(showTimer);
      window.clearTimeout(stallTimer);
    };
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
        alt={shown ? "" : POSTER_ALT}
        fetchPriority="high"
        data-footage={shown ? "playing" : "still"}
        className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity ${shown ? "opacity-0 duration-1000" : "opacity-100 duration-200"}`}
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
