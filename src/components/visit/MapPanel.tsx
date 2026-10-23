"use client";

import { useState } from "react";
import { ArrowUpRight, MapTrifold } from "@phosphor-icons/react";
import { SITE } from "@/lib/site";

/**
 * Stylized map: Route 715 and the firehouse pin, nothing else (no unconfirmed landmarks).
 * The Google Maps iframe only loads when asked for.
 */
export function MapPanel() {
  const [live, setLive] = useState(false);
  return (
    <figure className="relative border border-line-strong bg-ink-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[5/4] lg:aspect-square">
        {live ? (
          <iframe
            src={SITE.mapEmbed}
            title="Google Map: Brix Brewhouse, 128 PA-715, Brodheadsville, PA"
            className="absolute inset-0 h-full w-full [filter:grayscale(0.35)_contrast(1.05)]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <StylizedMap />
        )}
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
        <span className="t-mono text-[0.6875rem] text-text-3">{live ? "Map data © Google" : "Stylized, not to scale"}</span>
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

/** Hand-set cartography: a decorative contour field, the 715, a stencil compass and the pin. */
function StylizedMap() {
  // Route 715 runs roughly north-south through Brodheadsville; drawn as a gentle S, not surveyed.
  const route = "M318 -20 C 300 90, 352 150, 330 250 S 270 380, 300 470 S 340 560, 322 640";
  return (
    <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" role="img" aria-labelledby="map-t map-d">
      <title id="map-t">Stylized map of Route 715 in Brodheadsville</title>
      <desc id="map-d">Brix Brewhouse sits on Route 715 at number 128, the former West End Firehouse.</desc>
      <defs>
        <radialGradient id="mapGlow" cx="50%" cy="46%" r="55%">
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
      <g fill="none" stroke="#d69e14" strokeOpacity="0.13" strokeWidth="1">
        {Array.from({ length: 9 }, (_, i) => (
          <path key={i} d={`M-20 ${70 + i * 58} C 120 ${40 + i * 58}, 220 ${120 + i * 54}, 360 ${80 + i * 60} S 560 ${60 + i * 58}, 640 ${100 + i * 56}`} />
        ))}
      </g>
      {/* road: casing + gold centre */}
      <path d={route} fill="none" stroke="#0b0c0d" strokeWidth="26" strokeLinecap="round" />
      <path d={route} fill="none" stroke="#3a3b40" strokeWidth="20" strokeLinecap="round" />
      <path d={route} fill="none" stroke="#d69e14" strokeWidth="3" strokeDasharray="14 10" />
      {/* route marker */}
      <g transform="translate(372 120)">
        <rect x="-30" y="-15" width="60" height="30" fill="#111214" stroke="#f2f2f2" strokeOpacity="0.6" />
        <text x="0" y="5" textAnchor="middle" fill="#f2f2f2" style={{ fontFamily: "var(--font-jetbrains), monospace" }} fontSize="13" letterSpacing="1">
          PA-715
        </text>
      </g>
      {/* compass */}
      <g transform="translate(540 116)" fill="#f2f2f2" fillOpacity="0.7">
        <path d="M0 -26 L8 4 L0 -2 L-8 4 Z" />
        <text y="22" textAnchor="middle" style={{ fontFamily: "var(--font-stencil), sans-serif" }} fontSize="16" fontWeight="700">
          N
        </text>
      </g>
      {/* the firehouse */}
      <g transform="translate(330 262)">
        <circle r="64" fill="#d69e14" fillOpacity="0.08" />
        <circle r="40" fill="#111214" stroke="#d69e14" strokeWidth="2" />
        <image href="/brand/brix-monogram.svg" x="-24" y="-21" width="48" height="42" />
        <path d="M0 40 L-9 54 L9 54 Z" fill="#d69e14" />
      </g>
      <g style={{ fontFamily: "var(--font-jetbrains), monospace" }} fill="#f2f2f2">
        <text x="390" y="250" fontSize="15" letterSpacing="2">BRIX BREWHOUSE</text>
        <text x="390" y="272" fontSize="12" fillOpacity="0.65" letterSpacing="1">128 PA-715</text>
        <text x="390" y="290" fontSize="12" fillOpacity="0.65" letterSpacing="1">BRODHEADSVILLE, PA 18322</text>
        <text x="24" y="506" fontSize="11" fillOpacity="0.5" letterSpacing="1">40.9595° N · 75.4021° W</text>
      </g>
    </svg>
  );
}
