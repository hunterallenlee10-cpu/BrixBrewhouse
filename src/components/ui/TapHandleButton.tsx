"use client";

import { useSite, type PourTab } from "@/components/providers/SiteProvider";

/**
 * The one CTA. A tap handle sits at the left of the label: on hover it pulls
 * forward on its pivot and a thin gold pour line draws under the words.
 */
export function TapHandleButton({
  tab = "visit",
  label = "Pour One With Us",
  size = "md",
  className = "",
}: {
  tab?: PourTab;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { openPour } = useSite();
  // labels stay >= 18.7px bold: white on the logo red (4.13:1) only passes AA as large text
  const pad = size === "lg" ? "h-16 pl-5 pr-8 text-[1.4rem]" : size === "sm" ? "h-11 pl-3 pr-4 text-[1.2rem]" : "h-14 pl-4 pr-6 text-[1.25rem]";
  return (
    <button
      type="button"
      data-cursor="cap"
      onClick={(e) => openPour(tab, e.currentTarget)}
      className={`tap-btn group relative inline-flex select-none items-center gap-3 bg-red font-display font-extrabold uppercase tracking-[0.04em] text-foam shadow-[0_12px_30px_-12px_rgb(234_3_34/0.65)] transition-[background-color,transform] duration-300 hover:bg-red-deep active:translate-y-px ${pad} ${className}`}
    >
      <span aria-hidden className="tap-handle relative block h-[1.55em] w-[0.62em]">
        {/* knob */}
        <span className="absolute left-1/2 top-0 h-[0.42em] w-[0.42em] -translate-x-1/2 rounded-full bg-foam" />
        {/* shaft */}
        <span className="absolute bottom-[0.18em] left-1/2 top-[0.3em] w-[0.34em] -translate-x-1/2 rounded-[2px] bg-gradient-to-b from-foam to-[#cfcfcf]" />
        {/* ferrule */}
        <span className="absolute bottom-0 left-1/2 h-[0.22em] w-[0.56em] -translate-x-1/2 rounded-[1px] bg-gold" />
      </span>
      <span className="relative whitespace-nowrap leading-none">
        {label}
        <span
          aria-hidden
          className="absolute -bottom-[0.32em] left-0 h-[2px] w-full origin-left scale-x-0 bg-gold-hi transition-transform duration-500 ease-[var(--ease-pour)] group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </span>
    </button>
  );
}
