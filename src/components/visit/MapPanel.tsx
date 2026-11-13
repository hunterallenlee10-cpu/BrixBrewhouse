"use client";

import { useState } from "react";
import { ArrowUpRight, MapTrifold } from "@phosphor-icons/react";
import { SITE } from "@/lib/site";

/**
 * Overview map: Brix in the middle of the Poconos, about 20 miles in every direction,
 * with the towns and attractions around it. The Google Maps iframe only loads when asked for.
 */
export function MapPanel() {
  const [live, setLive] = useState(false);
  return (
    <figure className="relative border border-line-strong bg-ink-2">
      <div className="relative aspect-square w-full overflow-hidden md:aspect-[5/4] lg:aspect-square">
        {live ? (
          <iframe
            src={SITE.mapEmbed}
            title="Google Map: Brix Brewhouse and the Poconos around it"
            className="absolute inset-0 h-full w-full [filter:grayscale(0.35)_contrast(1.05)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <StylizedMap />
        )}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <span className="t-mono text-[0.6875rem] text-text-3">{live ? "Map data © Google" : "Rings: 5, 10 and 15 miles out, straight line"}</span>
        <span className="flex flex-wrap gap-2">
          {!live ? (
            <button
              type="button"
              onClick={() => setLive(true)}
              data-cursor="cap"
              className="t-mono inline-flex min-h-11 items-center gap-2 border border-line-strong px-3 text-[0.6875rem] text-foam transition-colors hover:border-gold-hi hover:text-gold-hi"
            >
              <MapTrifold aria-hidden size={16} /> Load Google Map
            </button>
          ) : null}
          <a
            href={SITE.directions}
            target="_blank"
            rel="noopener noreferrer"
            className="t-mono inline-flex min-h-11 items-center gap-2 px-2 text-[0.6875rem] text-text-2 underline underline-offset-4 hover:text-foam"
          >
            Open in Google Maps <ArrowUpRight aria-hidden size={14} />
          </a>
        </span>
      </figcaption>
    </figure>
  );
}

/* ---------- the overview, drawn to scale from real coordinates ----------
   The map is 40 miles across with Brix at the centre: 15 SVG units per mile. */
const HOME = { lat: SITE.geo.lat, lng: SITE.geo.lng };
const MILES_PER_DEG_LAT = 69;
const MILES_PER_DEG_LNG = 52.2; // at 41° north
const UNITS_PER_MILE = 15;
const at = (lat: number, lng: number): [number, number] => [
  Math.round(300 + (lng - HOME.lng) * MILES_PER_DEG_LNG * UNITS_PER_MILE),
  Math.round(300 - (lat - HOME.lat) * MILES_PER_DEG_LAT * UNITS_PER_MILE),
];

type Place = { name: string; sub?: string; lat: number; lng: number; anchor: "start" | "middle" | "end"; dx: number; dy: number };
/** Towns and attractions around Brix. dx/dy place the label clear of the roads. */
const PLACES: Place[] = [
  { name: "Tannersville", sub: "Camelback · The Crossings", lat: 41.0401, lng: -75.3057, anchor: "start", dx: 11, dy: -27 },
  { name: "Mount Pocono", lat: 41.1221, lng: -75.3647, anchor: "start", dx: 10, dy: 5 },
  { name: "Kalahari", lat: 41.0995, lng: -75.388, anchor: "end", dx: -9, dy: 5 },
  { name: "Pocono Raceway", lat: 41.0553, lng: -75.5103, anchor: "middle", dx: 0, dy: 23 },
  { name: "Lake Harmony", lat: 41.0605, lng: -75.5916, anchor: "end", dx: -9, dy: 5 },
  { name: "Stroudsburg", lat: 40.9864, lng: -75.1947, anchor: "middle", dx: 0, dy: 22 },
  { name: "Delaware Water Gap", lat: 40.9845, lng: -75.144, anchor: "end", dx: 96, dy: -14 },
  { name: "Saylorsburg", lat: 40.8997, lng: -75.3174, anchor: "end", dx: -8, dy: 20 },
  { name: "Blue Mountain Resort", lat: 40.8167, lng: -75.5098, anchor: "start", dx: 10, dy: 5 },
  { name: "Jim Thorpe", lat: 40.8636, lng: -75.7387, anchor: "start", dx: 10, dy: -10 },
];

/** Roads traced through the places they actually pass; smooth, not surveyed. */
const ROADS: { id: string; d: string; shield: [number, number] }[] = [
  // I-80: White Haven, Blakeslee, Tannersville, Stroudsburg, Delaware Water Gap
  { id: "80", d: "M-10 166 C 60 150, 110 134, 148 130 S 250 142, 296 152 S 350 168, 369 180 S 388 212, 410 224 S 440 236, 456 238 S 520 240, 610 256", shield: [92, 141] },
  // US-209: Jim Thorpe, Lehighton, Brodheadsville, Stroudsburg
  { id: "209", d: "M30 364 C 36 386, 52 398, 76 390 S 180 346, 217 332 S 276 308, 300 300 S 344 300, 366 296 S 432 262, 456 238", shield: [142, 359] },
  // PA-33: Bartonsville south through Saylorsburg and Wind Gap
  { id: "33", d: "M392 214 C 384 240, 380 262, 376 290 S 368 330, 374 356 S 392 430, 404 610", shield: [386, 436] },
  // PA-715: Brodheadsville north to Tannersville
  { id: "715", d: "M300 300 C 306 276, 320 246, 330 224 S 354 192, 369 180", shield: [342, 244] },
];

const RINGS = [5, 10, 15];

