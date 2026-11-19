"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise } from "@phosphor-icons/react";
import { useSite } from "@/components/providers/SiteProvider";
import { BayLabel } from "@/components/ui/primitives";
import { TAPS, type Beer } from "@/lib/data";
import type { TapSource } from "@/lib/tapSheet";
import { TapRail } from "./TapRail";
import { Paddle, type PaddleHandle } from "./Paddle";
import { FlightActions } from "./FlightActions";
import { Loops } from "./Loops";
import { TapList } from "./TapList";

const SIZE = TAPS.flightSize; // 4
const pad = (n: number) => String(n).padStart(2, "0");

function parseHash(byId: (id: string) => Beer | undefined): string[] | null {
  const m = window.location.hash.match(/flight=([\w,-]+)/);
  if (!m) return null;
  const ids = m[1].split(",").slice(0, SIZE).filter((id) => byId(id));
  return ids.length ? ids : null;
}

/**
 * BAY 03: pull four handles, build a flight.
 * `beers` is what's pouring: the owners' Google Sheet when it's connected, else /data/taps.json.
 */
export function FlightBuilder({ beers = TAPS.beers, source = "file", featuredId }: { beers?: Beer[]; source?: TapSource; featuredId?: string }) {
  const BEERS = beers;
  const byId = useCallback((id: string) => beers.find((b) => b.id === id), [beers]);
  const { reducedMotion } = useSite();
  const [slots, setSlots] = useState<(string | null)[]>(() => Array(SIZE).fill(null));
  // the featured panel opens on the sheet's Featured? beer, else the lowest tap
  const [focus, setFocus] = useState<Beer>(() => beers.find((b) => b.id === featuredId) ?? beers[0]);
  const [say, setSay] = useState("");
  const paddle = useRef<PaddleHandle>(null);

  const filled = slots.filter(Boolean).length;
  const full = filled === SIZE;
  const flight = slots.map((id) => (id ? byId(id)! : null));
  const counts = slots.reduce<Record<string, number>>((acc, id) => (id ? { ...acc, [id]: (acc[id] ?? 0) + 1 } : acc), {});

  // shared link: #flight=a,b,c,d restores the same flight
  const restore = useCallback(() => {
    const ids = parseHash(byId);
    if (!ids) return;
    const next = Array(SIZE).fill(null) as (string | null)[];
    ids.forEach((id, i) => (next[i] = id));
    setSlots(next);
    next.forEach((id, i) => (id ? paddle.current?.pour(i, byId(id)!, true) : paddle.current?.drain(i, true)));
    setSay(`Shared flight loaded: ${ids.map((id) => byId(id)!.short).join(", ")}.`);
  }, [byId]);
  useEffect(() => {
    const raf = requestAnimationFrame(restore); // after mount, so the paddle exists
    window.addEventListener("hashchange", restore);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", restore);
    };
  }, [restore]);

  const pour = (b: Beer) => {
    setFocus(b);
    const i = slots.indexOf(null);
    if (i === -1) {
      paddle.current?.shake();
      setSay("Your flight is full. Remove a glass to swap one out.");
      return;
    }
    const next = [...slots];
    next[i] = b.id;
    setSlots(next);
    paddle.current?.pour(i, b);
    const n = next.filter(Boolean).length;
    setSay(n === SIZE ? `${b.short} added, ${n} of ${SIZE}. Your flight is ready.` : `${b.short} added, ${n} of ${SIZE}.`);
  };

  const remove = (i: number) => {
    const b = flight[i];
    if (!b) return;
    paddle.current?.drain(i);
    const next = [...slots];
    next[i] = null;
    setSlots(next);
    setSay(`${b.short} removed, ${next.filter(Boolean).length} of ${SIZE}.`);
    if (window.location.hash.includes("flight=")) history.replaceState(null, "", window.location.pathname);
  };

  const reset = () => {
    slots.forEach((id, i) => id && paddle.current?.drain(i));
    setSlots(Array(SIZE).fill(null));
    setSay("Flight cleared. Four empty glasses.");
    if (window.location.hash.includes("flight=")) history.replaceState(null, "", window.location.pathname);
  };

  return (
    <section id="on-tap" aria-labelledby="on-tap-title" className="section relative overflow-hidden bg-ink-0">
      <div className="wrap">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <BayLabel n="03">On tap</BayLabel>
            <h2 id="on-tap-title" className="t-display mt-4 text-[clamp(3.6rem,10vw,9rem)] text-foam">
              Build your flight
            </h2>
            <p className="mt-3 max-w-[44ch] text-lg text-text-2">
              A flight is four glasses. {TAPS.totalTaps} taps rotate in Eli&rsquo;s Lounge. Pull a handle and it pours into the next empty glass.
            </p>
          </div>
          <p className="t-mono text-[0.68rem] text-text-2">
            {source === "sheet" ? (
              <>
                <span className="text-gold-hi">{beers.length} beers on tap right now.</span> <span className="whitespace-nowrap">Live from the bar.</span>
              </>
            ) : source === "fallback" ? (
              <>Ask your bartender for today&rsquo;s pours.</>
            ) : (
              <>Taps rotate. Here&rsquo;s what&rsquo;s been pouring.</>
            )}
          </p>
        </div>

        <div className="mt-12 md:mt-16">
          <TapRail beers={BEERS} full={full} onPour={(b) => pour(b)} onFocusBeer={setFocus} />
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1.45fr_0.55fr] lg:gap-14">
          <div className="relative">
            <Loops />
            <Paddle ref={paddle} slots={flight} reducedMotion={reducedMotion} onRemove={remove} />
            <div className="mt-3 flex items-center justify-between gap-4">
              <p className="t-mono text-[0.68rem] text-text-2">
                <span className="text-gold-hi">{filled}</span> of {SIZE} poured
              </p>
              <button
                type="button"
                onClick={reset}
                disabled={!filled}
                className="t-mono inline-flex h-11 items-center gap-2 px-2 text-[0.6875rem] text-text-2 transition-colors hover:text-foam disabled:opacity-40"
              >
                <ArrowCounterClockwise size={16} aria-hidden /> Start over
              </button>
            </div>
          </div>

          {/* beside the paddle: the beer in hand, then what to do with the flight */}
          <div className="flex flex-col border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-2">
            <BeerDetail beer={focus} />
            <FlightActions ids={slots.filter((id): id is string => id !== null)} size={SIZE} />
          </div>
        </div>

        <p aria-live="polite" role="status" className="sr-only">
          {say}
        </p>

        <TapList beers={BEERS} counts={counts} onAdd={pour} />

        {/* the rest of the bar: footnotes under the tap list, not more cards */}
        <dl className="flt-notes mt-14 grid gap-x-10 gap-y-5 border-t border-gold/35 pt-6 md:grid-cols-3">
          <div>
            <dt className="t-mono text-[0.72rem] text-gold"><span aria-hidden>*&nbsp;</span>Guest taps</dt>
            <dd className="mt-1.5 text-text-2">{TAPS.guest.description}</dd>
          </div>
          <div>
            <dt className="t-mono text-[0.72rem] text-gold"><span aria-hidden>&dagger;&nbsp;</span>To go</dt>
            <dd className="mt-1.5 text-text-2">{TAPS.toGo}</dd>
          </div>
          <div>
            <dt className="t-mono text-[0.72rem] text-gold"><span aria-hidden>&Dagger;&nbsp;</span>No beer?</dt>
            <dd className="mt-1.5 text-text-2">
              <span className="text-foam">House-made Birch Beer</span> is on tap and alcohol-free. Plus {TAPS.otherDrinks.join(", ").toLowerCase().replace(/, ([^,]*)$/, " and $1")}.
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function BeerDetail({ beer }: { beer: Beer }) {
  // only the stats the sheet actually has; a blank cell hides its box
  const all: [string, string | null][] = [
    ["ABV", beer.abv != null ? `${beer.abv}%` : null],
    ["IBU", beer.ibu != null ? String(beer.ibu) : null],
    ["Color", beer.color],
  ];
  const stats = all.filter((s): s is [string, string] => Boolean(s[1]));
  return (
    <aside aria-label="About this beer" className="flex flex-col">
      <p className="t-mono text-[0.6875rem] text-gold">{beer.tap ? `Tap ${pad(beer.tap)}${beer.style ? ` / ${beer.style}` : ""}` : beer.style}</p>
      <p className="t-display mt-2 text-[clamp(2.4rem,4vw,3.4rem)] text-foam">{beer.name}</p>
      {stats.length ? (
        <dl className="t-mono mt-5 grid grid-cols-3 gap-3 text-[0.6875rem]">
          {stats.map(([k, v]) => (
            <div key={k} className="border-t border-line pt-2">
              <dt className="text-text-3">{k}</dt>
              <dd className="mt-1 text-[0.78rem] normal-case tracking-normal text-foam">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <p className="mt-5 max-w-[38ch] text-text-2">{beer.description}</p>
      {!beer.confirmed ? (
        <p className="mt-3 text-sm text-text-2">
          Ask your bartender for the stats.
        </p>
      ) : null}
      <span aria-hidden className="mt-6 h-1 w-24" style={{ background: beer.liquid }} />
    </aside>
  );
}
