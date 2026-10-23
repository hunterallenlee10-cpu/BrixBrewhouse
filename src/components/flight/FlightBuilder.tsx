"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowCounterClockwise, CaretRight } from "@phosphor-icons/react";
import { useSite } from "@/components/providers/SiteProvider";
import { BayLabel, Confirm, Illustrative } from "@/components/ui/primitives";
import { TAPS, type Beer } from "@/lib/data";
import { TapRail } from "./TapRail";
import { Paddle, type PaddleHandle } from "./Paddle";
import { FlightCard } from "./FlightCard";
import { Loops } from "./Loops";

const SIZE = TAPS.flightSize; // 4
const ALL = [...TAPS.beers, TAPS.nonAlcoholic];
const byId = (id: string) => ALL.find((b) => b.id === id);
const pad = (n: number) => String(n).padStart(2, "0");

function parseHash(): string[] | null {
  const m = window.location.hash.match(/flight=([\w,-]+)/);
  if (!m) return null;
  const ids = m[1].split(",").slice(0, SIZE).filter((id) => byId(id));
  return ids.length ? ids : null;
}

/** BAY 02: pull four handles, build a flight. */
export function FlightBuilder() {
  const { reducedMotion } = useSite();
  const [slots, setSlots] = useState<(string | null)[]>(() => Array(SIZE).fill(null));
  const [birch, setBirch] = useState(false);
  const [focus, setFocus] = useState<Beer>(TAPS.beers[3]);
  const [say, setSay] = useState("");
  const paddle = useRef<PaddleHandle>(null);

  const beers = useMemo(() => (birch ? [...TAPS.beers, TAPS.nonAlcoholic] : TAPS.beers), [birch]);
  const filled = slots.filter(Boolean).length;
  const full = filled === SIZE;
  const flight = slots.map((id) => (id ? byId(id)! : null));

  // shared link: #flight=a,b,c,d restores the same flight
  const restore = useCallback(() => {
    const ids = parseHash();
    if (!ids) return;
    const next = Array(SIZE).fill(null) as (string | null)[];
    ids.forEach((id, i) => (next[i] = id));
    setSlots(next);
    if (ids.includes(TAPS.nonAlcoholic.id)) setBirch(true);
    next.forEach((id, i) => (id ? paddle.current?.pour(i, byId(id)!, true) : paddle.current?.drain(i, true)));
    setSay(`Shared flight loaded: ${ids.map((id) => byId(id)!.short).join(", ")}.`);
  }, []);
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
            <BayLabel n="02">On tap</BayLabel>
            <h2 id="on-tap-title" className="t-display mt-4 text-[clamp(3.6rem,10vw,9rem)] text-foam">
              Build your flight
            </h2>
            <p className="mt-3 max-w-[44ch] text-lg text-text-2">
              A flight is four glasses. Nine taps rotate. Pull a handle and it pours into the next empty glass.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="t-mono text-[0.68rem] text-text-2">
              Taps rotate. Here&rsquo;s what&rsquo;s been pouring. Updated <Confirm />
            </p>
            <button
              type="button"
              role="switch"
              aria-checked={birch}
              onClick={() => setBirch((v) => !v)}
              className="group inline-flex min-h-11 items-center gap-3 text-left text-sm text-foam"
            >
              <span aria-hidden className={`relative h-6 w-11 rounded-full border transition-colors ${birch ? "border-gold-hi bg-gold/30" : "border-line-strong bg-ink-2"}`}>
                <span className={`absolute top-0.5 h-[18px] w-[18px] rounded-full transition-transform duration-300 ${birch ? "translate-x-[22px] bg-gold-hi" : "translate-x-0.5 bg-foam/70"}`} />
              </span>
              Show Birch Beer (non-alcoholic)
            </button>
          </div>
        </div>

        <div className="mt-12 md:mt-16">
          <TapRail beers={beers} full={full} onPour={(b) => pour(b)} onFocusBeer={setFocus} />
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[1.45fr_0.55fr] lg:gap-14">
          <div className="relative">
            <Loops />
            <Paddle ref={paddle} slots={flight} reducedMotion={reducedMotion} onRemove={remove} />
            <Illustrative className="mt-3 block">Background pours: illustrative render</Illustrative>
            <div className="mt-2 flex items-center justify-between gap-4">
              <p className="t-mono text-[0.68rem] text-text-2">
                <span className="text-gold-hi">{filled}</span> of {SIZE} poured
              </p>
              <button
                type="button"
                onClick={reset}
                disabled={!filled}
                className="t-mono inline-flex h-11 items-center gap-2 px-2 text-[0.66rem] text-text-2 transition-colors hover:text-foam disabled:opacity-40"
              >
                <ArrowCounterClockwise size={16} aria-hidden /> Start over
              </button>
            </div>
          </div>

          <BeerDetail beer={focus} />
        </div>

        <p aria-live="polite" role="status" className="sr-only">
          {say}
        </p>

        {full ? (
          <div className="mt-12">
            <FlightCard beers={flight as Beer[]} />
          </div>
        ) : null}

        {/* the rest of the bar */}
        <div className="mt-14 grid border-y border-line md:grid-cols-[1.1fr_1fr_1fr]">
          <div className="mat-steel relative border-b border-line p-6 md:border-b-0 md:border-r">
            <div aria-hidden className="absolute inset-0 bg-black/70" />
            <div className="relative">
              <p className="t-display text-[2.4rem] text-foam">{TAPS.guest.name}</p>
              <p className="mt-1 text-text-2">{TAPS.guest.description}</p>
            </div>
          </div>
          <div className="border-b border-line p-6 md:border-b-0 md:border-r">
            <p className="t-display text-[2.4rem] text-foam">To go</p>
            <p className="mt-1 text-text-2">{TAPS.toGo}</p>
          </div>
          <div className="p-6">
            <p className="t-display text-[2.4rem] text-foam">No beer?</p>
            <p className="mt-1 text-text-2">
              House-made Birch Beer, a local favorite. Plus {TAPS.otherDrinks.join(", ").toLowerCase().replace(/, ([^,]*)$/, " and $1")}.
            </p>
          </div>
        </div>

        <details className="group mt-8">
          <summary className="t-mono inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-[0.7rem] text-foam hover:text-gold-hi">
            <CaretRight size={14} aria-hidden className="transition-transform group-open:rotate-90" /> Read the tap list as text
          </summary>
          <ul className="mt-4 grid gap-x-10 md:grid-cols-2">
            {beers.map((b) => (
              <li key={b.id} className="flex items-start justify-between gap-4 border-b border-line py-4">
                <div>
                  <p className="t-mono text-[0.62rem] text-gold">{b.tap ? `Tap ${pad(b.tap)}` : "Non-alcoholic"}</p>
                  <p className="text-foam">
                    {b.name}{" "}
                    <span className="tabular text-text-2">
                      {b.kind === "na" ? "· 0%" : b.abv != null ? `· ${b.abv}% · IBU ${b.ibu}` : "· stats to come"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-text-2">{b.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => pour(b)}
                  className="t-mono h-11 shrink-0 border border-line-strong px-3 text-[0.62rem] text-foam hover:border-gold-hi hover:text-gold-hi"
                  aria-label={`Add ${b.name} to your flight`}
                >
                  Add
                </button>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </section>
  );
}

function BeerDetail({ beer }: { beer: Beer }) {
  const na = beer.kind === "na";
  return (
    <aside aria-label="About this beer" className="flex flex-col border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-2">
      <p className="t-mono text-[0.66rem] text-gold">{beer.tap ? `Tap ${pad(beer.tap)} / ${beer.style}` : `Non-alcoholic / ${beer.style}`}</p>
      <p className="t-display mt-2 text-[clamp(2.4rem,4vw,3.4rem)] text-foam">{beer.name}</p>
      <dl className="t-mono mt-5 grid grid-cols-3 gap-3 text-[0.62rem]">
        {(
          [
            ["ABV", na ? "0%" : beer.abv != null ? `${beer.abv}%` : "—"],
            ["IBU", beer.ibu != null ? String(beer.ibu) : "—"],
            ["Color", beer.color ?? "—"],
          ] as const
        ).map(([k, v]) => (
          <div key={k} className="border-t border-line pt-2">
            <dt className="text-text-3">{k}</dt>
            <dd className="mt-1 text-[0.78rem] normal-case tracking-normal text-foam">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 max-w-[38ch] text-text-2">{beer.description}</p>
      {!beer.confirmed ? (
        <p className="mt-3 text-sm text-text-2">
          Ask your bartender. <Confirm label="Stats" />
        </p>
      ) : null}
      <span aria-hidden className="mt-6 h-1 w-24" style={{ background: beer.liquid }} />
    </aside>
  );
}
