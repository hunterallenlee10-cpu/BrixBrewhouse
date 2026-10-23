"use client";

import { useEffect, useRef } from "react";
import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { useSite } from "@/components/providers/SiteProvider";

/** Off by default. A quiet loop of pour, fizz and room murmur. */
export function SoundToggle({ compact = false }: { compact?: boolean }) {
  const { sound, setSound } = useSite();
  const audio = useRef<HTMLAudioElement | null>(null);
  const fade = useRef<number>(0);

  useEffect(() => {
    const a = audio.current;
    if (!sound) {
      if (!a) return;
      cancelAnimationFrame(fade.current);
      const step = () => {
        a.volume = Math.max(0, a.volume - 0.02);
        if (a.volume > 0) fade.current = requestAnimationFrame(step);
        else a.pause();
      };
      step();
      return;
    }
    if (!audio.current) {
      const el = new Audio();
      const canOpus = el.canPlayType('audio/webm; codecs="opus"');
      el.src = canOpus ? "/audio/taproom.webm" : "/audio/taproom.m4a";
      el.loop = true;
      el.volume = 0;
      audio.current = el;
    }
    const el = audio.current;
    el.play().catch(() => setSound(false));
    cancelAnimationFrame(fade.current);
    const up = () => {
      el.volume = Math.min(0.35, el.volume + 0.01);
      if (el.volume < 0.35) fade.current = requestAnimationFrame(up);
    };
    up();
  }, [sound, setSound]);

  useEffect(() => () => audio.current?.pause(), []);

  const Icon = sound ? SpeakerHigh : SpeakerSlash;
  return (
    <button
      type="button"
      aria-pressed={sound}
      onClick={() => setSound(!sound)}
      data-cursor="cap"
      className="t-mono inline-flex h-11 items-center gap-2 px-2.5 text-[0.68rem] text-foam/85 transition-colors hover:text-gold-hi"
    >
      <Icon aria-hidden size={18} weight={sound ? "fill" : "regular"} className={sound ? "text-gold-hi" : ""} />
      <span className={compact ? "sr-only" : ""}>Taproom sound</span>
    </button>
  );
}
