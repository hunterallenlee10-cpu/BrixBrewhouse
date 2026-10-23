"use client";

import { useRef } from "react";
import type { Beer } from "@/lib/data";
import { Confirm } from "@/components/ui/primitives";

const pad = (n: number) => String(n).padStart(2, "0");
const stat = (v: number | null, unit = "") => (v == null ? "—" : `${v}${unit}`);

/**
 * One blank tap handle per beer. Click, tap or press Enter to pour.
 * With a mouse or pen you can also drag the lever down past its catch.
 */
export function TapRail({
  beers,
  full,
  onPour,
  onFocusBeer,
}: {
  beers: Beer[];
  full: boolean;
  onPour: (b: Beer, el: HTMLButtonElement) => void;
  onFocusBeer: (b: Beer) => void;
}) {
  return (
    <div className="relative">
      <div aria-hidden className="flt-bar" />
      <ul className="flt-rail" aria-label="Taps. Choose a beer to pour it into your flight.">
        {beers.map((b) => (
          <li key={b.id} className="flex">
            <TapHandle beer={b} full={full} onPour={onPour} onFocusBeer={onFocusBeer} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TapHandle({ beer, full, onPour, onFocusBeer }: { beer: Beer; full: boolean; onPour: (b: Beer, el: HTMLButtonElement) => void; onFocusBeer: (b: Beer) => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  const lever = useRef<HTMLSpanElement>(null);
  const drag = useRef<{ y: number; moved: boolean; id: number } | null>(null);
  const suppressClick = useRef(false);
  const na = beer.kind === "na";
  const label = beer.tap ? `TAP ${pad(beer.tap)}` : "NA";

  const pull = () => {
    const el = btn.current!;
    el.dataset.pulled = "true";
    window.setTimeout(() => (el.dataset.pulled = "false"), 900);
    onPour(beer, el);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch" || e.button !== 0) return; // touch: tap to pour, the page keeps scrolling
    drag.current = { y: e.clientY, moved: false, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || !lever.current) return;
    const dy = Math.max(0, e.clientY - d.y);
    if (dy > 4) {
      d.moved = true;
      btn.current!.dataset.dragging = "true";
    }
    lever.current.style.setProperty("--pull", Math.min(1, dy / 60).toFixed(3));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !lever.current) return;
    btn.current!.dataset.dragging = "false";
    lever.current.style.removeProperty("--pull");
    if (d.moved) {
      suppressClick.current = true;
      if (e.clientY - d.y > 36) pull();
    }
  };

  return (
    <button
      ref={btn}
      type="button"
      className="flt-handle"
      data-cursor="cap"
      data-beer={beer.id}
      aria-disabled={full || undefined}
      aria-label={`Pour ${beer.name}${beer.abv != null ? `, ${beer.abv}% ABV` : ""}${beer.ibu != null ? `, IBU ${beer.ibu}` : ""}${na ? ", non-alcoholic" : ""}`}
      onClick={() => {
        if (suppressClick.current) {
          suppressClick.current = false;
          return;
        }
        pull();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onFocus={() => onFocusBeer(beer)}
      onPointerEnter={() => onFocusBeer(beer)}
    >
      <span aria-hidden className="flt-stage">
        <span ref={lever} className="flt-lever">
          <span className="flt-body" style={{ "--beer": beer.liquid } as React.CSSProperties}>
            <span className="flt-band" />
          </span>
          <span className="flt-ferrule" />
        </span>
      </span>
      <span className={`flt-label t-mono text-[0.62rem] tracking-[0.06em]`}>
        <span className="text-gold">{label}</span>
        <span className="text-[0.66rem] font-bold text-foam">{beer.short.toUpperCase()}</span>
        <span className="whitespace-nowrap text-[0.58rem] text-text-2">
          {na ? "0% · NA" : `${stat(beer.abv, "%")} / IBU ${stat(beer.ibu)}`}
        </span>
        {!beer.confirmed ? (
          <span className="mt-1 flex flex-col items-center gap-1 normal-case">
            <Confirm />
          </span>
        ) : null}
      </span>
    </button>
  );
}
