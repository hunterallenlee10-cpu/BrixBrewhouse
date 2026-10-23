"use client";

import { useState } from "react";
import { LinkSimple } from "@phosphor-icons/react";
import { TAPS, type Beer } from "@/lib/data";
import { TapHandleButton } from "@/components/ui/TapHandleButton";
import "./flight.css";

// range of the confirmed house beers, so the meter is built from real numbers only
const known = TAPS.beers.filter((b) => b.abv != null && b.ibu != null);
const abvR = [Math.min(...known.map((b) => b.abv!)), Math.max(...known.map((b) => b.abv!))];
const ibuR = [Math.min(...known.map((b) => b.ibu!)), Math.max(...known.map((b) => b.ibu!))];
const norm = (v: number, [a, b]: number[]) => Math.min(1, Math.max(0, (v - a) / (b - a)));

/** Lightest (0) to richest (1): 70% ABV, 30% IBU. Null when the stats aren't known. */
export function richness(b: Beer): number | null {
  if (b.abv == null) return null;
  const a = norm(b.abv, abvR);
  return b.ibu == null ? a : 0.7 * a + 0.3 * norm(b.ibu, ibuR);
}

export function shareUrl(ids: string[]) {
  return `${window.location.origin}${window.location.pathname}#flight=${ids.join(",")}`;
}

/** The finished flight as a brew sheet: four pours, a lightest-to-richest line, share + CTA. */
export function FlightCard({ beers }: { beers: Beer[] }) {
  const [copied, setCopied] = useState<"idle" | "ok" | "manual">("idle");
  const [manualUrl, setManualUrl] = useState("");

  const share = async () => {
    const url = shareUrl(beers.map((b) => b.id));
    history.replaceState(null, "", url);
    try {
      await navigator.clipboard.writeText(url);
      setCopied("ok");
    } catch {
      setManualUrl(url);
      setCopied("manual");
    }
  };

  return (
    <section aria-labelledby="flight-card-title" className={`flt-sheet p-5 md:p-8`}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h3 id="flight-card-title" className="t-display text-[clamp(2.2rem,4vw,3.4rem)] text-foam">
          Your flight
        </h3>
        <p className="t-mono text-[0.64rem] text-text-2">Four glasses · poured left to right</p>
      </div>

      <ol className="mt-5 grid gap-x-8 sm:grid-cols-2">
        {beers.map((b, i) => (
          <li key={i} className="flex h-[2.6rem] items-center gap-3 border-b border-line">
            <span className="t-mono w-5 text-[0.66rem] text-gold">{i + 1}</span>
            <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ background: b.liquid, boxShadow: "0 0 0 1px rgb(242 242 242 / 0.35)" }} />
            <span className="flex-1 truncate text-foam">{b.name}</span>
            <span className="t-mono tabular text-[0.7rem] text-text-2">
              {b.kind === "na" ? "NA" : b.abv != null ? `${b.abv}%` : "Ask your bartender"}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-8">
        <p className="t-mono text-[0.62rem] text-text-2">Lightest to richest, from each beer&rsquo;s ABV and IBU</p>
        <div className={`flt-meter mt-3`} role="img" aria-label={`Lightest to richest: ${[...beers].map((b) => [b, richness(b)] as const).filter(([, r]) => r != null).sort((a, b) => a[1]! - b[1]!).map(([b]) => b.short).join(", ")}`}>
          {beers.map((b, i) => {
            const r = richness(b);
            if (r == null) return null;
            return (
              <span key={i} className="flt-pin" style={{ left: `${4 + r * 92}%` }}>
                <span className="t-mono text-[0.62rem] text-foam" style={{ transform: `translateY(${(i % 2) * -18}px)` }}>
                  {i + 1}
                </span>
                <span className="flt-pinDot" style={{ background: b.liquid }} />
              </span>
            );
          })}
        </div>
        <div className="t-mono mt-2 flex justify-between text-[0.6rem] text-text-3">
          <span>Lightest</span>
          <span>Richest</span>
        </div>
        {beers.some((b) => richness(b) == null) ? (
          <p className="mt-2 text-sm text-text-3">Rotating beers without published stats sit off the line. Ask your bartender.</p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <TapHandleButton label="Pour this flight in person" />
        <button
          type="button"
          onClick={share}
          data-cursor="cap"
          className="t-mono inline-flex h-14 items-center gap-2 border border-line-strong px-5 text-[0.7rem] text-foam transition-colors hover:border-gold-hi hover:text-gold-hi"
        >
          <LinkSimple size={18} aria-hidden /> Share my flight
        </button>
        <p role="status" aria-live="polite" className="t-mono text-[0.66rem] text-gold-hi">
          {copied === "ok" ? "Link copied. Send it to whoever's driving." : copied === "manual" ? "Copy this link:" : ""}
        </p>
      </div>
      {copied === "manual" ? (
        <input readOnly value={manualUrl} onFocus={(e) => e.currentTarget.select()} aria-label="Share link" className="mt-3 h-11 w-full border border-line-strong bg-ink-1 px-3 font-mono text-sm text-foam" />
      ) : null}
    </section>
  );
}