/** Brix at the centre of the Poconos: roads, towns, attractions and distance rings. */
function StylizedMap() {
  const display = { fontFamily: "var(--font-big-shoulders), sans-serif", fontWeight: 800 } as const;
  const mono = { fontFamily: "var(--font-jetbrains), monospace" } as const;
  return (
    <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-labelledby="map-t map-d">
      <title id="map-t">Overview map of Brix Brewhouse in the Poconos</title>
      <desc id="map-d">
        Brix Brewhouse sits on Route 715 in Brodheadsville, where it meets Route 209. Within about 15 miles: Tannersville with Camelback and
        The Crossings outlets, Mount Pocono and Kalahari, Pocono Raceway, Lake Harmony, Stroudsburg, Delaware Water Gap, Saylorsburg and Blue
        Mountain Resort. Jim Thorpe is a little farther west. Interstate 80 and Route 33 pass close by.
      </desc>
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#2a1f0c" />
          <stop offset="1" stopColor="#141518" />
        </radialGradient>
        <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#f2f2f2" strokeOpacity="0.05" />
        </pattern>
      </defs>
      <rect width="600" height="600" fill="url(#mapGlow)" />
      <rect width="600" height="600" fill="url(#mapGrid)" />
      {/* decorative contour field (Pocono ridges as texture, not survey data) */}
      <g fill="none" stroke="#d69e14" strokeOpacity="0.1" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M-20 ${70 + i * 58} C 120 ${40 + i * 58}, 220 ${120 + i * 54}, 360 ${80 + i * 60} S 560 ${60 + i * 58}, 640 ${100 + i * 56}`} />
        ))}
      </g>

      {/* distance rings around the firehouse */}
      <g fill="none" stroke="#f2f2f2" strokeOpacity="0.2" strokeDasharray="3 7">
        {RINGS.map((mi) => (
          <circle key={mi} cx="300" cy="300" r={mi * UNITS_PER_MILE} />
        ))}
      </g>
      <g style={display} letterSpacing="1" textAnchor="middle" className="map-fine">
        {RINGS.map((mi) => (
          <g key={mi} transform={`translate(300 ${300 + mi * UNITS_PER_MILE})`}>
            <rect x="-22" y="-9" width="44" height="18" fill="#17181b" />
            <text y="5" fill="#f2f2f2" fillOpacity="0.7">
              {mi} MI
            </text>
          </g>
        ))}
      </g>

      {/* roads: dark casing, then the lane */}
      {ROADS.map((r) => (
        <g key={r.id} fill="none" strokeLinecap="round">
          <path d={r.d} stroke="#0b0c0d" strokeWidth={r.id === "80" ? 10 : 8} />
          <path d={r.d} stroke={r.id === "715" ? "#d69e14" : "#55575e"} strokeWidth={r.id === "80" ? 6 : 4} />
        </g>
      ))}
      {ROADS.map((r) => (
        <g key={r.id} transform={`translate(${r.shield[0]} ${r.shield[1]})`}>
          <rect x="-17" y="-10" width="34" height="20" rx="3" fill="#111214" stroke="#f2f2f2" strokeOpacity="0.6" />
          <text y="4.5" textAnchor="middle" fill="#f2f2f2" style={mono} fontSize="12" letterSpacing="0.5">
            {r.id}
          </text>
        </g>
      ))}

      {/* towns and attractions */}
      {PLACES.map((p) => {
        const [x, y] = at(p.lat, p.lng);
        return (
          <g key={p.name}>
            <circle cx={x} cy={y} r="5" fill="#111214" stroke="#f0bf45" strokeWidth="2" />
            <text x={x + p.dx} y={y + p.dy} textAnchor={p.anchor} fill="#f2f2f2" style={display} letterSpacing="0.6" className="map-name uppercase">
              {p.name}
            </text>
            {p.sub ? (
              <text x={x + p.dx} y={y + p.dy + 15} textAnchor={p.anchor} fill="#f2f2f2" fillOpacity="0.75" style={display} letterSpacing="0.8" className="map-fine uppercase">
                {p.sub}
              </text>
            ) : null}
          </g>
        );
      })}

      {/* compass */}
      <g transform="translate(556 112)" fill="#f2f2f2" fillOpacity="0.7">
        <path d="M0 -26 L8 4 L0 -2 L-8 4 Z" />
        <text y="22" textAnchor="middle" style={{ fontFamily: "var(--font-stencil), sans-serif" }} fontSize="16" fontWeight="700">
          N
        </text>
      </g>

      {/* the firehouse */}
      <g transform="translate(300 300)">
        <circle r="44" fill="#d69e14" fillOpacity="0.1" />
        <circle r="24" fill="#111214" stroke="#d69e14" strokeWidth="2.5" />
        <image href="/brand/brix-monogram.svg" x="-14.5" y="-12.5" width="29" height="25" />
      </g>
      <g textAnchor="end">
        <text x="262" y="290" fill="#f0bf45" style={display} fontSize="21" letterSpacing="1.2">
          BRIX BREWHOUSE
        </text>
        <text x="262" y="269" fill="#f2f2f2" fillOpacity="0.75" style={display} letterSpacing="0.8" className="map-fine">
          128 PA-715 · BRODHEADSVILLE
        </text>
      </g>
      <text x="24" y="506" fill="#f2f2f2" fillOpacity="0.5" style={mono} fontSize="11" letterSpacing="1">
        {HOME.lat.toFixed(4)}° N · {Math.abs(HOME.lng).toFixed(4)}° W
      </text>
    </svg>
  );
}
