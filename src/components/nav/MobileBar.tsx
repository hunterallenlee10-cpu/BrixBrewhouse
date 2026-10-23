"use client";

import { ForkKnife, MapPin, Phone } from "@phosphor-icons/react";
import { useSite } from "@/components/providers/SiteProvider";
import { SITE } from "@/lib/site";

/** Phones only: the three things a hungry person needs. Hidden behind the gate and the modal. */
export function MobileBar() {
  const { gatePassed, pour, scrollTo } = useSite();
  const hidden = !gatePassed || pour.open;
  const item = "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 t-mono text-[0.6875rem] text-foam active:bg-foam/5";
  return (
    <nav
      aria-label="Quick actions"
      aria-hidden={hidden}
      className={`fixed inset-x-0 bottom-0 flex border-t border-line-strong bg-black/92 backdrop-blur-md transition-transform duration-500 md:hidden ${hidden ? "translate-y-full" : "translate-y-0"}`}
      style={{ zIndex: "var(--z-bar)" as unknown as number, paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <a href={SITE.phoneHref} className={item} tabIndex={hidden ? -1 : 0}>
        <Phone aria-hidden size={20} className="text-gold-hi" />
        Call
      </a>
      <a href={SITE.directions} target="_blank" rel="noopener noreferrer" className={`${item} border-x border-line`} tabIndex={hidden ? -1 : 0}>
        <MapPin aria-hidden size={20} className="text-gold-hi" />
        Directions
      </a>
      <a
        href="#kitchen"
        onClick={(e) => {
          e.preventDefault();
          scrollTo("#menu", { duration: 1.4, offset: -72 });
        }}
        className={item}
        tabIndex={hidden ? -1 : 0}
      >
        <ForkKnife aria-hidden size={20} className="text-gold-hi" />
        Menu
      </a>
    </nav>
  );
}
