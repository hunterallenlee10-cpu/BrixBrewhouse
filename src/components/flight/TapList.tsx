"use client";

import { Plus } from "@phosphor-icons/react";
import type { Beer } from "@/lib/data";

const pad = (n: number) => String(n).padStart(2, "0");

/** The whole board as text: every pour, its numbers, and a way to add it to the flight. */
export function TapList({ beers, counts, onAdd }: { beers: Beer[]; counts: Record<string, number>; onAdd: (b: Beer) => void }) {
  return (
    <div className="mt-16 md:mt-20">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b border-gold/35 pb-4">
        <h3 className="t-display text-[clamp(2.4rem,4.4vw,3.6rem)] text-foam">The tap list</h3>
        <p className="t-mono pb-1 text-[0.6875rem] text-text-2">{beers.length} pouring · Add any of them to your flight</p>
      </div>
      <ol className="grid gap-x-14 md:grid-cols-2">
        {beers.map((b) => (
          <TapRow key={b.id} beer={b} count={counts[b.id] ?? 0} onAdd={onAdd} />
        ))}
      </ol>
    </div>
  );
}

function TapRow({ beer, count, onAdd }: { beer: Beer; count: number; onAdd: (b: Beer) => void }) {
  const na = beer.kind === "na";
  const label = beer.tap ? `Tap ${pad(beer.tap)}${beer.kind === "rotating" ? " · Rotating" : ""}` : "Non-alcoholic";
  const known = na || beer.abv != null;
  const stats = (na ? ["0% ABV", beer.color] : known ? [`${beer.abv}% ABV`, beer.ibu != null ? `IBU ${beer.ibu}` : null, beer.color] : ["Stats to come"]).filter(
    (v): v is string => Boolean(v),
  );

  return (
    <li className="grid grid-cols-[auto_1fr] items-start gap-x-4 border-b border-line py-6 sm:grid-cols-[auto_1fr_auto] sm:gap-x-5">
      <Glass beer={beer} />
      <div className="min-w-0">
        <p className="t-mono text-[0.6875rem] text-gold">
          {label}
          {count ? <span className="text-gold-hi"> · In your flight{count > 1 ? ` ×${count}` : ""}</span> : null}
        </p>
        <p className="t-display mt-1.5 text-[clamp(1.6rem,2.3vw,2rem)] leading-[0.95] text-foam">{beer.name}</p>
        <p className={`t-mono mt-2 text-[0.6875rem] ${known ? "text-foam/85" : "text-text-3"}`}>
          {/* each stat stays whole; lines break only after a dot */}
          {stats.map((v, i) => (
            <span key={v}>
              <span className="whitespace-nowrap">
                {v}
                {i < stats.length - 1 ? " ·" : ""}
              </span>
              {i < stats.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
        <p className="mt-2.5 max-w-[46ch] text-[0.95rem] leading-relaxed text-text-2">{beer.description}</p>
      </div>
      <button
        type="button"
        onClick={() => onAdd(beer)}
        aria-label={`Add ${beer.name} to your flight`}
        className={`t-mono col-start-2 mt-4 inline-flex h-11 shrink-0 items-center gap-1.5 justify-self-start border px-3 text-[0.6875rem] transition-colors hover:border-gold-hi hover:bg-gold-hi hover:text-black focus-visible:border-gold-hi sm:col-start-3 sm:row-start-1 sm:mt-0 ${
          count ? "border-gold-hi text-gold-hi" : "border-line-strong text-foam"
        }`}
      >
        <Plus aria-hidden size={14} weight="bold" />
        Add
      </button>
    </li>
  );
}

/** A small pint in the beer's own colour, with a foam head. Haze clouds it a little. */
function Glass({ beer }: { beer: Beer }) {
  const id = `tl-${beer.id}`;
  const glass = "M3 2.5 H33 L29.6 49.5 H6.4 Z";
  return (
    <svg viewBox="0 0 36 52" width="36" height="52" aria-hidden className="mt-0.5 shrink-0">
      <defs>
        <clipPath id={`${id}-c`}>
          <path d={glass} />
        </clipPath>
        <linearGradient id={`${id}-s`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.35" />
          <stop offset="0.3" stopColor="#000" stopOpacity="0" />
          <stop offset="0.75" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect x="0" y="9" width="36" height="43" fill={beer.liquid} />
        {beer.haze ? <rect x="0" y="9" width="36" height="43" fill="#fff" opacity={beer.haze * 0.16} /> : null}
        <rect x="0" y="0" width="36" height="52" fill={`url(#${id}-s)`} />
        <rect x="8" y="13" width="2.4" height="32" rx="1.2" fill="#fff" opacity="0.22" />
        <path d="M0 0 H36 V10 Q27 12.5 18 10.5 Q9 8.5 0 10.5 Z" fill={beer.foam ?? "#F3EAD7"} />
      </g>
      <path d={glass} fill="none" stroke="rgb(242 242 242 / 0.4)" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
