"use client";

import { Cube } from "@phosphor-icons/react";
import { SITE } from "@/lib/site";
import { track } from "@/lib/track";

/** The secondary CTA beside Pour One With Us: opens Vivid Visuals' 3D tour of the taproom in a new tab. */
export function VirtualTourButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={SITE.virtualTour}
      target="_blank"
      rel="noopener"
      data-cursor="cap"
      aria-label="Take a 3D virtual tour of Brix Brewhouse (opens in a new tab)"
      onClick={() => track("virtual_tour_click", { from: "final-cta" })}
      className={`group inline-flex h-16 select-none items-center justify-center gap-3 border-2 border-foam/80 bg-black/35 px-7 font-display text-[1.4rem] font-extrabold uppercase tracking-[0.04em] text-foam backdrop-blur-sm transition-colors duration-300 hover:border-gold-hi hover:text-gold-hi focus-visible:border-gold-hi ${className}`}
    >
      <Cube aria-hidden size={26} weight="bold" className="shrink-0" />
      <span className="whitespace-nowrap leading-none">Take the Virtual Tour</span>
    </a>
  );
}

/** A quiet text link to the same tour, for the Visit section. */
export function TourLink({ className = "" }: { className?: string }) {
  return (
    <a
      href={SITE.virtualTour}
      target="_blank"
      rel="noopener"
      aria-label="Take a 3D virtual tour of Brix Brewhouse (opens in a new tab)"
      onClick={() => track("virtual_tour_click", { from: "visit" })}
      className={`t-mono inline-flex min-h-11 items-center gap-2 text-[0.7rem] text-gold-hi underline-offset-4 hover:underline ${className}`}
    >
      <Cube aria-hidden size={16} weight="bold" /> Tour the taproom in 3D <span aria-hidden>&rarr;</span>
    </a>
  );
}
